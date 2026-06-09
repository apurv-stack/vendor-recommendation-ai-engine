from typing import Dict

from app.ai.prompts.ai_prompts import (

    VENDOR_DISCOVERY_PROMPT,

    FILTER_EXTRACTION_PROMPT,

    FOLLOWUP_RESPONSE_PROMPT,

    RECOMMENDATION_RESPONSE_PROMPT

)

from app.ai.prompts.model_prompts import (

    SQLALCHEMY_MODEL_PROMPT,

    POSTGRES_TABLE_PROMPT,

    RELATIONSHIP_MAPPING_PROMPT,

    QUERY_OPTIMIZATION_PROMPT

)

from app.ai.prompts.workflow_prompts import (

    CURSOR_AI_ENGINEERING_PROMPT,

    BACKEND_WORKFLOW_PROMPT,

    FRONTEND_WORKFLOW_PROMPT,

    DATABASE_WORKFLOW_PROMPT,

    AI_WORKFLOW_PROMPT,

    PROMPT_ENGINEERING_STRATEGY_PROMPT,

    AI_VALIDATION_PROMPT

)


class PromptLoader:

    _cache: Dict[str, str] = {}

    _prompt_registry = {

        # Vendor AI

        "vendor_discovery":

        VENDOR_DISCOVERY_PROMPT,

        "filter_extraction":

        FILTER_EXTRACTION_PROMPT,

        "followup_response":

        FOLLOWUP_RESPONSE_PROMPT,

        "recommendation_response":

        RECOMMENDATION_RESPONSE_PROMPT,

        # Database

        "sqlalchemy_model":

        SQLALCHEMY_MODEL_PROMPT,

        "postgres_table":

        POSTGRES_TABLE_PROMPT,

        "relationship_mapping":

        RELATIONSHIP_MAPPING_PROMPT,

        "query_optimization":

        QUERY_OPTIMIZATION_PROMPT,

        # Engineering Workflow

        "cursor_engineering":

        CURSOR_AI_ENGINEERING_PROMPT,

        "backend_workflow":

        BACKEND_WORKFLOW_PROMPT,

        "frontend_workflow":

        FRONTEND_WORKFLOW_PROMPT,

        "database_workflow":

        DATABASE_WORKFLOW_PROMPT,

        "ai_workflow":

        AI_WORKFLOW_PROMPT,

        "prompt_strategy":

        PROMPT_ENGINEERING_STRATEGY_PROMPT,

        "validation":

        AI_VALIDATION_PROMPT

    }

    @classmethod
    def get_prompt(

        cls,

        name: str

    ) -> str:

        cached=(

            cls._cache.get(

                name

            )

        )

        if cached:

            return cached

        prompt=(

            cls._prompt_registry.get(

                name

            )

        )

        if not prompt:

            available=(

                ", ".join(

                    sorted(

                        cls._prompt_registry.keys()

                    )

                )

            )

            raise ValueError(

                f"Prompt '{name}' not found. "

                f"Available prompts: {available}"

            )

        cls._cache[

            name

        ]=prompt

        return prompt

    @classmethod
    def register_prompt(

        cls,

        name:str,

        content:str

    ):

        cls._prompt_registry[

            name

        ]=content

        cls._cache.pop(

            name,

            None

        )

    @classmethod
    def clear_cache(

        cls

    ):

        cls._cache.clear()

    @classmethod
    def available_prompts(

        cls

    ):

        return sorted(

            cls._prompt_registry.keys()

        )