from app.graphs.reasoning_graph import reasoning_graph
from app.graphs.graph_state import AgentState

class GraphService:

    async def process(
        self,
        query: str,
        session_id: str,
        user_id: str,
        access_token: str | None,
        db,
        intent: str | None = None,       # ← NEW
        filters: dict | None = None,      # ← NEW
        structured: dict | None = None    # ← NEW
    ):

        state: AgentState = {
            "query": query,
            "session_id": session_id,
            "user_id": user_id,
            "access_token": access_token,
            "db": db,
            "intent": intent or "",          # ← pass in
            "filters": filters or {},        # ← pass in
            "structured": structured or {},  # ← pass in full result
            "workflow_trace": [],
            "errors": []
        }

        result = await reasoning_graph.ainvoke(state)
        return result