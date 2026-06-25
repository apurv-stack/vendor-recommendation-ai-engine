# AI Vendor Discovery & Recommendation Engine: Diagram Audit Report

This report provides a systematic technical audit of the generated SVG diagrams against the actual codebase implementation (including SQLAlchemy models, FastAPI routes, service layers, caching structures, and scoring algorithms).

---

## 1. Summary of Audit Scores

| # | Diagram Name | Accuracy Score (%) | Status | Major Findings |
| :--- | :--- | :---: | :--- | :--- |
| 1 | **Database ERD** (`database_erd_light.svg` & `_dark.svg`) | **85%** | Needs Review | Missing `categories` and `vendor_services` tables; incorrect FK indicator on `conversations.session_id`. |
| 2 | **Authentication Flow** (`authentication_flow_light.svg` & `_dark.svg`) | **100%** | Accurate | Aligns exactly with route dependencies and cookie settings. |
| 3 | **Recommendation Scoring Pipeline** (`recommendation_pipeline_light.svg` & `_dark.svg`) | **100%** | Accurate | Aligns exactly with python scoring weights, budget curves, and override logic. |
| 4 | **Session Lifecycle** (`session_lifecycle_light.svg` & `_dark.svg`) | **98%** | Accurate | Minor terminology clarification on active session closure. |
| 5 | **Sync & Cleanup Workflow** (`sync_cleanup_workflow_light.svg` & `_dark.svg`) | **100%** | Accurate | Aligns exactly with retry caps, error logs, and audit validation rules. |

---

## 2. Detailed Diagram Audits

### 1. Database ERD Diagrams (`database_erd_light.svg` & `database_erd_dark.svg`)

* **Comparison against SQLAlchemy Models:**
  * **Model `User` ([user.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/user.py)):** Matches perfectly. Columns `user_id` (PK, UUID), `username` (UQ), `email` (UQ), `role`, `password_hash`, `is_active`, and timestamps are accurately represented.
  * **Model `UserPreference` ([user_preference.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/user_preference.py)):** Matches. Columns `preference_id`, `user_id` (FK), `preferred_category`, `preferred_city`, and `preferred_event_type` are present.
  * **Model `ChatSession` ([chat_session.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/chat_session.py)):** Matches. Exposes JSONB columns `context_data` and `missing_fields`.
  * **Model `Conversation` ([conversation.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/conversation.py)):** Mostly matches, but misses several metadata columns.
  * **Model `Vendor` ([vendor.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/vendor.py)):** Core attributes (pricing, ratings, verifications, availability) are accurately represented.
  * **Model `Service` ([service.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/service.py)):** Matches. Relates `category_vendor_id` to `vendors.vendor_id`.
  * **Model `Review` ([review.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/review.py)):** Matches. `user_id` and `vendor_id` FK constraints are accurate.
* **Issues Found:**
  1. **Missing `categories` Entity:** The SQLAlchemy `Category` model mappings ([category.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/category.py)) and its table `categories` (used to store category directories) are completely omitted from the diagram.
  2. **Missing `vendor_services` Entity:** The codebase has **both** a `services` table (mapping `service_records` on `Vendor`) and a `vendor_services` table (ORM `VendorService` model in [vendor_service.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/vendor_service.py)). The `vendor_services` entity is missing from the ERD.
  3. **Incorrect ForeignKey Constraint:** The `conversations` block defines `session_id : UUID (FK)`. However, in the actual SQLAlchemy model `Conversation`, `session_id` is defined as a plain `Column(UUID(as_uuid=True), nullable=False)`. There is **no database-level foreign key constraint** referencing `chat_sessions.session_id`.
  4. **Missing Fields on `conversations`:** The `conversations` table block does not include key columns present in the model: `detected_intent`, `applied_filters`, `is_follow_up`, `context_summary`, and `recommendations` (JSONB).
* **Recommended Corrections:**
  * Add the `categories` table box and map the 1:N relationship from `categories` to `vendors.category_id`.
  * Add the `vendor_services` table box and map the 1:N relationship from `vendors` to `vendor_services.vendor_id`.
  * Remove the `(FK)` indicator from `conversations.session_id` and clarify it is a indexed UUID column.
  * Append missing metadata fields to the `conversations` table definition.

---

### 2. Authentication Flow Diagrams (`authentication_flow_light.svg` & `authentication_flow_dark.svg`)

