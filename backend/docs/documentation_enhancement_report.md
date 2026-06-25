# AI Vendor Recommendation & Discovery Engine: Architecture & Design Enhancement Report

This report provides a detailed, second-pass architecture analysis of the AI Vendor Discovery Agent backend. It maps every API route, database relationship, agent reasoning step, recommendation scoring criteria, session state, security policy, and deployment boundary. It serves as a specifications reference for final system documentation.

---

## 1. Complete API Inventory
The table below documents every REST endpoint exposed by the FastAPI backend, detailing its payload schemas, authentication rules, and downstream routing flows:

| HTTP Method | Route Endpoint | Request Schema / Params | Response Schema | Authentication / Role | Downstream Service Called | Downstream Repository Called |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **POST** | `/auth/register` | `RegisterRequest` | `RegisterResponse` | Public | `register_user` | `db.add(User)` |
| **POST** | `/auth/login` | `LoginRequest` | `LoginResponse` | Public | `login_user` | Query `User` |
| **POST** | `/auth/refresh` | Cookies: `refresh_token` | `{success, access_token}` | Public | `jwt.decode` / `create_access_token` | None |
| **POST** | `/auth/logout` | None | `{success, message}` | Public | `response.delete_cookie` | None |
| **GET** | `/auth/check-username/{username}` | Path: `username` | `{available, message}` | Public | Inline checking | Query `User` |
| **GET** | `/auth/check-email/{email}` | Path: `email` | `{available, message}` | Public | Inline checking | Query `User` |
| **GET** | `/auth/me` | None | `{success, message, user}` | Bearer JWT | `get_current_user` | Query `User` |
| **GET** | `/auth/admin-only` | None | `{success, message, user}` | JWT: `admin` | `require_role(["admin"])` | None |
| **GET** | `/auth/vendor-only` | None | `{success, message, user}` | JWT: `vendor` | `require_role(["vendor"])` | None |
| **GET** | `/auth/user-only` | None | `{success, message, user}` | JWT: `user` | `require_role(["user"])` | None |
| **POST** | `/chat/message` | `ChatRequest` | `ChatResponse` | Bearer JWT | `ChatService.process_message` | Query `User`, `ChatSession`, `Vendor` |
| **POST** | `/query/preprocess` | `QueryRequest` | `{success, original_query, normalized_query}` | Public | `QueryPreprocessor.preprocess` | None |
| **POST** | `/query/understand` | `QueryRequest` | `{success, original_query, intent, filters, validation, search_payload}` | Public | `IntentExtractor`, `QueryValidator`, `FilterGenerator`, `QueryTransformer` | None |
| **POST** | `/query/ai-understand` | `QueryRequest` | `{success, data: structured_response}` | Public | `AIService.build_structured_response`, `FilterGenerator` | None |
| **GET** | `/vendors/profile` | None | `VendorDetailResponse` | JWT: `vendor` | `get_current_vendor_profile_service` | Query `Vendor` (joinedloads) |
| **PUT** | `/vendors/profile` | `VendorProfileUpdateRequest` | `VendorDetailResponse` | JWT: `vendor` | `update_current_vendor_profile_service` | `update_vendor` |
| **PUT** | `/vendors/{vendor_id}/rename` | Path: `vendor_id`, Query: `name` | `{success, vendor}` | JWT: `vendor` | `rename_vendor_service` | Query `Vendor` |
| **POST** | `/vendors/team` | Query: `team_name`, `category_id`, `description`, `parent_vendor_id` | `{success, vendor}` | JWT: `vendor` | `create_internal_team_service` | `create_root_vendor` |
| **POST** | `/vendors/import` | `VendorImportRequest` | `VendorImportResponse` | JWT: `vendor` / `admin` | `import_vendors_service` | `bulk_create_vendors` |
| **GET** | `/sessions` | Query: `page`, `limit` | `{success, page, limit, count, sessions}` | Bearer JWT | `ChatSessionService.get_user_sessions` | Query `ChatSession` (offset/limit) |
| **GET** | `/sessions/{session_id}` | Path: `session_id` | `ChatSession` model | Bearer JWT | `ChatSessionService.get_session` | Query `ChatSession` |
| **GET** | `/sessions/{session_id}/history` | Path: `session_id` | `List[Conversation]` | Bearer JWT | `ConversationService.get_session_history` | Query `Conversation` |
| **GET** | `/sessions/{session_id}/context` | Path: `session_id` | `{session_id, context}` | Bearer JWT | `ConversationService.build_context_summary` | Query `Conversation` |
| **PATCH**| `/sessions/{session_id}` | Path: `session_id`, `SessionRenameRequest` | `{success, session_id, title}` | Bearer JWT | `ChatSessionService.update_session_title` | Query `ChatSession` |
| **DELETE**| `/sessions/{session_id}` | Path: `session_id` | `{success, message}` | Bearer JWT | `ChatSessionService.delete_session` | `delete_session` |
| **POST** | `/reasoning/test` | Query: `query` | `{success, intent, current_agent, workflow_trace, ranked_vendors, ai_response}` | Bearer JWT | `reasoning_graph.ainvoke` | Executes all internal repositories |
| **GET** | `/admin/agents` | None | `{success, agents}` | JWT: `admin` | Inline DB Query | Query `AIAgent` |
| **POST** | `/admin/agents` | `{agent_name, display_name, description}` | `{success, agent}` | JWT: `admin` | Inline DB Insert | `db.add(AIAgent)` |
| **POST** | `/admin/agents/test` | `{agent_id, test_query}` | `{success, agent_name, response}` | JWT: `admin` | `AIService.execute_prompt` | Query `AIAgent`, `AgentPrompt` |
| **POST** | `/admin/agents/test-workflow`| `{test_query}` | `{success, intent, filters, ai_response, vendors}` | JWT: `admin` | `GraphService.process` | Executes all repositories |
| **GET** | `/admin/agents/{agent_id}` | Path: `agent_id` | `{success, agent}` | JWT: `admin` | Inline DB Query | Query `AIAgent` |
| **PATCH**| `/admin/agents/{agent_id}/status`| Path: `agent_id`, `{status}`| `{success, message}` | JWT: `admin` | Inline DB Update & Log | `db.add(AgentAuditLog)` |
| **GET** | `/admin/agents/{agent_id}/prompt` | Path: `agent_id` | `{success, prompt}` | JWT: `admin` | Inline DB Query | Query `AgentPrompt` |
| **PUT** | `/admin/agents/{agent_id}/prompt` | Path: `agent_id`, `PromptUpdateRequest` | `{success, message}` | JWT: `admin` | `PromptService.clear_cache` | `db.add(PromptVersion)`, `db.add(AgentAuditLog)` |
| **GET** | `/admin/agents/{agent_id}/config` | Path: `agent_id` | `{success, configuration}` | JWT: `admin` | `AgentConfigurationService.get_configuration`| Query `AgentConfiguration` |
| **PUT** | `/admin/agents/{agent_id}/config` | Path: `agent_id`, `AgentConfigurationUpdate`| `{success, message, configuration}`| JWT: `admin` | `AgentConfigurationService.update_configuration` | `db.add(AgentAuditLog)` |
| **GET** | `/admin/agents/{agent_id}/versions` | Path: `agent_id` | `{success, versions}` | JWT: `admin` | Inline DB Query | Query `PromptVersion` |
| **POST** | `/admin/agents/{agent_id}/rollback/{version_id}`| Path: `agent_id`, `version_id`| `{success, message}` | JWT: `admin` | Rollback & clear cache | Query `PromptVersion`, Query `AgentPrompt` |
| **GET** | `/admin/agents/{agent_id}/audit-logs`| Path: `agent_id` | `{success, logs}` | JWT: `admin` | Inline DB Query | Query `AgentAuditLog` |
| **GET** | `/admin/vendor-cleanup/dashboard` | None | `{success, data: stats}` | JWT: `admin` | `VendorCleanupService.get_dashboard_stats`| Inline aggregations |
| **POST** | `/admin/vendor-cleanup/run` | None | `{success, run_id, stats}` | JWT: `admin` | `VendorCleanupService.run_analysis` | `db.add(VendorCleanupReport / Log)` |
| **GET** | `/admin/vendor-cleanup/reports` | None | `{success, reports}` | JWT: `admin` | `VendorCleanupService.get_reports`| Query `VendorCleanupReport` |
| **DELETE**| `/admin/vendor-cleanup/reports/{run_id}`| Path: `run_id` | `{success, message}` | JWT: `admin` | Inline DB Deletes | `delete(VendorCleanupReport / Log)` |
| **GET** | `/admin/vendor-cleanup/logs` | None | `{success, logs}` | JWT: `admin` | `VendorCleanupService.get_all_logs`| Query `VendorCleanupLog` |
| **GET** | `/admin/vendor-cleanup/logs/{run_id}`| Path: `run_id` | `{success, logs}` | JWT: `admin` | `VendorCleanupService.get_logs_for_run`| Query `VendorCleanupLog` |
| **PATCH**| `/admin/vendor-cleanup/logs/{log_id}/status`| Path: `log_id`, `{status}`| `{success, log_id, status, message}`| JWT: `admin` | Inline status update | Query `VendorCleanupLog` |
| **GET** | `/admin/vendor-sync/dashboard` | None | `{success, data}` | JWT: `admin` | `VendorSyncService.get_dashboard_stats` | Inline aggregations |
| **POST** | `/admin/vendor-sync/run` | None | `{success, run_id, total, success, failed}`| JWT: `admin` | `VendorSyncService.run_sync` | `db.add(SyncJobRun / Log)` |
| **GET** | `/admin/vendor-sync/runs` | None | `{success, runs}` | JWT: `admin` | `VendorSyncService.get_runs` | Query `SyncJobRun` |
| **GET** | `/admin/vendor-sync/logs` | None | `{success, logs}` | JWT: `admin` | `VendorSyncService.get_logs` | Query `SyncActivityLog` |

