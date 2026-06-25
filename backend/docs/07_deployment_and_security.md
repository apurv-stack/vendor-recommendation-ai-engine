# AI Vendor Discovery & Recommendation Engine: Deployment & Security Manual

This document details the deployment architecture, JWT-based security protocols, and operational procedures for the **AI Vendor Discovery Agent Backend**. It serves as an internship handover guide and system administrator manual.

---

## 1. Deployment Architecture

The platform uses a modular, cloud-native architecture that splits workloads between local private AI parsing and high-speed cloud response generation:

```
                          ┌───────────────────────┐
                          │   Vite Frontend UI    │
                          │   (Port 5173 / CDN)   │
                          └───────────┬───────────┘
                                      │ HTTP / JSON (CORS)
                                      ▼
                          ┌───────────────────────┐
                          │    FastAPI Server     │
                          │   (Port 8000 / WSGI)  │
                          └────┬─────────────┬────┘
                               │             │
               SQLAlchemy / PG │             │ REST / HTTP (Ollama / Groq)
                               ▼             ▼
                     ┌────────────────┐    ┌────────────────────────┐
                     │ PostgreSQL DB  │    │ Remote Response LLM    │
                     │  (Port 5432)   │    │ (Groq Cloud API)       │
                     └────────────────┘    └────────────────────────┘
                                             ▲
                                             │ HTTP / Local Link
                                           ┌─┴──────────────────────┐
                                           │ Local AI Inferences    │
                                           │ (Ollama Port 11434)    │
                                           └────────────────────────┘
```

### Component Breakdown
1. **Vite Frontend UI:** A static Single Page Application (SPA) compiled into static HTML/JS/CSS assets.
   * *Development:* Runs on port `5173`.
   * *Production:* Built via `npm run build` and served from an Nginx web server or CDN.
2. **FastAPI Application Server:** The primary API server built on FastAPI and executed via Uvicorn/Gunicorn.
   * *Development:* Runs on port `8000` via Uvicorn.
   * *Production:* Deployed inside Docker containers managed by Kubernetes or ECS, utilizing Gunicorn with Uvicorn workers for high concurrency. It handles routing, middleware log execution, background schedulers (APScheduler), and DB connection pooling.
3. **PostgreSQL Database:** The transactional data store (port `5432`) housing relational tables (users, vendors, category structures) and JSONB formats (conversation histories, preferences).
4. **Local AI Engine (Ollama):** A local service running on port `11434` hosting the `qwen2.5:7b` model. Used for parsing query intents, extracting parameter filters, and validating parameters locally to preserve privacy and reduce remote token costs.
5. **Remote Response Generator (Groq):** A remote API provider hosting `llama3-8b-8192`. Fast token generation is used to summarize search results and explain head-to-head comparisons in warm, conversational tones.

---

## 2. Security & Identity Architecture

### JWT Token Lifecycle
The platform enforces user authentication using a dual-token model to balance security and usability:

```
   [POST /auth/login] ──► Generates ──► 1. Access Token ──► JSON Body (15m expiry)
                                      └─► 2. Refresh Token ─► Secure HttpOnly Cookie (7d expiry)

   [API Request] ────────► Attaches ──► Headers: Authorization: Bearer <access_token>

   [Access Token Expires] ──► POST /auth/refresh ──► Server reads cookie ──► Issues new Access Token
```

1. **Access Token:**
   * *Lifespan:* 15 minutes.
   * *Delivery:* Returned directly in the JSON response body upon login.
   * *Storage:* Kept in client-side memory (non-persistent state variable). Never stored in LocalStorage to prevent Cross-Site Scripting (XSS) theft.
2. **Refresh Token:**
   * *Lifespan:* 7 days.
   * *Delivery:* Transmitted via a response header cookie.
   * *Storage:* Stored by the browser with `HttpOnly`, `Secure`, and `SameSite=Lax` parameters. This ensures JavaScript scripts cannot read the token, protecting it from malicious script extraction.

