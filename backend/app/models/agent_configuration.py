import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Text
)

from sqlalchemy.orm import relationship

from sqlalchemy.dialects.postgresql import (
    UUID,
    JSONB
)

from sqlalchemy.sql import func

from app.db.base import Base


class AgentConfiguration(Base):

    __tablename__ = "agent_configurations"

    config_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ai_agents.agent_id", ondelete="CASCADE"),
        nullable=False,
        unique=True
    )

    configuration = Column(
        JSONB,
        nullable=False,
        default=dict
    )

    updated_by = Column(
        Text,
        nullable=True
    )

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    agent = relationship(
        "AIAgent",
        back_populates="configuration"
    )