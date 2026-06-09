import re

from fastapi import (

    HTTPException,

    status

)


# =====================================
# PRICE VALIDATION
# =====================================

def validate_price(

    value: int | float | None

):

    if value is None:

        return

    if value < 0:

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Price cannot be negative"

        )

    if value > 100000000:

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Price exceeds allowed limit"

        )


# =====================================
# RATING VALIDATION
# =====================================

def validate_rating(

    value: float | None

):

    if value is None:

        return

    if value < 0:

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Rating cannot be below 0"

        )

    if value > 5:

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Rating cannot exceed 5"

        )


# =====================================
# PHONE VALIDATION
# =====================================

def validate_phone(

    phone: str | None

):

    if phone is None:

        return

    phone = (

        phone

        .strip()

        .replace(" ","")

        .replace("-","")

        .replace("+","")

        .replace("(","")

        .replace(")","")

    )

    pattern = r"^[0-9]{10}$"

    if not re.match(

        pattern,

        phone

    ):

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Phone number must contain exactly 10 digits"

        )


# =====================================
# TEXT SANITIZATION
# =====================================

def sanitize_text(

    value: str | None

):

    if value is None:

        return None

    cleaned = value.strip()

    if not cleaned:

        return None

    return cleaned


# =====================================
# SLUG VALIDATION
# =====================================

def validate_slug(

    slug: str | None

):

    if slug is None:

        return

    slug = slug.strip().lower()

    pattern = r"^[a-z0-9-]+$"

    if not re.match(

        pattern,

        slug

    ):

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Slug format invalid"

        )


# =====================================
# PAGE VALIDATION
# =====================================

def validate_page(

    value: int

):

    if value < 1:

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Page must be greater than 0"

        )


# =====================================
# LIMIT VALIDATION
# =====================================

def validate_limit(

    value: int

):

    if value < 1:

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Limit must be greater than 0"

        )

    if value > 100:

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Limit cannot exceed 100"

        )


# =====================================
# UUID VALIDATION
# =====================================

def validate_uuid(

    value

):

    if value is None:

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Required identifier missing"

        )