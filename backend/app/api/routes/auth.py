from fastapi import (
    APIRouter,
    Depends,
    Response,
    Request,
    HTTPException,
    status
)

from fastapi.security import (
    OAuth2PasswordRequestForm
)

from sqlalchemy.orm import Session

from jose import jwt, JWTError

from app.schemas.auth_schema import (
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    RegisterResponse
)

from app.services.auth_service import (
    login_user,
    register_user
)

from app.db.session import get_db

from app.api.dependencies.auth_dependency import (
    get_current_user,
    require_role
)

from app.models.user import User

from app.core.config import settings

from app.core.security import (
    create_access_token
)


router = APIRouter(
    prefix="/auth",
    tags=["Authentication"]
)


# -----------------------------
# REGISTER API
# -----------------------------

@router.post(
    "/register",
    response_model=RegisterResponse
)
def register(
    request: RegisterRequest,
    db: Session = Depends(get_db)
):

    return register_user(

        username=request.username,

        full_name=request.full_name,

        email=request.email,

        business_email=request.business_email,

        phone_number=request.phone_number,

        role=request.role,

        password=request.password,

        confirm_password=request.confirm_password,

        db=db
    )


# -----------------------------
# CHECK USERNAME AVAILABILITY
# -----------------------------

@router.get("/check-username/{username}")
def check_username(
    username: str,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.username.ilike(username)
    ).first()

    return {

        "available": existing_user is None,

        "message":

            "Username available"

            if existing_user is None

            else "Username already taken"
    }


# -----------------------------
# CHECK EMAIL AVAILABILITY
# -----------------------------

@router.get("/check-email/{email}")
def check_email(
    email: str,
    db: Session = Depends(get_db)
):

    existing_user = db.query(User).filter(
        User.email.ilike(email)
    ).first()

    return {

        "available": existing_user is None,

        "message":

            "Email available"

            if existing_user is None

            else "Email already registered"
    }


# -----------------------------
# FRONTEND LOGIN API
# -----------------------------

@router.post("/login")
def login(
    request: LoginRequest,
    response: Response,
    db: Session = Depends(get_db)
):

    login_response = login_user(

        identifier=request.identifier,

        password=request.password,

        db=db
    )

    # --------------------------------
    # STORE REFRESH TOKEN COOKIE
    # --------------------------------

    response.set_cookie(

        key="refresh_token",

        value=login_response["refresh_token"],

        httponly=True,

        secure=False,

        samesite="lax",

        path="/",

        max_age=60 * 60 * 24 * 7
    )

    # --------------------------------
    # REMOVE REFRESH TOKEN
    # FROM RESPONSE BODY
    # --------------------------------

    del login_response["refresh_token"]

    return login_response


# -----------------------------
# REFRESH ACCESS TOKEN
# -----------------------------

@router.post("/refresh")
def refresh_access_token(
    request: Request
):

    refresh_token = request.cookies.get(
        "refresh_token"
    )

    if not refresh_token:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Refresh token missing"
        )

    try:

        payload = jwt.decode(

            refresh_token,

            settings.SECRET_KEY,

            algorithms=[settings.ALGORITHM]
        )

        # --------------------------------
        # VALIDATE TOKEN TYPE
        # --------------------------------

        if payload.get("type") != "refresh":

            raise HTTPException(

                status_code=status.HTTP_401_UNAUTHORIZED,

                detail="Invalid refresh token"
            )

        # --------------------------------
        # CREATE NEW ACCESS TOKEN
        # --------------------------------

        access_token = create_access_token(

            data={

                "sub": payload.get("sub"),

                "user_id": payload.get("user_id"),

                "role": payload.get("role")
            }
        )

        return {

            "success": True,

            "access_token": access_token,

            "token_type": "bearer"
        }

    except JWTError:

        raise HTTPException(

            status_code=status.HTTP_401_UNAUTHORIZED,

            detail="Invalid or expired refresh token"
        )


# -----------------------------
# LOGOUT
# -----------------------------

@router.post("/logout")
def logout(
    response: Response
):

    response.delete_cookie(

        key="refresh_token",

        path="/"
    )

    return {

        "success": True,

        "message": "Logged out successfully"
    }


# -----------------------------
# SWAGGER LOGIN
# -----------------------------

@router.post(
    "/token",
    response_model=LoginResponse
)
def login_for_swagger(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):

    return login_user(

        identifier=form_data.username,

        password=form_data.password,

        db=db
    )


# -----------------------------
# CURRENT USER
# -----------------------------

@router.get("/me")
def get_logged_in_user(

    current_user: User = Depends(
        get_current_user
    )
):

    return {

        "success": True,

        "message": "Authenticated user fetched successfully",

        "user": {

            "user_id": str(current_user.user_id),

            "username": current_user.username,

            "full_name": current_user.full_name,

            "email": current_user.email,

            "phone_number": current_user.phone_number,

            "role": current_user.role
        }
    }


# -----------------------------
# ADMIN ONLY
# -----------------------------

@router.get("/admin-only")
def admin_only_route(

    current_user: User = Depends(
        require_role(["admin"])
    )
):

    return {

        "success": True,

        "message": "Welcome Admin",

        "user": {

            "email": current_user.email,

            "role": current_user.role
        }
    }


# -----------------------------
# VENDOR ONLY
# -----------------------------

@router.get("/vendor-only")
def vendor_only_route(

    current_user: User = Depends(
        require_role(["vendor"])
    )
):

    return {

        "success": True,

        "message": "Welcome Vendor",

        "user": {

            "email": current_user.email,

            "role": current_user.role
        }
    }


# -----------------------------
# USER ONLY
# -----------------------------

@router.get("/user-only")
def user_only_route(

    current_user: User = Depends(
        require_role(["user"])
    )
):

    return {

        "success": True,

        "message": "Welcome User",

        "user": {

            "email": current_user.email,

            "role": current_user.role
        }
    }