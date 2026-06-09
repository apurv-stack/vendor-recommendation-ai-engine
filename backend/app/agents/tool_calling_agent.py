import logging
from app.graphs.graph_state import AgentState
from app.tools.tool_registry import ToolRegistry
from app.utils.vendor_adapter import VendorAdapter

logger = logging.getLogger(__name__)

# OPTIMIZATION: Module-level cache for tool results
# key = (tool_name, frozenset of params) | value = (result, timestamp)
import time
_tool_cache: dict = {}
_CACHE_TTL_SECONDS = 300  # 5 minutes

def _get_cache_key(tool_name: str, params: dict) -> str:
    sorted_params = sorted(
        (k, str(v)) for k, v in params.items() if v is not None
    )
    return f"{tool_name}:{sorted_params}"

def _get_from_cache(key: str):
    entry = _tool_cache.get(key)
    if entry:
        result, timestamp = entry
        if time.time() - timestamp < _CACHE_TTL_SECONDS:
            logger.debug(f"[ToolCache] HIT: {key}")
            return result
        else:
            del _tool_cache[key]
            logger.debug(f"[ToolCache] EXPIRED: {key}")
    return None

def _set_cache(key: str, value):
    _tool_cache[key] = (value, time.time())
    logger.debug(f"[ToolCache] SET: {key}")


class ToolCallingAgent:

    async def execute(
        self,
        state: AgentState
    ) -> AgentState:

        try:

            filters = state.get("filters", {})
            token = state.get("access_token")
            intent = state.get("intent")

            # OPTIMIZATION: ToolRegistry initialized once per call
            # token is per-request so we can't avoid this
            # but internal tool lookup is O(1) dict access
            registry = ToolRegistry(token=token)

            tool_name = ""
            tool_input = {}
            tool_output = {}

            # ---------------------------------
            # Vendor Search
            # ---------------------------------

            if intent in ["vendor_recommendation", "service_query"]:

                tool_name = "search_vendors"
                tool_input = {
                    "category": filters.get("category"),
                    "city": filters.get("city"),
                    "min_price": filters.get("price_min"),
                    "max_price": filters.get("price_max")
                }

                # OPTIMIZATION: check cache before API call
                cache_key = _get_cache_key(tool_name, tool_input)
                cached = _get_from_cache(cache_key)

                if cached is not None:
                    tool_output = cached
                    logger.debug(f"[ToolCallingAgent] search_vendors served from cache")
                else:
                    tool = registry.get_tool(tool_name)
                    if not tool:
                        raise ValueError(f"Tool not found: {tool_name}")

                    tool_output = await tool(
                        category=tool_input["category"],
                        city=tool_input["city"],
                        min_price=tool_input["min_price"],
                        max_price=tool_input["max_price"]
                    )

                    logger.debug(f"[ToolCallingAgent] search_vendors raw output: {tool_output}")
                    _set_cache(cache_key, tool_output)

                vendors = []
                if isinstance(tool_output, dict):
                    vendors = tool_output.get("vendors", [])
                    vendors = [VendorAdapter.adapt(v) for v in vendors]

                state["vendors"] = vendors
                state["ranked_vendors"] = []

            # ---------------------------------
            # Session Query
            # ---------------------------------

            elif intent == "session_query":

                session_id = state.get("session_id")
                tool_name = "get_session_context"

                logger.debug(f"[ToolCallingAgent] session_query | session_id={session_id}")

                # Session context is per-session so cache key includes session_id
                cache_key = _get_cache_key(tool_name, {"session_id": session_id})
                cached = _get_from_cache(cache_key)

                if cached is not None:
                    normalized_context = cached
                    logger.debug(f"[ToolCallingAgent] session_context served from cache")
                else:
                    tool = registry.get_tool(tool_name)
                    if not tool:
                        raise ValueError(f"Tool not found: {tool_name}")

                    tool_output = await tool(
                        session_id=session_id,
                        token=token
                    )

                    logger.debug(f"[ToolCallingAgent] session_context raw output: {tool_output}")

                    if isinstance(tool_output, dict):
                        if "context" in tool_output:
                            normalized_context = tool_output
                        elif "data" in tool_output:
                            normalized_context = tool_output.get("data", {})
                        else:
                            normalized_context = {"context": tool_output}
                    else:
                        normalized_context = {"context": str(tool_output)}

                    _set_cache(cache_key, normalized_context)

                logger.debug(f"[ToolCallingAgent] normalized session_context: {normalized_context}")

                state["session_context"] = normalized_context
                state["vendors"] = []
                state["ranked_vendors"] = []

            # ---------------------------------
            # Query Understanding
            # ---------------------------------

            elif intent == "query_understanding":

                query = state.get("query", "")
                tool_name = "ai_understand_query"

                tool = registry.get_tool(tool_name)
                if not tool:
                    raise ValueError(f"Tool not found: {tool_name}")

                tool_output = await tool(query=query)

                state["query_analysis"] = tool_output
                state["vendors"] = []
                state["ranked_vendors"] = []

            # ---------------------------------
            # Unhandled intent
            # ---------------------------------

            else:
                logger.warning(
                    f"[ToolCallingAgent] No tool mapped for intent: {intent}"
                )

            state["tool_name"] = tool_name
            state["tool_input"] = tool_input
            state["tool_output"] = tool_output
            state["tool_status"] = "success"

            trace = state.get("workflow_trace", [])
            trace.append({
                "agent": "tool_calling_agent",
                "status": "success",
                "tool": tool_name,
                "intent": intent,
                "cache_hit": _get_from_cache(
                    _get_cache_key(tool_name, tool_input)
                ) is not None if tool_name else False
            })
            state["workflow_trace"] = trace

            return state

        except Exception as e:

            logger.error(
                f"[ToolCallingAgent] Exception: {str(e)}", exc_info=True
            )

            state["tool_status"] = "failed"
            state["tool_error"] = str(e)

            errors = state.get("errors", [])
            errors.append(str(e))
            state["errors"] = errors

            trace = state.get("workflow_trace", [])
            trace.append({
                "agent": "tool_calling_agent",
                "status": "failed",
                "error": str(e)
            })
            state["workflow_trace"] = trace

            return state