### Token Generation Claims
Tokens are signed via the `python-jose` library using `HS256` HMAC-SHA256 signatures. Claim details:
* **Access Claims:**
  ```json
  {
    "sub": "user@example.com",
    "role": "user",
    "type": "access",
    "exp": 1795904000
  }
  ```
* **Refresh Claims:**
  ```json
  {
    "sub": "user@example.com",
    "type": "refresh",
    "exp": 1796504000
  }
  ```

### Protected Routes & Dependency Injection
FastAPI route authorization is enforced using Dependency Injection.

1. **Active Context Parsing (`get_current_user`):**
   This function extracts the Bearer token from the `Authorization` header, decodes it using the server's `SECRET_KEY`, asserts that the `type` claim equals `"access"`, and verifies the user exists in the database.
   ```python
   # From app/api/dependencies/auth_dependency.py
   oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")

   def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
       credentials_exception = HTTPException(
           status_code=status.HTTP_401_UNAUTHORIZED,
           detail="Invalid or expired token",
           headers={"WWW-Authenticate": "Bearer"}
       )
       try:
           payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
           email = payload.get("sub")
           token_type = payload.get("type")
           if email is None or token_type != "access":
               raise credentials_exception
       except JWTError:
           raise credentials_exception
           
       user = db.query(User).filter(User.email == email).first()
       if user is None or not user.is_active:
           raise credentials_exception
           
       user.access_token = token # Inject token for downstream service calls
       return user
   ```

2. **Role Verification Closure (`require_role`):**
   Ensures the resolved user possesses the authorization scope needed for restricted administrative endpoints.
   ```python
   def require_role(allowed_roles: list[str]):
       def role_checker(current_user: User = Depends(get_current_user)):
           if current_user.role not in allowed_roles:
               raise HTTPException(
                   status_code=status.HTTP_403_FORBIDDEN,
                   detail="You do not have permission to perform this action"
               )
           return current_user
       return role_checker

   # Role Shortcuts
   admin_required = require_role(["admin"])
   vendor_required = require_role(["vendor"])
   ```

### CORS Security Policies
The server uses CORS middleware to prevent cross-origin scripting attacks. It restricts requests to the configured frontend host (e.g. `http://localhost:5173`) and explicitly requires `allow_credentials=True` to allow secure cookie exchanges during session refreshes.

---

## 3. Operational Variables & Configurations

Runtime variables are managed via Pydantic `BaseSettings`. The application loads configuration parameters from a `.env` file at startup:

| Environment Key | Python Type | Default Value | Purpose / Description |
| :--- | :--- | :--- | :--- |
| `DATABASE_URL` | `string` | *No Default (Required)* | SQLAlchemy connection string (e.g., `postgresql://postgres:root@localhost:5432/vendor_db`). |
| `SECRET_KEY` | `string` | *No Default (Required)* | High-entropy key used to sign HMAC JWT tokens. |
| `ALGORITHM` | `string` | `"HS256"` | JWT token hashing algorithm. |
| `ACCESS_TOKEN_EXPIRE_MINUTES`| `integer` | `15` | Expiry duration for client access headers. |
| `REFRESH_TOKEN_EXPIRE_DAYS` | `integer` | `7` | Cookie expiration limit. |
| `GROQ_API_KEY` | `string` | *No Default (Required)* | API key to access remote Groq response LLMs. |
| `OLLAMA_BASE_URL` | `string` | `"http://localhost:11434/v1"`| Base endpoint for the local Ollama daemon service. |
| `AI_PROVIDER` | `string` | `"ollama"` | Core NLP query parsing provider. |
| `AI_MODEL` | `string` | `"qwen2.5:7b"` | Selected local Ollama model identifier. |
| `AI_TIMEOUT` | `integer` | `45` | Model execution timeout limit in seconds. |
| `RESPONSE_AI_PROVIDER` | `string` | `"groq"` | Response generator provider. |
| `RESPONSE_AI_MODEL` | `string` | `"llama3-8b-8192"` | Fast remote LLM model identifier. |
| `API_BASE_URL` | `string` | `"http://localhost:8000"` | Absolute URL of the backend hosting environment. |

