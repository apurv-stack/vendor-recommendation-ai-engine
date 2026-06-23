import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Text
)

from sqlalchemy.orm import relationship

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.sql import func

from app.db.base import Base


class AgentPrompt(Base):

    __tablename__ = "agent_prompts"

    prompt_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ai_agents.agent_id"),
        nullable=False
    )

    base_prompt = Column(Text, nullable=True)

    role_instructions = Column(Text, nullable=True)

    behavior_guidelines = Column(Text, nullable=True)

    formatting_rules = Column(Text, nullable=True)

    business_rules = Column(Text, nullable=True)

    updated_by = Column(Text, nullable=True)

    updated_at = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now()
    )

    agent = relationship(
        "AIAgent",
        back_populates="prompts"
    )