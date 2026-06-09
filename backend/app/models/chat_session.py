import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text
)

from sqlalchemy.dialects.postgresql import (
    UUID,
    JSONB
)

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.base import Base


class ChatSession(Base):

    __tablename__ = "chat_sessions"

    __table_args__ = (

        Index(
            "idx_chat_session_user",
            "user_id"
        ),

        Index(
            "idx_chat_session_status",
            "status"
        ),

    )

    session_id = Column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    user_id = Column(

        UUID(as_uuid=True),

        ForeignKey("users.user_id"),

        nullable=True

    )

    status = Column(

        String,

        nullable=False,

        default="ACTIVE"

    )

    title = Column(

        String,

        nullable=True

    )

    detected_intent = Column(

        String,

        nullable=True

    )

    current_question = Column(

        Text,

        nullable=True

    )

    context_data = Column(

        JSONB,

        nullable=False,

        default=dict

    )

    missing_fields = Column(

        JSONB,

        nullable=False,

        default=list

    )

    created_at = Column(

        DateTime(timezone=True),

        server_default=func.now()

    )

    updated_at = Column(

        DateTime(timezone=True),

        server_default=func.now(),

        onupdate=func.now()

    )

    user = relationship(
        "User",
        back_populates="chat_sessions"
    )

    recommendation_history = relationship(

        "RecommendationHistory",

        back_populates="session",

        cascade="all, delete-orphan"

    )