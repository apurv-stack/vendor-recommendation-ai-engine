import logging

from fastapi import (
    Request,
    HTTPException,
    status
)

from fastapi.responses import (
    JSONResponse
)

from fastapi.exceptions import (
    RequestValidationError
)

from sqlalchemy.exc import (
    SQLAlchemyError,
    IntegrityError
)

from jose import JWTError

from app.core.response import (
    error_response
)


# =====================================
# LOGGER
# =====================================

logger = logging.getLogger(

    __name__

)


# =====================================
# VALIDATION
# =====================================

async def validation_exception_handler(

    request: Request,

    exc: RequestValidationError

) -> JSONResponse:

    errors = []

    for error in exc.errors():

        errors.append({

            "field":

            ".".join(

                map(

                    str,

                    error["loc"]

                )

            ),

            "message":

            error["msg"]

        })

    logger.warning(

        f"Validation failed: {errors}"

    )

    return JSONResponse(

        status_code=

        status.HTTP_422_UNPROCESSABLE_ENTITY,

        content=

        error_response(

            message=

            "Validation failed",

            code=

            "VALIDATION_ERROR",

            details=

            errors

        )

    )


# =====================================
# HTTP EXCEPTION
# =====================================

async def http_exception_handler(

    request: Request,

    exc: HTTPException

) -> JSONResponse:

    logger.warning(

        f"HTTP exception: {exc.detail}"

    )

    return JSONResponse(

        status_code=

        exc.status_code,

        content=

        error_response(

            message=

            str(exc.detail),

            code=

            "HTTP_EXCEPTION"

        )

    )


# =====================================
# AUTH TOKEN
# =====================================

async def jwt_exception_handler(

    request: Request,

    exc: JWTError

) -> JSONResponse:

    logger.warning(

        "JWT token invalid"

    )

    return JSONResponse(

        status_code=

        status.HTTP_401_UNAUTHORIZED,

        content=

        error_response(

            message=

            "Invalid or expired token",

            code=

            "AUTHENTICATION_FAILED"

        )

    )


# =====================================
# DATABASE
# =====================================

async def database_exception_handler(

    request: Request,

    exc: SQLAlchemyError

) -> JSONResponse:

    logger.exception(
        f"Request failed: {request.url.path}"
    )

    return JSONResponse(

        status_code=

        status.HTTP_500_INTERNAL_SERVER_ERROR,

        content=

        error_response(

            message=

            "Database operation failed",

            code=

            "DATABASE_ERROR"

        )

    )


# =====================================
# DATABASE DUPLICATE
# =====================================

async def integrity_exception_handler(

    request: Request,

    exc: IntegrityError

) -> JSONResponse:

    logger.exception(
        f"Request failed: {request.url.path}"
    )

    return JSONResponse(

        status_code=

        status.HTTP_409_CONFLICT,

        content=

        error_response(

            message=

            "Duplicate or conflicting data detected",

            code=

            "DATA_CONFLICT"

        )

    )


# =====================================
# INTERNAL SERVER
# =====================================

async def internal_exception_handler(

    request: Request,

    exc: Exception

) -> JSONResponse:

    logger.exception(
        f"Request failed: {request.url.path}"
    )

    return JSONResponse(

        status_code=

        status.HTTP_500_INTERNAL_SERVER_ERROR,

        content=

        error_response(

            message=(
                "Something went wrong while processing your request. "
                "Please try again."
            ),

            code=

            "INTERNAL_ERROR"

        )

    )