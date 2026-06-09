from app.tools.session.session_api_client import (
    SessionAPIClient
)


async def get_session_tool(
    session_id: str,
    token: str | None = None
):

    client = SessionAPIClient(
        token=token
    )

    return await client.get_session(
        session_id
    )


async def get_session_history_tool(
    session_id: str,
    token: str | None = None
):

    client = SessionAPIClient(
        token=token
    )

    return await client.get_session_history(
        session_id
    )


async def get_session_context_tool(
    session_id: str,
    token: str | None = None
):

    client = SessionAPIClient(
        token=token
    )

    return await client.get_session_context(
        session_id
    )