* **Comparison against FastAPI Routes & Security Dependencies:**
  * **Authentication Routes ([auth.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/api/routes/auth.py)):** `/auth/login` validates credentials against password hash, writes the `refresh_token` to an HttpOnly cookie, and returns the temporary `access_token` in the body. `/auth/refresh` decodes the cookie and reissues access. Matches the diagram sequence.
  * **Dependencies ([auth_dependency.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/api/dependencies/auth_dependency.py)):** `get_current_user` decodes JWT, validates `"type" == "access"`, and verifies active status. `require_role([...])` raises HTTP 403 Forbidden on role mismatch. Matches the diagram's verification steps.
* **Issues Found:** None. The sequence transitions, token expiries (15m access / 7d refresh), and cookie settings match the code.
* **Accuracy Score:** **100%** (Fully accurate).

---

### 3. Recommendation Pipeline Diagrams (`recommendation_pipeline_light.svg` & `recommendation_pipeline_dark.svg`)

* **Comparison against Recommendation Engine Logic ([recommendation_engine.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/ai/recommendation_engine.py)):**
  * **Core Formula:** `Final Score = Sum(Sub-Score * Weight)` matches `calculate_final_score()`.
  * **Category-Specific Weights:** Weights mapped for `photography` (30% rating / 20% reviews), `catering` (30% budget), and `venue` (30% location) match `RecommendationEngine.CATEGORY_WEIGHTS` exactly.
  * **Sub-Score Calculations:**
    * Category Fit matches `calculate_category_score()` (synonym matches = 100, partial = 75, name terms = 60).
    * Location matches `calculate_location_score()` (preferred city match = 100, else 0).
    * Budget Relevance matches `calculate_budget_relevance()` (in-range = 100; undershoot/overshoot curves match exactly).
    * Rating matches `calculate_rating_score()` (average / 5 * 100).
    * Review Count matches `calculate_review_score()` step thresholds (200+ = 100, 100+ = 80, 50+ = 60, 20+ = 40, >0 = 20, 0 = 10).
    * Verification and Availability match their respective scoring logic.
  * **Dynamic Overrides:** The admin overrides and availability priority coefficients (w["available"] = 0.40, rating -= 0.20) match the final scoring overrides.
* **Issues Found:** None. The mathematical weights, synonym mappings, and threshold margins match the Python implementation.
* **Accuracy Score:** **100%** (Fully accurate).

---

### 4. Session Lifecycle Diagrams (`session_lifecycle_light.svg` & `session_lifecycle_dark.svg`)

* **Comparison against Session Services & Caching:**
  * **Session Manager ([session_manager.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/ai/session_manager.py)):** Deque capping (Max 12 messages, Max 1500 characters) and sliding TTL cache cleanup (SESSION_TTL = 7200 seconds / 2 hours) match `SessionManager` variables.
  * **Database Lifecycle ([chat_session_service.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/services/chat_session_service.py)):**
    * Session creation and older session closure matches `expire_user_active_sessions()`.
    * Expiration job setting idle sessions to `"EXPIRED"` matches `expire_old_sessions()`.
* **Issues Found:**
  * **Active Session Closure Terminology:** When a new session is initialized, the diagram states "Create new Session" $\rightarrow$ "Expire active user ones". In the actual code `ChatSessionService.expire_user_active_sessions()`, older active sessions are marked as `"COMPLETED"`, not `"EXPIRED"`. The `"EXPIRED"` status is reserved for the 24-hour database cleanup cron job.
* **Recommended Corrections:**
  * Clarify in the creation phase of the diagram that "Expire active user ones" updates older database records to `"COMPLETED"` to ensure only one session remains `"ACTIVE"`.
* **Accuracy Score:** **98%** (Accurate).

---

### 5. Sync & Cleanup Workflow Diagrams (`sync_cleanup_workflow_light.svg` & `sync_cleanup_workflow_dark.svg`)

* **Comparison against Sync & Cleanup Services:**
  * **Sync Pipeline ([vendor_sync_service.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/services/vendor_sync_service.py)):** Sync runs check fields (vendor name, email, phone checks), invoke retries (Max retries = 3), and write stats to `SyncJobRun` and `SyncActivityLog`. Matches the diagram.
  * **Cleanup Pipeline ([vendor_cleanup_service.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/services/vendor_cleanup_service.py)):** Scans database and audits name+email duplicates, name+phone duplicates, invalid email formats, missing/invalid phones, price inconsistencies ($Price_{min} > Price_{max}$), inactive profiles, and missing location data. Matches the diagram rules.
* **Issues Found:** None. The schedulers, retries, audit rules, and metadata tables align with the service layer implementations.
* **Accuracy Score:** **100%** (Fully accurate).
