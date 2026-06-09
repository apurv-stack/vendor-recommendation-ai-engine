from fastapi import (

    APIRouter,

    Depends,

    HTTPException,

    status

)

from sqlalchemy.orm import (

    Session

)

from app.db.session import (

    get_db

)

from app.schemas.chat_schema import (

    ChatRequest,

    ChatResponse

)

from app.services.chat_service import (

    ChatService

)

from app.api.dependencies.auth_dependency import (

    get_current_user

)

from app.models.user import (

    User

)


router = APIRouter(

    prefix="/chat",

    tags=["Chat"]

)


def get_chat_service(

    db: Session = Depends(

        get_db

    )

):

    return ChatService(

        db

    )


@router.post(

    "/message",

    response_model=ChatResponse,

    status_code=status.HTTP_200_OK

)

async def chat(

    payload: ChatRequest,

    current_user: User = Depends(

        get_current_user

    ),

    chat_service: ChatService = Depends(

        get_chat_service

    )

):

    try:

        result = await (

            chat_service

            .process_message(

                payload,

                current_user

            )

        )

        if (

            not result

        ):

            raise HTTPException(

                status_code=

                status.HTTP_500_INTERNAL_SERVER_ERROR,

                detail=

                "Empty response from chat service"

            )

        if (
            result.get("success")
            is False
            and
            result.get("response_type") not in (
                "validation_error",
                "error"
            )
        ):
            raise HTTPException(
                status_code=
                status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=
                result.get("error")
                or
                "Chat processing failed"
            )

        return result

    except HTTPException:

        raise

    except Exception as e:

        print(

            "CHAT API ERROR:",

            str(

                e

            )

        )

        raise HTTPException(

            status_code=

            status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail=

            "Unable to process chat request"

        )