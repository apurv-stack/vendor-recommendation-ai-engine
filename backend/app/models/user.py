import uuid

from sqlalchemy import (
    Boolean,
    CheckConstraint,
    Column,
    DateTime,
    String
)

from sqlalchemy.orm import relationship

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.sql import func

from app.db.base import Base


class User(Base):

    __tablename__ = "users"

    __table_args__ = (

        CheckConstraint(

            "length(trim(full_name)) > 0",

            name="check_full_name"

        ),

        CheckConstraint(

            "length(trim(username)) > 0",

            name="check_username"

        ),

        CheckConstraint(

            "length(trim(email)) > 0",

            name="check_email"

        ),

        CheckConstraint(

            "phone_number IS NULL OR length(trim(phone_number)) > 0",

            name="check_phone"

        ),

        CheckConstraint(

            "role IN ('user','vendor','admin')",

            name="check_role"

        ),

    )

    user_id = Column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    full_name = Column(

        String,

        nullable=False

    )

    username = Column(

        String,

        unique=True,

        nullable=False

    )

    email = Column(

        String,

        unique=True,

        nullable=False

    )

    phone_number = Column(

        String,

        nullable=True

    )

    role = Column(

        String,

        nullable=False,

        default="user"

    )

    password_hash = Column(

        String,

        nullable=False

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

    # ==========================
    # RELATIONSHIPS
    # ==========================

    vendor = relationship(

        "Vendor",

        back_populates="user",

        uselist=False

    )

    reviews = relationship(

        "Review",

        back_populates="user"

    )

    viewed_vendors = relationship(

        "ViewedVendor",

        back_populates="user"

    )

    
    followed_vendors=relationship(

        "VendorFollow",

        back_populates=

        "user",

        cascade=

        "all, delete-orphan"

    )

    saved_vendors=relationship(

        "SavedVendor",

        cascade=

        "all, delete-orphan"

    )

    preferences = relationship(

        "UserPreference",

        back_populates="user",

        uselist=False

    )

    conversations = relationship(

        "Conversation",

        back_populates="user"

    )

    search_history = relationship(

        "SearchHistory",

        back_populates="user"

    )

    chat_sessions = relationship(

        "ChatSession",

        back_populates="user",

        cascade="all, delete-orphan"

    )

    recommendation_history = relationship(

        "RecommendationHistory",

        back_populates="user",

        cascade="all, delete-orphan"

    )