from fastapi import (
    APIRouter,
    HTTPException
)

from app.schemas.query_schema import (
    QueryRequest
)

from app.ai.query_preprocessor import (
    QueryPreprocessor
)

from app.ai.query_parser import (
    QueryParser
)

from app.ai.intent_extractor import (
    IntentExtractor
)

from app.ai.query_validator import (
    QueryValidator
)

from app.ai.query_transformer import (
    QueryTransformer
)

from app.ai.filter_generator import (
    FilterGenerator
)

from app.ai.filter_validator import (
    FilterValidator
)

from app.ai.ai_service import (
    AIService
)


router = APIRouter(

    prefix="/query",

    tags=[
        "Query Understanding"
    ]

)


# ==================================================
# PREPROCESS
# ==================================================

@router.post(
    "/preprocess"
)
async def preprocess_query(
    request: QueryRequest
):

    try:

        normalized_query = (

            QueryPreprocessor.preprocess(

                request.query

            )

        )

        return {

            "success": True,

            "original_query":

            request.query,

            "normalized_query":

            normalized_query

        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )


# ==================================================
# UNDERSTAND
# ==================================================

@router.post(
    "/understand"
)
async def understand_query(
    request: QueryRequest
):

    try:

        normalized_query = (

            QueryPreprocessor.preprocess(

                request.query

            )

        )

        intent_data = (

            IntentExtractor.extract(

                request.query

            )

        )

        filters = dict(

            intent_data["filters"]

        )

        validation = (

            QueryValidator.validate(

                intent_data["intent"],

                filters

            )

        )

        structured_filter = (

            FilterGenerator.generate(

                filters

            )

        )

        filter_validation = (

            FilterValidator.validate(

                structured_filter

            )

        )

        search_payload = (

            QueryTransformer.build_search_payload(

                filters

            )

        )

        return {

            "success": True,

            "original_query":

            request.query,

            "normalized_query":

            normalized_query,

            "intent":

            intent_data["intent"],

            "secondary_intents":

            intent_data.get(

                "secondary_intents",

                []

            ),

            "confidence":

            intent_data.get(

                "confidence",

                0.0

            ),

            "filters":

            filters,

            "structured_filter":

            structured_filter,

            "validation":

            validation,

            "filter_validation":

            filter_validation,

            "search_payload":

            search_payload

        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )


# ==================================================
# AI UNDERSTAND
# ==================================================

@router.post(
    "/ai-understand"
)
async def ai_understand_query(
    request: QueryRequest
):

    try:

        service = AIService()

        result = await (

            service.build_structured_response(

                request.query

            )

        )

        structured_filter = (

            FilterGenerator.generate(

                result.get(

                    "filters",

                    {}

                )

            )

        )

        filter_validation = (

            FilterValidator.validate(

                structured_filter

            )

        )

        result[

            "structured_filter"

        ] = structured_filter

        result[

            "filter_validation"

        ] = filter_validation

        return {

            "success": True,

            "data":

            result

        }

    except Exception as e:

        raise HTTPException(

            status_code=500,

            detail=str(e)

        )