import logging
from app.graphs.graph_state import AgentState
from app.services.conversation_service import ConversationService
from app.services.user_preference_service import UserPreferenceService

logger = logging.getLogger(__name__)

# Intents that don't need conversation context or user preferences
SKIP_CONTEXT_INTENTS = {
    "session_query",
    "greeting",
    "chitchat"
}

# Intents that need context but not user preferences
SKIP_PREFERENCES_INTENTS = {
    "session_query",
    "greeting",
    "chitchat",
    "query_understanding",
    "comparison_query"
}

class ContextAgent:

    @staticmethod
    async def execute(state: AgentState) -> AgentState:

        try:

            db = state.get("db")
            user_id = state.get("user_id")
            session_id = state.get("session_id")
            intent = state.get("intent", "")

            conversation_context = ""
            user_preferences = {}

            from app.services.agent_configuration_service import AgentConfigurationService
            context_cfg = AgentConfigurationService.get_configuration_by_agent_name(
                db, "context_agent"
            ) if db else None
            context_config = context_cfg.configuration if context_cfg else {}
            state["context_config"] = context_config

            # -----------------------------------
            # OPTIMIZATION: Skip both DB calls
            # for intents that never use them
            # -----------------------------------

            if intent in SKIP_CONTEXT_INTENTS:

                logger.debug(
                    f"[ContextAgent] Skipping context fetch for intent: {intent}"
                )

                state["conversation_context"] = ""
                state["user_preferences"] = {}
                state["current_agent"] = "context_agent"

                workflow = state.get("workflow_trace", [])
                workflow.append({
                    "agent": "context_agent",
                    "status": "skipped",
                    "reason": f"intent={intent} does not require context"
                })
                state["workflow_trace"] = workflow

                return state

            # -----------------------------------
            # CONVERSATION CONTEXT
            # Needed for: vendor_recommendation,
            # comparison_query, service_query
            # -----------------------------------

            if db and session_id:

                try:
                    conversation_context = (
                        ConversationService.build_context_summary(
                            db,
                            session_id
                        )
                    )
                    logger.debug(
                        f"[ContextAgent] conversation_context fetched "
                        f"| length={len(conversation_context)}"
                    )
                except Exception as ce:
                    if db:
                        db.rollback()
                    logger.warning(
                        f"[ContextAgent] Failed to fetch conversation context: {ce}"
                    )

                    conversation_context = ""

            # -----------------------------------
            # USER PREFERENCES
            # Only needed for ranking
            # Skip for intents that don't rank
            # -----------------------------------

            if db and user_id and intent not in SKIP_PREFERENCES_INTENTS:

                try:
                    user_preferences = (
                        UserPreferenceService.get_user_preferences(
                            db,
                            user_id
                        )
                    )
                    logger.debug(
                        f"[ContextAgent] user_preferences fetched for user_id={user_id}"
                    )
                except Exception as pe:
                    if db:
                        db.rollback()
                    logger.warning(
                        f"[ContextAgent] Failed to fetch user preferences: {pe}"
                    )

                    user_preferences = {}

            state["conversation_context"] = conversation_context
            state["user_preferences"] = user_preferences
            state["current_agent"] = "context_agent"

            workflow = state.get("workflow_trace", [])
            workflow.append({
                "agent": "context_agent",
                "status": "success",
                "context_fetched": bool(conversation_context),
                "preferences_fetched": bool(user_preferences)
            })
            state["workflow_trace"] = workflow

            return state

        except Exception as e:

            logger.error(f"[ContextAgent] Exception: {str(e)}", exc_info=True)

            db = state.get("db")
            if db:
                db.rollback()

            errors = state.get("errors", [])
            errors.append(str(e))
            state["errors"] = errors

            workflow = state.get("workflow_trace", [])
            workflow.append({
                "agent": "context_agent",
                "status": "failed",
                "error": str(e)
            })
            state["workflow_trace"] = workflow

            return state