from pydantic import BaseModel
from typing import Optional
from uuid import UUID
from datetime import datetime


class AgentBase(BaseModel):
    agent_name: str
    display_name: str
    description: Optional[str] = None
    status: bool = True


class AgentResponse(AgentBase):
    agent_id: UUID
    created_at: datetime | None = None
    updated_at: datetime | None = None

    class Config:
        from_attributes = True


class PromptUpdateRequest(BaseModel):
    base_prompt: Optional[str] = None
    role_instructions: Optional[str] = None
    behavior_guidelines: Optional[str] = None
    formatting_rules: Optional[str] = None
    business_rules: Optional[str] = None
    change_notes: str


class PromptResponse(BaseModel):
    prompt_id: UUID
    agent_id: UUID

    base_prompt: Optional[str] = None
    role_instructions: Optional[str] = None
    behavior_guidelines: Optional[str] = None
    formatting_rules: Optional[str] = None
    business_rules: Optional[str] = None

    updated_by: Optional[str] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class PromptVersionResponse(BaseModel):
    version_id: UUID
    agent_id: UUID
    version_number: int

    change_notes: Optional[str] = None
    created_by: Optional[str] = None
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True