import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    String,
    Text
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.base import Base


class Category(Base):

    __tablename__ = "categories"

    # -----------------------------
    # PRIMARY KEY
    # -----------------------------

    category_id = Column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4
    )

    # -----------------------------
    # CATEGORY INFORMATION
    # -----------------------------

    name = Column(

        String,

        nullable=False,

        unique=True
    )

    slug = Column(

        String,

        unique=True,

        nullable=False
    )

    description = Column(

        Text,

        nullable=True
    )

    is_active = Column(

        Boolean,

        default=True
    )

    # -----------------------------
    # TIMESTAMPS
    # -----------------------------

    created_at = Column(

        DateTime(timezone=True),

        server_default=func.now()
    )

    updated_at = Column(

        DateTime(timezone=True),

        server_default=func.now(),

        onupdate=func.now()
    )

    # -----------------------------
    # RELATIONSHIPS
    # -----------------------------

    vendors = relationship(

        "Vendor",

        back_populates="category"
    )