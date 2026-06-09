from uuid import UUID

from fastapi import (
    APIRouter,
    Depends
)

from sqlalchemy.orm import Session

from app.db.session import get_db

from app.schemas.category_schema import (

    CategoryCreateRequest,
    CategoryUpdateRequest,
    CategoryDetailResponse,
    CategoryListResponse
)

from app.services.category_service import (

    create_category_service,
    get_single_category_service,
    get_all_categories_service,
    update_category_service,
    deactivate_category_service
)

from app.api.dependencies.auth_dependency import (
    require_role
)

from app.models.user import User


router = APIRouter(

    prefix="/categories",

    tags=["Categories"]
)


# -----------------------------
# CREATE CATEGORY
# -----------------------------

@router.post(
    "/",
    response_model=CategoryDetailResponse
)
def create_category_api(

    category_data: CategoryCreateRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_role(["admin"])
    )
):

    return create_category_service(

        db=db,

        category_data=category_data
    )


# -----------------------------
# GET SINGLE CATEGORY
# -----------------------------

@router.get(
    "/{category_id}",
    response_model=CategoryDetailResponse
)
def get_single_category_api(

    category_id: UUID,

    db: Session = Depends(get_db)
):

    return get_single_category_service(

        db=db,

        category_id=category_id
    )


# -----------------------------
# GET ALL CATEGORIES
# -----------------------------

@router.get(
    "/",
    response_model=CategoryListResponse
)
def get_all_categories_api(

    db: Session = Depends(get_db)
):

    return get_all_categories_service(

        db=db
    )


# -----------------------------
# PARTIAL UPDATE CATEGORY
# -----------------------------

@router.patch(
    "/{category_id}",
    response_model=CategoryDetailResponse
)
def update_category_api(

    category_id: UUID,

    category_data: CategoryUpdateRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_role(["admin"])
    )
):

    return update_category_service(

        db=db,

        category_id=category_id,

        update_data=category_data.model_dump(
            exclude_unset=True
        )
    )


# -----------------------------
# DEACTIVATE CATEGORY
# -----------------------------

@router.delete(
    "/{category_id}",
    response_model=CategoryDetailResponse
)
def deactivate_category_api(

    category_id: UUID,

    db: Session = Depends(get_db),

    current_user: User = Depends(
        require_role(["admin"])
    )
):

    return deactivate_category_service(

        db=db,

        category_id=category_id
    )