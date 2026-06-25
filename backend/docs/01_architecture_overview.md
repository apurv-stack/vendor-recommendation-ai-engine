# AI Vendor Discovery & Recommendation Engine: Architecture Overview

This document provides a comprehensive overview of the system architecture, technology stack, folder structure, and API design of the **AI Vendor Discovery Agent API**. It is designed as a primary handover document for software engineers, architects, and technical operators.

---

## 1. Business Purpose
The AI Vendor Discovery & Recommendation Engine is a conversational matchmaking platform designed to connect event planners and clients with specialized vendors (e.g., caterers, photographers, venue hosts, decorators, DJs). 

Unlike static directory portals that rely on rigid keyword searches and strict filtering dropdowns, this engine leverages Natural Language Processing (NLP) and agentic workflows to:
* **Interpret Fuzzy User Requirements:** Understand intent and extract search parameters from conversational phrases (e.g., "I need a budget photographer in Mumbai who does candid shots").
* **Automate Constraint Gathering:** Recognize when essential requirements (like location, budget, or guest counts) are missing and ask targeted follow-up questions to complete the search context.
* **Score & Rank Candidates Intellectually:** Rank matching vendors based on category-tailored scoring rules (e.g., prioritizing distance for venues, price-fit for caterers, and rating distributions for photographers).
* **Perform Competitive Comparisons:** Enable head-to-head comparisons of vendor profiles, extracting winner/loser verdicts from marketplace signals.
* **Maintain High Data Quality:** Periodically scan registered profiles for invalid data, price inconsistencies, and duplicate records.

---

## 2. Technology Stack
The platform is built using a cloud-native, Python-centric technology stack:

* **Backend Framework:** **FastAPI (v0.100+)**
  * *Rationale:* High performance, native asynchronous support, auto-generated OpenAPI documentation, and robust dependency injection for database sessions and security checks.
* **Database & ORM:** **PostgreSQL** with **SQLAlchemy ORM (v2.0+)**
  * *Rationale:* PostgreSQL offers advanced relational querying, transactional safety, and robust JSONB support for storing dynamic session states and conversation metadata. SQLAlchemy 2.0 provides type-safe mapping and optimized eager loading.
* **Database Migrations:** **Alembic**
  * *Rationale:* Tracks versioned database schema upgrades and updates.
* **AI Orchestration & Agents:** **LangGraph (v0.0.x)** and **LangChain**
  * *Rationale:* Models the multi-agent conversational reasoning loop as a state machine. It manages state transitions between specialized supervisor, analyzer, tool-calling, ranking, and response nodes.
* **AI Providers & Models:**
  * **Ollama (Local - Qwen 2.5:7b):** Serves as the primary engine for local, private query understanding, filter extraction, and parameter parsing.
  * **Groq Cloud (Remote - Llama 3-8b-8192):** Serves as the high-speed response formatter, generating warm, human-toned summaries.
  * **Gemini (Google GenAI) / ModelScope:** Fallback providers for high-concurrency extraction or backup reasoning paths.
* **Background Scheduling:** **APScheduler (Advanced Python Scheduler)**
  * *Rationale:* Runs an in-process daemon to schedule periodic database cleanups and data syncs without requiring separate container architectures.

---

## 3. High-Level System Architecture
The system follows a clean-architecture model, dividing responsibilities into distinct layers:
1. **API Router Layer (FastAPI):** Exposes REST routes, parses request payloads, and enforces JWT validation.
2. **Service Layer:** Implements business logic (e.g., managing the conversation loop, importing spreadsheets, executing cleaning jobs).
3. **Reasoning Graph Layer (LangGraph):** Drives the multi-agent execution state machine.
4. **Repository Layer:** Abstract SQL query builders (using SQLAlchemy `joinedload` techniques to prevent N+1 queries).
5. **Database Layer (PostgreSQL):** Stores relational and JSONB schemas.
6. **Integration Layer (LLM Clients & Tools):** Manages API clients for external LLM execution.

