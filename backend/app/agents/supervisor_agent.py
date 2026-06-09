import logging
from app.ai.intent_extractor import IntentExtractor
from app.graphs.graph_state import AgentState

logger = logging.getLogger(__name__)

class SupervisorAgent:

    @staticmethod
    async def execute(state: AgentState) -> AgentState:

        try:

            query = state.get("query", "")

            # -----------------------------------
            # OPTIMIZATION: If intent already
            # passed in from chat_service,
            # skip re-extraction entirely
            # -----------------------------------

            existing_intent = state.get("intent", "")
            existing_filters = state.get("filters", {})

            if existing_intent:

                logger.debug(
                    f"[SupervisorAgent] Intent already in state: {existing_intent} "
                    f"— skipping re-extraction"
                )

                state["secondary_intents"] = state.get("secondary_intents", [])
                state["confidence"] = state.get("confidence", 1.0)
                state["current_agent"] = "supervisor_agent"

                workflow = state.get("workflow_trace", [])
                workflow.append({
                    "agent": "supervisor_agent",
                    "status": "skipped",
                    "reason": "intent already extracted upstream",
                    "intent": existing_intent
                })
                state["workflow_trace"] = workflow

                return state

            # -----------------------------------
            # FULL EXTRACTION
            # Only runs if intent not in state
            # -----------------------------------

            logger.debug(f"[SupervisorAgent] Extracting intent for query: {query}")

            result = IntentExtractor.extract(query)

            intent = result.get("intent", "generic_platform_query")
            filters = result.get("filters", {})

            # Merge — don't overwrite existing filters from state
            merged_filters = {
                **filters,
                **existing_filters
            }

            state["intent"] = intent
            state["secondary_intents"] = result.get("secondary_intents", [])
            state["confidence"] = result.get("confidence", 0.0)
            state["filters"] = merged_filters
            state["current_agent"] = "supervisor_agent"

            workflow = state.get("workflow_trace", [])
            workflow.append({
                "agent": "supervisor_agent",
                "status": "success",
                "intent": intent
            })
            state["workflow_trace"] = workflow

            return state

        except Exception as e:

            logger.error(f"[SupervisorAgent] Exception: {str(e)}", exc_info=True)

            errors = state.get("errors", [])
            errors.append(str(e))
            state["errors"] = errors

            workflow = state.get("workflow_trace", [])
            workflow.append({
                "agent": "supervisor_agent",
                "status": "failed",
                "error": str(e)
            })
            state["workflow_trace"] = workflow

            return state