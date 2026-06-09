import uuid

from sqlalchemy import (

    Column,
    DateTime,
    ForeignKey,
    UniqueConstraint

)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.base import Base


class ViewedVendor(Base):

    __tablename__ = "viewed_vendors"

    __table_args__=(

        UniqueConstraint(

            "user_id",

            "vendor_id",

            name=

            "unique_user_vendor_view"

        ),

    )

    view_id=Column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    user_id=Column(

        UUID(as_uuid=True),

        ForeignKey(

            "users.user_id",

            ondelete="CASCADE"

        ),

        nullable=False

    )

    vendor_id=Column(

        UUID(as_uuid=True),

        ForeignKey(

            "vendors.vendor_id",

            ondelete="CASCADE"

        ),

        nullable=False

    )

    viewed_at=Column(

        DateTime(

            timezone=True

        ),

        nullable=False,

        server_default=func.now()

    )

    user=relationship(

        "User",

        back_populates=

        "viewed_vendors"

    )

    vendor=relationship(

        "Vendor",

        back_populates=

        "viewed_by"

    )