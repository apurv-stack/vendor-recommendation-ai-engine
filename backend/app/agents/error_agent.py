import logging
from app.graphs.graph_state import AgentState

logger = logging.getLogger(__name__)

DEFAULT_ERROR_MESSAGE = (
    "Sorry, something went wrong while "
    "processing your request. Please try again."
)

class ErrorAgent:

    @staticmethod
    async def execute(
        state: AgentState
    ) -> AgentState:

        error_message = DEFAULT_ERROR_MESSAGE

        try:
            from app.services.prompt_service import PromptService
            agent_prompt = PromptService.get_prompt("error_agent")
            if agent_prompt and agent_prompt.base_prompt:
                error_message = agent_prompt.base_prompt.strip()
        except Exception:
            pass

        state["ai_response"] = error_message

        state["current_agent"] = "error_agent"

        workflow = state.get("workflow_trace", [])
        workflow.append({
            "agent": "error_agent",
            "status": "executed",
            "errors": state.get("errors", [])
        })
        state["workflow_trace"] = workflow

        return state