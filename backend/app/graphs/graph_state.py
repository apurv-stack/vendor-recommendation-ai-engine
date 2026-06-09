from typing import (
    TypedDict,
    Dict,
    List,
    Any,
    Optional
)

from sqlalchemy.orm import Session

class AgentState(TypedDict, total=False):

    # -----------------------------------
    # REQUEST
    # -----------------------------------
    query: str
    session_id: str
    user_id: str
    db: Session
    access_token: str | None

    # -----------------------------------
    # ROUTING
    # -----------------------------------
    intent: str
    secondary_intents: List[str]
    confidence: float

    # -----------------------------------
    # QUERY ANALYSIS
    # -----------------------------------
    filters: Dict[str, Any]
    validation: Dict[str, Any]
    search_payload: Dict[str, Any]

    # -----------------------------------
    # TOOL CALLING
    # -----------------------------------
    tool_name: str
    tool_input: Dict[str, Any]
    tool_output: Dict[str, Any]
    tool_status: Optional[str]
    tool_error: Optional[str]

    # -----------------------------------
    # CONTEXT
    # -----------------------------------
    conversation_context: str
    user_preferences: Dict[str, Any]
    context: Dict[str, Any]

    # -----------------------------------
    # VENDOR DATA
    # -----------------------------------
    vendors: List[Any]
    ranked_vendors: List[Any]

    # -----------------------------------
    # SESSION DATA
    # -----------------------------------
    session_context: Dict[str, Any]
    
    query_analysis: Dict[str, Any]

    structured: Dict[str, Any]
    
    # -----------------------------------
    # COMPARISON
    # -----------------------------------
    comparison_result: Dict[str, Any]

    # -----------------------------------
    # RESPONSE
    # -----------------------------------
    ai_response: str

    # -----------------------------------
    # WORKFLOW
    # -----------------------------------
    current_agent: str
    workflow_trace: List[Dict[str, Any]]

    # -----------------------------------
    # ERROR HANDLING
    # -----------------------------------
    errors: List[str]
    retry_count: int