---

## 2. Complete Database Relationship Mapping
This section maps the relational database schema implemented in PostgreSQL via SQLAlchemy:

### Model Schema Mappings
1. **`User` (Table: `users`):**
   * **Primary Key:** `user_id` (UUID, Default: `uuid4`)
   * **Attributes:** `full_name` (String, NN), `username` (String, NN, Unique), `email` (String, NN, Unique), `phone_number` (String, Null), `role` (String, NN, Default: `'user'`), `password_hash` (String, NN), `is_active` (Bool, NN, Default: `True`), `created_at` (DateTime, TZ), `updated_at` (DateTime, TZ)
   * **Constraints:** `check_full_name`, `check_username`, `check_email`, `check_phone`, `check_role` (Role must be in `'user'`, `'vendor'`, or `'admin'`).
   * **Indexes:** PK Implicit Unique Indexes on `username`, `email`.

2. **`Vendor` (Table: `vendors`):**
   * **Primary Key:** `vendor_id` (UUID, Default: `uuid4`)
   * **Foreign Keys:**
     * `user_id` $\rightarrow$ `users.user_id` (UUID, Nullable, Unique)
     * `parent_vendor_id` $\rightarrow$ `vendors.vendor_id` (UUID, Nullable, Self-referencing)
     * `category_id` $\rightarrow$ `categories.category_id` (UUID, Nullable)
   * **Attributes:** `name` (String, NN), `slug` (String, Unique, Null), `description` (String, Null), `city` (String, Null), `address` (String, Null), `business_email` (String, NN, Unique), `contact_phone` (String, NN), `price_min` (Int, Null), `price_max` (Int, Null), `avg_rating` (Float, Default: `0`), `review_count` (Int, Default: `0`), `is_available` (Bool, Default: `True`), `is_verified` (Bool, Default: `False`), `is_active` (Bool, Default: `True`), `is_rejected` (Bool, Default: `False`), `followers_count` (Int, Default: `0`), `profile_views` (Int, Default: `0`), `engagement_score` (Float, Default: `0`)
   * **Constraints:** `check_vendor_name`, `check_business_email`, `check_contact_phone`, `check_price_min` ($\ge 0$), `check_price_max` ($\ge 0$), `check_price_order` ($Price_{min} \le Price_{max}$), `check_rating` ($0 \le Rating \le 5$), `check_review_count` ($\ge 0$).

