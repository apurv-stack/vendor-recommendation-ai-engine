# AI Vendor Discovery & Recommendation Engine: Agentic Workflow & LangGraph

This document describes the design, nodes, state transitions, tool integrations, and caching strategies of the agentic reasoning graph. The agent system is implemented using **LangGraph** to model the conversation loop as a state machine.

---

## 1. LangGraph Workflow Architecture
The conversational intelligence of the recommendation engine is modeled as a stateful, multi-agent workflow. The state machine coordinates specialized agent nodes, directing user queries through context loading, intent analysis, database searches, vendor ranking, comparison evaluations, and final response formatting.

The execution state is tracked via a central `AgentState` object. Nodes read from this state, execute their business logic, and return updates to the state. The workflow transitions between nodes based on conditional routing functions.

[DIAGRAM: LangGraph Workflow]

---

## 2. State Mapping (`AgentState`)
The `AgentState` (defined in [app/graphs/graph_state.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/graphs/graph_state.py)) is a shared dictionary passed between agents. It contains the following keys:

* **Request Context:**
  * `query` (str): The raw user message.
  * `session_id` (str): Unique UUID tracking the active conversation session.
  * `user_id` (str): UUID of the authenticated user.
  * `db` (Session): Active SQLAlchemy database transaction.
  * `access_token` (str | None): User access token for authentication.
* **Routing Metadata:**
  * `intent` (str): Primary classified intent (e.g., `'vendor_recommendation'`).
  * `secondary_intents` (List[str]): Alternative detected intents.
  * `confidence` (float): Intent classification confidence score.
* **Constraint Extraction:**
  * `filters` (Dict[str, Any]): Cumulative search constraints (category, city, budget, guest count).
  * `validation` (Dict[str, Any]): Validation error logs.
  * `search_payload` (Dict[str, Any]): Formatted SQL query criteria.
* **Database & Tool Outputs:**
  * `tool_name` (str): Name of the active tool.
  * `tool_input` (Dict[str, Any]): Parameters passed to the tool.
  * `tool_output` (Dict[str, Any]): Output returned by the tool.
  * `tool_status` (str): Status of the tool execution (`'success'` or `'failed'`).
  * `tool_error` (str | None): Error details if tool execution fails.
  * `vendors` (List[Any]): List of matching database vendor objects.
  * `ranked_vendors` (List[Any]): Sorted, ranked vendor results.
* **Workflow Trace:**
  * `current_agent` (str): Name of the currently executing agent.
  * `workflow_trace` (List[Dict[str, Any]]): Log of executed nodes for debugging.
  * `errors` (List[str]): List of exceptions caught during execution.
  * `ai_response` (str): Final response text generated for the user.

---

## 3. Node Specifications & Code Locations

### 1. `supervisor` (in [app/agents/supervisor_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/supervisor_agent.py))
* **Purpose:** Evaluates the query to determine the primary intent.
* **Design Decision:** Optimization logic check: if the intent was already resolved upstream by the controller, the LLM classification step is bypassed to minimize latency.
* **Implementation:** Otherwise, calls `IntentExtractor.extract(query)` and loads the `supervisor_agent` database config for default fallbacks.

### 2. `context` (in [app/agents/context_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/context_agent.py))
* **Purpose:** Collects conversation history and user preferences.
* **Implementation:** Calls `ConversationService.build_context_summary` to retrieve the last 10 messages. Queries `UserPreferenceService.get_user_preferences` for preferred locations or categories.
* **Optimization:** Bypasses database queries for simple chit-chat or greetings.

### 3. `query_analysis` (in [app/agents/query_analysis_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/query_analysis_agent.py))
* **Purpose:** Parses search filters (category, city, budget, guest count).
* **Implementation:** Loads dynamic system prompt settings from the `agent_prompts` database and calls `AIService.build_structured_response`.
* **Optimization:** Bypasses LLM extraction if filters were already extracted by regex/rule-based modules.

### 4. `tool_calling` (in [app/agents/tool_calling_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/tool_calling_agent.py))
* **Purpose:** Executes database queries using registered tools.
* **Implementation:** Initializes the `ToolRegistry` and calls tools based on the classified intent.
* **API Failure Handling:** Intercepts failures (e.g. database connectivity errors) and updates `state["tool_status"] = "failed"` to propagate errors upstream.

### 5. `discovery` (in [app/agents/discovery_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/discovery_agent.py))
* **Purpose:** Fetches matching vendors using the extracted filters.
* **Implementation:** Calls `DataOrchestrator.fetch_context` and reads the `max_results` limits from the database configurations.

### 6. `ranking` (in [app/agents/ranking_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/ranking_agent.py))
* **Purpose:** Sorts and filters matched vendors.
* **Implementation:** Passes vendor datasets and active configurations to `RecommendationEngine.rank_vendors`.

### 7. `comparison` (in [app/agents/comparison_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/comparison_agent.py))
* **Purpose:** Handles head-to-head comparisons of vendor profiles.
* **Implementation:** Looks for vendor targets in session history. If found, it pulls their details; otherwise, it queries the database.
* **Fuzzy Match Logic:** Implements word-intersection scoring to map user inputs to vendor names (e.g. matching "Elite Catering" to "Elite Catering Services").

### 8. `response` (in [app/agents/response_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/response_agent.py))
* **Purpose:** Generates user-facing responses.
* **Implementation:** Handles comparison tables, session summaries, and standard recommendations using system prompts loaded from the `agent_prompts` table.

### 9. `error` (in [app/agents/error_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/error_agent.py))
* **Purpose:** Fallback error handler.
* **Implementation:** Catches uncaught workflow exceptions and updates the response state with friendly error messages.

---

## 4. Routing Logic
The graph uses conditional routers to transition between nodes:

* **`route_from_supervisor`:** Checks `state["intent"]`.
  * If the intent is related to searching (`'vendor_search'`, `'vendor_recommendation'`, `'pricing_query'`, `'service_query'`, `'session_query'`), it routes to the `context` node.
  * If the intent is `'comparison_query'`, it routes directly to the `comparison` node.
  * For other intents (greetings, analytics, categories), it routes directly to the `response` node.
* **`route_after_analysis`:** Resolves execution routes after query analysis.
  * If the intent is `'comparison_query'`, routes to `comparison`.
  * If the intent is discovery-related, routes to `tool_calling`.
* **`route_after_tool_calling`:** Routes session-only requests (`'session_query'`) directly to `response` and discovery requests to the `discovery` node.

---

## 5. Tool Integration & Caching
The system uses a repository pattern to isolate database queries, exposing them to agents via a structured **`ToolRegistry`**:

* **`search_vendors` Tool:** Wraps database query filters, mapping budget parameters and guest counts to SQLAlchemy queries.
* **`get_session_context` Tool:** Fetches conversation histories for active sessions.
* **`ai_understand_query` Tool:** Debugging endpoint that extracts search constraints using LLM models.

### Caching and Performance Optimizations
To reduce database load and latency, the `ToolCallingAgent` uses an in-memory cache:
* **Selective Cache Key Generation:** Cache keys are generated using composite tuples of parameters: `f"{tool_name}:{sorted_params}"`.
* **In-Memory Cache Cache-TTL:** Cache items are stored with a 5-minute TTL (configurable in database configurations).
* **Strict Cache Policies:** Only complete queries (containing both `city` and `category` parameters) are cached. Incomplete queries are always routed directly to database queries to ensure users receive up-to-date follow-up questions.
