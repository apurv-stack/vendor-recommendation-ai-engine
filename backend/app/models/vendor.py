from uuid import uuid4
from uuid import UUID as UUIDType

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    ForeignKey,
    Integer,
    Float,
    String
)

from sqlalchemy.orm import (
    relationship,
    Mapped,
    mapped_column
)

from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Vendor(Base):

    __tablename__ = "vendors"

    __table_args__ = (

        CheckConstraint(
            "length(trim(name)) > 0",
            name="check_vendor_name"
        ),

        CheckConstraint(
            "length(trim(business_email)) > 0",
            name="check_business_email"
        ),

        CheckConstraint(
            "length(trim(contact_phone)) > 0",
            name="check_contact_phone"
        ),

        CheckConstraint(
            "price_min IS NULL OR price_min >= 0",
            name="check_price_min"
        ),

        CheckConstraint(
            "price_max IS NULL OR price_max >= 0",
            name="check_price_max"
        ),

        CheckConstraint(
            "(price_min IS NULL OR price_max IS NULL) OR (price_min <= price_max)",
            name="check_price_order"
        ),

        CheckConstraint(
            "avg_rating >= 0 AND avg_rating <= 5",
            name="check_rating"
        ),

        CheckConstraint(
            "review_count >= 0",
            name="check_review_count"
        )

    )

    # ==========================
    # PRIMARY KEY
    # ==========================

    vendor_id: Mapped[UUIDType] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )

    # ==========================
    # USER
    # ==========================

    user_id: Mapped[UUIDType | None] = mapped_column(
        UUID(as_uuid=True),
        ForeignKey(
            "users.user_id"
        ),
        nullable=True,
        unique=True
    )

    # ==========================
    # HIERARCHY
    # ==========================

    parent_vendor_id: Mapped[
        UUIDType | None
    ] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey(
            "vendors.vendor_id"
        ),

        nullable=True

    )

    # ==========================
    # DETAILS
    # ==========================

    name: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    slug: Mapped[
        str | None
    ] = mapped_column(

        String,

        unique=True,

        nullable=True

    )

    description: Mapped[
        str | None
    ] = mapped_column(

        String,

        nullable=True

    )

    category_id: Mapped[
        UUIDType | None
    ] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey(
            "categories.category_id"
        ),

        nullable=True

    )

    city: Mapped[
        str | None
    ] = mapped_column(

        String,

        nullable=True

    )

    address: Mapped[
        str | None
    ] = mapped_column(

        String,

        nullable=True

    )

    # ==========================
    # CONTACT
    # ==========================

    business_email: Mapped[str] = mapped_column(
        String,
        nullable=False,
        unique=True
    )

    contact_phone: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    # ==========================
    # PRICING
    # ==========================

    price_min: Mapped[
        int | None
    ] = mapped_column(

        Integer,

        nullable=True

    )

    price_max: Mapped[
        int | None
    ] = mapped_column(

        Integer,

        nullable=True

    )

    # ==========================
    # REVIEW
    # ==========================

    avg_rating: Mapped[
        float
    ] = mapped_column(

        Float,

        default=0

    )

    review_count: Mapped[
        int
    ] = mapped_column(

        Integer,

        default=0

    )

    # ==========================
    # STATUS
    # ==========================

    is_available: Mapped[
        bool
    ] = mapped_column(

        Boolean,

        default=True

    )

    is_verified: Mapped[
        bool
    ] = mapped_column(

        Boolean,

        default=False

    )

    is_active: Mapped[
        bool
    ] = mapped_column(

        Boolean,

        default=True

    )

    # ==========================
    # ANALYTICS
    # ==========================

    followers_count: Mapped[
        int
    ] = mapped_column(

        Integer,

        default=0

    )

    profile_views: Mapped[
        int
    ] = mapped_column(

        Integer,

        default=0

    )

    engagement_score: Mapped[
        float
    ] = mapped_column(

        Float,

        default=0

    )
    # ==========================
    # RELATIONS
    # ==========================

    user = relationship(
        "User",
        back_populates="vendor"
    )

    category = relationship(
        "Category"
    )

    reviews = relationship(
        "Review",
        back_populates="vendor",
        cascade="all, delete-orphan"
    )

    pricing_models = relationship(
        "PricingModel",
        back_populates="vendor",
        cascade="all, delete-orphan"
    )

    media = relationship(
        "VendorMedia",
        back_populates="vendor",
        cascade="all, delete-orphan"
    )

    viewed_by = relationship(
        "ViewedVendor",
        back_populates="vendor",
        cascade="all, delete-orphan"
    )

    followers = relationship(
        "VendorFollow",
        back_populates="vendor",
        cascade="all, delete-orphan"

    )

    saved_by=relationship(
        "SavedVendor",
        cascade=
        "all, delete-orphan"
    )

    notifications=relationship(
        "Notification",
        back_populates=
        "vendor",
        cascade=
        "all, delete-orphan"
    )

    recommendation_metadata = relationship(
        "RecommendationMetadata",
        back_populates="vendor",
        uselist=False,
        cascade="all, delete-orphan"
    )

    semantic_embedding = relationship(
        "SemanticEmbedding",
        back_populates="vendor",
        uselist=False,
        cascade="all, delete-orphan"
    )

    services = relationship(
        "VendorService",
        back_populates="vendor",
        cascade="all, delete-orphan"
    )

    service_records = relationship(

        "Service",

        back_populates="category_vendor",

        cascade="all, delete-orphan"

    )

    parent_vendor = relationship(
        "Vendor",
        remote_side=[vendor_id],
        back_populates="managed_teams"
    )

    managed_teams = relationship(
        "Vendor",
        back_populates="parent_vendor",
        cascade="all, delete-orphan"
    )