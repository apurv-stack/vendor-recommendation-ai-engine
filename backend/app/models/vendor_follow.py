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


class VendorFollow(Base):

    __tablename__="vendor_follows"

    __table_args__=(

        UniqueConstraint(

            "user_id",

            "vendor_id",

            name=

            "unique_user_vendor_follow"

        ),

    )

    follower_id=Column(

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

        "User",

        back_populates=

        "followed_vendors"

    )

    vendor=relationship(

        "Vendor",

        back_populates=

        "followers"

    )