3. **`Service` (Table: `services`):**
   * **Primary Key:** `service_id` (UUID, Default: `uuid4`)
   * **Foreign Keys:** `category_vendor_id` $\rightarrow$ `vendors.vendor_id` (UUID, NN, Cascade Delete)
   * **Attributes:** `service_name` (String, NN)
   * **Constraints:** Unique constraint `unique_service_per_category` on composite key (`category_vendor_id`, `service_name`).

4. **`VendorService` (Table: `vendor_services`):**
   * **Primary Key:** `service_id` (UUID, Default: `uuid4`)
   * **Foreign Keys:** `vendor_id` $\rightarrow$ `vendors.vendor_id` (UUID, NN)
   * **Attributes:** `service_name` (String, NN), `description` (Text, Null), `price` (Int, Null), `is_active` (Bool, Default: `True`), `created_at` (DateTime, TZ), `updated_at` (DateTime, TZ)
   * **Constraints:** `check_service_name`, `check_service_price` ($\ge 0$).

5. **`Review` (Table: `reviews`):**
   * **Primary Key:** `review_id` (UUID)
   * **Foreign Keys:**
     * `user_id` $\rightarrow$ `users.user_id` (UUID, NN)
     * `vendor_id` $\rightarrow$ `vendors.vendor_id` (UUID, NN, Cascade Delete)
   * **Attributes:** `rating` (Float, NN), `comment` (Text, Null)

