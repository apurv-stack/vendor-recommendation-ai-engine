import enum
import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    Enum,
    ForeignKey,
    Integer,
    String,
    Text
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.base import Base


class PricingType(str, enum.Enum):

    FIXED = "fixed"

    HOURLY = "hourly"

    PACKAGE = "package"

    CUSTOM = "custom"


class PricingModel(Base):

    __tablename__ = "pricing_models"

    __table_args__ = (

        CheckConstraint(

            "price >= 0",

            name="check_price_positive"

        ),

    )

    # -----------------------------
    # PRIMARY KEY
    # -----------------------------

    pricing_id = Column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    # -----------------------------
    # RELATIONSHIP
    # -----------------------------

    vendor_id = Column(

        UUID(as_uuid=True),

        ForeignKey(

            "vendors.vendor_id"

        ),

        nullable=False

    )

    # -----------------------------
    # PRICING INFORMATION
    # -----------------------------

    title = Column(

        String,

        nullable=False

    )

    description = Column(

        Text,

        nullable=True

    )

    price = Column(

        Integer,

        nullable=False

    )

    currency = Column(

        String,

        default="INR",

        nullable=False

    )

    pricing_type = Column(

        Enum(

            PricingType

        ),

        nullable=False

    )

    is_active = Column(

        Boolean,

        default=True

    )

    # -----------------------------
    # TIMESTAMPS
    # -----------------------------

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

    # -----------------------------
    # RELATIONSHIPS
    # -----------------------------

    vendor = relationship(

        "Vendor",

        back_populates=

        "pricing_models"

    )