from uuid import UUID

from sqlalchemy.orm import Session

from sqlalchemy import func

from app.models.category import Category


# =============================
# CREATE CATEGORY
# =============================

def create_category(

    db: Session,

    category_data: dict

):

    new_category = Category(

        **category_data

    )

    db.add(

        new_category

    )

    db.commit()

    db.refresh(

        new_category

    )

    return new_category


# =============================
# GET BY ID
# =============================

def get_category_by_id(

    db: Session,

    category_id: UUID

):

    return (

        db.query(

            Category

        )

        .filter(

            Category.category_id

            ==

            category_id,

            Category.is_active.is_(

                True

            )

        )

        .first()

    )


# =============================
# GET BY NAME
# =============================

def get_category_by_name(

    db: Session,

    name: str

):

    return (

        db.query(

            Category

        )

        .filter(

            func.lower(

                Category.name

            )

            ==

            name.lower()

            .strip()

        )

        .first()

    )


# =============================
# GET BY SLUG
# =============================

def get_category_by_slug(

    db: Session,

    slug: str

):

    return (

        db.query(

            Category

        )

        .filter(

            Category.slug

            ==

            slug

            .strip()

            .lower()

        )

        .first()

    )


# =============================
# GET ALL
# =============================

def get_all_categories(

    db: Session

):

    return (

        db.query(

            Category

        )

        .filter(

            Category.is_active.is_(

                True

            )

        )

        .all()

    )


# =============================
# UPDATE
# =============================

def update_category(

    db: Session,

    category: Category,

    update_data: dict

):

    blocked_fields = {

        "category_id",

        "created_at"

    }

    for key, value in update_data.items():

        if key in blocked_fields:

            continue

        setattr(

            category,

            key,

            value

        )

    db.commit()

    db.refresh(

        category

    )

    return category


# =============================
# DEACTIVATE
# =============================

def deactivate_category(

    db: Session,

    category: Category

):

    setattr(
        category,
        "is_active",
        False
    )

    db.commit()

    db.refresh(

        category

    )

    return category