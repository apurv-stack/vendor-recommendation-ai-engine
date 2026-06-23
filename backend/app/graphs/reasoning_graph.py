from langgraph.graph import (
    StateGraph,
    END
)

from app.graphs.graph_state import AgentState
from app.graphs.router import (
    route_from_supervisor,
    route_after_tool_calling
)

from app.agents.supervisor_agent import SupervisorAgent
from app.agents.context_agent import ContextAgent
from app.agents.query_analysis_agent import QueryAnalysisAgent
from app.agents.comparison_agent import ComparisonAgent
from app.agents.discovery_agent import DiscoveryAgent
from app.agents.ranking_agent import RankingAgent
from app.agents.response_agent import ResponseAgent
from app.agents.error_agent import ErrorAgent
from app.agents.tool_calling_agent import ToolCallingAgent


def route_after_analysis(state: AgentState):
    intent = state.get("intent", "")
    if intent == "comparison_query":
        return "comparison"
    return "discovery"


class ReasoningGraph:

    @staticmethod
    def build():

        workflow = StateGraph(AgentState)

        # NODES
        workflow.add_node("supervisor", SupervisorAgent.execute)
        workflow.add_node("context", ContextAgent.execute)
        workflow.add_node("query_analysis", QueryAnalysisAgent.execute)
        workflow.add_node("tool_calling", ToolCallingAgent().execute)
        workflow.add_node("comparison", ComparisonAgent.execute)
        workflow.add_node("discovery", DiscoveryAgent.execute)
        workflow.add_node("ranking", RankingAgent.execute)
        workflow.add_node("response", ResponseAgent.execute)
        workflow.add_node("error", ErrorAgent.execute)

        # ENTRY
        workflow.set_entry_point("supervisor")

        # SUPERVISOR ROUTING
        # FIX: comparison_query goes directly to comparison node, NOT context
        workflow.add_conditional_edges(
            "supervisor",
            route_from_supervisor,
            {
                "query_analysis": "context",
                "comparison": "comparison",   # ← FIXED: was "context", now "comparison"
                "response": "response"
            }
        )

        # RECOMMENDATION FLOW
        workflow.add_edge("context", "query_analysis")

        workflow.add_conditional_edges(
            "query_analysis",
            route_after_analysis,
            {
                "comparison": "comparison",
                "discovery": "tool_calling"
            }
        )

        workflow.add_conditional_edges(
            "tool_calling",
            route_after_tool_calling,
            {
                "ranking": "discovery",
                "response": "response"
            }
        )

        workflow.add_edge("discovery", "ranking")
        workflow.add_edge("ranking", "response")

        # END STATES
        workflow.add_edge("comparison", "response")
        workflow.add_edge("response", END)
        workflow.add_edge("error", END)

        return workflow.compile()


reasoning_graph = ReasoningGraph.build()