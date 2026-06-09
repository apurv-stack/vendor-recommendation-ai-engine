import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Integer,
    String,
    Text
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.base import Base


class VendorService(Base):

    __tablename__ = "vendor_services"

    __table_args__ = (

        CheckConstraint(

            "length(trim(service_name)) > 0",

            name="check_service_name"

        ),

        CheckConstraint(

            "price IS NULL OR price >= 0",

            name="check_service_price"

        ),

    )

    service_id = Column(

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

    service_name = Column(

        String,

        nullable=False

    )

    description = Column(

        Text,

        nullable=True

    )

    price = Column(

        Integer,

        nullable=True

    )

    is_active = Column(

        Boolean,

        default=True

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

        back_populates="services"

    )