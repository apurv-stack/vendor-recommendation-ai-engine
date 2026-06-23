import uuid

from sqlalchemy import (
    Column,
    DateTime,
    ForeignKey,
    Integer,
    Text
)

from sqlalchemy.orm import relationship

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.sql import func

from app.db.base import Base


class PromptVersion(Base):

    __tablename__ = "prompt_versions"

    version_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    agent_id = Column(
        UUID(as_uuid=True),
        ForeignKey("ai_agents.agent_id"),
        nullable=False
    )

    version_number = Column(
        Integer,
        nullable=False
    )

    base_prompt = Column(Text)

    role_instructions = Column(Text)

    behavior_guidelines = Column(Text)

    formatting_rules = Column(Text)

    business_rules = Column(Text)

    change_notes = Column(Text)

    created_by = Column(Text)

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    agent = relationship(
        "AIAgent",
        back_populates="versions"
    )