import logging
from app.ai.ai_service import AIService
from app.graphs.graph_state import AgentState

logger = logging.getLogger(__name__)

SKIP_ANALYSIS_INTENTS = {
    "session_query",
    "query_understanding",
    "greeting",
    "chitchat",
    "comparison_query"
}

class QueryAnalysisAgent:

    @staticmethod
    async def execute(state: AgentState) -> AgentState:

        try:

            intent = state.get("intent", "")

            # ---------------------------------
            # OPTIMIZATION 1
            # Skip for intents that don't need
            # filter extraction at all
            # ---------------------------------

            if intent in SKIP_ANALYSIS_INTENTS:

                logger.debug(
                    f"[QueryAnalysisAgent] Skipping — intent={intent}"
                )

                workflow = state.get("workflow_trace", [])
                workflow.append({
                    "agent": "query_analysis_agent",
                    "status": "skipped",
                    "reason": f"intent={intent} does not require analysis"
                })
                state["workflow_trace"] = workflow
                state["current_agent"] = "query_analysis_agent"
                return state

            # ---------------------------------
            # OPTIMIZATION 2
            # Filters already complete —
            # skip LLM extraction entirely
            # ---------------------------------

            existing_filters = state.get("filters", {})
            has_category = bool(existing_filters.get("category"))
            has_city = bool(existing_filters.get("city"))

            if has_category and has_city and intent != "comparison_query":

                logger.debug(
                    "[QueryAnalysisAgent] Filters already complete — skipping LLM"
                )

                workflow = state.get("workflow_trace", [])
                workflow.append({
                    "agent": "query_analysis_agent",
                    "status": "skipped",
                    "reason": "filters already populated from chat_service"
                })
                state["workflow_trace"] = workflow
                state["current_agent"] = "query_analysis_agent"
                return state

            # ---------------------------------
            # FULL LLM ANALYSIS
            # Only reaches here if filters
            # are genuinely incomplete
            # ---------------------------------

            logger.debug(
                f"[QueryAnalysisAgent] Running full LLM analysis — intent={intent}"
            )

            ai_service = AIService()

            structured = await ai_service.build_structured_response(
                user_message=state.get("query", ""),
                previous=None,
                conversation_context=state.get("conversation_context", "")
            )

            new_filters = structured.get("filters", {})

            merged_filters = {
                **new_filters,
                **existing_filters  # existing always take priority
            }
            merged_filters = {
                k: v for k, v in merged_filters.items()
                if v is not None
            }

            state["filters"] = merged_filters
            state["validation"] = structured.get("validation", {})
            state["search_payload"] = structured.get("search_payload", {})
            state["current_agent"] = "query_analysis_agent"

            workflow = state.get("workflow_trace", [])
            workflow.append({
                "agent": "query_analysis_agent",
                "status": "success",
                "filters_extracted": list(new_filters.keys())
            })
            state["workflow_trace"] = workflow
            return state

        except Exception as e:

            logger.error(
                f"[QueryAnalysisAgent] Exception: {str(e)}", exc_info=True
            )

            errors = state.get("errors", [])
            errors.append(str(e))
            state["errors"] = errors

            workflow = state.get("workflow_trace", [])
            workflow.append({
                "agent": "query_analysis_agent",
                "status": "failed",
                "error": str(e)
            })
            state["workflow_trace"] = workflow
            return state