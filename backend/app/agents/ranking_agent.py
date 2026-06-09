from app.graphs.graph_state import (
    AgentState
)
from app.ai.recommendation_engine import (
    RecommendationEngine
)
class RankingAgent:

    @staticmethod
    async def execute(
        state: AgentState
    ) -> AgentState:

        try:

            vendors = state.get(
                "vendors",
                []
            )

            if not vendors:

                state["ranked_vendors"] = []

                return state

            print(
                "RANKING AGENT INPUT:",
                len(vendors)
            )

            print(
                "RANKING AGENT VENDORS:",
                [
                    v.get("name")
                    if isinstance(v, dict)
                    else getattr(v, "name", str(v))
                    for v in vendors
                ]
            )

            filters = state.get(
                "filters",
                {}
            )

            context = {
                "user_preferences":
                state.get(
                    "user_preferences"
                )
            }

            ranked = (
                RecommendationEngine
                .rank_vendors(
                    vendors,
                    filters,
                    context
                )
            )

            state["ranked_vendors"] = (
                ranked
            )

            state["current_agent"] = (
                "ranking_agent"
            )

            workflow = state.get(
                "workflow_trace",
                []
            )

            workflow.append(
                {
                    "agent":
                    "ranking_agent",

                    "status":
                    "success",

                    "vendors_ranked":
                    len(ranked)
                }
            )

            state["workflow_trace"] = workflow

            return state

        except Exception as e:

            errors = state.get(
                "errors",
                []
            )

            errors.append(
                str(e)
            )

            state["errors"] = errors

            workflow = state.get(
                "workflow_trace",
                []
            )

            workflow.append(
                {
                    "agent":
                    "ranking_agent",

                    "status":
                    "failed",

                    "error":
                    str(e)
                }
            )

            state["workflow_trace"] = workflow

            return state