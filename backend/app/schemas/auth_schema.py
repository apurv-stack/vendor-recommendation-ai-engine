from uuid import UUID

from pydantic import (
    BaseModel,
    EmailStr,
    Field,
    field_validator,
    model_validator
)

import re


# =============================
# LOGIN REQUEST
# =============================

class LoginRequest(BaseModel):

    identifier: str = Field(
        min_length=3,
        max_length=100
    )

    password: str = Field(
        min_length=8,
        max_length=100
    )

    @field_validator("identifier")
    @classmethod
    def validate_identifier(
        cls,
        value: str
    ):

        value = value.strip()

        if not value:

            raise ValueError(
                "Email or username is required"
            )

        return value


# =============================
# REGISTER REQUEST
# =============================

class RegisterRequest(BaseModel):

    username: str = Field(
        min_length=3,
        max_length=30
    )

    full_name: str = Field(
        min_length=2,
        max_length=100
    )

    email: EmailStr

    business_email: EmailStr | None = None

    phone_number: str | None = None

    role: str = "user"

    password: str = Field(
        min_length=8,
        max_length=100
    )

    confirm_password: str


    # =============================
    # USERNAME
    # =============================

    @field_validator("username")
    @classmethod
    def validate_username(

        cls,

        value: str

    ):

        value = value.strip()

        if not re.match(

            r"^[a-zA-Z0-9._-]+$",

            value

        ):

            raise ValueError(

                "Username can only contain letters, numbers, dots, hyphens and underscores"

            )

        if not re.search(

            r"[a-zA-Z0-9]",

            value

        ):

            raise ValueError(

                "Username must contain letters or numbers"

            )

        return value


    # =============================
    # FULL NAME
    # =============================

    @field_validator("full_name")
    @classmethod
    def validate_name(

        cls,

        value: str

    ):

        value = value.strip()

        if not re.match(

            r"^[A-Za-z ]+$",

            value

        ):

            raise ValueError(

                "Full name can contain only letters"

            )

        return value


    # =============================
    # PHONE
    # =============================

    @field_validator("phone_number")
    @classmethod
    def validate_phone(

        cls,

        value: str | None

    ):

        if value:

            value = value.strip()

            if not re.match(

                r"^[0-9]{10}$",

                value

            ):

                raise ValueError(

                    "Phone number must contain exactly 10 digits"

                )

        return value


    # =============================
    # ROLE
    # =============================

    @field_validator("role")
    @classmethod
    def validate_role(

        cls,

        value: str

    ):

        allowed_roles = [

            "user",

            "vendor"

        ]

        value = value.lower()

        if value not in allowed_roles:

            raise ValueError(

                "Invalid role selected"

            )

        return value


    # =============================
    # PASSWORD
    # =============================

    @field_validator("password")
    @classmethod
    def validate_password(

        cls,

        value: str

    ):

        if not re.search(

            r"[A-Z]",

            value

        ):

            raise ValueError(

                "Password must contain one uppercase letter"

            )

        if not re.search(

            r"[a-z]",

            value

        ):

            raise ValueError(

                "Password must contain one lowercase letter"

            )

        if not re.search(

            r"[0-9]",

            value

        ):

            raise ValueError(

                "Password must contain one number"

            )

        if not re.search(

            r"[!@#$%^&*(),.?\":{}|<>]",

            value

        ):

            raise ValueError(

                "Password must contain one special character"

            )

        return value


    # =============================
    # REGISTER CHECK
    # =============================

    @model_validator(
        mode="after"
    )
    def validate_register(

        self

    ):

        if (

            self.password

            !=

            self.confirm_password

        ):

            raise ValueError(

                "Passwords do not match"

            )

        if (

            self.role

            ==

            "vendor"

        ):

            if not self.business_email:

                raise ValueError(

                    "Business email is required for vendors"

                )

            if not self.phone_number:

                raise ValueError(

                    "Phone number is required for vendors"

                )

        return self


# =============================
# USER RESPONSE
# =============================

class UserResponse(

    BaseModel

):

    user_id: UUID

    username: str

    full_name: str

    email: EmailStr

    role: str

    phone_number: str | None = None


# =============================
# LOGIN RESPONSE
# =============================

class LoginResponse(

    BaseModel

):

    success: bool

    message: str

    access_token: str | None = None

    token_type: str | None = None

    user: UserResponse


# =============================
# REGISTER RESPONSE
# =============================

class RegisterResponse(

    BaseModel

):

    success: bool

    message: str

    user: UserResponse