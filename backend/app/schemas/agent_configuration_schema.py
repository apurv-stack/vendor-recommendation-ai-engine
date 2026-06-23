from typing import Optional, Dict, Any

from pydantic import BaseModel


class AgentConfigurationResponse(BaseModel):

    config_id: str

    agent_id: str

    configuration: Dict[str, Any]

    updated_by: Optional[str] = None

    updated_at: Optional[str] = None

    class Config:
        from_attributes = True


class AgentConfigurationUpdate(BaseModel):

    configuration: Dict[str, Any]

    updated_by: Optional[str] = "admin"


class AgentConfigurationCreate(BaseModel):

    agent_id: str

    configuration: Dict[str, Any]

    updated_by: Optional[str] = "admin"