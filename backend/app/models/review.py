import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Float,
    ForeignKey,
    Index,
    String,
    Text
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.base import Base


class Review(Base):

    __tablename__ = "reviews"

    __table_args__ = (

        Index(

            "idx_review_vendor",

            "vendor_id"

        ),

        Index(

            "idx_review_user",

            "user_id"

        ),

        Index(

            "idx_review_rating",

            "rating"

        ),

        Index(

            "idx_review_created_at",

            "created_at"

        ),

        CheckConstraint(

            "rating >= 1 AND rating <= 5",

            name="check_review_rating"

        ),

        CheckConstraint(

            "sentiment_score >= -1 AND sentiment_score <= 1",

            name="check_sentiment_score"

        ),

    )

    review_id = Column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    vendor_id = Column(

        UUID(as_uuid=True),

        ForeignKey(

            "vendors.vendor_id"

        ),

        nullable=False

    )

    user_id = Column(

        UUID(as_uuid=True),

        ForeignKey(

            "users.user_id"

        ),

        nullable=False

    )

    review_title = Column(

        String,

        nullable=True

    )

    rating = Column(

        Float,

        nullable=False

    )

    review_text = Column(

        Text,

        nullable=True

    )

    is_approved = Column(

        Boolean,

        default=True

    )

    sentiment_score = Column(

        Float,

        nullable=True

    )

    created_at = Column(

        DateTime(

            timezone=True

        ),

        server_default=func.now()

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

        "reviews"

    )

    user = relationship(

        "User",

        back_populates=

        "reviews"

    )