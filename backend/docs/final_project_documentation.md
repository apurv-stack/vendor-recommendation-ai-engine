# AI Vendor Discovery & Recommendation Engine: Consolidated Project Documentation

Technical reference manual detailing system architecture, LangGraph workflows, recommendation logic, session persistence, API specifications, and deployment profiles. Suitable for engineering handover and mentor review.

---

## Document Revision History

| Version | Date | Author | Description |
| :--- | :--- | :--- | :--- |
| **v1.0.0** | 2026-06-25 | Principal Technical Architect | Consolidated technical blueprints, state graph node operations, database schemas, REST APIs, and deployment runbooks. Integrated the custom light and dark mode SVG diagram suite. |

---

## Executive Summary

The **AI Vendor Discovery & Recommendation Engine** is an intelligent conversational search and matchmaking platform. It allows clients to query and match with service vendors (such as caterers, DJs, venue hosts, photographers, and decorators) using fuzzy natural language. 

Traditional directories rely on rigid, keyword-based search structures. This engine uses **natural language parsing (NLP)** and **agentic loops** to:
1. Parse unstructured conversational statements to extract requirements (e.g. city, categories, pricing limits).
2. Gather missing search filters dynamically through conversational follow-up questions.
3. Perform competitive evaluations and side-by-side profile comparisons.
4. Calculate category-specific candidate scores based on location match, budget boundaries, average ratings, and review distributions.
5. Ingest data feeds in bulk and audit profiles automatically for quality assurance.

The platform is built using **FastAPI**, **PostgreSQL**, and **LangGraph**, and is configured to run local AI parsing via **Ollama** (`qwen2.5:7b`) and remote response generation via **Groq** (`llama3-8b-8192`) for sub-second, warm, human-toned output summaries.

---

