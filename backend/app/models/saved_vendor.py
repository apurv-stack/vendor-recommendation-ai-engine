import uuid

from sqlalchemy import (

    Column,
    ForeignKey,
    UniqueConstraint,
    DateTime

)

from sqlalchemy.orm import relationship

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.sql import func

from app.db.base import Base


class SavedVendor(Base):

    __tablename__="saved_vendors"

    __table_args__=(

        UniqueConstraint(

            "user_id",
            "vendor_id",

            name=

            "unique_saved_vendor"

        ),

    )

    saved_id=Column(

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

    created_at=Column(

        DateTime(

            timezone=True

        ),

        server_default=func.now()

    )

    user=relationship(

        "User"

    )

    vendor=relationship(

        "Vendor"

    )