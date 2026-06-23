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

            from app.services.agent_configuration_service import AgentConfigurationService

            db = state.get("db")
            _close_db = False
            if db is None:
                from app.db.session import SessionLocal
                db = SessionLocal()
                _close_db = True
            try:
                ranking_config = AgentConfigurationService.get_configuration_by_agent_name(
                    db, "ranking_agent"
                )
                config_values = ranking_config.configuration if ranking_config else {}
            finally:
                if _close_db:
                    db.close()

            context = {
                "user_preferences": state.get("user_preferences"),
                "ranking_config": config_values
            }

            max_results = config_values.get("max_results", 10)

            ranked = (
                RecommendationEngine
                .rank_vendors(
                    vendors,
                    filters,
                    context,
                    max_results=max_results
                )
            )

            state["ranked_vendors"] = ranked

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