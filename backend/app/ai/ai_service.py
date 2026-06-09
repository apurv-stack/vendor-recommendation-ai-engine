import asyncio
import hashlib
import json
import logging
import time

from typing import (
    Any,
    Dict,
    Optional
)

from app.ai.cache_handler import (
    CacheHandler
)

from app.ai.fallback_handler import (
    FallbackHandler
)

from app.ai.llm_factory import (
    LLMFactory
)

from app.ai.prompt_guard import (
    PromptGuard
)

from app.ai.prompt_loader import (
    PromptLoader
)

from app.ai.prompt_chain import (
    PromptChain
)

from app.ai.structured_response import (
    StructuredResponseBuilder
)

from app.ai.query_parser import (
    QueryParser
)

from app.ai.intent_extractor import (
    IntentExtractor
)

from app.core.config import (
    settings
)

from app.ai.query_preprocessor import (
    QueryPreprocessor
)

from app.ai.query_validator import (
    QueryValidator
)

from app.ai.query_transformer import (
    QueryTransformer
)

logger = logging.getLogger(

    __name__

)


class AIService:

    CACHE_ENABLED = True

    # -----------------------------------
    # OLLAMA SAFE SETTINGS
    # -----------------------------------

    MAX_RETRIES = 1

    REQUEST_TIMEOUT = 180

    TEMPERATURE = 0.7

    MAX_OUTPUT_TOKENS = 250

    def __init__(

        self

    ):

        self.client = (

            LLMFactory.get_client()

        )

        self.model = (

            LLMFactory.get_model()

        )

        self.cache = (

            CacheHandler()

        )

        self.provider = (

            settings
            .AI_PROVIDER
            .lower()

        )

    async def execute_prompt(

        self,

        prompt: str

    ):

        start = time.time()

        try:

            PromptGuard.validate(

                prompt

            )

            cache_key = (

                hashlib.md5(

                    (

                        self.provider
                        +
                        self.model
                        +
                        prompt

                    ).encode()

                ).hexdigest()

            )

            # -----------------------------------
            # CACHE
            # -----------------------------------

            if self.CACHE_ENABLED:

                cached = (

                    await self.cache.get(

                        cache_key

                    )

                )

                if cached:

                    return cached

            response = None

            # -----------------------------------
            # RETRIES
            # -----------------------------------

            for attempt in range(

                self.MAX_RETRIES + 1

            ):
                
                print("== AI CALL START ==")

                try:

                    response = await (

                        asyncio.wait_for(

                            asyncio.to_thread(

                                self._generate,

                                prompt

                            ),

                            timeout=

                            self.REQUEST_TIMEOUT

                        )

                    )

                    break

                    print("== AI CALL END ==")

                except Exception as e:

                    logger.warning(

                        f"AI retry {attempt + 1} failed"

                    )

                    if (

                        attempt

                        >=

                        self.MAX_RETRIES

                    ):

                        raise

                    await asyncio.sleep(

                        1

                    )

            if not response:

                raise RuntimeError(

                    "Empty AI response"

                )

            latency = round(

                (

                    time.time()

                    -

                    start

                ) * 1000,

                2

            )
            print(f"AI LATENCY: {latency} ms")

            result = {

                "success": True,

                "response":

                response.strip(),

                "error": None,

                "metadata": {

                    "provider":

                    self.provider,

                    "model":

                    self.model,

                    "latency_ms":

                    latency

                }

            }

            # -----------------------------------
            # CACHE STORE
            # -----------------------------------

            if self.CACHE_ENABLED:

                await self.cache.set(

                    cache_key,

                    result

                )

            return result

        except asyncio.TimeoutError:

            logger.exception(

                "TIMEOUT"

            )

            return (

                FallbackHandler
                .get_fallback_response()

            )

        except Exception as e:

            logger.exception(

                "AI FAILURE"

            )

            return {

                "success": False,

                "response": None,

                "error": str(

                    e

                )

            }

    async def build_structured_response(
        self,
        user_message: str,
        previous: Optional[Dict] = None,
        conversation_context: str = ""
    ):

        # -----------------------------------
        # PREPROCESS QUERY
        # -----------------------------------

        normalized_query = (
            QueryPreprocessor.preprocess(
                user_message
            )
        )

        # -----------------------------------
        # PARSER FILTERS
        # -----------------------------------

        parser_filters = dict(
            QueryParser.extract_filters(
                normalized_query,
                previous
            )
        )

        # -----------------------------------
        # PROMPT CHAIN
        # -----------------------------------

        chain = PromptChain.build(normalized_query, previous or {})