---

## 4. System Startup Sequence

At start, the application boots through the following sequence:

```
  1. Uvicorn Start ──► 2. Load settings ──► 3. Initialize Engine ──► 4. Lifespan Begin
                                                                            │
      ┌─────────────────────────────────────────────────────────────────────┘
      ▼
  5. Warm up Local AI ──► POST /api/generate (warm up 'qwen2.5:7b' in Ollama memory)
      │
      ▼
  6. In-Process Scheduler ──► Invoke start_scheduler() (APScheduler threads start)
      │
      ▼
  7. Database Schema Audit ──► Base.metadata.create_all() (Verify active tables)
      │
      ▼
  8. Listening ──► Accept API connections on Port 8000
```

1. **Lifespan Startup Warmup:**
   To prevent cold-start latency spikes when the first user enters a chat message, the application utilizes FastAPI's `lifespan` context manager. On startup, it launches an async background task to warm up the local Ollama model:
   ```python
   # Excerpt from app/main.py
   @asynccontextmanager
   async def lifespan(app: FastAPI):
       async def _warm_up():
           try:
               import httpx
               from app.core.config import settings
               if settings.AI_PROVIDER.lower() != "ollama":
                   return
               async with httpx.AsyncClient(timeout=120.0) as client:
                   await client.post(
                       "http://localhost:11434/api/generate",
                       json={
                           "model": settings.AI_MODEL,
                           "prompt": "hi",
                           "stream": False,
                           "keep_alive": "10m"
                       }
                   )
               print(f"✅ Ollama '{settings.AI_MODEL}' warmed up successfully")
           except Exception as e:
               print(f"⚠️ Ollama warmup failed (non-fatal): {e}")

       import asyncio
       asyncio.ensure_future(_warm_up())
       start_scheduler() # Initializes database cleanup and sync schedules
       yield
   ```

2. **Database Verification:**
   The backend runs `Base.metadata.create_all(bind=engine)` to verify database health and ensure tables exist. In production environments, database migrations are applied using Alembic commands:
   ```bash
   alembic upgrade head
   ```

---

## 5. Logging, Diagnostics, & Monitoring

### Logging Pipeline
* **Request Logging Middleware:** The server uses `RequestLoggingMiddleware` to intercept every incoming API call. It logs the HTTP method, path, response status code, and request duration in milliseconds.
* **Audit Logs:** Schema modifications, prompt changes, and system rollbacks write audit records to the `AgentAuditLog` database table. This helps track administrative operations without scraping log files.
* **Data Ingestion logs:** Sync runs write execution statistics (success ratios, failed items) to `SyncJobRun` and `SyncActivityLog` tables for easy debugging.

### Production Monitoring Recommendations
1. **Process Monitoring:**
   * Monitor Uvicorn processes using process managers like **PM2** or **Supervisord**.
   * Configure Docker container health checks to probe the `/health` endpoint:
     `curl -f http://localhost:8000/health || exit 1`
2. **AI Provider Latency Monitoring:**
   * **Ollama Monitoring:** Monitor CPU/GPU usage on the hosting machine. Local model execution times can increase significantly if the hardware is under heavy load.
   * **Groq Latency Tracing:** Trace external response times. If Groq responses take longer than 5 seconds, consider implementing a local llama fallback or setting alert notifications.
3. **Database Performance Audits:**
   * Monitor database connection pools. Adjust pool limits (e.g. `pool_size`, `max_overflow`) to prevent database exhaustion under heavy loads.
   * Review execution logs for long-running database queries. Add indexes for high-frequency queries (e.g., searches on `city` or composite keys in `user_preferences`).
