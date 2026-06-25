# AI Vendor Discovery & Recommendation Engine: Admin Operations, Security, & Scheduler

This document covers prompt management, background schedulers, data quality audits, security architectures, and deployment structures.

---

## 1. Dynamic Prompt Management & Rollback Versioning
To allow administrators to fine-tune AI behavior without redeploying code, the system supports dynamic prompt configurations (implemented in [admin_agent_routes.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/api/routes/admin_agent_routes.py)):

* **Prompt Customization:** Administrators can update prompt templates (including system instructions, role guidelines, behavior rules, and formatting patterns) for individual agents.
* **Version Control:** Saving a prompt automatically increments its version number and creates a new `PromptVersion` record to track changes.
* **Rollback Support:** Administrators can roll back prompts to any historical version. This updates the active prompt config and creates a rollback log.
* **Cache Invalidation:** Updating or rolling back a prompt automatically calls `PromptService.clear_cache()` and `PromptLoader.invalidate_all()` to clear cached prompts.
* **Audit Logging:** All changes (such as prompt updates, configurations, status toggles, and rollbacks) write audit records to the `AgentAuditLog` table.

---

## 2. Sync & Cleanup Scheduler Workflow
The backend running daemon utilizes **APScheduler** to execute periodic background operations.

[DIAGRAM: Sync & Cleanup Workflow]

### 1. Database Synchronization Pipeline (`VendorSyncService`)
* **Execution Interval:** Scheduled to run every 30 minutes.
* **Data Validation:** Reads vendor records, validating required fields (such as name, email, and phone).
* **Sync Logging:** Saves results to the `SyncJobRun` table and records errors in `SyncActivityLog`.
* **Retry Policy:** Automatically retries failed vendor syncs up to 3 times.

### 2. Vendor Quality Audit & Cleanup Pipeline (`VendorCleanupService`)
* **Anomalies Checked:** Runs quality audits to flag duplicates (matching name-email or name-phone pairs), check email formats, verify phone numbers, check for missing cities, and identify pricing errors ($Price_{min} > Price_{max}$).
* **Review Cycle:** Audit logs are saved to `VendorCleanupLog` with a `'pending'` status. Administrators can review logs and update their status to `'reviewed'`, `'resolved'`, or `'ignored'`.
* **Metrics:** Scans are recorded in `VendorCleanupReport` to track metrics like total scanned profiles, issues detected, and issues resolved.

---

## 3. Security Architecture
The security architecture enforces standard authentication and authorization controls:

[DIAGRAM: Authentication Flow]

* **JWT Signature Configurations:** Enforces signature validations using `SECRET_KEY` and the `HS256` algorithm.
  * Access Token: Valid for 15 minutes (passed in authorization headers).
  * Refresh Token: Valid for 7 days (stored in a secure HttpOnly cookie).
* **Refresh Token Rotation:**
  * Clients send requests to `/auth/refresh` with the refresh cookie.
  * The server decodes the token, verifies it is a refresh type token, generates a new access token, and returns it in the response body.
* **Role Verification Dependencies:**
  * Enforces role checks (`require_role(["admin"])` and `require_role(["vendor"])`) before executing route actions.
  * Extracted roles are stored in access tokens, allowing the server to validate permissions without querying the database for every request.

---

## 4. Deployment Boundaries & Runtime Configurations
The platform is designed for cloud-native deployment with the following boundaries:

* **Vite Frontend UI:** Serves static files, communicating with the backend API on port `5173`.
* **FastAPI Application Server:** Executed via Uvicorn/Gunicorn. It runs on port `8000`, exposes the API routes, drives the LangGraph workflow, and handles background tasks.
* **PostgreSQL Database Engine:** Stores relational schemas on port `5432` (or external RDS hosts).
* **AI Providers:**
  * **Ollama (Local):** Warmup tasks run on startup. It listens on port `11434` for query understanding.
  * **Groq Cloud (Remote):** Used for fast response generation (Llama 3).
  * **Gemini (Google GenAI) / ModelScope:** Fallback providers for processing prompts and extracting filters.
* **Configuration:** Managed via Pydantic settings. Environment variables are loaded from `.env` files, and CORS settings are configured to allow cross-origin requests from the frontend.
