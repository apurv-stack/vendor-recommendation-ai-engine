import logging
import time

from starlette.middleware.base import (
    BaseHTTPMiddleware
)

from fastapi import (
    Request
)


# =====================================
# LOGGER
# =====================================

logger = logging.getLogger(

    __name__

)


# =====================================
# REQUEST LOGGING MIDDLEWARE
# =====================================

class RequestLoggingMiddleware(

    BaseHTTPMiddleware

):

    async def dispatch(

        self,

        request: Request,

        call_next

    ):

        start_time = time.time()

        method = request.method

        path = request.url.path

        client_ip = (

            request.client.host

            if request.client

            else "unknown"

        )

        try:

            response = await call_next(

                request

            )

            duration = round(

                (

                    time.time()

                    -

                    start_time

                )

                * 1000,

                2

            )

            logger.info(

                f"{method} "

                f"{path} "

                f"{response.status_code} "

                f"{duration}ms "

                f"{client_ip}"

            )

            return response

        except Exception:

            duration = round(

                (

                    time.time()

                    -

                    start_time

                )

                * 1000,

                2

            )

            logger.exception(

                f"{method} "

                f"{path} "

                f"FAILED "

                f"{duration}ms "

                f"{client_ip}"

            )

            raise