from fastapi import (
    FastAPI,
    HTTPException
)

from fastapi.middleware.cors import (
    CORSMiddleware
)

from fastapi.exceptions import (
    RequestValidationError
)

from sqlalchemy.exc import (
    SQLAlchemyError,
    IntegrityError
)

from app.db.base import Base

from app.db.session import engine


# =====================================
# ROUTES
# =====================================

from app.api.routes.auth import (
    router as auth_router
)

from app.api.routes.vendor import (
    router as vendor_router
)

from app.api.routes.category import (
    router as category_router
)

from app.api.routes.ai import (
    router as ai_router
)

from app.api.routes.chat import (
    router as chat_router
)

from app.api.routes.query import (
    router as query_router
)

from app.api.routes.session import router as session_router

from app.api.routes.reasoning_test import (
    router as reasoning_router
)

from app.api.routes.admin_agent_routes import router as admin_agent_router
from app.api.routes.vendor_cleanup_routes import router as vendor_cleanup_router
from app.api.routes.vendor_sync_routes import router as vendor_sync_router

# =====================================
# EXCEPTION HANDLERS
# =====================================

from app.core.exceptions import (

    validation_exception_handler,

    http_exception_handler,

    database_exception_handler,

    integrity_exception_handler,

    internal_exception_handler

)


# =====================================
# MIDDLEWARE
# =====================================

from app.core.request_logger import (

    RequestLoggingMiddleware

)


# =====================================
# IMPORT MODELS
# =====================================

from app.models.user import User

from app.models.category import Category

from app.models.vendor import Vendor

from app.models.review import Review

from app.models.search_history import (
    SearchHistory
)

from app.models.user_preference import (
    UserPreference
)

from app.models.viewed_vendor import (
    ViewedVendor
)

from app.models.conversation import (
    Conversation
)

from app.models.semantic_embedding import (
    SemanticEmbedding
)

from app.models.recommendation_metadata import (
    RecommendationMetadata
)

from app.models.pricing_model import (
    PricingModel
)

from app.models.vendor_media import (
    VendorMedia
)

from app.models.vendor_service import (
    VendorService
)

from app.models.vendor_cleanup_log import VendorCleanupLog
from app.models.vendor_cleanup_report import VendorCleanupReport
from app.services.scheduler_service import start_scheduler

# =====================================
# CREATE TABLES
# =====================================

Base.metadata.create_all(

    bind=engine

)

# =====================================
# STARTUP — OLLAMA WARMUP
# =====================================

from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # STARTUP — warm up Ollama in background
    async def _warm_up():
        try:
            import httpx
            from app.core.config import settings
            if settings.AI_PROVIDER.lower() != "ollama":
                return
            async with httpx.AsyncClient(timeout=120.0) as client:
                r = await client.post(
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
    start_scheduler()
    yield
    # SHUTDOWN — nothing needed

# =====================================
# APP
# =====================================

app = FastAPI(

    title="AI Vendor Discovery Agent API",

    version="1.0.0",

    lifespan=lifespan

)


# =====================================
# REQUEST LOGGING
# =====================================

app.add_middleware(

    RequestLoggingMiddleware

)


# =====================================
# CORS
# =====================================

origins = [

    "http://localhost:5173"

]

app.add_middleware(

    CORSMiddleware,

    allow_origins=origins,

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"]

)


# =====================================
# EXCEPTION HANDLERS
# =====================================

app.exception_handler(

    RequestValidationError

)(

    validation_exception_handler

)

app.exception_handler(

    HTTPException

)(

    http_exception_handler

)

app.exception_handler(

    SQLAlchemyError

)(

    database_exception_handler

)

app.exception_handler(

    IntegrityError

)(

    integrity_exception_handler

)

app.exception_handler(

    Exception

)(

    internal_exception_handler

)
# =====================================
# ROOT
# =====================================

@app.get("/")
def home():

    return {

        "success": True,

        "message":

        "AI Vendor Discovery Agent Backend Running",

        "data": {

            "service":

            "AI Vendor Discovery Agent API",

            "version":

            "1.0.0"

        },

        "error": None

    }


# =====================================
# HEALTH CHECK
# =====================================

@app.get("/health")
def health_check():

    return {

        "success": True,

        "message":

        "Backend healthy",

        "data": {

            "database":

            "connected"

        },

        "error": None

    }


# =====================================
# ROUTES
# =====================================

app.include_router(

    auth_router

)

# app.include_router(

#     category_router

# )

app.include_router(

    vendor_router

)

app.include_router(

    ai_router

)

app.include_router(

    chat_router

)

app.include_router(

    query_router

)

app.include_router(
    session_router
)

app.include_router(
    reasoning_router
)

app.include_router(
    admin_agent_router
)

app.include_router(
    vendor_cleanup_router
)

app.include_router(
    vendor_sync_router
)