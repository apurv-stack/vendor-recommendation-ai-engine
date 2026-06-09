import uuid

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Index,
    String,
    Float
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.base import Base


class UserPreference(Base):

    __tablename__ = "user_preferences"

    __table_args__ = (

        Index(

            "idx_user_preference_category",

            "preferred_category"

        ),

        Index(

            "idx_user_preference_vendor",

            "favorite_vendor_id"

        ),

        CheckConstraint(

            "preferred_city IS NULL OR length(trim(preferred_city)) > 0",

            name=

            "check_preferred_city"

        ),

        CheckConstraint(

            "preferred_price_range IS NULL OR length(trim(preferred_price_range)) > 0",

            name=

            "check_price_range"

        ),

        CheckConstraint(

            "preferred_event_type IS NULL OR length(trim(preferred_event_type)) > 0",

            name=

            "check_event_type"

        ),

    )

    preference_id = Column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    user_id = Column(

        UUID(as_uuid=True),

        ForeignKey(

            "users.user_id"

        ),

        nullable=False,

        unique=True

    )

    preferred_category = Column(

        String,

        nullable=True
    )

    preferred_city = Column(

        String,

        nullable=True

    )

    preferred_price_range = Column(

        String,

        nullable=True

    )

    preferred_event_type = Column(

        String,

        nullable=True

    )

    preferred_min_rating = Column(
        Float,
        nullable=True
    )

    favorite_vendor_id = Column(

        UUID(as_uuid=True),

        ForeignKey(

            "vendors.vendor_id"

        ),

        nullable=True

    )

    preference_notes = Column(

        String,

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

    user = relationship(

        "User",

        back_populates=

        "preferences"

    )

    favorite_vendor = relationship(

        "Vendor"

    )