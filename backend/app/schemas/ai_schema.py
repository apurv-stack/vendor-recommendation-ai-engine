from pydantic import (
    BaseModel,
    Field
)

from typing import Optional


class AIMetadata(BaseModel):

    provider: str

    model: str

    latency_ms: float

    fallback: bool


class AIRequest(BaseModel):

    query: str = Field(

        ...,

        min_length=1,

        description="User conversational query"

    )

    workflow: str = Field(

        default="vendor",

        description="Workflow selection"

    )


class AIResponse(BaseModel):

    success: bool

    response: Optional[str] = None

    error: Optional[str] = None

    metadata: AIMetadata