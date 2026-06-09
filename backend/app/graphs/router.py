from app.graphs.graph_state import (
    AgentState
)


def route_from_supervisor(
    state: AgentState
):

    intent = state.get(
        "intent",
        "generic_platform_query"
    )

    if intent in [

        "vendor_search",

        "vendor_recommendation",

        "pricing_query",

        "service_query",

        "session_query"

    ]:

        return "query_analysis"

    if intent == "comparison_query":

        return "comparison"

    if intent in [

        "review_query",

        "analytics_query",

        "category_query"

    ]:

        return "response"

    return "response"

def route_after_tool_calling(
    state: AgentState
):

    intent = state.get(
        "intent",
        ""
    )

    if intent == "session_query":
        return "response"

    return "ranking"