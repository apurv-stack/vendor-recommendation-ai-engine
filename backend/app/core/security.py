from datetime import (
    datetime,
    timedelta,
    timezone
)

from typing import Optional

from jose import jwt

from passlib.context import CryptContext

from app.core.config import settings


pwd_context = CryptContext(
    schemes=["bcrypt"],
    deprecated="auto"
)


# -----------------------------
# PASSWORD HASHING
# -----------------------------

def hash_password(password: str) -> str:
    """
    Hash plain password before storing in database
    """

    return pwd_context.hash(password)


# -----------------------------
# PASSWORD VERIFICATION
# -----------------------------

def verify_password(
    plain_password: str,
    hashed_password: str
) -> bool:
    """
    Verify entered password against stored hash
    """

    return pwd_context.verify(
        plain_password,
        hashed_password
    )


# -----------------------------
# ACCESS TOKEN GENERATION
# -----------------------------

def create_access_token(
    data: dict,
    expires_delta: Optional[timedelta] = None
) -> str:

    to_encode = data.copy()

    expire = (
        datetime.now(timezone.utc)
        + (
            expires_delta
            or timedelta(
                minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
            )
        )
    )

    to_encode.update({

        "exp": expire,

        "type": "access"
    })

    encoded_jwt = jwt.encode(

        to_encode,

        settings.SECRET_KEY,

        algorithm=settings.ALGORITHM
    )

    return encoded_jwt


# -----------------------------
# REFRESH TOKEN GENERATION
# -----------------------------

def create_refresh_token(
    data: dict
) -> str:

    to_encode = data.copy()

    expire = (
        datetime.now(timezone.utc)
        + timedelta(
            days=settings.REFRESH_TOKEN_EXPIRE_DAYS
        )
    )

    to_encode.update({

        "exp": expire,

        "type": "refresh"
    })

    encoded_jwt = jwt.encode(

        to_encode,

        settings.SECRET_KEY,

        algorithm=settings.ALGORITHM
    )

    return encoded_jwt