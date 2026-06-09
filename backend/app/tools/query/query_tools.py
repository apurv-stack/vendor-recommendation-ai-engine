from app.tools.query.query_api_client import QueryAPIClient


client = QueryAPIClient()


async def preprocess_query_tool(
    query: str
):

    return await client.preprocess_query(
        query
    )


async def understand_query_tool(
    query: str
):

    return await client.understand_query(
        query
    )


async def ai_understand_query_tool(
    query: str
):

    return await client.ai_understand_query(
        query
    )