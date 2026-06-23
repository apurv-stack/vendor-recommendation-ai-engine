import uuid

from sqlalchemy import (
    Column,
    DateTime,
    String,
    Text,
    Boolean
)

from sqlalchemy.orm import relationship

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.sql import func

from app.db.base import Base


class AIAgent(Base):

    __tablename__ = "ai_agents"

    agent_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    agent_name = Column(
        String,
        unique=True,
        nullable=False
    )

    display_name = Column(
        String,
        nullable=False
    )

    description = Column(
        Text,
        nullable=True
    )

    status = Column(
        Boolean,
        default=True
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

    prompts = relationship(
        "AgentPrompt",
        back_populates="agent",
        cascade="all, delete-orphan"
    )

    versions = relationship(
        "PromptVersion",
        back_populates="agent",
        cascade="all, delete-orphan"
    )

    audit_logs = relationship(
        "AgentAuditLog",
        back_populates="agent",
        cascade="all, delete-orphan"
    )

    configuration = relationship(
        "AgentConfiguration",
        back_populates="agent",
        uselist=False,
        cascade="all, delete-orphan"
    )