[DIAGRAM: High-Level System Architecture]

---

## 4. Folder Structure Analysis
Below is the structural breakdown of the `/backend` directory and its design motivations:

* **`/alembic`:** Houses migration files, schema version histories, and `env.py` configured to bind target metadata.
* **`/app/core` (in [core/](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/core)):** Centralized configurations.
  * `config.py`: Exposes Pydantic-based `Settings` mapping environment variables (database connection strings, secrets, AI provider models).
  * `security.py`: Implements password hashing (bcrypt) and access token issuance.
  * `exceptions.py`: Defins global exception handlers mapping database violations (e.g., unique constraints) to clean HTTP responses.
* **`/app/models` (in [models/](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models)):** Database mapping entities.
* **`/app/schemas` (in [schemas/](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/schemas)):** Pydantic schemas validating API inputs and outputs.
* **`/app/repositories` (in [repositories/](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/repositories)):** Contains direct database query logic.
* **`/app/services` (in [services/](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/services)):** Service layer containing transactional steps and business rule validations.
* **`/app/ai` (in [ai/](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/ai)):** AI services. Contains the LLM factory, intent extractors, prompt template loaders, and the scoring logic.
* **`/app/agents` (in [agents/](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/agents)):** Individual agent executable nodes used by LangGraph.
* **`/app/graphs` (in [graphs/](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/graphs)):** State graphs, routers, and compiled graph logic.
* **`/app/tools` (in [tools/](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/tools)):** Structured tools (such as database selectors) exposed to agents.
* **`/app/api` (in [api/](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/api)):** Controller endpoints.
  * `/routes`: Router files matching business domains.
  * `/dependencies`: Injectable functions (e.g., extracting active user details from headers).

---

## 5. API Architecture
The API layer exposes REST interfaces grouped into six sub-routers:

### 1. Authentication Router (`/auth`):
Manages registration, login, token refresh, and identity checks.
* **POST `/auth/register`:** Validates username formats, email regex, strength of passwords, and creates User accounts.
* **POST `/auth/login`:** Validates user credentials. Sets the 7-day refresh token in a secure, HttpOnly cookie and returns the 15-minute access token in the response body.
* **POST `/auth/refresh`:** Renews access tokens using the refresh cookie.
* **POST `/auth/logout`:** Invalidates sessions by clearing cookies.
* **GET `/auth/me`:** Resolves the current user's profile metadata.

### 2. Conversational Chat Router (`/chat`):
* **POST `/chat/message`:** Accepts a `message` and an optional `session_id`. Passes payloads to the `ChatService` and triggers the LangGraph reasoning workflow to return structured recommendations or follow-up clarification questions.

### 3. Query Debugging Router (`/query`):
Exposes NLP pipeline components for diagnostic testing.
* **POST `/query/preprocess`:** Standardizes inputs (lowercasing, character stripping).
* **POST `/query/understand`:** Returns extracted intents and filters using rule-based parsers.
* **POST `/query/ai-understand`:** Runs the LLM filter extractor.

### 4. Vendor Management Router (`/vendors`):
* **GET / POST `/vendors/profile`:** Manages parent vendor details.
* **POST `/vendors/team`:** Links specialized sub-team vendors under a parent vendor.
* **POST `/vendors/import`:** Imports spreadsheets in bulk.

### 5. Session Router (`/sessions`):
* **GET `/sessions`:** Lists session metadata with pagination offsets.
* **GET `/sessions/{session_id}/history`:** Fetches the message history for a session.
* **DELETE `/sessions/{session_id}`:** Clears a session and its associated conversations.

### 6. Administration Routers (`/admin`):
Protected by admin-only role checks.
* **`/admin/agents`:** Creates, updates, rollback, and configures prompt parameters for agent nodes.
* **`/admin/vendor-cleanup`:** Triggers quality cleanses and lists data discrepancy reports.
* **`/admin/vendor-sync`:** Manages background database synchronization runs.
