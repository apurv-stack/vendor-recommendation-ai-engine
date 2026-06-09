from app.integrations.vendor_api_client import (
    VendorAPIClient
)


class VendorTools:

    def __init__(
        self,
        token: str | None = None
    ):
        self.client = VendorAPIClient(
            token=token
        )

    async def search_vendors_tool(
        self,
        category: str | None = None,
        city: str | None = None,
        min_price: int | None = None,
        max_price: int | None = None,
        rating: float | None = None,
        verified: bool | None = None
    ):

        return await self.client.search_vendors(

            category=category,

            city=city,

            min_price=min_price,

            max_price=max_price,

            rating=rating,

            verified=verified
        )

    async def get_vendor_details_tool(
        self,
        vendor_id: str
    ):

        return await self.client.get_vendor_details(
            vendor_id
        )

    async def get_recommendations_tool(
        self
    ):

        return await self.client.get_recommendations()

    async def get_user_preferences_tool(
        self
    ):

        return await self.client.get_user_preferences()

    async def follow_vendor_tool(
        self,
        vendor_id: str
    ):

        return await self.client.follow_vendor(
            vendor_id
        )

    async def save_vendor_tool(
        self,
        vendor_id: str
    ):

        return await self.client.save_vendor(
            vendor_id
        )