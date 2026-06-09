import httpx

from app.core.config import settings


class VendorAPIClient:

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

    async def search_vendors(
        self,
        **params
    ):
        
        params = {
            k: v
            for k, v in params.items()
            if v is not None
        }

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            response = await client.get(
                f"{self.base_url}/vendors/search",
                params=params,
                headers=self._headers()
            )

            response.raise_for_status()

            return response.json()

    async def get_vendor_details(
        self,
        vendor_id: str
    ):

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            response = await client.get(
                f"{self.base_url}/vendors/{vendor_id}",
                headers=self._headers()
            )

            response.raise_for_status()

            return response.json()

    async def get_recommendations(
        self
    ):

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            response = await client.get(
                f"{self.base_url}/vendors/recommendations",
                headers=self._headers()
            )

            response.raise_for_status()

            return response.json()

    async def get_user_preferences(
        self
    ):

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            response = await client.get(
                f"{self.base_url}/vendors/preferences/me",
                headers=self._headers()
            )

            response.raise_for_status()

            return response.json()

    async def follow_vendor(
        self,
        vendor_id: str
    ):

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            response = await client.post(
                f"{self.base_url}/vendors/{vendor_id}/follow",
                headers=self._headers()
            )

            response.raise_for_status()

            return response.json()

    async def save_vendor(
        self,
        vendor_id: str
    ):

        async with httpx.AsyncClient(
            timeout=30.0
        ) as client:

            response = await client.post(
                f"{self.base_url}/vendors/{vendor_id}/save",
                headers=self._headers()
            )

            response.raise_for_status()

            return response.json()