6. **`UserPreference` (Table: `user_preferences`):**
   * **Primary Key:** `preference_id` (UUID, Default: `uuid4`)
   * **Foreign Keys:**
     * `user_id` $\rightarrow$ `users.user_id` (UUID, NN, Unique)
     * `favorite_vendor_id` $\rightarrow$ `vendors.vendor_id` (UUID, Nullable)
   * **Attributes:** `preferred_category` (String, Null), `preferred_city` (String, Null), `preferred_price_range` (String, Null), `preferred_event_type` (String, Null), `preferred_min_rating` (Float, Null), `preference_notes` (String, Null), `created_at` (DateTime, TZ), `updated_at` (DateTime, TZ)
   * **Constraints:** `check_preferred_city`, `check_price_range`, `check_event_type`
   * **Indexes:** `idx_user_preference_category` on `preferred_category`, `idx_user_preference_vendor` on `favorite_vendor_id`.

7. **`ChatSession` (Table: `chat_sessions`):**
   * **Primary Key:** `session_id` (UUID, Default: `uuid4`)
   * **Foreign Keys:** `user_id` $\rightarrow$ `users.user_id` (UUID, Nullable)
   * **Attributes:** `status` (String, NN, Default: `'ACTIVE'`), `title` (String, Null), `detected_intent` (String, Null), `current_question` (Text, Null), `context_data` (JSONB, NN, Default: `{}`), `missing_fields` (JSONB, NN, Default: `[]`), `created_at` (DateTime, TZ), `updated_at` (DateTime, TZ)
   * **Indexes:** `idx_chat_session_user` on `user_id`, `idx_chat_session_status` on `status`.

8. **`Conversation` (Table: `conversations`):**
   * **Primary Key:** `conversation_id` (UUID, Default: `uuid4`)
   * **Foreign Keys:** `user_id` $\rightarrow$ `users.user_id` (UUID, NN)
   * **Attributes:** `session_id` (UUID, NN), `user_message` (Text, NN), `ai_response` (Text, NN), `detected_intent` (String, Null), `applied_filters` (Text, Null), `is_follow_up` (Bool, Default: `False`), `context_summary` (Text, Null), `recommendations` (JSONB, Null), `created_at` (DateTime, TZ)
   * **Indexes:** `idx_conversation_session` on `session_id`, `idx_conversation_user` on `user_id`, `idx_conversation_intent` on `detected_intent`, `idx_conversation_user_created` on composite key (`user_id`, `created_at`).

9. **`AIAgent` (Table: `ai_agents`):**
   * **Primary Key:** `agent_id` (UUID, Default: `uuid4`)
   * **Attributes:** `agent_name` (String, Unique, NN), `display_name` (String, NN), `description` (Text, Null), `status` (Bool, Default: `True`), `created_at`, `updated_at`

10. **`AgentConfiguration` (Table: `agent_configurations`):**
    * **Primary Key:** `config_id` (UUID, Default: `uuid4`)
    * **Foreign Keys:** `agent_id` $\rightarrow$ `ai_agents.agent_id` (UUID, NN, Unique, Cascade Delete)
    * **Attributes:** `configuration` (JSONB, NN, Default: `{}`), `updated_by` (Text, Null), `updated_at` (DateTime, TZ)

11. **`AgentPrompt` (Table: `agent_prompts`):**
    * **Primary Key:** `prompt_id` (UUID, Default: `uuid4`)
    * **Foreign Keys:** `agent_id` $\rightarrow$ `ai_agents.agent_id` (UUID, NN)
    * **Attributes:** `base_prompt` (Text), `role_instructions` (Text), `behavior_guidelines` (Text), `formatting_rules` (Text), `business_rules` (Text), `updated_by` (Text), `updated_at` (DateTime)

