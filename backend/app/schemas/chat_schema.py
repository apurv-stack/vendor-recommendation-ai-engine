from typing import (

    List,
    Optional

)

from pydantic import (

    BaseModel,
    ConfigDict,
    Field,
    field_validator

)


class RecommendationCard(

    BaseModel

):

    vendor_id: str

    vendor_name: str

    category: Optional[
        str
    ] = None

    city: str

    rating: float

    review_count: int = 0

    price_min: Optional[
        int
    ] = None

    price_max: Optional[
        int
    ] = None

    price_range: Optional[
        str
    ] = None

    vendor_description: Optional[
        str
    ] = None

    recommendation_reason: Optional[
        str
    ] = None

    match_score: int = 0

    featured_badge: Optional[str] = None

class ChatRequest(

    BaseModel

):

    message: str = Field(

        ...,

        min_length=1,

        max_length=500

    )

    session_id: Optional[str] = Field(

        default=None,

        max_length=100

    )

    @field_validator(

        "message"

    )

    @classmethod
    def validate_message(

        cls,

        value: str

    ):

        cleaned = value.strip()

        if not cleaned:

            raise ValueError(

                "Message cannot be empty"

            )

        return cleaned


class ChatResponse(

    BaseModel

):

    success: bool

    message: str

    session_id: str

    response_type: str = "chat"

    current_question: Optional[
        str
    ] = None

    missing_fields: List[
        str
    ] = Field(

        default_factory=list

    )

    recommendations: List[
        RecommendationCard
    ] = Field(

        default_factory=list

    )

    error: Optional[
        str
    ] = None

    model_config = ConfigDict(

        from_attributes=True

    )