from uuid import uuid4
from uuid import UUID as UUIDType

from sqlalchemy import (
    String,
    ForeignKey,
    UniqueConstraint
)

from sqlalchemy.orm import (
    Mapped,
    mapped_column,
    relationship
)

from sqlalchemy.dialects.postgresql import UUID

from app.db.base import Base


class Service(Base):

    __tablename__ = "services"

    __table_args__ = (

        UniqueConstraint(
            "category_vendor_id",
            "service_name",
            name="unique_service_per_category"
        ),

    )

    # =====================
    # PRIMARY KEY
    # =====================

    service_id: Mapped[
        UUIDType
    ] = mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid4

    )

    # =====================
    # DETAILS
    # =====================

    service_name: Mapped[
        str
    ] = mapped_column(

        String,

        nullable=False

    )

    # =====================
    # CATEGORY LINK
    # =====================

    category_vendor_id: Mapped[
        UUIDType
    ] = mapped_column(

        UUID(as_uuid=True),

        ForeignKey(
            "vendors.vendor_id",
            ondelete="CASCADE"
        ),

        nullable=False

    )

    # =====================
    # RELATIONS
    # =====================

    category_vendor = relationship(
        "Vendor",
        back_populates="service_records"
    )