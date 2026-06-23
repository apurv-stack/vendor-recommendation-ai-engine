from app.graphs.graph_state import (
    AgentState
)

from app.ai.data_orchestrator import (
    DataOrchestrator
)

from sqlalchemy.orm import Session

class DiscoveryAgent:

    @staticmethod
    async def execute(
        state: AgentState
    ) -> AgentState:

        try:

            db = state.get("db")

            if db is None:
                raise ValueError(
                    "Database session missing from AgentState"
                )

            intent = state.get(
                "intent",
                ""
            )

            filters = state.get(
                "filters",
                {}
            )

            user_preferences = (
                state.get(
                    "user_preferences",
                    {}
                )
            )
            

            from app.services.agent_configuration_service import AgentConfigurationService

            discovery_cfg = AgentConfigurationService.get_configuration_by_agent_name(
                db, "discovery_agent"
            )
            discovery_config = discovery_cfg.configuration if discovery_cfg else {}
            max_results = discovery_config.get("max_results", 20)
            allow_out_of_budget = discovery_config.get("allow_out_of_budget", True)

            if allow_out_of_budget:
                filters = {**filters, "strict_budget": False}

            result = (
                DataOrchestrator.fetch_context(
                    db=db,
                    intent=intent,
                    filters=filters,
                    user_preferences=user_preferences
                )
            )

            vendors = (
                result.get("recommendations", {}).get("vendors", [])
                or
                result.get("context", {}).get("vendors", [])
            )

            vendors = vendors[:max_results]
            

            print(
                "DISCOVERY AGENT VENDORS:",
                [
                    v.name if hasattr(v, "name")
                    else str(v)
                    for v in vendors
                ]   
            )

            print(
                "DISCOVERY AGENT COUNT:",
                len(vendors)
            )

            state["vendors"] = vendors

            state["context"] = (
                result.get(
                    "context",
                    {}
                )
            )

            state["current_agent"] = (
                "discovery_agent"
            )

            workflow = (
                state.get(
                    "workflow_trace",
                    []
                )
            )

            workflow.append(
                {
                    "agent":
                    "discovery_agent",

                    "status":
                    "success",

                    "vendors_found":
                    len(vendors)
                }
            )

            state["workflow_trace"] = (
                workflow
            )

            return state

        except Exception as e:

            errors = (
                state.get(
                    "errors",
                    []
                )
            )

            errors.append(
                str(e)
            )

            state["errors"] = errors

            workflow = (
                state.get(
                    "workflow_trace",
                    []
                )
            )

            workflow.append(
                {
                    "agent":
                    "discovery_agent",

                    "status":
                    "failed",

                    "error":
                    str(e)
                }
            )

            state["workflow_trace"] = (
                workflow
            )

            return state