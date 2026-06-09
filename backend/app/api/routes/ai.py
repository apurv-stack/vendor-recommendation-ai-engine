from fastapi import APIRouter

from app.schemas.ai_schema import (
    AIRequest,
    AIResponse
)

from app.ai.ai_service import AIService


router = APIRouter(

    prefix="/ai",

    tags=["AI"]

)


service = AIService()


@router.post(

    "/chat",

    response_model=AIResponse

)

async def ai_chat(

    payload: AIRequest

):

    workflow_map = {

        "vendor": "ai_prompts.md",

        "crud": "crud_prompts.md",

        "model": "model_prompts.md",

        "react": "react_prompts.md"

    }

    prompt_file = workflow_map.get(

        payload.workflow,

        "ai_prompts.md"

    )

    result = await service.execute_prompt_file(

        prompt_file,

        payload.query

    )

    return result