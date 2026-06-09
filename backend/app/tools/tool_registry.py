from app.tools.vendor_tools import VendorTools
from app.tools.session.session_tools import (
    get_session_tool,
    get_session_history_tool,
    get_session_context_tool
)

from app.tools.query.query_tools import (
    preprocess_query_tool,
    understand_query_tool,
    ai_understand_query_tool
)

class ToolRegistry:

    def __init__(
        self,
        token: str | None = None
    ):

        self.vendor_tools = VendorTools(
            token=token
        )

        self.tools = {

            "search_vendors":
                self.vendor_tools.search_vendors_tool,

            "get_vendor_details":
                self.vendor_tools.get_vendor_details_tool,

            "get_recommendations":
                self.vendor_tools.get_recommendations_tool,

            "get_user_preferences":
                self.vendor_tools.get_user_preferences_tool,

            "follow_vendor":
                self.vendor_tools.follow_vendor_tool,

            "save_vendor":
                self.vendor_tools.save_vendor_tool,

            "get_session":
                get_session_tool,

            "get_session_history":
                get_session_history_tool,

            "get_session_context":
                get_session_context_tool,

            "preprocess_query": preprocess_query_tool,

            "understand_query": understand_query_tool,

            "ai_understand_query": ai_understand_query_tool
        }

    def get_tool(
        self,
        tool_name: str
    ):

        return self.tools.get(
            tool_name
        )

    def get_available_tools(
        self
    ):

        return list(
            self.tools.keys()
        )