### Entity-Relationship Schema Map
* **User Relationship Cardinalities:**
  * `User` (1) $\leftrightarrow$ (0..1) `Vendor` (Unique FK `vendors.user_id`)
  * `User` (1) $\leftrightarrow$ (0..1) `UserPreference` (Unique FK `user_preferences.user_id`)
  * `User` (1) $\leftrightarrow$ (0..*) `Review` (FK `reviews.user_id`)
  * `User` (1) $\leftrightarrow$ (0..*) `ChatSession` (FK `chat_sessions.user_id`)
  * `User` (1) $\leftrightarrow$ (0..*) `Conversation` (FK `conversations.user_id`)
* **Vendor Relationship Cardinalities:**
  * `Vendor` (1, Parent Profile) $\leftrightarrow$ (0..*) `Vendor` (Child Category-Specialty teams, FK `vendors.parent_vendor_id`)
  * `Vendor` (1, Child Specialty team) $\leftrightarrow$ (0..*) `Service` (Catalog list of specific food/service names, FK `services.category_vendor_id`)
  * `Vendor` (1, Parent Profile) $\leftrightarrow$ (0..*) `VendorService` (Custom prices, FK `vendor_services.vendor_id`)
  * `Vendor` (1, Parent Profile) $\leftrightarrow$ (0..*) `Review` (FK `reviews.vendor_id`)
  * `Vendor` (1, Parent Profile) $\leftrightarrow$ (0..*) `PricingModel` (FK `pricing_models.vendor_id`)

---

## 3. LangGraph Architecture Breakdown
The backend reasoning flow is orchestrated via **LangGraph**, compiling nodes into an acyclic state machine:

```
                  ┌──────────────┐
                  │  supervisor  ├────────────────────────┐
                  └──────┬───────┘                        │
                         │ (Intent route)                 │
                         ▼                                │ (Simple Intents)
                   ┌──────────┐                           │
                   │ context  │                           │
                   └────┬─────┘                           │
                        ▼                                 │
              ┌──────────────────┐                        │
              │  query_analysis  │                        │
              └────────┬─────────┘                        │
                       │ (Conditional Intent)             │
            ┌──────────┴──────────┐                       │
            ▼                     ▼                       │
     ┌────────────┐        ┌──────────────┐               │
     │ comparison │        │ tool_calling │               │
     └─────┬──────┘        └──────┬───────┘               │
           │                      │ (Routing)             │
           │               ┌──────┴──────┐                │
           │               ▼             ▼                │
           │          ┌─────────┐   ┌─────────┐           │
           │          │ ranking │   │   end   │           │
           │          └────┬────┘   └─────────┘           │
           │               │                              │
           ▼               ▼                              ▼
     ┌──────────────────────────────────────────────────────┐
     │                       response                       │
     └──────────────────────────┬───────────────────────────┘
                                ▼
                             ┌─────┐
                             │ END │
                             └─────┘
```

### 1. Nodes Specification
* **`supervisor`:** Evaluates the user query to categorize the root routing intent. It queries the `supervisor_agent` config from the database to fallback on configured default intents if classifications are ambiguous.
* **`context`:** Fetches active session conversation transcripts (using `ConversationService`) and user database preferences (using `UserPreferenceService`). Optimization bypasses database calls for simple chit-chat or generic queries.
* **`query_analysis`:** Coordinates parameter extraction. If target parameters are already identified by the parser, it skips LLM invocations. Otherwise, it compiles database prompts to instruct Ollama or Groq to extract structured query constraints.
* **`tool_calling`:** Executing backend logic.
  * Checks inputs to prevent negative pricing/budgets or zero guest counts from reaching database queries.
  * Intercepts `failed` statuses from service registries, raising failures for downstream agents.
  * Employs memory-caching routines for complete category-city queries.
* **`discovery`:** Consolidates matched vendor lists from database queries and limits counts according to config parameters.
* **`ranking`:** Submits vendor datasets and filters to the `RecommendationEngine` ranking functions.
* **`comparison`:** Intercepts comparison intents. Retrieves target vendors from session history lists, resolves spelling match intersections, and falls back to database queries to obtain matching competitors.
* **`response`:** Generates user-facing responses. Directs comparison outputs into formatted tables, runs comparison scoring, determines winner entities, and calls Groq to explain results. It also converts standard discovery results into plain text.
* **`error`:** Catches workflow exceptions and outputs fallback error messages.

