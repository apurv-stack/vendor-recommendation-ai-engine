from uuid import UUID

from pydantic import (
    BaseModel,
    Field,
    field_validator
)

import re


# =============================
# CATEGORY BASE
# =============================

class CategoryBase(BaseModel):

    name: str = Field(

        min_length=2,

        max_length=255

    )

    slug: str = Field(

        min_length=2,

        max_length=100

    )

    description: str | None = Field(

        default=None,

        max_length=1000

    )

    # =============================
    # NAME VALIDATION
    # =============================

    @field_validator("name")

    @classmethod

    def validate_name(

        cls,

        value: str

    ):

        value = value.strip()

        if not value:

            raise ValueError(

                "Category name cannot be empty"

            )

        if len(value) < 2:

            raise ValueError(

                "Category name too short"

            )

        return value


    # =============================
    # SLUG VALIDATION
    # =============================

    @field_validator("slug")

    @classmethod

    def validate_slug(

        cls,

        value: str

    ):

        value = (

            value

            .strip()

            .lower()

        )

        if not value:

            raise ValueError(

                "Slug cannot be empty"

            )

        if not re.match(

            r"^[a-z0-9-]+$",

            value

        ):

            raise ValueError(

                "Slug can contain lowercase letters numbers and hyphens only"

            )

        return value


    # =============================
    # DESCRIPTION SANITIZATION
    # =============================

    @field_validator(

        "description"

    )

    @classmethod

    def validate_description(

        cls,

        value

    ):

        if value is None:

            return value

        value = value.strip()

        if not value:

            return None

        return value


# =============================
# CREATE CATEGORY
# =============================

class CategoryCreateRequest(

    CategoryBase

):

    pass


# =============================
# UPDATE CATEGORY
# =============================

class CategoryUpdateRequest(

    BaseModel

):

    name: str | None = Field(

        default=None,

        min_length=2,

        max_length=255

    )

    slug: str | None = Field(

        default=None,

        min_length=2,

        max_length=100

    )

    description: str | None = Field(

        default=None,

        max_length=1000

    )

    is_active: bool | None = None


    # =============================
    # NAME VALIDATION
    # =============================

    @field_validator(

        "name"

    )

    @classmethod

    def validate_update_name(

        cls,

        value

    ):

        if value is None:

            return value

        value = value.strip()

        if not value:

            raise ValueError(

                "Category name cannot be empty"

            )

        return value


    # =============================
    # SLUG VALIDATION
    # =============================

    @field_validator(

        "slug"

    )

    @classmethod

    def validate_update_slug(

        cls,

        value

    ):

        if value is None:

            return value

        value = (

            value

            .strip()

            .lower()

        )

        if not value:

            raise ValueError(

                "Slug cannot be empty"

            )

        if not re.match(

            r"^[a-z0-9-]+$",

            value

        ):

            raise ValueError(

                "Slug can contain lowercase letters numbers and hyphens only"

            )

        return value


    # =============================
    # DESCRIPTION VALIDATION
    # =============================

    @field_validator(

        "description"

    )

    @classmethod

    def validate_update_description(

        cls,

        value

    ):

        if value is None:

            return value

        value = value.strip()

        if not value:

            return None

        return value


# =============================
# CATEGORY RESPONSE
# =============================

class CategoryResponse(

    CategoryBase

):

    category_id: UUID

    is_active: bool

    class Config:

        from_attributes = True


# =============================
# DETAIL RESPONSE
# =============================

class CategoryDetailResponse(

    BaseModel

):

    success: bool

    message: str

    category: CategoryResponse


# =============================
# LIST RESPONSE
# =============================

class CategoryListResponse(

    BaseModel

):

    success: bool

    message: str

    categories: list[
        CategoryResponse
    ]