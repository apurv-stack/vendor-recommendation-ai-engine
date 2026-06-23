import logging
from app.graphs.graph_state import AgentState

logger = logging.getLogger(__name__)


def route_from_supervisor(state: AgentState):

    intent = state.get("intent", "generic_platform_query")

    logger.info(f"[Router] route_from_supervisor — intent={intent}")

    if intent in [
        "vendor_search",
        "vendor_recommendation",
        "pricing_query",
        "service_query",
        "session_query"
    ]:
        return "query_analysis"

    if intent == "comparison_query":
        logger.info("[Router] Routing to COMPARISON node")
        return "comparison"

    if intent in [
        "review_query",
        "analytics_query",
        "category_query"
    ]:
        return "response"

    return "response"


def route_after_tool_calling(state: AgentState):

    intent = state.get("intent", "")

    if intent == "session_query":
        return "response"

    return "ranking"