### 2. State Transitions & Routers
* **`route_from_supervisor`:** Splits pathways. Routes searching, recommendations, pricing, service, and session queries to `query_analysis` (via `context`), routes comparison queries directly to `comparison`, and maps reviews, analytics, and category queries to `response`.
* **`route_after_analysis`:** Resolves execution routes. Sends comparison intents to `comparison` and discovery queries to `tool_calling`.
* **`route_after_tool_calling`:** Sends session inquiries to `response` and recommendation/discovery runs to `discovery` (which flows to `ranking` $\rightarrow$ `response`).

### 3. Memory & Context Configuration
* **Graph State (`AgentState`):** Persisted TypedDict mapping queries, filters, matched vendor datasets, execution traces, active tool operations, and context variables across executing nodes.
* **Cache Management:** The `ToolCallingAgent` features an in-memory cache with configurable TTL parameters to store execution results, avoiding duplicate database queries for identical searches.

---

## 4. Recommendation Engine Internal Design
The matching scoring pipeline resides in **`RecommendationEngine`**:

```
[Raw Vendor Matches]
         │
         ▼
[Calculate Components]
  ├── Category Match Score   ── (0 - 100)
  ├── Budget Relevance Score ── (0 - 100)
  ├── Location Score         ── (0 / 100)
  ├── Average Rating Score   ── (0 - 100)
  ├── Review Count Score     ── (10 - 100)
  ├── Verification Score     ── (0 / 100)
  └── Availability Score     ── (0 - 100)
         │
         ▼
[Fetch Dynamic Category Weights]
  ├── E.g., Catering: Budget=30%, Category=25%, Location=10%, Rating=15%...
  └── Apply Admin Config Coefficient Overrides (if present)
         │
         ▼
[Calculate Weighted Sum] ──► [Limit to max_results] ──► [Final Ranked List]
```

### 1. Match Scoring Pipeline
The system evaluates candidate vendors against seven sub-scores:
1. **Category Score:** Checks the matching category. Category-synonym mappings normalize similar terms (e.g., matching "photos" to "photography").
2. **Budget Relevance:**
   * If budget lies within $[Price_{min}, Price_{max}]$, score is $100$ (Perfect match).
   * If the vendor's max price is under budget, returns $80$ (within 20% undershoot) or $60$.
   * If the vendor's min price exceeds the budget, returns $70$ (within 10% overshoot), $40$ (within 25% overshoot), or $20$ (within 50% overshoot). Larger overshoots return $0$.
3. **Location Score:** Binary check. Returns $100$ if the vendor's city matches the user's preferred city, else $0$.
4. **Rating Score:** Computes normalized rating averages: $(\text{avg\_rating} / 5) \times 100$.
5. **Review Count Score:** Step-wise confidence bonus mapping review thresholds: $\ge 200 \rightarrow 100$, $\ge 100 \rightarrow 80$, $\ge 50 \rightarrow 60$, $\ge 20 \rightarrow 40$, $> 0 \rightarrow 20$, $0 \rightarrow 10$.
6. **Verification Score:** Verified vendors receive $100$, unverified vendors receive $0$.
7. **Availability Score:** Returns $100$ if the vendor is marked available, $0$ if unavailable, and $50$ if unspecified.

### 2. Weighting & Verification Logic
* Weights are dynamically assigned based on the requested service category. For instance, venues prioritize location (30% weight), catering prioritizes budget (30% weight), and photography prioritizes ratings (30% weight).
* Admin configurations stored in the database can override these weights.
* **Duplicate Filtering:** The search queries in [vendor_repository.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/repositories/vendor_repository.py) group results by `Vendor.vendor_id`. This ensures duplicate rows are filtered out before scoring, preventing redundant rankings for the same vendor.

---

## 5. Session Lifecycle Design
The engine uses a dual-layer session lifecycle model:

```
[POST /chat/message]
         │
         ▼
[Check Session in DB]
         │
         ├───[Not Found]──► Expire active user sessions ──► Create new ChatSession
         │                                                      │
         ▼                                                      ▼
[In-Memory SessionManager Cache] ◄──────────────────────────────┘
  ├── Add message to Deque (Max 12 messages)
  ├── Touch timestamp (Slide TTL)
  ├── Update accumulated session filters
  └── Run thread-safe cleanup (pop sessions idle > 2 hours)
         │
         ▼
[Graph execution complete] ──► Mark Session completed in DB & Update Preference Models
```

