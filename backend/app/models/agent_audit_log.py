import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    String
)

from sqlalchemy.orm import relationship

from sqlalchemy.dialects.postgresql import (
    UUID,
    JSONB
)

from sqlalchemy.sql import func

from app.db.base import Base


class AgentAuditLog(Base):

    __tablename__ = "agent_audit_logs"

    audit_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ai_agents.agent_id"),
        nullable=False
    )

    action = Column(
        String,
        nullable=False
    )

    old_value = Column(
        JSONB,
        nullable=True
    )

    new_value = Column(
        JSONB,
        nullable=True
    )

    modified_by = Column(
        String,
        nullable=True
    )

    modified_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    agent = relationship(
        "AIAgent",
        back_populates="audit_logs"
    )