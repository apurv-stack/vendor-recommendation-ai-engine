# AI Vendor Discovery & Recommendation Engine: API Reference Manual

This document provides complete technical reference documentation for every API endpoint exposed by the **AI Vendor Discovery & Recommendation Engine** backend. It is designed for frontend developers, integration engineers, and system operators.

---

## 1. Global Configurations & Authentication

### Base URL
* **Development:** `http://localhost:8000`
* **Production:** Configured via environment gateway (e.g., `https://api.vendor-engine.internal`)

### Security Model
The system enforces standard **OAuth2** authentication with signed **JWT Access Tokens** and rotation cookies:
1. **Access Token:** Short-lived JWT (15 minutes). Exchanged in the HTTP headers:
   `Authorization: Bearer <JWT_ACCESS_TOKEN>`
2. **Refresh Token:** Long-lived token (7 days). Set by the server in a secure, `HttpOnly`, `Secure`, `SameSite=Lax` cookie. Automatically read at the `/auth/refresh` endpoint to rotate access tokens.
3. **Role Checks:** Injectable route dependencies enforce role restrictions: `user`, `vendor`, and `admin`.

---

## 2. Authentication Router (`/auth`)

Endpoints for registration, login, token refresh, logout, and credential validation.

### POST `/auth/register`
* **Purpose:** Registers a new user or vendor account.
* **Authentication Required:** Public (None)
* **Request Schema (`RegisterRequest`):**
  * `username` (string, required): 3–30 characters, alphanumeric with `.`, `-`, or `_`.
  * `full_name` (string, required): 2–100 characters, letters and spaces only.
  * `email` (string/EmailStr, required): Valid email address.
  * `password` (string, required): 8–100 characters. Requires 1 uppercase letter, 1 lowercase letter, 1 digit, and 1 special character.
  * `confirm_password` (string, required): Must match `password` exactly.
  * `role` (string, optional, default: `"user"`): Access role. Valid options: `"user"`, `"vendor"`.
  * `business_email` (string/EmailStr, optional): Required if `role` is `"vendor"`.
  * `phone_number` (string, optional): Required if `role` is `"vendor"`. Must be exactly 10 digits.
* **Response Schema (`RegisterResponse`):**
  * `success` (boolean): `true` if registered.
  * `message` (string): Status message.
  * `user` (object): User details object.
* **Service Called:** `register_user`
* **Repository Called:** `db.add(User)`
* **Example Request:**
  ```json
  {
    "username": "jane_doe",
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "password": "Password123!",
    "confirm_password": "Password123!",
    "role": "user"
  }
  ```
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "User registered successfully",
    "user": {
      "user_id": "d3b07384-d113-49cd-a5d6-8cf815f94d9a",
      "username": "jane_doe",
      "full_name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "phone_number": null
    }
  }
  ```
* **Error Responses:**
  * **400 Bad Request (Passwords do not match):**
    ```json
    { "detail": "Passwords do not match" }
    ```
  * **400 Bad Request (Username exists):**
    ```json
    { "detail": "Username already taken" }
    ```

---

### POST `/auth/login`
* **Purpose:** Authenticates credentials and issues tokens.
* **Authentication Required:** Public (None)
* **Request Schema (`LoginRequest`):**
  * `identifier` (string, required): Username or email.
  * `password` (string, required): Hashed verification password.
* **Response Schema (`LoginResponse`):**
  * `success` (boolean): `true` if logged in.
  * `message` (string): Status message.
  * `access_token` (string): Signed access JWT.
  * `token_type` (string): `"bearer"`.
  * `user` (object): Logged in user metadata.
* **Service Called:** `login_user`
* **Repository Called:** Direct query on `User`
* **Response Headers:** `Set-Cookie: refresh_token=<REFRESH_JWT>; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`
* **Example Request:**
  ```json
  {
    "identifier": "jane_doe",
    "password": "Password123!"
  }
  ```
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "Login successful",
    "access_token": "eyJhbGciOiJIUzI1Ni...",
    "token_type": "bearer",
    "user": {
      "user_id": "d3b07384-d113-49cd-a5d6-8cf815f94d9a",
      "username": "jane_doe",
      "full_name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "phone_number": null
    }
  }
  ```
* **Error Responses:**
  * **401 Unauthorized (Invalid credentials):**
    ```json
    { "detail": "Invalid username/email or password" }
    ```

---

### POST `/auth/refresh`
* **Purpose:** Decodes the secure cookie and issues a new access token.
* **Authentication Required:** Public (None - relies on incoming cookies)
* **Request Schema:** None (reads `refresh_token` from Request cookies)
* **Response Schema:**
  * `success` (boolean): `true`
  * `access_token` (string): Updated access token.
* **Service Called:** `jwt.decode` / `create_access_token`
* **Repository Called:** None
* **Example Response:**
  ```json
  {
    "success": true,
    "access_token": "eyJhbGciOiJIUzI1NiJ9..."
  }
  ```
* **Error Responses:**
  * **401 Unauthorized (Missing/expired refresh token):**
    ```json
    { "detail": "Invalid or expired refresh token" }
    ```

---

### POST `/auth/logout`
* **Purpose:** Invalidates the user session.
* **Authentication Required:** Public
* **Request Schema:** None
* **Response Schema:**
  * `success` (boolean): `true`
  * `message` (string): Logout confirmation.
* **Service Called:** `response.delete_cookie("refresh_token")`
* **Repository Called:** None
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "Successfully logged out"
  }
  ```

---

### GET `/auth/check-username/{username}`
* **Purpose:** Checks if a username is available.
* **Authentication Required:** Public
* **Request Params:** `username` (string, path parameter)
* **Response Schema:**
  * `success` (boolean)
  * `available` (boolean)
  * `message` (string)
* **Service Called:** Inline query check
* **Repository Called:** Query `User`
* **Example Response:**
  ```json
  {
    "success": true,
    "available": true,
    "message": "Username is available"
  }
  ```

---

### GET `/auth/check-email/{email}`
* **Purpose:** Checks if an email is already registered.
* **Authentication Required:** Public
* **Request Params:** `email` (string, path parameter)
* **Response Schema:**
  * `success` (boolean)
  * `available` (boolean)
  * `message` (string)
* **Service Called:** Inline query check
* **Repository Called:** Query `User`
* **Example Response:**
  ```json
  {
    "success": true,
    "available": false,
    "message": "Email is already registered"
  }
  ```

---

### GET `/auth/me`
* **Purpose:** Returns the current logged-in user profile.
* **Authentication Required:** Bearer JWT (Any role)
* **Response Schema:**
  * `success` (boolean)
  * `message` (string)
  * `user` (object): User metadata.
* **Service Called:** `get_current_user`
* **Repository Called:** Query `User`
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "User profile retrieved successfully",
    "user": {
      "user_id": "d3b07384-d113-49cd-a5d6-8cf815f94d9a",
      "username": "jane_doe",
      "full_name": "Jane Doe",
      "email": "jane@example.com",
      "role": "user",
      "phone_number": null
    }
  }
  ```

