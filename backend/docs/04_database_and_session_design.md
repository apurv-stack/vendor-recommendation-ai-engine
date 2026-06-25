# AI Vendor Discovery & Recommendation Engine: Database & Session Design

This document details the database schemas, indexing strategies, cache mechanisms, transaction scopes, and session lifecycles of the recommendation engine.

---

## 1. Database Schema & Index Specifications
The database layout is built using PostgreSQL. Relations are modeled via SQLAlchemy ORM (using Python type annotations).

[DIAGRAM: Database ERD]

### 1. Table Definitions & Constraints

#### `users` (Model: `User` in [user.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/user.py))
* **Primary Key:** `user_id` (UUID, Default: `uuid4`)
* **Unique Constraints:** `username`, `email`
* **Check Constraints:** 
  * `check_full_name`: `length(trim(full_name)) > 0`
  * `check_username`: `length(trim(username)) > 0`
  * `check_email`: `length(trim(email)) > 0`
  * `check_phone`: `phone_number IS NULL OR length(trim(phone_number)) > 0`
  * `check_role`: `role IN ('user','vendor','admin')`

#### `vendors` (Model: `Vendor` in [vendor.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/vendor.py))
* **Primary Key:** `vendor_id` (UUID, Default: `uuid4`)
* **Foreign Keys:** 
  * `user_id` $\rightarrow$ `users.user_id` (Unique, Nullable)
  * `parent_vendor_id` $\rightarrow$ `vendors.vendor_id` (Self-referencing hierarchy link, Nullable)
  * `category_id` $\rightarrow$ `categories.category_id` (Nullable)
* **Check Constraints:**
  * `check_vendor_name`: `length(trim(name)) > 0`
  * `check_business_email`: `length(trim(business_email)) > 0`
  * `check_contact_phone`: `length(trim(contact_phone)) > 0`
  * `check_price_min`: `price_min IS NULL OR price_min >= 0`
  * `check_price_max`: `price_max IS NULL OR price_max >= 0`
  * `check_price_order`: `(price_min IS NULL OR price_max IS NULL) OR (price_min <= price_max)`
  * `check_rating`: `avg_rating >= 0 AND avg_rating <= 5`
  * `check_review_count`: `review_count >= 0`

#### `services` (Model: `Service` in [service.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/service.py))
* **Primary Key:** `service_id` (UUID, Default: `uuid4`)
* **Foreign Key:** `category_vendor_id` $\rightarrow$ `vendors.vendor_id` (Cascade delete)
* **Unique Constraint:** `unique_service_per_category` on (`category_vendor_id`, `service_name`)

#### `vendor_services` (Model: `VendorService` in [vendor_service.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/vendor_service.py))
* **Primary Key:** `service_id` (UUID, Default: `uuid4`)
* **Foreign Key:** `vendor_id` $\rightarrow$ `vendors.vendor_id`
* **Check Constraints:**
  * `check_service_name`: `length(trim(service_name)) > 0`
  * `check_service_price`: `price IS NULL OR price >= 0`

#### `chat_sessions` (Model: `ChatSession` in [chat_session.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/chat_session.py))
* **Primary Key:** `session_id` (UUID, Default: `uuid4`)
* **Foreign Key:** `user_id` $\rightarrow$ `users.user_id`
* **Indexes:** 
  * `idx_chat_session_user` on `user_id`
  * `idx_chat_session_status` on `status`

#### `conversations` (Model: `Conversation` in [conversation.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/conversation.py))
* **Primary Key:** `conversation_id` (UUID, Default: `uuid4`)
* **Foreign Key:** `user_id` $\rightarrow$ `users.user_id`
* **Indexes:** 
  * `idx_conversation_session` on `session_id`
  * `idx_conversation_user` on `user_id`
  * `idx_conversation_intent` on `detected_intent`
  * `idx_conversation_user_created` on (`user_id`, `created_at`)

#### `user_preferences` (Model: `UserPreference` in [user_preference.py](file:///C:/Users/kashish/Desktop/Intern/vendor-recommendation-ai-engine/backend/app/models/user_preference.py))
* **Primary Key:** `preference_id` (UUID, Default: `uuid4`)
* **Foreign Keys:**
  * `user_id` $\rightarrow$ `users.user_id` (Unique)
  * `favorite_vendor_id` $\rightarrow$ `vendors.vendor_id`
* **Indexes:**
  * `idx_user_preference_category` on `preferred_category`
  * `idx_user_preference_vendor` on `favorite_vendor_id`
* **Check Constraints:** `check_preferred_city`, `check_price_range`, `check_event_type`

---

## 2. Session Lifecycle Design
The conversation session flow manages active user states:

[DIAGRAM: Session Lifecycle]

### 1. Creation Phase
* Triggered when a POST request is sent to `/chat/message` with a new `session_id` or when the user starts a new chat thread.
* The system retrieves the active session from the database. If it is missing, the system completes any other active sessions for the user (setting status to `'COMPLETED'`) and creates a new `ChatSession` record.

### 2. Update & Context Compilation Phase
* User and assistant messages are added to the database conversation logs.
* Filters extracted during the conversation are merged with active session filters and saved to `ChatSession.context_data` as JSONB.
* The system checks for missing constraints (e.g. city or category). If missing, it adds them to `ChatSession.missing_fields` and saves the follow-up question.

### 3. Expiration Phase
* **Cache Expiration:** An in-process background task runs every 2 hours (TTL = 7200 seconds) to clear inactive sessions from memory.
* **Database Expiration:** A database task runs every 24 hours to expire active sessions that have been idle, setting their status to `'EXPIRED'`.

### 4. Persistence Phase
* Conversation histories are persisted in PostgreSQL to support multi-device syncing.
* Preferences (preferred locations and categories) are saved in the `user_preferences` table to customize future recommendations.

---

## 3. Session Caching
To optimize performance and reduce database load, the system uses a dual-layer caching strategy:

### In-Memory Cache Layer (`SessionManager`)
* **Thread-Safe Memory Lock:** Uses a threading lock to manage in-memory dicts.
* **Dialogue Memory Limits:** Stores the last 12 messages (up to 1500 characters) in a deque to build conversation context.
* **Cumulative Filters:** Saves search criteria across messages in a session to support query refinements.
* **Vendor Memory:** Stores the last recommended vendor list to handle follow-up comparison requests.

### Database Persistence Layer (`ChatSessionService` & `ConversationService`)
* Serves as the source of truth, persisting session states and conversation histories.
* Extracted filters and missing requirements are saved as JSONB fields for quick retrieval.
* Summarizes long dialogue histories before calling LLM models to prevent timeouts.
