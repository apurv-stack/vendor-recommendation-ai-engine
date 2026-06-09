from typing import Optional

from sqlalchemy.orm import Session

from app.models.chat_session import ChatSession

from datetime import (
    datetime,
    timedelta,
    timezone
)
class ChatSessionService:

    @staticmethod
    def create_session(

        db: Session,

        user_id,

        session_id,

        context_data=None,

        missing_fields=None,

        current_question=None,

        detected_intent=None

    ):

        session = ChatSession(

            session_id=session_id,

            user_id=user_id,

            status="ACTIVE",

            context_data=context_data or {},

            missing_fields=missing_fields or [],

            current_question=current_question,

            detected_intent=detected_intent

        )

        db.add(session)

        db.commit()

        db.refresh(session)

        return session

    @staticmethod
    def get_session(

        db: Session,

        session_id

    ) -> Optional[ChatSession]:

        return (

            db.query(

                ChatSession

            )
            .filter(

                ChatSession.session_id
                == session_id

            )
            .first()

        )

    @staticmethod
    def update_session(

        db: Session,

        session_id,

        context_data=None,

        missing_fields=None,

        current_question=None,

        detected_intent=None,

        status=None

    ):

        session = (

            ChatSessionService
            .get_session(

                db,

                session_id

            )

        )

        if not session:

            return None

        if context_data is not None:

            session.context_data = context_data

        if missing_fields is not None:

            session.missing_fields = missing_fields

        if current_question is not None:

            session.current_question = current_question

        if detected_intent is not None:

            session.detected_intent = detected_intent

        if status is not None:

            session.status = status

        db.commit()

        db.refresh(session)

        return session

    @staticmethod
    def mark_completed(

        db: Session,

        session_id

    ):

        session = (

            ChatSessionService
            .get_session(

                db,

                session_id

            )

        )

        if not session:

            return None

        session.status = "COMPLETED"

        session.current_question = None

        session.missing_fields = []

        db.commit()

        db.refresh(session)

        return session
    
    @staticmethod
    def expire_old_sessions(
        db: Session,
        expiry_hours: int = 24
    ):

        cutoff = (
            datetime.now(
                timezone.utc
            )
            - timedelta(
                hours=expiry_hours
            )
        )

        expired_sessions = (

            db.query(
                ChatSession
            )

            .filter(
                ChatSession.status == "ACTIVE",
                ChatSession.updated_at < cutoff
            )

            .all()
        )

        for session in expired_sessions:

            session.status = "EXPIRED"

        db.commit()

        return len(
            expired_sessions
        )
    
    @staticmethod
    def expire_user_active_sessions(
        db: Session,
        user_id
    ):

        active_sessions = (

            db.query(
                ChatSession
            )

            .filter(
                ChatSession.user_id == user_id,
                ChatSession.status == "ACTIVE"
            )   

            .all()
        )

        for session in active_sessions:

            session.status = "COMPLETED"

        db.commit()

        return len(
            active_sessions
        )
    
    @staticmethod
    def get_user_sessions(
        db: Session,
        user_id,
        page: int = 1,
        limit: int = 20
    ):
        
        offset = (
            (page - 1)
            * limit
        )

        return (

            db.query(
                ChatSession
            )

            .filter(
                ChatSession.user_id == user_id
            )

            .order_by(
                ChatSession.updated_at.desc()
            )   

            .offset(
                offset
            )

            .limit(
                limit
            )

            .all()

        )
    
    @staticmethod
    def update_session_title(
        db: Session,
        session_id,
        title: str
    ):

        session = (
            ChatSessionService.get_session(
                db,
                session_id
            )
        )

        if not session:
            return None

        session.title = title

        db.commit()

        db.refresh(session)

        return session
    
    @staticmethod
    def delete_session(
        db: Session,
        session_id
    ):

        session = (
            ChatSessionService.get_session(
                db,
                session_id
            )
        )

        if not session:
            return False

        db.delete(
            session
        )

        db.commit()

        return True