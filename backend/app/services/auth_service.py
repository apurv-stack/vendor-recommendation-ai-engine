from uuid import UUID

from fastapi import (
    HTTPException,
    status
)

from sqlalchemy.orm import Session
from sqlalchemy import or_

from app.models.user import User
from app.models.vendor import Vendor

from app.schemas.auth_schema import (
    RegisterResponse,
    UserResponse
)

from app.core.security import (
    verify_password,
    hash_password,
    create_access_token,
    create_refresh_token
)


# =====================================
# REGISTER USER
# =====================================

def register_user(

    username: str,
    full_name: str,
    email: str,
    business_email: str | None,
    phone_number: str | None,
    role: str,
    password: str,
    confirm_password: str,
    db: Session

) -> RegisterResponse:

    existing_email = (

        db.query(User)

        .filter(

            User.email == email

        )

        .first()

    )

    if existing_email:

        raise HTTPException(

            status_code=400,

            detail="Email already registered"

        )

    existing_username = (

        db.query(User)

        .filter(

            User.username == username

        )

        .first()

    )

    if existing_username:

        raise HTTPException(

            status_code=400,

            detail="Username already taken"

        )

    if password != confirm_password:

        raise HTTPException(

            status_code=400,

            detail="Passwords do not match"

        )

    if role == "vendor":

        if not business_email:

            raise HTTPException(

                status_code=400,

                detail="Business email required"

            )

        if not phone_number:

            raise HTTPException(

                status_code=400,

                detail="Phone number required"

            )

        existing_business = (

            db.query(Vendor)

            .filter(

                Vendor.business_email

                ==

                business_email

            )

            .first()

        )

        if existing_business:

            raise HTTPException(

                status_code=400,

                detail="Business email already exists"

            )

    hashed_password = (

        hash_password(password)

    )

    new_user = User(

        username=username,

        full_name=full_name,

        email=email,

        role=role,

        phone_number=phone_number,

        password_hash=hashed_password

    )

    db.add(new_user)

    db.commit()

    db.refresh(new_user)

    # ===============================
    # AUTO CREATE VENDOR
    # ===============================

    if role == "vendor":

        vendor = Vendor(

            user_id=UUID(
                str(
                    new_user.user_id
                )
            ),

            parent_vendor_id=None,

            name=full_name,

            slug=None,

            description="",

            category_id=None,

            city=None,

            address="",

            business_email=business_email,

            contact_phone=phone_number,

            price_min=None,

            price_max=None,

            is_available=True,

            is_active=True

        )

        db.add(vendor)

        db.commit()

        db.refresh(vendor)

    return RegisterResponse(

        success=True,

        message="User registered successfully",

        user=UserResponse(

            user_id=UUID(
                str(
                    new_user.user_id
                )
            ),

            username=str(
                new_user.username
            ),

            full_name=str(
                new_user.full_name
            ),

            email=str(
                new_user.email
            ),

            role=str(
                new_user.role
            ),

            phone_number=(

                str(
                    new_user.phone_number
                )

                if

                new_user.phone_number is not None

                else

                None

            )

        )

    )


# =====================================
# LOGIN USER
# =====================================

def login_user(

    identifier: str,

    password: str,

    db: Session

):

    user = (

        db.query(User)

        .filter(

            or_(

                User.email == identifier,

                User.username == identifier

            )

        )

        .first()

    )

    if not user:

        raise HTTPException(

            status_code=404,

            detail="User does not exist"

        )

    password_valid = (

        verify_password(

            password,

            str(

                user.password_hash

            )

        )

    )

    if not password_valid:

        raise HTTPException(

            status_code=401,

            detail="Invalid credentials"

        )

    if not bool(user.is_active):

        raise HTTPException(

            status_code=403,

            detail="Account inactive"

        )

    access_token = (

        create_access_token(

            {

                "sub":

                str(user.email),

                "user_id":

                str(user.user_id),

                "role":

                str(user.role)

            }

        )

    )

    refresh_token = (

        create_refresh_token(

            {

                "sub":

                str(user.email),

                "user_id":

                str(user.user_id),

                "role":

                str(user.role)

            }

        )

    )

    return {

        "success": True,

        "message": "Login successful",

        "access_token": access_token,

        "refresh_token": refresh_token,

        "token_type": "bearer",

        "user": {

            "user_id":

            str(user.user_id),

            "username":

            str(user.username),

            "full_name":

            str(user.full_name),

            "email":

            str(user.email),

            "role":

            str(user.role),

            "phone_number":

            (

                str(

                    user.phone_number

                )

                if

                user.phone_number is not None

                else

                None

            )

        }

    }