1. **Creation:** 
   * Triggers when a POST request is sent to `/chat/message` with a new `session_id`.
   * The database verifies session statuses. If a session is missing, it closes any older active sessions for the user and creates a new `ChatSession` record.
2. **Update:**
   * Every message in a session is added to the in-memory deque (capped at 12 messages, max 1500 characters) and saved to the PostgreSQL `conversations` table.
   * Extracted filters are merged with the session's active filters and saved.
3. **Expiration:**
   * In-memory cache data uses a thread-safe cleanup routine with a 2-hour TTL sliding window.
   * A background scheduler runs database updates to mark PostgreSQL sessions inactive for over 24 hours as `EXPIRED`.
4. **Persistence:**
   * Crucial dialog history is saved in PostgreSQL to support multi-device syncing.
   * Search preferences are logged in the `user_preferences` table to customize future recommendations.

---

## 6. Security Architecture
The security architecture enforces standard OAuth2 authentication with JWT token verification:

* **JWT Signature Configurations:** Configured with `SECRET_KEY` and the `HS256` signing algorithm. Access tokens are valid for 15 minutes, and refresh tokens are valid for 7 days.
* **HttpOnly Cookies:** Refresh tokens are written to client browsers via secure, HttpOnly cookies with `SameSite=lax` policies. This protects the tokens from XSS-based theft.
* **Access Token Rotation Flow:**
   1. The client requests a token refresh at `/auth/refresh`.
   2. The server reads the HttpOnly cookie and validates the refresh token.
   3. The server generates a new temporary access token and returns it in the response body.
* **Role Verification Dependency:**
   * Injectable dependencies (`require_role(["admin"])` and `require_role(["vendor"])`) validate scopes before executing route actions.
   * Prevents unauthorized access to administrative endpoints (such as agent configurations or database cleanup commands).

---

## 7. Deployment Architecture
The backend is designed for cloud-native deployment with the following component mapping:

```
                  ┌──────────────────────┐
                  │   Vite Frontend UI   │
                  └──────────┬───────────┘
                             │ HTTP / JSON
                             ▼
                  ┌──────────────────────┐
                  │    FastAPI Server    │
                  └────┬────────────┬────┘
                       │            │
       SQLAlchemy / PG │            │ REST API / OpenAI Schema
                       ▼            ▼
         ┌────────────────┐      ┌────────────────────────┐
         │ PostgreSQL DB  │      │  AI LLM Providers      │
         └────────────────┘      │  (Ollama, Groq,        │
                                 │   Gemini, ModelScope)  │
                                 └────────────────────────┘
```

1. **Vite Frontend UI:** Single Page App compiled as static files, running locally on port `5173`.
2. **FastAPI Application Server:** Runs the Python REST framework. Manages database connections, executes LangGraph reasoning steps, and handles API requests.
3. **PostgreSQL Database:** Stores structured data, including user accounts, vendor profiles, reviews, configurations, and chat sessions.
4. **AI Providers:**
   * **Ollama (Local):** Warmup lifespans run in the background on startup. Defaults to Qwen 2.5:7b on port `11434` for query understanding.
   * **Groq Cloud (Remote):** Used as the primary client for fast, human-toned response generation (defaults to Llama 3).
   * **Gemini / ModelScope:** Fallback providers for processing prompts and extracting filters.

---

## 8. Required Diagrams List
The final technical documentation must include the following diagrams to visualize the architecture:

1. **High-Level System Integration Diagram:** Shows request paths from the UI to FastAPI routers, services, the database, and AI providers.
2. **Database Entity Relationship Diagram (ERD):** Maps tables, primary/foreign keys, cascade deletes, and indexing strategies.
3. **LangGraph Agentic State Workflow Diagram:** Visualizes state transitions, supervisor routing decisions, and loop structures.
4. **Recommendation Engine Scoring Pipeline Flowchart:** Illustrates the parsing of parameters, category scoring weights, and final score calculations.
5. **Interactive Chat Dialogue Lifecycle Diagram:** Shows the lifecycle of a message from the initial API post through constraint verification to final output.
6. **Authentication & Token Rotation Sequence Diagram:** Details register/login tasks, HttpOnly cookie storage, and access token refreshes.
7. **Periodic Synchronization & Cleanup Pipeline:** Outlines the background scheduler, synchronization runs, and data cleanup processes.