## Table of Contents
1. [Chapter 1: System Integration & Architecture Overview](#chapter-1-system-integration---architecture-overview)
2. [Chapter 2: Agentic Workflow & LangGraph State Machine](#chapter-2-agentic-workflow---langgraph-state-machine)
3. [Chapter 3: Recommendation Engine & Suitability Scoring](#chapter-3-recommendation-engine---suitability-scoring)
4. [Chapter 4: Database Schema & Session Design](#chapter-4-database-schema---session-design)
5. [Chapter 5: Admin Operations & Background Schedulers](#chapter-5-admin-operations---background-schedulers)
6. [Chapter 6: API Reference Manual](#chapter-6-api-reference-manual)
7. [Chapter 7: Deployment Configuration & Security](#chapter-7-deployment-configuration---security)

---

## Chapter 1: System Integration & Architecture Overview

The backend is built around a layered architecture, separating REST route validation, business orchestration, state graph reasoning, and direct SQL repository queries.

### High-Level Components
1. **API Router Layer (FastAPI):** Exposes REST route endpoints, parses incoming payloads, and verifies user access tokens.
2. **Service Layer:** Houses transactional steps and validations (e.g., spreadsheet parsing, logging sync outcomes).
3. **Reasoning Graph Layer (LangGraph):** Orchestrates multi-agent pipelines where specialized nodes handle Context retrieval, Query Analysis, Database Tool Calling, Vendor Comparisons, Ranking, and Response generation.
4. **Repository Layer:** Encapsulates raw database queries (utilizing SQLAlchemy `joinedload` techniques to prevent N+1 queries).
5. **Database Layer (PostgreSQL):** Stores relational schemas and JSONB conversation data.
6. **Integration Layer (LLM Providers):** Manages Ollama and Groq API client connections.

### System Integration Diagrams

#### Light Mode:
![High-Level System Integration - Light Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/high_level_architecture_light.svg)

#### Dark Mode:
![High-Level System Integration - Dark Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/high_level_architecture_dark.svg)

---

### Folder Structure Overview

```
backend/
├── alembic/                      # Database migration scripts and environment setups
├── app/
│   ├── agents/                   # LangGraph agent definitions (Supervisor, Context, Query Analysis, etc.)
│   ├── ai/                       # NLP pipeline, LLM factory, structured parsers, recommendation engine
│   │   ├── prompts/              # Loaded system prompt configurations
│   │   └── providers/            # Vendor LLM api integrations
│   ├── api/                      # REST endpoints and request dependencies
│   │   ├── dependencies/         # Security, user context, and database session injection
│   │   └── routes/               # API Router groups (auth, vendor, chat, query, reasoning)
│   ├── core/                     # Application configurations, exceptions, security, and validators
│   ├── db/                       # SQLAlchemy connection initialization and database session factory
│   ├── graphs/                   # LangGraph workflow compile setups, routing routers, and state definitions
│   ├── integrations/             # External integration API clients
│   ├── models/                   # SQLAlchemy ORM schemas mapped to PostgreSQL tables
│   ├── repositories/             # Database access queries (VendorRepository, CategoryRepository)
│   ├── schemas/                  # Pydantic serialization models for API boundaries
│   ├── scripts/                  # Utility and seeding scripts
│   ├── services/                 # Business logic services (ChatService, VendorService, SyncService, etc.)
│   ├── tools/                    # Registered database query tools executed by agents
│   └── utils/                    # Shared helper functions
└── requirements/                 # Dependency lists for environment setups
```

---

## Chapter 2: Agentic Workflow & LangGraph State Machine

The conversational workflow is managed via a stateful compiled graph in **LangGraph**. The state machine coordinates node transitions and updates a central `AgentState` mapping.

### LangGraph Workflow Diagrams

#### Light Mode:
![LangGraph Workflow - Light Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/langgraph_workflow_light.svg)

#### Dark Mode:
![LangGraph Workflow - Dark Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/langgraph_workflow_dark.svg)

---

### State Mapping (`AgentState`)
The `AgentState` (defined in [app/graphs/graph_state.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/graphs/graph_state.py)) is a shared dictionary passed between agents. It contains:
* **Request Context:** `query` (str), `session_id` (str), `user_id` (str), `db` (Session), and `access_token` (str | None).
* **Routing Metadata:** `intent` (str), `secondary_intents` (List[str]), and `confidence` (float).
* **Constraint Extraction:** `filters` (Dict[str, Any]), `validation` (Dict[str, Any]), and `search_payload` (Dict[str, Any]).
* **Database & Tool Outputs:** `tool_name` (str), `tool_input` (Dict[str, Any]), `tool_output` (Dict[str, Any]), `tool_status` (str), `tool_error` (str | None), `vendors` (List[Any]), and `ranked_vendors` (List[Any]).
* **Workflow Trace:** `current_agent` (str), `workflow_trace` (List[Dict[str, Any]]), `errors` (List[str]), and `ai_response` (str).

### Node Specifications & Behaviors
1. **`supervisor` (in [supervisor_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/supervisor_agent.py)):** Evaluates query intent. If intent was classified upstream, it bypasses LLM classification steps to minimize latency. Otherwise, it calls the `IntentExtractor`.
2. **`context` (in [context_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/context_agent.py)):** Loads user preference history and the last 10 messages. Bypasses database queries for simple chit-chat.
3. **`query_analysis` (in [query_analysis_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/query_analysis_agent.py)):** Parses filters (category, city, budget, guest count) using instructions from the `agent_prompts` table and the `AIService`.
4. **`tool_calling` (in [tool_calling_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/tool_calling_agent.py)):** Invokes tool executors. Catches database failures to update state.
5. **`discovery` (in [discovery_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/discovery_agent.py)):** Fetches matching vendors, applying limits from database configurations.
6. **`ranking` (in [ranking_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/ranking_agent.py)):** Passes vendor datasets and weights to `RecommendationEngine.rank_vendors`.
7. **`comparison` (in [comparison_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/comparison_agent.py)):** Executes head-to-head vendor reviews. Resolves spelling mismatches with fuzzy intersection checks.
8. **`response` (in [response_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/response_agent.py)):** Generates client responses (including tables and comparison summaries) using Groq.
9. **`error` (in [error_agent.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents/error_agent.py)):** Outputs user-friendly fallback error messages.

---

## Chapter 3: Recommendation Engine & Suitability Scoring

Candidate vendors are evaluated against seven sub-scores. The final match score is computed using category-specific weights:

### Recommendation Scoring Pipeline Diagrams

#### Light Mode:
![Recommendation Scoring Pipeline - Light Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/recommendation_pipeline_light.svg)

#### Dark Mode:
![Recommendation Scoring Pipeline - Dark Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/recommendation_pipeline_dark.svg)

---

### Core Formula
$$\text{Final Score} = \sum (\text{Sub-Score}_i \times \text{Weight}_i)$$

$$\text{Final Score} = (\text{Category} \times W_{cat}) + (\text{Budget} \times W_{bud}) + (\text{Location} \times W_{loc}) + (\text{Rating} \times W_{rat}) + (\text{Reviews} \times W_{rev}) + (\text{Verified} \times W_{ver}) + (\text{Available} \times W_{av})$$

### Sub-Score Hashing Logic
1. **Category Fit Score (0-100):** synonym check. Returns 100 for exact match, 75 for partial string match, 60 for keyword match, and 0 for mismatch.
2. **Budget Relevance Score (0-100):** Evaluates pricing constraints.
   * If budget lies within $[Price_{min}, Price_{max}]$: Returns 100.
   * Max price under budget (undershoot): Returns 80 (within 20% margin) or 60.
   * Min price over budget (overshoot): Returns 70 (within 10% overshoot), 40 (within 25%), 20 (within 50%), or 0.
3. **Location Score (0 or 100):** Binary check. Returns 100 if the vendor's city matches the query city, else 0.
4. **Rating Score (0-100):** Normalizes average ratings: $(\text{Average Rating} / 5.0) \times 100$.
5. **Review Count Score (10-100):** Step-wise index: $\ge 200 \rightarrow 100$, $\ge 100 \rightarrow 80$, $\ge 50 \rightarrow 60$, $\ge 20 \rightarrow 40$, $> 0 \rightarrow 20$, $0 \rightarrow 10$.
6. **Verification Score (0 or 100):** Returns 100 if verified, else 0.
7. **Availability Score (0-100):** Returns 100 if available, 0 if unavailable, and 50 if unspecified.

### Category-Specific Weights

| Category | $W_{cat}$ (Category) | $W_{bud}$ (Budget) | $W_{loc}$ (Location) | $W_{rat}$ (Rating) | $W_{rev}$ (Reviews) | $W_{ver}$ (Verified) | $W_{av}$ (Available) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| **`default`** | 35% | 20% | 15% | 15% | 10% | 3% | 2% |
| **`photography`**| 25% | 10% | 10% | 30% | 20% | 3% | 2% |
| **`catering`** | 25% | 30% | 10% | 15% | 15% | 3% | 2% |
| **`venue`** | 25% | 20% | 30% | 12% | 8% | 3% | 2% |
| **`decoration`** | 25% | 15% | 10% | 28% | 17% | 3% | 2% |
| **`dj`** | 25% | 15% | 10% | 28% | 17% | 3% | 2% |
| **`entertainment`**| 25% | 12% | 10% | 30% | 18% | 3% | 2% |
| **`music`** | 25% | 12% | 10% | 30% | 18% | 3% | 2% |

---

## Chapter 4: Database Schema & Session Design

The backend uses PostgreSQL for transactional storage, mapped via SQLAlchemy ORM models.

### Database ERD Diagrams

#### Light Mode:
![Database Entity Relationship - Light Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/database_erd_light.svg)

#### Dark Mode:
![Database Entity Relationship - Dark Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/database_erd_dark.svg)

---

### Key Table Definitions & Constraints
1. **`users` (Model: `User`):** Stores user credentials and access roles (`'user'`, `'vendor'`, `'admin'`).
2. **`vendors` (Model: `Vendor`):** Stores business profile parameters. Includes checks for ratings ($0 \le Rating \le 5$) and price ordering ($Price_{min} \le Price_{max}$).
3. **`services` (Model: `Service`):** Custom services linked to sub-teams. Enforces composite unique constraint on (`category_vendor_id`, `service_name`).
4. **`vendor_services` (Model: `VendorService`):** Details pricing for services.
5. **`chat_sessions` (Model: `ChatSession`):** Tracks session parameters, intent classifications, missing requirements, and active filters.
6. **`conversations` (Model: `Conversation`):** Stores dialogue transcripts, intent predictions, and search preferences.
7. **`user_preferences` (Model: `UserPreference`):** Stores preferred locations and favorite vendor profiles.

### Interactive Chat Session Lifecycle Diagrams

#### Light Mode:
![Chat Session Lifecycle - Light Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/session_lifecycle_light.svg)

#### Dark Mode:
![Chat Session Lifecycle - Dark Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/session_lifecycle_dark.svg)

---

### Session Lifecycle Management
* **Creation:** Triggers when a POST request is sent to `/chat/message` with a new `session_id`. If a session is missing, it closes older active sessions for the user and creates a new `ChatSession` record.
* **Update:** Dialogues are saved to the `conversations` table, and extracted filters are merged with `ChatSession.context_data` JSONB parameters.
* **Expiration:** Cache records use a thread-safe cleanup routine with a 2-hour TTL sliding window. A background scheduler runs database updates to mark PostgreSQL sessions inactive for over 24 hours as `EXPIRED`.
* **Persistence:** Histories are stored in PostgreSQL to support multi-device syncing, and preferences are saved in the `user_preferences` table.

---

## Chapter 5: Admin Operations & Background Schedulers

Administrators can modify prompt templates, review audit logs, and trigger synchronization or cleanup tasks. The system utilizes **APScheduler** to run periodic background operations.

### Sync & Cleanup Workflow Diagrams

#### Light Mode:
![Sync & Cleanup Workflow - Light Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/sync_cleanup_workflow_light.svg)

#### Dark Mode:
![Sync & Cleanup Workflow - Dark Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/sync_cleanup_workflow_dark.svg)

---

### Database Synchronization Pipeline (`VendorSyncService`)
* **Execution Interval:** Scheduled to run every 30 minutes.
* **Operations:** Reads external vendor records, validates required fields (name, email, phone), and retries failed syncs up to 3 times.
* **Logging:** Saves results to `SyncJobRun` and errors to `SyncActivityLog`.

### Database Quality Audit & Cleanup Pipeline (`VendorCleanupService`)
* **Anomalies Checked:** Runs quality audits to flag duplicates (matching name-email or name-phone pairs), validate email formats, check phone numbers, check for missing cities, and identify pricing errors ($Price_{min} > Price_{max}$).
* **Review Cycle:** Audit logs are saved to `VendorCleanupLog` with a `'pending'` status. Administrators can review logs and update their status to `'reviewed'`, `'resolved'`, or `'ignored'`.
* **Metrics:** Scans are recorded in `VendorCleanupReport` to track metrics like total scanned profiles, issues detected, and issues resolved.

---

## Chapter 6: API Reference Manual

REST endpoints are organized into nine routers:

### Authentication & Token Rotation Sequence Diagrams

#### Light Mode:
![Authentication Flow - Light Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/authentication_flow_light.svg)

#### Dark Mode:
![Authentication Flow - Dark Mode](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/docs/assets/diagrams/authentication_flow_dark.svg)

---

### 1. Authentication Router (`/auth`)
* **POST `/auth/register`:** Registers a new user.
  * *Request Body (`RegisterRequest`):* `username`, `full_name`, `email`, `password`, `confirm_password`, `role` (`"user"` or `"vendor"`), `business_email` (required for vendors), `phone_number` (required for vendors).
  * *Response Body:* `success`, `message`, `user`.
* **POST `/auth/login`:** Validates user credentials. Sets the 7-day refresh token in a secure, HttpOnly cookie and returns the 15-minute access token in the response body.
  * *Request Body (`LoginRequest`):* `identifier` (username or email), `password`.
  * *Response Body:* `success`, `message`, `access_token`, `token_type`, `user`.
* **POST `/auth/refresh`:** Renews access tokens using the refresh cookie.
  * *Response Body:* `success`, `access_token`.
* **POST `/auth/logout`:** Invalidates sessions by clearing cookies.
  * *Response Body:* `success`, `message`.
* **GET `/auth/check-username/{username}`:** Instantly checks if a username is available.
* **GET `/auth/check-email/{email}`:** Instantly checks if an email is registered.
* **GET `/auth/me`:** Resolves the current user's profile metadata.

### 2. Conversational Chat Router (`/chat`)
* **POST `/chat/message`:** Accepts a message and an optional session ID, runs the LangGraph workflow, and returns structured recommendations or follow-up questions.
  * *Request Body (`ChatRequest`):* `message` (1–500 characters), `session_id` (optional).
  * *Response Body (`ChatResponse`):* `success`, `message`, `session_id`, `response_type`, `current_question`, `missing_fields`, `recommendations` (list of `RecommendationCard`).

### 3. Query Debugging Router (`/query`)
* **POST `/query/preprocess`:** Normalizes user text (character stripping, spelling checks).
* **POST `/query/understand`:** Returns extracted intents and filters using rule-based parsers.
* **POST `/query/ai-understand`:** Triggers the LLM-driven structured filter extractor.

### 4. AI Interactive Router (`/ai`)
* **POST `/ai/chat`:** Runs sandboxed prompts from templates, bypassing graph state.
  * *Request Body (`AIRequest`):* `query`, `workflow` (defaults to `"vendor"`).

### 5. Category Registry Management (`/categories`)
* **POST `/categories/`:** Creates a new service category. (Admin only)
* **GET `/categories/`:** Lists all active categories.
* **GET `/categories/{category_id}`:** Retrieves a single category.
* **PATCH `/categories/{category_id}`:** Updates category name, slug, or status. (Admin only)
* **DELETE `/categories/{category_id}`:** Soft-deactivates a category. (Admin only)

### 6. Chat Session Router (`/sessions`)
* **GET `/sessions`:** Lists user sessions with pagination offsets.
* **GET `/sessions/{session_id}`:** Retrieves session parameters and missing fields.
* **GET `/sessions/{session_id}/history`:** Chronological message logs for a session.
* **GET `/sessions/{session_id}/context`:** AI-generated summary of session preferences.
* **PATCH `/sessions/{session_id}`:** Renames the session title.
* **DELETE `/sessions/{session_id}`:** Deletes a session and its conversational history.

### 7. Vendor Directory & Profiles (`/vendors`)
* **GET `/vendors/profile`:** Retrieves the active vendor's business profile. (Vendor only)
* **PUT `/vendors/profile`:** Updates the vendor business profile. (Vendor only)
* **PUT `/vendors/{vendor_id}/rename`:** Renames a vendor business name.
* **POST `/vendors/team`:** Creates a specialty sub-team nested under the root vendor profile.
* **GET `/vendors/internal-team`:** Returns sub-teams nested under the active vendor profile.
* **GET `/vendors/{vendor_id}/children`:** Public retrieval of sub-teams nested under a parent vendor ID.
* **GET `/vendors/service/{service_id}`:** Retrieves a single service detail.
* **PUT `/vendors/service/{service_id}/rename`:** Renames a specific service.
* **DELETE `/vendors/service/{service_id}`:** Removes a service from the catalog.
* **GET `/vendors/search`:** Search endpoint with filtering and pagination.
* **GET `/vendors/recommendations`:** Returns candidate vendors matching user preferences.
* **GET `/vendors/preferences/me` | PUT `/vendors/preferences/me`:** Manages user search preferences.
* **POST `/vendors/import`:** Ingests vendor profile listings (JSON payload). (Admin only)
* **POST `/vendors/import-file`:** Ingests vendor listings from CSV/Excel files. (Admin only)
* **PATCH `/vendors/{vendor_id}/verify`:** Verification status toggle. (Admin only)
* **PATCH `/vendors/{vendor_id}/reject`:** Flags a vendor profile as rejected. (Admin only)
* **PATCH `/vendors/{vendor_id}/restore`:** Restores deactivated/rejected vendor profiles. (Admin only)

### 8. AI Agent Administration (`/admin/agents`)
* **GET `/admin/agents` | POST `/admin/agents`:** Lists and creates reasoning agent nodes.
* **GET `/admin/agents/{agent_id}`:** Details for a specific reasoning agent.
* **PATCH `/admin/agents/{agent_id}/status`:** Toggles active/inactive status of an agent.
* **GET `/admin/agents/{agent_id}/prompt` | PUT `/admin/agents/{agent_id}/prompt`:** Manages agent prompt versions.
* **GET `/admin/agents/{agent_id}/config` | PUT `/admin/agents/{agent_id}/config`:** Runtime parameter configs (e.g. model name, temperature, timeouts).
* **GET `/admin/agents/{agent_id}/versions`:** Lists version logs for the system prompts.
* **POST `/admin/agents/{agent_id}/rollback/{version_id}`:** Rolls back agent prompts to previous versions.
* **GET `/admin/agents/{agent_id}/audit-logs`:** Lists audit logs for the agent.

### 9. Vendor Quality Audit & Cleanup (`/admin/vendor-cleanup`)
* **GET `/admin/vendor-cleanup/dashboard`:** Statistics of quality audit issues.
* **POST `/admin/vendor-cleanup/run`:** Triggers database quality audits.
* **GET `/admin/vendor-cleanup/reports` | DELETE `/admin/vendor-cleanup/reports/{run_id}`:** Manages execution reports.
* **GET `/admin/vendor-cleanup/logs` | PATCH `/admin/vendor-cleanup/logs/{log_id}/status`:** Manages audit logs.

### 10. Vendor Ingestion & Synchronization (`/admin/vendor-sync`)
* **GET `/admin/vendor-sync/dashboard`:** Ingestion sync dashboard stats.
* **POST `/admin/vendor-sync/run`:** Forces an immediate background ingestion sync run.
* **GET `/admin/vendor-sync/runs`:** Lists historical execution logs of ingestion sync jobs.
* **GET `/admin/vendor-sync/logs`:** Lists detailed sync errors.

---

## Chapter 7: Deployment Configuration & Security

The system is designed for cloud-native deployment. Configurations are managed via environment variables loaded on startup.

### Environmental Settings
* `DATABASE_URL`: Connection string for PostgreSQL database.
* `SECRET_KEY`: High-entropy key used to sign HMAC JWT tokens.
* `ALGORITHM`: Token signing algorithm (`HS256`).
* `ACCESS_TOKEN_EXPIRE_MINUTES`: Expiry limit for access tokens (15 minutes).
* `REFRESH_TOKEN_EXPIRE_DAYS`: Expiry limit for refresh cookies (7 days).
* `GROQ_API_KEY`: API key to access remote Groq response LLMs.
* `OLLAMA_BASE_URL`: Endpoint for local Ollama daemon service (`http://localhost:11434/v1`).
* `AI_PROVIDER`: NLP parsing provider (`"ollama"`).
* `AI_MODEL`: Local Ollama model identifier (`"qwen2.5:7b"`).
* `AI_TIMEOUT`: Execution timeout limit (45 seconds).
* `RESPONSE_AI_PROVIDER`: Response generator provider (`"groq"`).
* `RESPONSE_AI_MODEL`: Remote Groq model identifier (`"llama3-8b-8192"`).

### System Startup Life Cycle
At start, the application boots through the following sequence:
1. Uvicorn starts the application process.
2. Settings and environment variables are loaded.
3. Database engine connects.
4. Lifespan event launches an async background task to warm up the local Ollama model (hitting `/api/generate` with model `qwen2.5:7b` and `keep_alive` set to `"10m"`).
5. `start_scheduler()` invokes APScheduler threads in the background.
6. DB tables are verified and auto-created (or migrations are applied).
7. FastAPI begins listening for API connections on Port 8000.

### Production Monitoring Recommendations
* **Process Managers:** Monitor Uvicorn processes using process managers like **PM2** or **Supervisord**. Probe `/health` endpoint for container health checks.
* **LLM Latency Tracing:** Trace execution times for local Ollama models. If Groq responses take longer than 5 seconds, implement fallbacks or trigger alerts.
* **Database Auditing:** Monitor database connection pools. Adjust pool limits (`pool_size`, `max_overflow`) to prevent database exhaustion. Review execution logs for long-running database queries and add indexes where needed.
