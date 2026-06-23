import logging
from app.graphs.graph_state import AgentState
from app.ai.data_orchestrator import DataOrchestrator
from app.ai.session_manager import SessionManager

logger = logging.getLogger(__name__)


def _vendor_name_matches(vendor_name: str, targets: list[str]) -> bool:
    """
    Bidirectional partial match.
    'Elite Catering Services' matches target 'elite catering services'
    'Budget Catering Hub' matches target 'budget catering'
    """
    vendor_lower = vendor_name.lower().strip()
    for target in targets:
        target_lower = target.lower().strip()
        if target_lower in vendor_lower or vendor_lower in target_lower:
            return True
    return False


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

            logger.info(f"[ComparisonAgent] vendor_names from filters: {vendor_names}")
            logger.info(f"[ComparisonAgent] full filters: {filters}")

            from app.services.agent_configuration_service import AgentConfigurationService

            comparison_config = {}
            try:
                comp_cfg = AgentConfigurationService.get_configuration_by_agent_name(
                    db, "comparison_agent"
                )
                comparison_config = comp_cfg.configuration if comp_cfg else {}
                logger.info(f"[ComparisonAgent] Loaded comparison_config: {comparison_config}")
                print(f"COMPARISON CONFIG LOADED: {comparison_config}")
            except Exception as e:
                logger.error(f"[ComparisonAgent] Failed to load comparison_config: {e}", exc_info=True)
                print(f"COMPARISON CONFIG ERROR: {e}")
                comparison_config = {}

            state["comparison_config"] = comparison_config

            vendors = []

            # ---------------------------------
            # STEP 1: Try session memory first
            # ---------------------------------
            remembered = SessionManager.get_vendor_memory(session_id)

            if remembered and vendor_names:

                matched = []
                unmatched_targets = list(vendor_names)

                for vendor in remembered:
                    vendor_name_lower = getattr(vendor, "name", "").lower().strip()
                    for target in unmatched_targets:
                        target_lower = target.lower().strip()
            # Score: count how many words of target appear in vendor name
                        target_words = set(target_lower.split())
                        vendor_words = set(vendor_name_lower.split())
                        common = target_words & vendor_words
            # Match if majority of target words found in vendor name
                        if len(common) >= max(1, len(target_words) - 1):
                            matched.append(vendor)
                            unmatched_targets.remove(target)
                            break

                logger.info(
                    f"[ComparisonAgent] Matched vendors from session: "
                    f"{[getattr(v, 'name', str(v)) for v in matched]}"
                )

                if len(matched) >= 2:
                    vendors = matched[:2]
                    state["vendors"] = vendors
                    state["ranked_vendors"] = vendors
                    state["current_agent"] = "comparison_agent"
                    workflow = state.get("workflow_trace", [])
                    workflow.append({
                        "agent": "comparison_agent",
                        "status": "success",
                        "vendors_found": len(vendors),
                        "source": "session_memory_matched"
                    })
                    state["workflow_trace"] = workflow
                    return state

                elif len(matched) == 1:
                    # Only 1 matched — still try DB fallback below
                    logger.warning(
                        f"[ComparisonAgent] Only 1 vendor matched in session — "
                        f"falling back to DB"
                    )

            elif remembered and not vendor_names:
                # No specific vendors requested — use top 2 from memory
                vendors = remembered[:2]
                logger.info(
                    f"[ComparisonAgent] No vendor_names specified — "
                    f"using top 2 from session memory"
                )

            # ---------------------------------
            # STEP 2: Fallback to DB search
            # ---------------------------------
            if len(vendors) < 2:
                logger.info(
                    "[ComparisonAgent] Falling back to DataOrchestrator DB search"
                )

                result = DataOrchestrator.fetch_context(
                    db=db,
                    intent="comparison_query",
                    filters=filters,
                    user_preferences={}
                )

                comparison_data = result.get("context", {})
                db_vendors = comparison_data.get("vendors", [])

                logger.info(
                    f"[ComparisonAgent] DB returned {len(db_vendors)} vendors: "
                    f"{[getattr(v, 'name', str(v)) for v in db_vendors]}"
                )

                # If vendor_names specified, filter DB results too
                if vendor_names and db_vendors:
                    matched_db = [
                        v for v in db_vendors
                        if _vendor_name_matches(getattr(v, "name", ""), vendor_names)
                    ]
                    vendors = matched_db if len(matched_db) >= 2 else db_vendors[:2]
                else:
                    vendors = db_vendors[:2]

                state["comparison_result"] = comparison_data

            # ---------------------------------
            # Set final state
            # ---------------------------------
            state["vendors"] = vendors
            state["ranked_vendors"] = vendors
            state["current_agent"] = "comparison_agent"

            logger.info(
                f"[ComparisonAgent] Final vendors for comparison: "
                f"{[getattr(v, 'name', str(v)) for v in vendors]}"
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