# Intent extracted BEFORE context injection ← FIX
        intent_data = IntentExtractor.extract(normalized_query)
        intent = intent_data.get("intent", "vendor_recommendation")
        intent_filters = intent_data.get("filters", {})

        if conversation_context:
            normalized_query = (
                f"Prior Messages:\n"
                f"{conversation_context}\n\n"
                f"New Query:\n"
                f"{normalized_query}"
            )

        llm_filters = {}
        has_category = bool(parser_filters.get("category"))
        has_city = bool(parser_filters.get("city"))
        if not (has_category and has_city) and intent != "comparison_query":
            for step in chain:
                if (
                    step["stage"]
                    ==
                    "filter_extraction"
                ):
                    llm_filters = await (
                        self._extract_llm_filters(
                            normalized_query
                        )
                    )
                    break
        
        intent_filters = (
            intent_data.get(
                "filters",
                {}
            )
        )

        final_filters = {
            **parser_filters
        }

        if intent_filters.get(
            "vendor_names"
        ):
            final_filters[
                "vendor_names"
            ] = intent_filters[
                "vendor_names"
            ]

        if intent_filters.get(
            "comparison_request"
        ):
            final_filters[
                "comparison_request"
            ] = intent_filters[
                "comparison_request"
            ]

        # -----------------------------------
        # MERGE FILTERS
        # -----------------------------------

        final_filters = {
            **final_filters
        }

        if llm_filters:

            for key, value in llm_filters.items():

                if (
                    value is not None
                    and
                    value != ""
                ):

                    final_filters[key] = value

        # -----------------------------------
        # VALIDATION
        # -----------------------------------

        validation = (
            QueryValidator.validate(
                intent,
                final_filters
            )
        )

        # -----------------------------------
        # SEARCH PAYLOAD
        # -----------------------------------

        search_payload = (
            QueryTransformer.build_search_payload(
                final_filters
            )
        )

        # -----------------------------------
        # CONFIDENCE
        # -----------------------------------

        confidence = 0.90

        if llm_filters:
            confidence = 0.98

        if validation["is_valid"]:
            confidence += 0.01

        confidence = min(
            confidence,
            0.99
        )

        # -----------------------------------
        # STRUCTURED RESPONSE
        # -----------------------------------

        structured = (
            StructuredResponseBuilder.build(
                parser_filters=
                parser_filters,

                llm_filters=
                llm_filters,

                intent=
                intent,

                confidence=
                confidence
            )
        )

        # -----------------------------------
        # ENRICH RESPONSE
        # -----------------------------------

        structured["normalized_query"] = (
            normalized_query
        )

        structured["needs_clarification"] = (
            validation[
                "needs_clarification"
            ]
        )

        structured["validation"] = (
            validation
        )

        structured["search_payload"] = (
            search_payload
        )

        structured["prompt_chain"] = [
            step["stage"]
            for step in chain
        ]

        return structured

    async def build_recommendation_response(

        self,

        user_message: str,

        recommendations_exist: bool,

        filters: dict

    ) -> str:

        # -----------------------------------
        # NO VENDORS
        # -----------------------------------

        if not recommendations_exist:

            return (

                "Sorry, I couldn't find matching vendors."

            )

        try:

            template = (

                PromptLoader.get_prompt(

                    "recommendation_response"

                )

            )

            category = (

                filters.get(

                    "category"

                )

                or

                "vendor"

            )

            pricing = (

                filters.get(

                    "pricing_preference"

                )

                or

                ""

            )

            city = (

                filters.get(

                    "city"

                )

                or

                ""

            )


            prompt = (

                f"{template}\n\n"

                f"User Query:\n"

                f"{user_message}\n\n"

                f"Category:{category}\n"

                f"Pricing:{pricing}\n"

                f"City:{city}"


            )

            result = await (

                self.execute_prompt(

                    prompt

                )

            )

            if result.get(

                "success"

            ):

                return (

                    result.get(

                        "response"

                    )

                )

        except Exception:

            pass

        # -----------------------------------
        # SAFE FALLBACK
        # -----------------------------------

        return (

            "Perfect. I found vendor options matching your requirements."

        )

    async def _extract_llm_filters(

        self,

        user_message: str

    ):

        try:

            template = (

                PromptLoader.get_prompt(

                    "filter_extraction"

                )

            )

            prompt = (

                f"{template}\n\n"

                f"User:\n"

                f"{user_message}"

            )

            result = await (

                self.execute_prompt(

                    prompt

                )

            )

            if not result.get(

                "success"

            ):

                return {}

            response = result["response"]

            # -----------------------------------
            # JSON PARSE
            # -----------------------------------

            try:

                parsed = json.loads(

                    response

                )

                return parsed

            except Exception:

                logger.warning(

                    "Invalid structured JSON"

                )

                return {}

        except Exception:

            return {}

    def _generate(

        self,

        prompt: str

    ):

        # -----------------------------------
        # GROQ / OLLAMA / MODELSCOPE
        # -----------------------------------

        if self.provider in [

            "groq",
            "ollama",
            "modelscope"

        ]:

            response = (

                self.client
                .chat
                .completions
                .create(

                    model=

                    self.model,

                    messages=[

                        {

                            "role": "system",

                            "content":

                            (
                                "You are a warm, friendly, and emotionally intelligent "
                                "event planning assistant. "
                                "Adapt your tone based on the user's event type, budget, "
                                "preferences, and context. "
                                "Be conversational, natural, and engaging. "
                                "Use occasional emojis when appropriate. "
                                "Avoid robotic responses."
                            )

                        },

                        {

                            "role": "user",

                            "content":

                            prompt

                        }

                    ],

                    temperature=

                    self.TEMPERATURE,

                    stream=False,

                    max_tokens=

                    self.MAX_OUTPUT_TOKENS

                )

            )

            return (

                response
                .choices[0]
                .message.content

            )

        # -----------------------------------
        # GEMINI
        # -----------------------------------

        elif (

            self.provider

            ==

            "gemini"

        ):

            gemini_client: Any = (

                self.client

            )

            response = (

                gemini_client
                .models
                .generate_content(

                    model=

                    self.model,

                    contents=

                    prompt

                )

            )

            return (

                response.text

            )

        # -----------------------------------
        # INVALID PROVIDER
        # -----------------------------------

        raise RuntimeError(

            f"Unsupported provider {self.provider}"

        )