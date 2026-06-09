import httpx


class QueryAPIClient:

    def __init__(
        self,
        base_url: str = "http://localhost:8000"
    ):
        self.base_url = base_url

    async def preprocess_query(
        self,
        query: str
    ):

        async with httpx.AsyncClient() as client:

            response = await client.post(
                f"{self.base_url}/query/preprocess",
                json={
                    "query": query
                }
            )

            response.raise_for_status()

            return response.json()

    async def understand_query(
        self,
        query: str
    ):

        async with httpx.AsyncClient() as client:

            response = await client.post(
                f"{self.base_url}/query/understand",
                json={
                    "query": query
                }
            )

            response.raise_for_status()

            return response.json()

    async def ai_understand_query(
        self,
        query: str
    ):

        async with httpx.AsyncClient() as client:

            response = await client.post(
                f"{self.base_url}/query/ai-understand",
                json={
                    "query": query
                }
            )

            response.raise_for_status()

            return response.json()