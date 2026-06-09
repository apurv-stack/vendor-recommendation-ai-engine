import uuid

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.base import Base


class RecommendationMetadata(Base):

    __tablename__ = "recommendation_metadata"

    __table_args__ = (

        CheckConstraint(

            "recommendation_score >= 0",

            name="check_recommendation_positive"

        ),

        CheckConstraint(

            "popularity_score >= 0",

            name="check_popularity_positive"

        ),

        CheckConstraint(

            "engagement_score >= 0",

            name="check_engagement_positive"

        ),

    )

    metadata_id = Column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    vendor_id = Column(

        UUID(as_uuid=True),

        ForeignKey(

            "vendors.vendor_id"

        ),

        nullable=False,

        unique=True

    )

    recommendation_score = Column(

        Float,

        default=0.0,

        nullable=False

    )

    popularity_score = Column(

        Float,

        default=0.0,

        nullable=False

    )

    engagement_score = Column(

        Float,

        default=0.0,

        nullable=False

    )

    updated_at = Column(

        DateTime(

            timezone=True

        ),

        server_default=func.now(),

        onupdate=func.now()

    )

    vendor = relationship(

        "Vendor",

        back_populates=

        "recommendation_metadata"

    )