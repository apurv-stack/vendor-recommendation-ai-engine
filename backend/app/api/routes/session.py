from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.db.session import get_db

from app.api.dependencies.auth_dependency import (
    get_current_user
)

from app.models.user import User

from app.services.chat_session_service import (
    ChatSessionService
)

from app.services.conversation_service import (
    ConversationService
)

from app.schemas.session_schema import (
    SessionRenameRequest
)

router = APIRouter(
    prefix="/sessions",
    tags=["Sessions"]
)

@router.get("")
def get_user_sessions(

    page: int = 1,

    limit: int = 20,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        get_current_user
    )

):

    sessions = (

        ChatSessionService.get_user_sessions(
            db=db,
            user_id=current_user.user_id,
            page=page,
            limit=limit
        )

    )

    result = []

    for session in sessions:

        preview = (

            ConversationService.get_session_preview(
                db=db,
                session_id=str(session.session_id)
            )

        )

        result.append({

            "session_id":
                str(session.session_id),

            "status":
                session.status,

            "title":
                session.title,

            "created_at":
                session.created_at,

            "updated_at":
                session.updated_at,

            "preview":
                preview
        })

    return {

        "success": True,

        "page": page,

        "limit": limit,

        "count": len(result),

        "sessions": result
    }

@router.get("/{session_id}")
def get_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):

    session = ChatSessionService.get_session(
        db,
        session_id
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )
    
    if str(session.user_id) != str(current_user.user_id):

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    return session


@router.get("/{session_id}/history")
def get_session_history(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    session = ChatSessionService.get_session(
        db,
        session_id
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    if str(session.user_id) != str(current_user.user_id):

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )


    history = (
        ConversationService.get_session_history(
            db,
            session_id
        )
    )

    return history


@router.get("/{session_id}/context")
def get_session_context(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    
    session = ChatSessionService.get_session(
        db,
        session_id
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    if str(session.user_id) != str(current_user.user_id):

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    context = (
        ConversationService.build_context_summary(
            db,
            session_id
        )
    )

    return {
        "session_id": session_id,
        "context": context
    }

@router.patch("/{session_id}")
def rename_session(
    session_id: str,
    payload: SessionRenameRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    session = (
        ChatSessionService.get_session(
            db,
            session_id
        )
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    if str(session.user_id) != str(current_user.user_id):

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    updated = (
        ChatSessionService.update_session_title(
            db,
            session_id,
            payload.title
        )
    )

    return {

        "success": True,

        "session_id": str(
            updated.session_id
        ),

        "title": updated.title
    }

@router.delete("/{session_id}")
def delete_session(
    session_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(
        get_current_user
    )
):

    session = (
        ChatSessionService.get_session(
            db,
            session_id
        )
    )

    if not session:

        raise HTTPException(
            status_code=404,
            detail="Session not found"
        )

    if str(session.user_id) != str(current_user.user_id):

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    ConversationService.delete_session_conversations(
        db,
        session_id
    )

    ChatSessionService.delete_session(
        db,
        session_id
    )

    return {

        "success": True,

        "message": "Session deleted successfully"
    }