---

### GET `/auth/admin-only` | GET `/auth/vendor-only` | GET `/auth/user-only`
* **Purpose:** Diagnostic routes validating role-based authorization headers.
* **Authentication Required:** Bearer JWT with `admin`, `vendor`, or `user` roles respectively.
* **Response Schema:**
  * `success` (boolean): `true`
  * `message` (string): Confirmation of successful authorization.
  * `user` (object): User details.
* **Service Called:** `require_role([...])`
* **Repository Called:** None
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "Authorized successfully for admin role",
    "user": {
      "user_id": "8c66fd55-7313-4630-9b04-a1db1f94a899",
      "email": "admin@vendor-app.com",
      "role": "admin"
    }
  }
  ```

---

## 3. Conversational Chat Router (`/chat`)

### POST `/chat/message`
* **Purpose:** The primary conversational API. Processes conversational messages using the LangGraph state machine.
* **Authentication Required:** Bearer JWT (Any role)
* **Request Schema (`ChatRequest`):**
  * `message` (string, required): Message string (1–500 characters).
  * `session_id` (string, optional): Existing UUID string (max 100 characters). If omitted, a new chat session is initialized.
* **Response Schema (`ChatResponse`):**
  * `success` (boolean): `true`
  * `message` (string): Text response (either direct LLM reply, recommendation overview, or follow-up question).
  * `session_id` (string): Active UUID.
  * `response_type` (string): `"chat"`, `"validation_error"`, or `"error"`.
  * `current_question` (string, optional): Follow-up text prompting for missing fields.
  * `missing_fields` (list of strings): Extracted fields that are still missing (e.g. `["city", "budget"]`).
  * `recommendations` (list, optional): Candidate lists (populated only when all constraints are gathered). See items structure:
    * `vendor_id` (string)
    * `vendor_name` (string)
    * `category` (string)
    * `city` (string)
    * `rating` (float)
    * `review_count` (integer)
    * `price_min` (integer)
    * `price_max` (integer)
    * `price_range` (string)
    * `vendor_description` (string)
    * `recommendation_reason` (string)
    * `match_score` (integer): Weighted suitability index (0–100).
    * `featured_badge` (string)
* **Service Called:** `ChatService.process_message`
* **Repository Called:** Query and update `ChatSession`, `Conversation`, `User`, `Vendor`, `UserPreference`
* **Example Request:**
  ```json
  {
    "message": "I am looking for a catering vendor in Pune under 500 per plate.",
    "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d"
  }
  ```
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "Here are the top match results for catering in Pune within your budget.",
    "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "response_type": "chat",
    "current_question": null,
    "missing_fields": [],
    "recommendations": [
      {
        "vendor_id": "e44d32aa-990a-48d6-a2cb-3b10c9a4b899",
        "vendor_name": "Royal Cuisine Caterers",
        "category": "Catering",
        "city": "Pune",
        "rating": 4.7,
        "review_count": 85,
        "price_min": 350,
        "price_max": 480,
        "price_range": "350 - 480",
        "vendor_description": "Premium vegetarian and non-vegetarian catering packages.",
        "recommendation_reason": "Perfect match for budget constraint and high customer satisfaction.",
        "match_score": 98,
        "featured_badge": "Verified"
      }
    ]
  }
  ```

---

## 4. Query Preprocessing & NLP Parser (`/query`)

Debugging endpoints exposing individual NLP query analysis pipelines.

### POST `/query/preprocess`
* **Purpose:** Standardizes raw user text (character stripping, spelling normalization).
* **Authentication Required:** Public
* **Request Schema (`QueryRequest`):**
  * `query` (string, required): Raw text.
* **Response Schema:**
  * `success` (boolean)
  * `original_query` (string)
  * `normalized_query` (string)
* **Service Called:** `QueryPreprocessor.preprocess`
* **Example Response:**
  ```json
  {
    "success": true,
    "original_query": "I   need catering in PUNE!!!",
    "normalized_query": "i need catering in pune"
  }
  ```

---

### POST `/query/understand`
* **Purpose:** Executes rule-based intent classifiers and parses parameters.
* **Authentication Required:** Public
* **Request Schema (`QueryRequest`)**
* **Response Schema:**
  * `success` (boolean)
  * `intent` (string): Primary intent (e.g. `"discover"`, `"compare"`, `"chit_chat"`).
  * `filters` (object): Unstructured key-value extraction metadata.
  * `structured_filter` (object): Schema-normalized filters.
  * `validation` (object): Intent check parameters.
  * `search_payload` (object): PostgreSQL search payload mapping.
* **Service Called:** `IntentExtractor`, `QueryValidator`, `FilterGenerator`, `QueryTransformer`
* **Example Response:**
  ```json
  {
    "success": true,
    "intent": "discover",
    "filters": {
      "category": "catering",
      "city": "Pune",
      "max_price": "500"
    },
    "structured_filter": {
      "category": "Catering",
      "city": "Pune",
      "price_max": 500
    },
    "validation": {
      "is_valid": true,
      "errors": []
    },
    "search_payload": {
      "category_name": "Catering",
      "city": "Pune",
      "price_max": 500
    }
  }
  ```

---

### POST `/query/ai-understand`
* **Purpose:** Runs LLM-assisted parser mapping dynamic values.
* **Authentication Required:** Public
* **Request Schema (`QueryRequest`)**
* **Response Schema:**
  * `success` (boolean)
  * `data` (object): LLM output including extracted filters and validate logic.
* **Service Called:** `AIService.build_structured_response`, `FilterGenerator`, `FilterValidator`
* **Example Response:**
  ```json
  {
    "success": true,
    "data": {
      "intent": "discover",
      "filters": {
        "category": "Photography",
        "city": "Mumbai",
        "price_max": 30000
      },
      "structured_filter": {
        "category": "Photography",
        "city": "Mumbai",
        "price_max": 30000
      },
      "filter_validation": {
        "is_valid": true,
        "errors": []
      }
    }
  }
  ```

