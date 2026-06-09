from jose import (
    JWTError,
    jwt
)

from fastapi import (
    Depends,
    HTTPException,
    status
)

from fastapi.security import (
    OAuth2PasswordBearer
)

from sqlalchemy.orm import (
    Session
)

from app.core.config import (
    settings
)

from app.db.session import (
    get_db
)

from app.models.user import (
    User
)


oauth2_scheme = OAuth2PasswordBearer(

    tokenUrl="/auth/token"

)


# =====================================
# CURRENT USER
# =====================================

def get_current_user(

    token: str = Depends(

        oauth2_scheme

    ),

    db: Session = Depends(

        get_db

    )

):

    credentials_exception = HTTPException(

        status_code=

        status.HTTP_401_UNAUTHORIZED,

        detail=

        "Invalid or expired token",

        headers={

            "WWW-Authenticate":

            "Bearer"

        }

    )

    try:

        payload = jwt.decode(

            token,

            settings.SECRET_KEY,

            algorithms=[

                settings.ALGORITHM

            ]

        )

        email = payload.get(

            "sub"

        )

        token_type = payload.get(

            "type"

        )

        if (

            email is None

            or

            token_type != "access"

        ):

            raise (

                credentials_exception

            )

    except JWTError:

        raise (

            credentials_exception

        )

    user = (

        db.query(User)

        .filter(

            User.email

            ==

            email

        )

        .first()

    )

    if user is None:

        raise (

            credentials_exception

        )

    if user.is_active is False:

        raise HTTPException(

            status_code=

            status.HTTP_403_FORBIDDEN,

            detail=

            "User account is inactive"

    )

    user.access_token = token

    return user


# =====================================
# ROLE ACCESS
# =====================================

def require_role(

    allowed_roles: list[str]

):

    def role_checker(

        current_user: User = Depends(

            get_current_user

        )

    ):

        if (

            current_user.role

            not in

            allowed_roles

        ):

            raise HTTPException(

                status_code=

                status.HTTP_403_FORBIDDEN,

                detail=(

                    "You do not have permission "

                    "to perform this action"

                )

            )

        return current_user

    return role_checker


# =====================================
# ROLE SHORTCUTS
# =====================================

admin_required = require_role(

    ["admin"]

)

vendor_required = require_role(

    ["vendor"]

)

user_required = require_role(

    [

        "admin",

        "vendor",

        "user"

    ]

)