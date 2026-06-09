import httpx

from app.core.config import settings


class SessionAPIClient:

    def __init__(
        self,
        token: str | None = None
    ):
        self.base_url = settings.API_BASE_URL
        self.token = token

    def _headers(self):

        headers = {
            "Content-Type": "application/json"
        }

        if self.token:
            headers["Authorization"] = (
                f"Bearer {self.token}"
            )

        return headers

    async def get_session(
        self,
        session_id: str
    ):

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            response = await client.get(
                f"{self.base_url}/sessions/{session_id}",
                headers=self._headers()
            )

            response.raise_for_status()

            return response.json()

    async def get_session_history(
        self,
        session_id: str
    ):

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            response = await client.get(
                f"{self.base_url}/sessions/{session_id}/history",
                headers=self._headers()
            )

            response.raise_for_status()

            return response.json()

    async def get_session_context(
        self,
        session_id: str
    ):

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            response = await client.get(
                f"{self.base_url}/sessions/{session_id}/context",
                headers=self._headers()
            )

            response.raise_for_status()

            return response.json()