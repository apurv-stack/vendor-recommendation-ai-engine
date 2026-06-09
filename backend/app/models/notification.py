import uuid

from sqlalchemy import (

    Boolean,
    String,
    ForeignKey,
    DateTime

)

from sqlalchemy.orm import (

    Mapped,
    mapped_column,
    relationship

)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.sql import func

from app.db.base import Base


class Notification(Base):

    __tablename__="notifications"


    notification_id:Mapped[uuid.UUID]=mapped_column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )


    vendor_id:Mapped[uuid.UUID]=mapped_column(

        UUID(as_uuid=True),

        ForeignKey(

            "vendors.vendor_id",

            ondelete="CASCADE"

        )

    )


    title:Mapped[str]=mapped_column(

        String,

        nullable=False

    )


    message:Mapped[str]=mapped_column(

        String,

        nullable=False

    )


    is_read:Mapped[bool]=mapped_column(

        Boolean,

        default=False,

        nullable=False

    )


    created_at:Mapped[DateTime]=mapped_column(

        DateTime(

            timezone=True

        ),

        server_default=func.now()

    )


    vendor=relationship(

        "Vendor"

    )