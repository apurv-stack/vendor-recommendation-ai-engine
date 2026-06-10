import httpx

from app.core.config import settings

import logging

logger = logging.getLogger(__name__)

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
    
    async def _safe_request(
        self,
        method: str,
        url: str,
        **kwargs
    ):

        try:

            async with httpx.AsyncClient(
                timeout=30.0
            )  as client:

                if method == "GET":

                    response = await client.get(
                        url,
                        **kwargs
                    )

                else:

                    response = await client.post(
                        url,
                        **kwargs
                    )

                response.raise_for_status()

                return response.json()

        except httpx.TimeoutException:

            logger.exception(
                "Vendor API timeout"
            )

            return {
                "success": False,
                "error_code": "VENDOR_TIMEOUT",
                "message": "Vendor service is taking longer than expected."
            }

        except httpx.HTTPStatusError:

            logger.exception(
                "Vendor API HTTP error"
            )

            return {
                "success": False,
                "error_code": "VENDOR_API_ERROR",
                "message": "Vendor information is temporarily unavailable."
            }

        except Exception:

            logger.exception(
                "Vendor API failure"
            )

            return {
                "success": False,
                "error_code": "VENDOR_FAILURE",
                "message": "Unable to retrieve vendor information right now."
            }

    async def search_vendors(
        self,
        **params
    ):
        
        params = {
            k: v
            for k, v in params.items()
            if v is not None
        }

        return await self._safe_request(
            "GET",
            f"{self.base_url}/vendors/search",
            params=params,
            headers=self._headers()
        )

    async def get_vendor_details(
        self,
        vendor_id: str
    ):

        return await self._safe_request(
            "GET",
            f"{self.base_url}/vendors/{vendor_id}",
            headers=self._headers()
        )

    async def get_recommendations(
        self
    ):

        return await self._safe_request(
            "GET",
            f"{self.base_url}/vendors/recommendations",
            headers=self._headers()
        )

    async def get_user_preferences(
        self
    ):

        return await self._safe_request(
            "GET",
            f"{self.base_url}/vendors/preferences/me",
            headers=self._headers()
        )

    async def follow_vendor(
        self,
        vendor_id: str
    ):

        return await self._safe_request(
            "POST",
            f"{self.base_url}/vendors/{vendor_id}/follow",
            headers=self._headers()
        )

    async def save_vendor(
        self,
        vendor_id: str
    ):

        return await self._safe_request(
            "POST",
            f"{self.base_url}/vendors/{vendor_id}/save",
            headers=self._headers()
        )