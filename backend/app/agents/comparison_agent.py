import logging
from app.graphs.graph_state import AgentState
from app.ai.data_orchestrator import DataOrchestrator
from app.ai.session_manager import SessionManager

logger = logging.getLogger(__name__)

class ComparisonAgent:

    @staticmethod
    async def execute(state: AgentState) -> AgentState:

        try:

            db = state.get("db")
            if db is None:
                raise ValueError("Database session missing from AgentState")

            filters = state.get("filters", {})
            session_id = state.get("session_id", "")
            vendor_names = filters.get("vendor_names", [])

            logger.debug(f"[ComparisonAgent] vendor_names={vendor_names} | filters={filters}")

            vendors = []

            # ---------------------------------
            # STEP 1: Try session memory first
            # Vendors from previous search are
            # already fetched — reuse them
            # ---------------------------------

            remembered = SessionManager.get_vendor_memory(session_id)

            if remembered and len(remembered) >= 2:

                logger.debug(
                    f"[ComparisonAgent] Using session memory — "
                    f"{len(remembered)} vendors available"
                )

                # If vendor names specified, filter to only those
                if vendor_names:
                    name_lower = [n.lower() for n in vendor_names]
                    matched = [
                        v for v in remembered
                        if any(
                            n in getattr(v, "name", "").lower()
                            for n in name_lower
                        )
                    ]
                    vendors = matched if len(matched) >= 2 else remembered[:2]
                else:
                    vendors = remembered[:2]

                logger.debug(
                    f"[ComparisonAgent] Vendors for comparison: "
                    f"{[getattr(v, 'name', str(v)) for v in vendors]}"
                )

            # ---------------------------------
            # STEP 2: Fallback to DB search
            # Only if session memory is empty
            # ---------------------------------

            if len(vendors) < 2:

                logger.debug(
                    "[ComparisonAgent] Session memory insufficient — "
                    "falling back to DataOrchestrator"
                )

                result = DataOrchestrator.fetch_context(
                    db=db,
                    intent="comparison_query",
                    filters=filters,
                    user_preferences={}
                )

                comparison_data = result.get("context", {})
                vendors = comparison_data.get("vendors", [])

                state["comparison_result"] = comparison_data

            # ---------------------------------
            # Set state
            # ---------------------------------

            state["vendors"] = vendors
            state["ranked_vendors"] = vendors
            state["current_agent"] = "comparison_agent"

            logger.debug(
                f"[ComparisonAgent] Final vendor count: {len(vendors)}"
            )

            workflow = state.get("workflow_trace", [])
            workflow.append({
                "agent": "comparison_agent",
                "status": "success",
                "vendors_found": len(vendors)
            })
            state["workflow_trace"] = workflow

            return state

        except Exception as e:

            logger.error(f"[ComparisonAgent] Exception: {str(e)}", exc_info=True)

            errors = state.get("errors", [])
            errors.append(str(e))
            state["errors"] = errors

            workflow = state.get("workflow_trace", [])
            workflow.append({
                "agent": "comparison_agent",
                "status": "failed",
                "error": str(e)
            })
            state["workflow_trace"] = workflow

            return state