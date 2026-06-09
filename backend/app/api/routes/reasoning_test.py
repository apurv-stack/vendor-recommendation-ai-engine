from fastapi import (
    APIRouter,
    Depends,
    HTTPException,
    status
)

import uuid

from sqlalchemy.orm import (
    Session
)

from app.db.session import (
    get_db
)

from app.api.dependencies.auth_dependency import (
    get_current_user
)

from app.models.user import (
    User
)

from app.graphs.reasoning_graph import (
    reasoning_graph
)

from app.graphs.graph_state import (
    AgentState
)


router = APIRouter(
    prefix="/reasoning",
    tags=["Reasoning Test"]
)


@router.post(
    "/test",
    status_code=status.HTTP_200_OK
)
async def test_reasoning_workflow(

    query: str,

    current_user: User = Depends(
        get_current_user
    ),

    db: Session = Depends(
        get_db
    )

):

    try:

        state: AgentState = {

            "query": query,

            "session_id":
            str(uuid.uuid4()),

            "user_id":
            str(current_user.user_id),

            "db": db,

            "workflow_trace": [],

            "errors": []

        }

        result = await (
            reasoning_graph.ainvoke(
                state
            )
        )

        return {

            "success": True,

            "intent":
            result.get(
                "intent"
            ),

            "current_agent":
            result.get(
                "current_agent"
            ),

            "workflow_trace":
            result.get(
                "workflow_trace",
                []
            ),

            "vendors_found":
            len(
                result.get(
                    "vendors",
                    []
                )
            ),

            "ranked_vendors":
            len(
                result.get(
                    "ranked_vendors",
                    []
                )
            ),

            "ai_response":
            result.get(
                "ai_response"
            ),

            "errors":
            result.get(
                "errors",
                []
            )
        }

    except Exception as e:

        print(
            "REASONING TEST ERROR:",
            str(e)
        )

        raise HTTPException(
            status_code=
            status.HTTP_500_INTERNAL_SERVER_ERROR,

            detail=
            str(e)
        )