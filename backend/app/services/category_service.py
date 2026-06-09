from uuid import UUID

from fastapi import (
    HTTPException,
    status
)

from sqlalchemy.orm import Session

from app.repositories.category_repository import (

    create_category,
    get_category_by_id,
    get_category_by_name,
    get_category_by_slug,
    get_all_categories,
    update_category,
    deactivate_category

)

from app.schemas.category_schema import (
    CategoryCreateRequest
)

from app.core.validators import (
    sanitize_text
)


# =====================================
# CREATE CATEGORY
# =====================================

def create_category_service(

    db: Session,
    category_data: CategoryCreateRequest

):

    payload = (

        category_data.model_dump()

    )

    clean_name = sanitize_text(

        payload["name"]

    )

    if clean_name is None:

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Category name cannot be empty"

        )

    payload["name"] = clean_name

    payload["description"] = (

        sanitize_text(

            payload.get(

                "description"

            )

        )

    )

    existing_name = (

        get_category_by_name(

            db=db,

            name=str(

                payload["name"]

            )

        )

    )

    if existing_name is not None:

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Category name already exists"

        )

    existing_slug = (

        get_category_by_slug(

            db=db,

            slug=str(

                payload["slug"]

            )

        )

    )

    if existing_slug is not None:

        raise HTTPException(

            status_code=

            status.HTTP_400_BAD_REQUEST,

            detail=

            "Category slug already exists"

        )

    new_category = (

        create_category(

            db=db,

            category_data=payload

        )

    )

    return {

        "success": True,

        "message":

        "Category created successfully",

        "category":

        new_category

    }


# =====================================
# GET SINGLE CATEGORY
# =====================================

def get_single_category_service(

    db: Session,
    category_id: UUID

):

    category = (

        get_category_by_id(

            db=db,

            category_id=

            category_id

        )

    )

    if category is None:

        raise HTTPException(

            status_code=

            status.HTTP_404_NOT_FOUND,

            detail=

            "Category not found"

        )

    return {

        "success": True,

        "message":

        "Category fetched successfully",

        "category":

        category

    }


# =====================================
# GET ALL CATEGORIES
# =====================================

def get_all_categories_service(

    db: Session

):

    categories = (

        get_all_categories(

            db=db

        )

    )

    return {

        "success": True,

        "message":

        "Categories fetched successfully",

        "categories":

        categories

    }


# =====================================
# UPDATE CATEGORY
# =====================================

def update_category_service(

    db: Session,
    category_id: UUID,
    update_data: dict

):

    category = (

        get_category_by_id(

            db=db,

            category_id=

            category_id

        )

    )

    if category is None:

        raise HTTPException(

            status_code=

            status.HTTP_404_NOT_FOUND,

            detail=

            "Category not found"

        )

    if "name" in update_data:

        clean_name = (

            sanitize_text(

                update_data["name"]

            )

        )

        if clean_name is None:

            raise HTTPException(

                status_code=

                status.HTTP_400_BAD_REQUEST,

                detail=

                "Category name cannot be empty"

            )

        update_data["name"] = clean_name

        existing_name = (

            get_category_by_name(

                db=db,

                name=str(

                    update_data["name"]

                )

            )

        )

        if existing_name is not None:

            existing_id = str(

                existing_name.category_id

            )

            current_id = str(

                category.category_id

            )

            if existing_id != current_id:

                raise HTTPException(

                    status_code=

                    status.HTTP_400_BAD_REQUEST,

                    detail=

                    "Category name already exists"

                )

    if "description" in update_data:

        update_data["description"] = (

            sanitize_text(

                update_data["description"]

            )

        )

    if "slug" in update_data:

        existing_slug = (

            get_category_by_slug(

                db=db,

                slug=str(

                    update_data["slug"]

                )

            )

        )

        if existing_slug is not None:

            existing_id = str(

                existing_slug.category_id

            )

            current_id = str(

                category.category_id

            )

            if existing_id != current_id:

                raise HTTPException(

                    status_code=

                    status.HTTP_400_BAD_REQUEST,

                    detail=

                    "Category slug already exists"

                )

    updated_category = (

        update_category(

            db=db,

            category=category,

            update_data=

            update_data

        )

    )

    return {

        "success": True,

        "message":

        "Category updated successfully",

        "category":

        updated_category

    }


# =====================================
# DEACTIVATE CATEGORY
# =====================================

def deactivate_category_service(

    db: Session,
    category_id: UUID

):

    category = (

        get_category_by_id(

            db=db,

            category_id=

            category_id

        )

    )

    if category is None:

        raise HTTPException(

            status_code=

            status.HTTP_404_NOT_FOUND,

            detail=

            "Category not found"

        )

    deactivated = (

        deactivate_category(

            db=db,

            category=category

        )

    )

    return {

        "success": True,

        "message":

        "Category deactivated successfully",

        "category":

        deactivated

    }