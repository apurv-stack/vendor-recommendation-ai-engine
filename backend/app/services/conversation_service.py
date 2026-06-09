import json

from typing import List, Optional

from sqlalchemy.orm import Session

from app.models.conversation import Conversation


class ConversationService:

    @staticmethod
    def create_conversation(
        db: Session,
        session_id: str,
        user_id,
        user_message: str,
        ai_response: str,
        detected_intent: Optional[str] = None,
        applied_filters: Optional[dict] = None,
        is_follow_up: bool = False,
        context_summary: Optional[str] = None
    ) -> Conversation:

        conversation = Conversation(

            session_id=session_id,

            user_id=user_id,

            user_message=user_message,

            ai_response=ai_response,

            detected_intent=detected_intent,

            applied_filters=(
                json.dumps(applied_filters)
                if applied_filters
                else None
            ),

            is_follow_up=is_follow_up,

            context_summary=context_summary
        )

        db.add(conversation)

        db.commit()

        db.refresh(conversation)

        return conversation

    @staticmethod
    def get_session_history(
        db: Session,
        session_id: str
    ) -> List[Conversation]:

        return (

            db.query(
                Conversation
            )

            .filter(
                Conversation.session_id == session_id
            )

            .order_by(
                Conversation.created_at.asc()
            )

            .all()
        )

    @staticmethod
    def get_recent_conversations(
        db: Session,
        user_id,
        limit: int = 20
    ) -> List[Conversation]:

        return (

            db.query(
                Conversation
            )

            .filter(
                Conversation.user_id == user_id
            )

            .order_by(
                Conversation.created_at.desc()
            )

            .limit(limit)

            .all()
        )

    @staticmethod
    def build_context_summary(
        db: Session,
        session_id: str,
        max_messages: int = 10
    ) -> str:

        conversations = (

            db.query(
                Conversation
            )

            .filter(
                Conversation.session_id == session_id
            )

            .order_by(
                Conversation.created_at.desc()
            )

            .limit(max_messages)

            .all()
        )

        conversations.reverse()

        summary_parts = []

        for conversation in conversations:

            summary_parts.append(

                f"User: {conversation.user_message}"
            )

            summary_parts.append(

                f"Assistant: {conversation.ai_response}"
            )

        return "\n".join(
            summary_parts
        )

    @staticmethod
    def get_last_interaction(
        db: Session,
        session_id: str
    ) -> Optional[Conversation]:

        return (

            db.query(
                Conversation
            )

            .filter(
                Conversation.session_id == session_id
            )

            .order_by(
                Conversation.created_at.desc()
            )

            .first()
        )
    

    @staticmethod
    def get_session_preview(
        db: Session,
        session_id: str
    ):

        first_message = (

            db.query(
                Conversation
            )

            .filter(
                Conversation.session_id == session_id
            )

            .order_by(
                Conversation.created_at.asc()
            )

            .first()

        )

        if not first_message:
            return "New Conversation"

        return first_message.user_message[:80]
    
    @staticmethod
    def build_user_history_context(
        db: Session,
        user_id,
        limit: int = 10
    ) -> str:

        conversations = (

            db.query(
                Conversation
            )

            .filter(
                Conversation.user_id == user_id
            )

            .order_by(
                Conversation.created_at.desc()
            )

            .limit(limit)

            .all()
        )

        conversations.reverse()

        history_parts = []

        for conversation in conversations:

            history_parts.append(
                f"User: {conversation.user_message}"
            )

            history_parts.append(
                f"Assistant: {conversation.ai_response}"
            )

        return "\n".join(
            history_parts
        )
    
    @staticmethod
    def delete_session_conversations(
        db: Session,
        session_id: str
    ):

        (

            db.query(
                Conversation
            )

            .filter(
                Conversation.session_id == session_id
            )

            .delete(
                synchronize_session=False
            )

        )

        db.commit()