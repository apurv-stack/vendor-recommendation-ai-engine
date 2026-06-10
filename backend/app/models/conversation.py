import uuid

from sqlalchemy import (
    Boolean,
    Column,
    DateTime,
    ForeignKey,
    Index,
    String,
    Text
)

from sqlalchemy.dialects.postgresql import UUID, JSONB
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app.db.base import Base


class Conversation(Base):
    __tablename__ = "conversations"

    __table_args__ = (
        Index("idx_conversation_session", "session_id"),
        Index("idx_conversation_user", "user_id"),
        Index("idx_conversation_intent", "detected_intent"),
        Index(
            "idx_conversation_user_created",
            "user_id",
            "created_at"
        ),
    )

    conversation_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    session_id = Column(
        UUID(as_uuid=True),
        nullable=False
    )

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.user_id"),
        nullable=False
    )

    user_message = Column(
        Text,
        nullable=False
    )

    ai_response = Column(
        Text,
        nullable=False
    )

    detected_intent = Column(
        String,
        nullable=True
    )

    applied_filters = Column(
        Text,
        nullable=True
    )

    is_follow_up = Column(
        Boolean,
        default=False
    )

    context_summary = Column(
        Text,
        nullable=True
    )

    recommendations = Column(
        JSONB,
        nullable=True
    )

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    user = relationship(
        "User",
        back_populates="conversations"
    )