---

## 5. Category Registry Management (`/categories`)

Manage service category directories (e.g., Catering, Photography, Venues).

### POST `/categories/`
* **Purpose:** Creates a new service category.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Schema (`CategoryCreateRequest`):**
  * `name` (string, required): 2–255 characters.
  * `slug` (string, required): 2–100 characters. Lowercase, numbers, and hyphens only.
  * `description` (string, optional): Max 1000 characters.
* **Response Schema (`CategoryDetailResponse`):**
  * `success` (boolean)
  * `message` (string)
  * `category` (object): Created category details.
* **Service Called:** `create_category_service`
* **Repository Called:** `db.add(Category)`
* **Example Request:**
  ```json
  {
    "name": "Live Music & DJ",
    "slug": "live-music-dj",
    "description": "Professional event disc jockeys and live music performers."
  }
  ```
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "Category created successfully",
    "category": {
      "category_id": "4f90a9b3-1f12-4214-874e-7b70f034cbfa",
      "name": "Live Music & DJ",
      "slug": "live-music-dj",
      "description": "Professional event disc jockeys and live music performers.",
      "is_active": true
    }
  }
  ```

---

### GET `/categories/`
* **Purpose:** Lists all active categories.
* **Authentication Required:** Public
* **Response Schema (`CategoryListResponse`):**
  * `success` (boolean)
  * `message` (string)
  * `categories` (list): Array of active categories.
* **Service Called:** `get_all_categories_service`
* **Repository Called:** Query `Category`
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "Categories retrieved successfully",
    "categories": [
      {
        "category_id": "4f90a9b3-1f12-4214-874e-7b70f034cbfa",
        "name": "Live Music & DJ",
        "slug": "live-music-dj",
        "description": "Professional event disc jockeys and live music performers.",
        "is_active": true
      }
    ]
  }
  ```

---

### GET `/categories/{category_id}`
* **Purpose:** Retrieves a single category by ID.
* **Authentication Required:** Public
* **Request Params:** `category_id` (UUID, path parameter)
* **Response Schema (`CategoryDetailResponse`)**
* **Service Called:** `get_single_category_service`
* **Repository Called:** Query `Category`
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "Category retrieved successfully",
    "category": {
      "category_id": "4f90a9b3-1f12-4214-874e-7b70f034cbfa",
      "name": "Live Music & DJ",
      "slug": "live-music-dj",
      "description": "Professional DJs and music bands",
      "is_active": true
    }
  }
  ```

---

### PATCH `/categories/{category_id}`
* **Purpose:** Partially updates an existing category.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `category_id` (UUID, path parameter)
* **Request Schema (`CategoryUpdateRequest`):**
  * `name` (string, optional)
  * `slug` (string, optional)
  * `description` (string, optional)
  * `is_active` (boolean, optional)
* **Response Schema (`CategoryDetailResponse`)**
* **Service Called:** `update_category_service`
* **Repository Called:** Query and update `Category`
* **Example Request:**
  ```json
  {
    "description": "Updated category details for music bands and DJs."
  }
  ```
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "Category updated successfully",
    "category": {
      "category_id": "4f90a9b3-1f12-4214-874e-7b70f034cbfa",
      "name": "Live Music & DJ",
      "slug": "live-music-dj",
      "description": "Updated category details for music bands and DJs.",
      "is_active": true
    }
  }
  ```

---

### DELETE `/categories/{category_id}`
* **Purpose:** Deactivates a category (soft-delete, sets `is_active` to `false`).
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `category_id` (UUID, path parameter)
* **Response Schema (`CategoryDetailResponse`)**
* **Service Called:** `deactivate_category_service`
* **Repository Called:** Update `Category`
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "Category deactivated successfully",
    "category": {
      "category_id": "4f90a9b3-1f12-4214-874e-7b70f034cbfa",
      "name": "Live Music & DJ",
      "slug": "live-music-dj",
      "description": "DJs and live performers",
      "is_active": false
    }
  }
  ```

---

## 6. Chat Session Management (`/sessions`)

### GET `/sessions`
* **Purpose:** Paginated retrieval of the active user's chat sessions.
* **Authentication Required:** Bearer JWT (Any role)
* **Request Params:**
  * `page` (integer, query param, default: `1`)
  * `limit` (integer, query param, default: `20`)
* **Response Schema:**
  * `success` (boolean): `true`
  * `page` (integer)
  * `limit` (integer)
  * `count` (integer)
  * `sessions` (list): Array of session summary objects containing `session_id`, `status`, `title`, `created_at`, `updated_at`, and a dialog `preview` (last conversation exchange).
* **Service Called:** `ChatSessionService.get_user_sessions`, `ConversationService.get_session_preview`
* **Repository Called:** Query `ChatSession`, `Conversation`
* **Example Response:**
  ```json
  {
    "success": true,
    "page": 1,
    "limit": 20,
    "count": 1,
    "sessions": [
      {
        "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
        "status": "ACTIVE",
        "title": "Mumbai Photographer Search",
        "created_at": "2026-06-25T12:00:00Z",
        "updated_at": "2026-06-25T12:05:00Z",
        "preview": "User: I need a photographer. AI: Sure, what is your budget?"
      }
    ]
  }
  ```

---

### GET `/sessions/{session_id}`
* **Purpose:** Retrieves the current metadata parameters of a single chat session.
* **Authentication Required:** Bearer JWT (Owner checking enforced)
* **Request Params:** `session_id` (string, path parameter)
* **Response Schema:** Complete ORM model dict for `ChatSession`. Includes intent, status, collected filters, and missing fields.
* **Service Called:** `ChatSessionService.get_session`
* **Repository Called:** Query `ChatSession`
* **Example Response:**
  ```json
  {
    "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "user_id": "d3b07384-d113-49cd-a5d6-8cf815f94d9a",
    "status": "ACTIVE",
    "title": "Mumbai Photographer Search",
    "detected_intent": "discover",
    "current_question": "What is your target budget for the photographer?",
    "context_data": {
      "city": "Mumbai",
      "category": "Photography"
    },
    "missing_fields": [
      "price_max"
    ],
    "created_at": "2026-06-25T12:00:00Z",
    "updated_at": "2026-06-25T12:05:00Z"
  }
  ```

---

### GET `/sessions/{session_id}/history`
* **Purpose:** Fetches the chronological message transcript of a chat session.
* **Authentication Required:** Bearer JWT (Owner checking enforced)
* **Request Params:** `session_id` (string, path parameter)
* **Response Schema:** List of conversation exchanges containing `user_message`, `ai_response`, `created_at`, etc.
* **Service Called:** `ConversationService.get_session_history`
* **Repository Called:** Query `Conversation` (ordered by `created_at` ASC)
* **Example Response:**
  ```json
  [
    {
      "conversation_id": "e445fd-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
      "user_message": "Find photographers in Mumbai",
      "ai_response": "I found some photographers in Mumbai. What is your target budget?",
      "detected_intent": "discover",
      "applied_filters": "{\"city\": \"Mumbai\", \"category\": \"Photography\"}",
      "is_follow_up": true,
      "created_at": "2026-06-25T12:01:00Z"
    }
  ]
  ```

---

### GET `/sessions/{session_id}/context`
* **Purpose:** Builds an AI-synthesized contextual summary of the session history.
* **Authentication Required:** Bearer JWT (Owner check enforced)
* **Request Params:** `session_id` (string, path parameter)
* **Response Schema:**
  * `session_id` (string)
  * `context` (string): Textual summary of preferences gathered so far.
* **Service Called:** `ConversationService.build_context_summary`
* **Repository Called:** Query `Conversation`
* **Example Response:**
  ```json
  {
    "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "context": "The user is looking for a photographer in Mumbai. They have unspecified budget details and have requested candidacy reviews."
  }
  ```

---

### PATCH `/sessions/{session_id}`
* **Purpose:** Renames the session title.
* **Authentication Required:** Bearer JWT (Owner check enforced)
* **Request Params:** `session_id` (string, path parameter)
* **Request Schema (`SessionRenameRequest`):**
  * `title` (string, required): New title string.
* **Response Schema:**
  * `success` (boolean)
  * `session_id` (string)
  * `title` (string)
* **Service Called:** `ChatSessionService.update_session_title`
* **Repository Called:** Query and update `ChatSession`
* **Example Request:**
  ```json
  {
    "title": "Candid Photographers in Mumbai"
  }
  ```
* **Example Response:**
  ```json
  {
    "success": true,
    "session_id": "9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d",
    "title": "Candid Photographers in Mumbai"
  }
  ```

---

### DELETE `/sessions/{session_id}`
* **Purpose:** Deletes a session and its conversational history.
* **Authentication Required:** Bearer JWT (Owner check enforced)
* **Request Params:** `session_id` (string, path parameter)
* **Response Schema:**
  * `success` (boolean): `true`
  * `message` (string)
* **Service Called:** `ChatSessionService.delete_session`, `ConversationService.delete_session_conversations`
* **Repository Called:** Delete operations on `ChatSession` and `Conversation`
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "Session deleted successfully"
  }
  ```

