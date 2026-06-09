import uuid
import time

from sqlalchemy.orm import Session

from app.ai.ai_service import AIService
from app.ai.intent_extractor import IntentExtractor
from app.ai.data_orchestrator import DataOrchestrator
from app.ai.session_manager import SessionManager
from app.ai.conversation_orchestrator import ConversationOrchestrator
from app.ai.recommendation_formatter import RecommendationFormatter
from app.services.chat_session_service import ChatSessionService
from app.services.conversation_service import ConversationService
from app.services.recommendation_history_service import RecommendationHistoryService
from app.services.user_preference_service import UserPreferenceService
from app.graphs.graph_service import GraphService

from app.schemas.chat_schema import ChatRequest


class ChatService:

    QUICK_REPLIES = {
        "hi": "Hello 👋 Tell me your event requirements and I'll help find vendors.",
        "hello": "Hello 👋 Tell me what vendor you're looking for.",
        "hey": "Hey 👋 What can I help you find today?"
    }

    SERVICE_TERMS = {
        "service",
        "services",
        "provide",
        "provides",
        "offering",
        "offer",
        "other",
        "else"
    }

    REFINEMENT_TERMS = {
        "luxury",
        "premium",
        "cheap",
        "budget",
        "affordable"
    }

    MAX_VENDOR_CARDS = 3

    def __init__(self, db: Session):
        self.db = db
        self.ai_service = AIService()
        self.graph_service = GraphService()

    async def process_message(
        self,
        payload: ChatRequest,
        current_user
    ):
        
        start_time = time.time()

        ChatSessionService.expire_old_sessions(
            self.db
        )
        
        session_id = payload.session_id or str(uuid.uuid4())
        print("SESSION ID:", session_id)

        # -----------------------------------
        # PERSISTENT CHAT SESSION
        # -----------------------------------

        db_session = ChatSessionService.get_session(
            self.db,
            session_id
        )

        if not db_session:

            ChatSessionService.expire_user_active_sessions(
                self.db,
                current_user.user_id
            )

            ChatSessionService.create_session(
                db=self.db,
                user_id=current_user.user_id,
                session_id=session_id
            )

        try:
            user_message = payload.message.strip()
            lower = user_message.lower()

            # -----------------------------------
            # QUICK REPLIES
            # -----------------------------------

            if lower in self.QUICK_REPLIES:
                return {
                    "success": True,
                    "message": self.QUICK_REPLIES[lower],
                    "session_id": session_id,
                    "response_type": "chat",
                    "recommendations": [],
                    "error": None
                }

            # -----------------------------------
            # STORE USER MESSAGE
            # -----------------------------------

            SessionManager.add_message(
                session_id,
                "user",
                user_message
            )

            previous = SessionManager.get_filters(session_id)

            remembered = SessionManager.get_vendor_memory(session_id)

            # -----------------------------------
            # SERVICE REQUEST FLOW
            # -----------------------------------

            service_request = any(
                term in lower
                for term in self.SERVICE_TERMS
            )

            comparison_keywords = [
                "compare",
                "comparison",
                "vs",
                "versus"
            ]

            is_comparison = any(
                word in lower
                for word in comparison_keywords
            )

            if (
                remembered
                and service_request
                and not is_comparison
            ):

                assistant = self._service_reply(remembered)

                return {
                    "success": True,
                    "message": assistant,
                    "session_id": session_id,
                    "response_type": "chat",
                    "recommendations": [
                        RecommendationFormatter.format_vendor(
                            vendor
                        )
                        for vendor in remembered[:self.MAX_VENDOR_CARDS]
                    ],
                    "error": None
                }

            # -----------------------------------
            # STRUCTURED EXTRACTION
            # -----------------------------------

            try:
                conversation_context = (
                    ConversationService.build_context_summary(
                        db=self.db,
                        session_id=session_id,
                        max_messages=10
                    )
                )

                user_history_context = (
                    ConversationService.build_user_history_context(
                        db=self.db,
                        user_id=current_user.user_id,
                        limit=10
                    )
                )

                # Trim context to prevent Ollama from hanging on large inputs
                conversation_context_trimmed = conversation_context[:500] if conversation_context else ""
                user_history_trimmed = user_history_context[:300] if user_history_context else ""

                combined_context = (
                    f"CURRENT SESSION:\n{conversation_context_trimmed}\n\n"
                    f"USER HISTORY:\n{user_history_trimmed}"
                ).strip()

                structured = await self.ai_service.build_structured_response(
                    user_message,
                    previous,
                    combined_context
                )

            except Exception:
                structured = {
                    "filters": previous or {},
                    "intent": "vendor_recommendation",
                    "missing_fields": []
                }

            filters = structured.get("filters", {})
            intent = structured.get("intent")

            filters = {
                k: v
                for k, v in filters.items()
                if v is not None
            }

            if previous:

                filters = (
                    ConversationOrchestrator.merge_context(
                        previous,
                        filters
                    )
                )

            SessionManager.set_filters(
                session_id,
                filters
            )

            # -----------------------------------
            # REFINEMENT FLOW
            # -----------------------------------

            refinement = any(
                word in lower
                for word in self.REFINEMENT_TERMS
            )

            if refinement and previous:
                filters = {
                    **previous,
                    **filters
                }

            # -----------------------------------
            # MISSING FIELD DETECTION
            # -----------------------------------
            missing = structured.get(
                "missing_fields",
                []
            )

            if missing:
                missing = missing[0]
            elif intent not in ("comparison_query", "session_query"):
                missing = self._find_missing(filters)
            else:
                missing = None     

            recommendations = []

            # -----------------------------------
            # FOLLOWUP FLOW
            # -----------------------------------

            if missing and intent not in ("comparison_query", "session_query"):
                
                missing_fields = (
                    [missing]
                    if isinstance(missing, str)
                    else missing
                )

                session_state = (
                    ConversationOrchestrator.build_session_state(
                        filters=filters,
                        missing_fields=missing_fields,
                        intent=intent
                    )
                )

                assistant = (
                    session_state.get("current_question")
                    or "Could you provide more details?"
                )

                ChatSessionService.update_session(
                    db=self.db,
                    session_id=session_id,
                    context_data=filters,
                    missing_fields=missing_fields,
                    current_question=assistant,
                    detected_intent=intent,
                    status="ACTIVE"
                )

                response_type = "followup"

                ConversationService.create_conversation(
                    db=self.db,
                    session_id=session_id,
                    user_id=current_user.user_id,
                    user_message=user_message,
                    ai_response=assistant,
                    detected_intent=intent,
                    applied_filters=filters,
                    is_follow_up=True,
                    context_summary=f"Missing fields: {missing_fields}"
                )

            else:
                response_type = (
                    "session"
                    if intent == "session_query"
                    else "recommendation"
                )

                # -----------------------------------
                # FALLBACK INTENT
                # -----------------------------------

                if not intent:
                    intent = "vendor_recommendation"

                # -----------------------------------
                # DATABASE CONTEXT
                # -----------------------------------

                preference = None

                if intent != "session_query":

                    UserPreferenceService.learn_from_chat(
                        db=self.db,
                        user_id=current_user.user_id,
                        filters=filters
                    )

                    preference = (
                        UserPreferenceService.get_user_preferences(
                            db=self.db,
                            user_id=current_user.user_id
                        )
                    )

                if preference:

                    if (
                        not filters.get("category")
                        and preference.preferred_category is not None
                    ):  
                        filters["category"] = (
                            preference.preferred_category
                        )

                    if (
                        not filters.get("city")
                        and preference.preferred_city is not None
                    ):
                        filters["city"] = (
                            preference.preferred_city
                        )

                    if (
                        not filters.get("event_type")
                        and preference.preferred_event_type is not None
                    ):
                        filters["event_type"] = (
                            preference.preferred_event_type
                        )

                    # if (
                    #     not filters.get("rating")
                    #     and preference.preferred_min_rating is not None
                    # ):
                    #     filters["rating"] = (
                    #         preference.preferred_min_rating
                    #     )   
                graph_intent = intent
                graph_response = None
                USE_REASONING_GRAPH = True

                if USE_REASONING_GRAPH:

                    graph_result = await self.graph_service.process(
                        query=user_message,
                        session_id=session_id,
                        user_id=str(current_user.user_id),
                        access_token=current_user.access_token,
                        db=self.db,
                        intent=intent,       
                        filters=filters,    
                    )

                    recommendations = (
                        graph_result.get(
                            "ranked_vendors",
                            []
                        )
                    )

                    graph_response = (
                        graph_result.get(
                            "ai_response",
                            ""
                        )
                    )

                    graph_intent = graph_result.get("intent", intent) 

                else:

                    context = DataOrchestrator.fetch_context(
                        self.db,
                        intent,
                        filters,
                        user_preferences=preference
                    )

                    recommendations = (
                        context.get(
                            "recommendations",
                            {}
                        ).get(
                            "vendors",
                            []
                        )
                    )

                    graph_response = None
                    graph_intent = intent

                # -----------------------------------
                # SESSION QUERY RESPONSE
                # ← NEW BLOCK — handles session_query
                # before the recommendations check
                # -----------------------------------
                if graph_intent == "session_query":

                    assistant = (
                        graph_response
                        if graph_response
                        else "I retrieved your session but no context was found."
                    )

                    ConversationService.create_conversation(
                        db=self.db,
                        session_id=session_id,
                        user_id=current_user.user_id,
                        user_message=user_message,
                        ai_response=assistant,
                        detected_intent=graph_intent,
                        applied_filters=filters,
                        is_follow_up=False,
                        context_summary="Session context retrieved"
                    )

                # -----------------------------------
                # RECOMMENDATION FLOW
                # -----------------------------------

                elif recommendations:

                    SessionManager.set_vendor_memory(
                        session_id,
                        recommendations
                    )

                    ChatSessionService.mark_completed(
                        self.db,
                        session_id
                    )

                    if USE_REASONING_GRAPH and graph_response:

                        assistant = graph_response

                    else:

                        assistant = await self.ai_service.build_recommendation_response(
                        user_message=user_message,
                        recommendations_exist=True,
                        filters=filters
                    )

                    ConversationService.create_conversation(
                        db=self.db,
                        session_id=session_id,
                        user_id=current_user.user_id,
                        user_message=user_message,
                        ai_response=assistant,
                        detected_intent=intent,
                        applied_filters=filters,
                        is_follow_up=False,
                        context_summary="Vendor recommendations generated"
                    )

                    for vendor in recommendations:

                        RecommendationHistoryService.create_recommendation_record(
                            db=self.db,
                            user_id=current_user.user_id,
                            session_id=session_id,
                            vendor_id=vendor.vendor_id,
                            filters_snapshot=filters
                        )

                else:

                    ChatSessionService.update_session(
                        db=self.db,
                        session_id=session_id,
                        context_data=filters,
                        detected_intent=intent,
                        status="ACTIVE"
                    )

                    assistant = (
                        graph_response
                        if graph_response
                        else "Sorry, I couldn't find matching vendors."
                    )


                    ConversationService.create_conversation(
                        db=self.db,
                        session_id=session_id,
                        user_id=current_user.user_id,
                        user_message=user_message,
                        ai_response=assistant,
                        detected_intent=intent,
                        applied_filters=filters,
                        is_follow_up=False,
                        context_summary="No matching vendors found"
                    )

            # -----------------------------------
            # STORE ASSISTANT MESSAGE
            # -----------------------------------

            SessionManager.add_message(
                session_id,
                "assistant",
                assistant
            )

            # -----------------------------------
            # FINAL RESPONSE
            # -----------------------------------

            print(
                f"TOTAL REQUEST TIME: {round(time.time() - start_time, 2)}s"
            )

            return {
                "success": True,
                "message": assistant,
                "session_id": session_id,
                "response_type": response_type,
                "current_question": (
                    assistant
                    if response_type == "followup"
                    else None
                ),
                "missing_fields": (
                    missing_fields
                    if response_type == "followup"
                    else []
                ),
                "recommendations":
                    RecommendationFormatter.format_vendors(
                        recommendations[:self.MAX_VENDOR_CARDS],
                        filters
                    ),
                "error": None
            }

        except Exception as e:

            print(
                "CHAT ERROR:",
                str(e)
            )

            print(
                f"TOTAL REQUEST TIME: {round(time.time() - start_time, 2)}s"
            )

            return {
                "success": False,
                "message": "",
                "session_id": session_id,
                "response_type": "error",
                "recommendations": [],
                "error": str(e)
            }

    def _service_reply(self, vendors):

        vendor = vendors[0]

        sections = []

        teams = (
            getattr(
                vendor,
                "managed_teams",
                []
            )
            or []
        )

        for team in teams:

            category_name = getattr(
                team,
                "name",
                ""
            )

            service_names = [
                service.service_name
                for service in getattr(
                    team,
                    "service_records",
                    []
                )
                if getattr(
                    service,
                    "service_name",
                    None
                )
            ]

            if service_names:

                sections.append(
                    f"{category_name}: "
                    + ", ".join(service_names)
                )

            elif category_name:

                sections.append(
                    category_name
                )

        if not sections:
            return "No service information available."

        return (
            f"{vendor.name} provides:\n\n"
            + "\n".join(sections)
        )

    def _find_missing(self, filters):

        category = filters.get("category")

        if not category:
            return None

        if not filters.get("city"):
            return "city"

        if category == "catering":

            if not filters.get("budget"):
                return "budget"

            if not filters.get("guest_count"):
                return "guest_count"

        return None

   