---

## 7. Vendor Directory & Profiles (`/vendors`)

This sub-router manages vendor registration, specialty sub-teams, pricing service lines, profile analysis views, search filters, and import/export capabilities.

### GET `/vendors/profile`
* **Purpose:** Retrieves the active user's vendor business profile.
* **Authentication Required:** Bearer JWT (Vendor role)
* **Response Schema (`VendorDetailResponse`):** Vendor details including category, price boundaries, followings count, and sub-teams.
* **Service Called:** `get_current_vendor_profile_service`
* **Repository Called:** Query `Vendor` (using `joinedload` on sub-teams and category)
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "Vendor profile retrieved successfully",
    "vendor": {
      "vendor_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "user_id": "d3b07384-d113-49cd-a5d6-8cf815f94d9a",
      "parent_vendor_id": null,
      "name": "Candid Moments Photography",
      "slug": "candid-moments-photography",
      "description": "High quality candids.",
      "category_id": "4f90a9b3-1f12-4214-874e-7b70f034cbfa",
      "city": "Mumbai",
      "address": "402, Trade Tower, Bandra",
      "business_email": "candid@moments.com",
      "contact_phone": "9876543210",
      "price_min": 15000,
      "price_max": 45000,
      "avg_rating": 4.8,
      "review_count": 140,
      "is_available": true,
      "is_verified": true,
      "is_active": true,
      "managed_teams": []
    }
  }
  ```

---

### PUT `/vendors/profile`
* **Purpose:** Updates the vendor business profile.
* **Authentication Required:** Bearer JWT (Vendor role)
* **Request Schema (`VendorProfileUpdateRequest`):**
  * `name` (string, optional)
  * `slug` (string, optional): Lowercase letters, numbers, and hyphens.
  * `description` (string, optional)
  * `category_id` (UUID, optional)
  * `city` (string, optional)
  * `address` (string, optional)
  * `business_email` (string/EmailStr, optional)
  * `contact_phone` (string, optional): Must clean to 10 digits.
  * `price_min` (integer, optional): Minimum price ($\ge 0$).
  * `price_max` (integer, optional): Maximum price ($\ge 0$). Must satisfy $Price_{min} \le Price_{max}$.
  * `is_available` (boolean, optional)
* **Response Schema (`VendorDetailResponse`)**
* **Service Called:** `update_current_vendor_profile_service`
* **Repository Called:** Update `Vendor`
* **Example Request:**
  ```json
  {
    "price_min": 18000,
    "price_max": 48000,
    "description": "Updated candid photography profile descriptions."
  }
  ```
* **Example Response:**
  ```json
  {
    "success": true,
    "message": "Vendor profile updated successfully",
    "vendor": {
      "vendor_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "Candid Moments Photography",
      "price_min": 18000,
      "price_max": 48000,
      "description": "Updated candid photography profile descriptions.",
      "is_available": true,
      "is_verified": true
    }
  }
  ```

---

### PUT `/vendors/{vendor_id}/rename`
* **Purpose:** Renames a vendor business name.
* **Authentication Required:** Bearer JWT (Vendor owner or Admin role)
* **Request Params:**
  * `vendor_id` (UUID, path parameter)
  * `name` (string, query parameter)
* **Response Schema:** `{ "success": bool, "vendor": VendorResponse }`
* **Service Called:** `rename_vendor_service`
* **Repository Called:** Query and update `Vendor`
* **Example Request:** `PUT /vendors/a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d/rename?name=Artistic%20Moments`
* **Example Response:**
  ```json
  {
    "success": true,
    "vendor": {
      "vendor_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "name": "Artistic Moments"
    }
  }
  ```

---

### POST `/vendors/team`
* **Purpose:** Creates a specialty sub-team (category specialty) nested under the root vendor profile.
* **Authentication Required:** Bearer JWT (Vendor role)
* **Request Params (passed as Query Parameters):**
  * `team_name` (string, required): 2-100 characters.
  * `category_id` (UUID, optional)
  * `description` (string, optional): Max 500 characters.
  * `parent_vendor_id` (UUID, optional): If omitted, resolves to the caller's root vendor ID.
* **Response Schema:** `{ "success": bool, "vendor": ManagedTeamResponse }`
* **Service Called:** `create_internal_team_service`
* **Repository Called:** `db.add(Vendor)` with self-referencing `parent_vendor_id`
* **Example Request:** `POST /vendors/team?team_name=Candid%20Team&description=Candid%20specialists`
* **Example Response:**
  ```json
  {
    "success": true,
    "vendor": {
      "vendor_id": "f8d384ab-c34d-48bb-aef9-323ff034f5aa",
      "name": "Candid Team",
      "parent_vendor_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
      "services": []
    }
  }
  ```

---

### GET `/vendors/internal-team`
* **Purpose:** Returns the sub-teams nested under the active vendor profile.
* **Authentication Required:** Bearer JWT (Vendor role)
* **Response Schema:** List of `ManagedTeamResponse`.
* **Service Called:** `get_my_internal_team_service`
* **Repository Called:** Query `Vendor` (child filtering)

---

### GET `/vendors/{vendor_id}/children`
* **Purpose:** Public retrieval of sub-teams nested under a parent vendor ID.
* **Authentication Required:** Public
* **Request Params:** `vendor_id` (UUID, path parameter)
* **Response Schema:** List of child sub-team objects.
* **Service Called:** `get_internal_teams_service`
* **Repository Called:** Query `Vendor`

---

### GET `/vendors/service/{service_id}`
* **Purpose:** Retrieves a single price line-item detail from the catalog.
* **Authentication Required:** Public
* **Request Params:** `service_id` (UUID, path parameter)
* **Response Schema:** Service record details.
* **Service Called:** `get_single_service_service`
* **Repository Called:** Query `VendorService`

---

### PUT `/vendors/service/{service_id}/rename`
* **Purpose:** Renames a specific service line item.
* **Authentication Required:** Bearer JWT (Vendor owner)
* **Request Params:**
  * `service_id` (UUID, path parameter)
  * `name` (string, query parameter)
* **Response Schema:** `{ "success": bool }`
* **Service Called:** `rename_service_service`
* **Repository Called:** Query and update `VendorService`

---

### DELETE `/vendors/service/{service_id}`
* **Purpose:** Removes a service line item from the catalog.
* **Authentication Required:** Bearer JWT (Vendor owner)
* **Request Params:** `service_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "message": str }`
* **Service Called:** `delete_service_service`
* **Repository Called:** Delete `VendorService`

---

### GET `/vendors/profile/views`
* **Purpose:** Returns profile view history statistics for the active vendor.
* **Authentication Required:** Bearer JWT (Vendor role)
* **Response Schema:** `{ "success": bool, "views": list }`
* **Service Called:** `get_profile_views_service`

---

### POST `/vendors/{vendor_id}/follow` | DELETE `/vendors/{vendor_id}/follow`
* **Purpose:** Adds or removes a vendor from the user's favorites listing.
* **Authentication Required:** Bearer JWT (User role)
* **Request Params:** `vendor_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "message": str }`
* **Service Called:** `follow_vendor_service` / `unfollow_vendor_service`
* **Repository Called:** Query and update `UserPreference` / `Vendor`

---

### POST `/vendors/{vendor_id}/save` | DELETE `/vendors/{vendor_id}/save`
* **Purpose:** Saves or unsaves a vendor bookmark for short-list consideration.
* **Authentication Required:** Bearer JWT (User role)
* **Request Params:** `vendor_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "message": str }`
* **Service Called:** `save_vendor_service` / `remove_saved_vendor_service`

---

### GET `/vendors/saved`
* **Purpose:** Returns the active user's saved/bookmarked vendors.
* **Authentication Required:** Bearer JWT (User role)
* **Response Schema:** List of saved vendors.
* **Service Called:** `get_saved_vendors_service`
* **Repository Called:** Query `UserPreference`

---

### POST `/vendors/{vendor_id}/view`
* **Purpose:** Increments the profile views counter for a vendor.
* **Authentication Required:** Bearer JWT (User role)
* **Request Params:** `vendor_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool }`
* **Service Called:** `track_vendor_view_service`

---

### GET `/vendors/profile/analytics`
* **Purpose:** Analytics dashboard data (views, follower metrics, engagement scores).
* **Authentication Required:** Bearer JWT (Vendor role)
* **Response Schema:** `{ "success": bool, "analytics": object }`
* **Service Called:** `get_profile_analytics_service`

---

### GET `/vendors/profile/pricing`
* **Purpose:** Detailed pricing statistics for the vendor's service catalog.
* **Authentication Required:** Bearer JWT (Vendor role)
* **Response Schema:** `{ "success": bool, "pricing": object }`
* **Service Called:** `get_profile_pricing_service`

---

### GET `/vendors/notifications`
* **Purpose:** Retrieves notifications for the vendor (e.g. follows, reviews).
* **Authentication Required:** Bearer JWT (Vendor role)
* **Response Schema:** `{ "success": bool, "notifications": list }`
* **Service Called:** `get_notifications_service`

---

### PUT `/vendors/notifications/{notification_id}`
* **Purpose:** Marks a notification as read.
* **Authentication Required:** Bearer JWT (Vendor role)
* **Request Params:** `notification_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool }`
* **Service Called:** `mark_notification_read_service`

---

### GET `/vendors/search`
* **Purpose:** Search endpoint with filtering and pagination.
* **Authentication Required:** Public
* **Request Params (Query parameters):**
  * `query` (string, optional): Text keyword.
  * `city` (string, optional)
  * `category` (string, optional)
  * `min_price` (integer, optional)
  * `max_price` (integer, optional)
  * `rating` (float, optional)
  * `min_reviews` (integer, optional)
  * `available` (boolean, optional)
  * `verified` (boolean, optional)
  * `sort_by` (string, optional): Options: `"rating"`, `"price_asc"`, `"price_desc"`, `"popularity"`.
  * `page` (integer, default: `1`)
  * `limit` (integer, default: `10`)
* **Response Schema (`VendorListResponse`):**
  * `success` (boolean)
  * `page` (integer)
  * `limit` (integer)
  * `total_results` (integer)
  * `vendors` (list): Array of matching `VendorResponse` objects.
* **Service Called:** `search_vendors_service`
* **Repository Called:** Query `Vendor`
* **Example Request:** `GET /vendors/search?city=Mumbai&category=Photography&max_price=30000&sort_by=rating`
* **Example Response:**
  ```json
  {
    "success": true,
    "page": 1,
    "limit": 10,
    "total_results": 1,
    "vendors": [
      {
        "vendor_id": "a1b2c3d4-e5f6-7a8b-9c0d-1e2f3a4b5c6d",
        "name": "Candid Moments Photography",
        "city": "Mumbai",
        "avg_rating": 4.8,
        "review_count": 140,
        "price_min": 15000,
        "price_max": 28000,
        "is_available": true,
        "is_verified": true
      }
    ]
  }
  ```

---

### GET `/vendors/recommendations`
* **Purpose:** Returns candidate vendors matching user preferences.
* **Authentication Required:** Bearer JWT (User role)
* **Response Schema:** `{ "success": bool, "recommendations": list }`
* **Service Called:** `get_recommendations_service`
* **Repository Called:** Query `UserPreference` and `Vendor`

---

### GET `/vendors/preferences/me`
* **Purpose:** Retrieves the active user's search preferences (category, price range, city).
* **Authentication Required:** Bearer JWT (User role)
* **Response Schema:** `{ "success": bool, "preferences": object }`
* **Service Called:** `get_my_preferences_service`
* **Repository Called:** Query `UserPreference`

---

### PUT `/vendors/preferences/me`
* **Purpose:** Updates the active user's search preferences.
* **Authentication Required:** Bearer JWT (User role)
* **Request Params (Query parameters):**
  * `category` (string, optional)
  * `city` (string, optional)
  * `event_type` (string, optional)
  * `price_range` (string, optional)
  * `min_rating` (float, optional)
  * `vendor_id` (UUID, optional): Favorite vendor bookmark.
* **Response Schema:** `{ "success": bool, "message": str }`
* **Service Called:** `update_my_preferences_service`
* **Repository Called:** Query and update `UserPreference`

---

### GET `/vendors/categories`
* **Purpose:** Returns a list of categories (shortcut helper matching `/categories`).
* **Authentication Required:** Public
* **Response Schema:** List of categories.
* **Service Called:** `get_all_categories_service`

---

### GET `/vendors/suggestions`
* **Purpose:** Returns query auto-suggestions based on trending vendor categories and cities.
* **Authentication Required:** Bearer JWT (User role)
* **Response Schema:** `{ "success": bool, "suggestions": list[str] }`
* **Service Called:** `get_suggestions_service`

---

### GET `/vendors/{vendor_id}`
* **Purpose:** Retrieves a single vendor profile by ID.
* **Authentication Required:** Public
* **Request Params:** `vendor_id` (UUID, path parameter)
* **Response Schema (`VendorDetailResponse`)**
* **Service Called:** `get_single_vendor_service`
* **Repository Called:** Query `Vendor` (using `joinedload` on sub-teams and services)
* **Example Response:** See GET `/vendors/profile` response structure.

---

### GET `/vendors/`
* **Purpose:** Lists all registered vendors (system-wide raw listing).
* **Authentication Required:** Public
* **Response Schema:** `{ "success": bool, "vendors": list }`
* **Service Called:** `get_all_vendors_service`
* **Repository Called:** Query `Vendor`

---

### DELETE `/vendors/{vendor_id}`
* **Purpose:** Soft-deactivates a vendor profile (`is_active` set to `false`).
* **Authentication Required:** Bearer JWT (Vendor owner or Admin role)
* **Request Params:** `vendor_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "message": str }`
* **Service Called:** `deactivate_vendor_service`
* **Repository Called:** Update `Vendor`

---

### POST `/vendors/import`
* **Purpose:** Bulk imports vendor profile listings (JSON payload).
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Schema (`VendorImportRequest`):**
  * `vendors` (list of `VendorImportItem`, required): List of profiles to ingest:
    * `name` (string, required): 2-255 characters.
    * `business_email` (string/EmailStr, required)
    * `contact_phone` (string, required): 10 digits.
    * `city` (string, optional)
    * `address` (string, optional)
    * `description` (string, optional)
    * `category` (string, optional)
    * `price_min` (integer, optional)
    * `price_max` (integer, optional)
    * `is_available` (boolean, default: `true`)
    * `is_verified` (boolean, default: `false`)
    * `avg_rating` (float, default: `0.0`): 0.0 - 5.0
    * `review_count` (integer, default: `0`)
* **Response Schema (`VendorImportResponse`):**
  * `success` (boolean)
  * `total` (integer): Total processed.
  * `imported` (integer): Successfully created.
  * `failed` (integer): Total failed records.
  * `errors` (list of strings): Array of validation failure reasons.
* **Service Called:** `import_vendors_service`
* **Repository Called:** `bulk_create_vendors`
* **Example Request:**
  ```json
  {
    "vendors": [
      {
        "name": "Elite DJs",
        "business_email": "dj@elite.com",
        "contact_phone": "9998887770",
        "city": "Mumbai",
        "category": "Live Music & DJ",
        "price_min": 10000,
        "price_max": 20000
      }
    ]
  }
  ```
* **Example Response:**
  ```json
  {
    "success": true,
    "total": 1,
    "imported": 1,
    "failed": 0,
    "errors": []
  }
  ```

---

### POST `/vendors/import-file`
* **Purpose:** Bulk imports vendor listings by uploading a CSV or Excel spreadsheet file.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Payload:** `multipart/form-data` with `file` key (UploadFile)
* **Response Schema (`VendorImportResponse`)**
* **Service Called:** Parses file stream and invokes `import_vendors_service`
* **Repository Called:** `bulk_create_vendors`

---

### PATCH `/vendors/{vendor_id}/verify`
* **Purpose:** Verification status toggle.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `vendor_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "message": str }`
* **Service Called:** `toggle_verify_vendor_service`
* **Repository Called:** Update `Vendor`

---

### PATCH `/vendors/{vendor_id}/reject`
* **Purpose:** Flags a vendor profile as rejected (`is_rejected` set to `true`).
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `vendor_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "message": str }`
* **Service Called:** `reject_vendor_service`
* **Repository Called:** Update `Vendor`

---

### PATCH `/vendors/{vendor_id}/restore`
* **Purpose:** Restores a deactivated/rejected vendor profile back to active status.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `vendor_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "message": str }`
* **Service Called:** `restore_vendor_service`
* **Repository Called:** Update `Vendor`

---

### GET `/vendors/admin/stats`
* **Purpose:** Administrative analytics overview.
* **Authentication Required:** Bearer JWT (Admin role)
* **Response Schema:** `{ "success": bool, "stats": object }`
* **Service Called:** `get_admin_stats_service`

---

## 8. AI Agent Administration (`/admin/agents`)

Endpoints for prompt templates, version rollback controls, and active agent configurations.

### GET `/admin/agents`
* **Purpose:** Lists all registered agent nodes in the supervisor pool.
* **Authentication Required:** Bearer JWT (Admin role)
* **Response Schema:** `{ "success": bool, "agents": list[AgentResponse] }`
* **Repository Called:** Direct query `db.query(AIAgent).all()`

---

### POST `/admin/agents`
* **Purpose:** Adds a new reasoning agent definition.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Schema:**
  * `agent_name` (string, required)
  * `display_name` (string, required)
  * `description` (string, optional)
* **Response Schema:** `{ "success": bool, "agent": AgentResponse }`
* **Repository Called:** Direct insert `db.add(AIAgent)`

---

### GET `/admin/agents/{agent_id}`
* **Purpose:** Retrieves details for a specific reasoning agent.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `agent_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "agent": AgentResponse }`

---

### PATCH `/admin/agents/{agent_id}/status`
* **Purpose:** Toggles active/inactive status of an agent.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `agent_id` (UUID, path parameter)
* **Request Schema:** `{ "status": "active" | "inactive" | true | false }`
* **Response Schema:** `{ "success": bool, "message": str }`
* **Repository Called:** `db.add(AgentAuditLog)`, Update `AIAgent`

---

### GET `/admin/agents/{agent_id}/prompt`
* **Purpose:** Retrieves the current active system prompt instructions for an agent.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `agent_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "prompt": PromptResponse }`
* **Repository Called:** Query `AgentPrompt`

---

### PUT `/admin/agents/{agent_id}/prompt`
* **Purpose:** Updates active prompt parameters and logs a version increment.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `agent_id` (UUID, path parameter)
* **Request Schema (`PromptUpdateRequest`):**
  * `base_prompt` (string, optional)
  * `role_instructions` (string, optional)
  * `behavior_guidelines` (string, optional)
  * `formatting_rules` (string, optional)
  * `business_rules` (string, optional)
  * `change_notes` (string, required): Change audit notes.
* **Response Schema:** `{ "success": bool, "message": str }`
* **Service Called:** `PromptService.clear_cache`, `PromptLoader.invalidate_all`
* **Repository Called:** Query `AgentPrompt`, `db.add(PromptVersion)`, `db.add(AgentAuditLog)`
* **Example Request:**
  ```json
  {
    "base_prompt": "You are a professional venue expert agent.",
    "role_instructions": "Focus heavily on guest capacities.",
    "change_notes": "Updated venue agent instructions to prioritize capacity bounds."
  }
  ```

---

### GET `/admin/agents/{agent_id}/config`
* **Purpose:** Retrieves active runtime parameters (e.g. LLM temperature, fallback provider) for an agent.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `agent_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "configuration": dict }`
* **Service Called:** `AgentConfigurationService.get_configuration`

---

### PUT `/admin/agents/{agent_id}/config`
* **Purpose:** Overwrites agent configurations (e.g. toggles provider to Groq or Gemini).
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `agent_id` (UUID, path parameter)
* **Request Schema (`AgentConfigurationUpdate`):**
  * `configuration` (object/dict, required): JSON configuration settings.
* **Response Schema:** `{ "success": bool, "message": str, "configuration": dict }`
* **Service Called:** `AgentConfigurationService.update_configuration`
* **Repository Called:** Query `AgentConfiguration`, `db.add(AgentAuditLog)`

---

### GET `/admin/agents/{agent_id}/versions`
* **Purpose:** Lists version logs for the system prompts.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `agent_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "versions": list[PromptVersionResponse] }`
* **Repository Called:** Query `PromptVersion`

---

### POST `/admin/agents/{agent_id}/rollback/{version_id}`
* **Purpose:** Rolls back the active agent prompt to a previous version number.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:**
  * `agent_id` (UUID, path parameter)
  * `version_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "message": "Rollback completed" }`
* **Service Called:** `PromptService.clear_cache`, `PromptLoader.invalidate_all`
* **Repository Called:** Query `PromptVersion`, Query `AgentPrompt`, `db.add(AgentAuditLog)`

---

### GET `/admin/agents/{agent_id}/audit-logs`
* **Purpose:** Lists administrative actions taken on the agent.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `agent_id` (UUID, path parameter)
* **Response Schema:** `{ "success": bool, "logs": list }`
* **Repository Called:** Query `AgentAuditLog`

---

### POST `/admin/agents/test`
* **Purpose:** Run a sandboxed LLM prompt test using combined instructions (ignores state graph).
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Schema:**
  * `agent_id` (UUID, required)
  * `test_query` (string, required)
* **Response Schema:**
  * `success` (boolean)
  * `agent_name` (string)
  * `test_query` (string)
  * `response` (string): Sandbox output.
* **Service Called:** `AIService.execute_prompt`

---

### POST `/admin/agents/test-workflow`
* **Purpose:** Runs a dry-run test of the full LangGraph state machine.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Schema:**
  * `test_query` (string, required)
* **Response Schema:** Complete workflow trace (intents, parsed filters, vendor matches count, path execution history).
* **Service Called:** `GraphService.process`

---

## 9. Vendor Quality Audit & Cleanup (`/admin/vendor-cleanup`)

Endpoints scanning registered vendor listings for price discrepancies, duplicate records, and invalid phone numbers/emails.

### GET `/admin/vendor-cleanup/dashboard`
* **Purpose:** Retrieves high-level statistics of quality audit issues (totals, reviewed, fixed).
* **Authentication Required:** Bearer JWT (Admin role)
* **Response Schema:**
  * `success` (boolean)
  * `data` (object): Dashboard aggregation totals.
* **Service Called:** `VendorCleanupService.get_dashboard_stats`
* **Example Response:**
  ```json
  {
    "success": true,
    "data": {
      "total_reports": 14,
      "total_issues_detected": 42,
      "issues_pending": 12,
      "issues_fixed": 30
    }
  }
  ```

---

### POST `/admin/vendor-cleanup/run`
* **Purpose:** Triggers a background transactional database quality audit.
* **Authentication Required:** Bearer JWT (Admin role)
* **Response Schema:**
  * `success` (boolean)
  * `run_id` (string): Generated report UUID.
  * `stats` (object): Count of anomalies matched.
* **Service Called:** `VendorCleanupService.run_analysis`
* **Repository Called:** `db.add(VendorCleanupReport / Log)`
* **Example Response:**
  ```json
  {
    "success": true,
    "run_id": "c8aa404f-90e9-445e-8848-f0df034f599a",
    "stats": {
      "duplicates": 2,
      "invalid_emails": 1,
      "price_inconsistencies": 0
    }
  }
  ```

---

### GET `/admin/vendor-cleanup/reports`
* **Purpose:** Lists historical execution reports of quality audits.
* **Authentication Required:** Bearer JWT (Admin role)
* **Response Schema:** `{ "success": bool, "reports": list }`
* **Service Called:** `VendorCleanupService.get_reports`

---

### DELETE `/admin/vendor-cleanup/reports/{run_id}`
* **Purpose:** Deletes a historical quality audit report and its linked detail logs.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `run_id` (string, path parameter)
* **Response Schema:** `{ "success": bool, "message": str }`
* **Repository Called:** Delete operations on `VendorCleanupReport` and `VendorCleanupLog`

---

### GET `/admin/vendor-cleanup/logs`
* **Purpose:** Returns flagged quality audit logs across all runs.
* **Authentication Required:** Bearer JWT (Admin role)
* **Response Schema:** `{ "success": bool, "logs": list }`
* **Service Called:** `VendorCleanupService.get_all_logs`

---

### GET `/admin/vendor-cleanup/logs/{run_id}`
* **Purpose:** Returns flagged quality logs for a specific run ID.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `run_id` (string, path parameter)
* **Response Schema:** `{ "success": bool, "logs": list }`
* **Service Called:** `VendorCleanupService.get_logs_for_run`

---

### PATCH `/admin/vendor-cleanup/logs/{log_id}/status`
* **Purpose:** Updates the workflow state of a flagged quality issue.
* **Authentication Required:** Bearer JWT (Admin role)
* **Request Params:** `log_id` (string, path parameter)
* **Request Schema:**
  * `status` (string, required): Options: `"pending"`, `"reviewed"`, `"resolved"`, `"ignored"`.
* **Response Schema:** `{ "success": bool, "log_id": str, "status": str, "message": str }`
* **Repository Called:** Update `VendorCleanupLog`

---

## 10. Vendor Ingestion & Synchronization (`/admin/vendor-sync`)

Manage periodic scheduler sync tasks importing records from external endpoints.

### GET `/admin/vendor-sync/dashboard`
* **Purpose:** Ingestion sync dashboard stats (success count, fails, averages).
* **Authentication Required:** Bearer JWT (Admin role)
* **Response Schema:** `{ "success": bool, "data": dict }`
* **Service Called:** `VendorSyncService.get_dashboard_stats`

---

### POST `/admin/vendor-sync/run`
* **Purpose:** Forces an immediate background ingestion sync run.
* **Authentication Required:** Bearer JWT (Admin role)
* **Response Schema:**
  * `success` (boolean): `true`
  * `run_id` (string)
  * `total` (integer)
  * `success_count` (integer)
  * `failed_count` (integer)
* **Service Called:** `VendorSyncService.run_sync`
* **Repository Called:** `db.add(SyncJobRun / Log)`

---

### GET `/admin/vendor-sync/runs`
* **Purpose:** Lists historical execution logs of ingestion sync jobs.
* **Authentication Required:** Bearer JWT (Admin role)
* **Response Schema:** `{ "success": bool, "runs": list }`
* **Service Called:** `VendorSyncService.get_runs`

---

### GET `/admin/vendor-sync/logs`
* **Purpose:** Lists detailed vendor-by-vendor errors or warnings encountered during sync jobs.
* **Authentication Required:** Bearer JWT (Admin role)
* **Response Schema:** `{ "success": bool, "logs": list }`
* **Service Called:** `VendorSyncService.get_logs`

---

## 11. LangGraph Pipeline Execution (`/reasoning`)

### POST `/reasoning/test`
* **Purpose:** Executes the LangGraph agent state graph synchronously and returns complete tracing metrics for debugging queries.
* **Authentication Required:** Bearer JWT (User role)
* **Request Params (Query parameters):**
  * `query` (string, required): Input query.
* **Response Schema:**
  * `success` (boolean)
  * `intent` (string): Extracted intent.
  * `current_agent` (string)
  * `workflow_trace` (list): Array of nodes executed.
  * `vendors_found` (integer): Candidates matched.
  * `ranked_vendors` (integer): Ranked results.
  * `ai_response` (string): Resulting text message.
  * `errors` (list): Any exceptions encountered.
* **Service Called:** `reasoning_graph.ainvoke`
* **Repository Called:** Downstream invocation of all repository layers
* **Example Request:** `POST /reasoning/test?query=Find%20decorators%20in%20Delhi`
* **Example Response:**
  ```json
  {
    "success": true,
    "intent": "discover",
    "current_agent": "response",
    "workflow_trace": [
      "supervisor",
      "context",
      "query_analysis",
      "tool_calling",
      "discovery",
      "ranking",
      "response"
    ],
    "vendors_found": 3,
    "ranked_vendors": 3,
    "ai_response": "I have found 3 decorators in Delhi matching your criteria...",
    "errors": []
  }
  ```

---

## 12. Standard Error Response Payloads

The backend uses standard HTTP exception structures.

### 400 Bad Request
Occurs when input validation constraints fail (e.g. empty strings, email format checks, out-of-order prices).
```json
{
  "detail": [
    {
      "loc": ["body", "confirm_password"],
      "msg": "Passwords do not match",
      "type": "value_error"
    }
  ]
}
```

### 401 Unauthorized
Occurs when credentials or JWT bearer tokens are missing, expired, or invalid.
```json
{
  "detail": "Could not validate credentials"
}
```

### 403 Forbidden
Occurs when a user attempts to access an endpoint outside their role permissions (e.g. a standard user calling `/admin/agents`).
```json
{
  "detail": "Role admin is required to access this resource"
}
```

### 404 Not Found
Occurs when requesting a resource (session, vendor, category) that does not exist.
```json
{
  "detail": "Session not found"
}
```

### 500 Internal Server Error
Occurs when downstream LLMs, third-party APIs, or database connections fail.
```json
{
  "detail": "Unable to process chat request"
}
```
