from uuid import UUID

from fastapi import HTTPException

from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.service import Service

from app.repositories.vendor_repository import (

    create_root_vendor,
    get_vendor_by_business_email,
    get_vendor_by_id,
    get_all_vendors,
    search_vendors,
    update_vendor,

    create_service,
    service_exists,
    get_services_by_category,
    get_service_by_id

)

from app.schemas.vendor_schema import (

    VendorProfileUpdateRequest,
    CreateVendorRequest

)

from app.core.validators import (

    validate_phone,
    validate_price,
    validate_rating,
    validate_page,
    validate_limit,
    sanitize_text

)


# =====================================================
# CREATE ROOT VENDOR
# =====================================================

def create_vendor_profile_service(

    db: Session,
    current_user,
    vendor_data: CreateVendorRequest

):

    existing = (

        db.query(Vendor)

        .filter(

            Vendor.user_id ==

            current_user.user_id

        )

        .first()

    )

    if existing:

        raise HTTPException(

            400,

            "Vendor profile already exists"

        )

    duplicate = (

        get_vendor_by_business_email(

            db,

            vendor_data.business_email

        )

    )

    if duplicate:

        raise HTTPException(

            400,

            "Business email already exists"

        )

    validate_phone(

        vendor_data.contact_phone

    )

    vendor = create_root_vendor(

        db=db,

        current_user_id=current_user.user_id,

        vendor_data={

            "name":

            sanitize_text(

                vendor_data.name

            ),

            "business_email":

            vendor_data.business_email,

            "contact_phone":

            vendor_data.contact_phone,

            "city":

            sanitize_text(

                vendor_data.city

            ),

            "address":

            sanitize_text(

                vendor_data.address

            ),

            "description":

            sanitize_text(

                vendor_data.description

            )

        }

    )

    return {

        "success": True,

        "message":

        "Vendor profile created successfully",

        "vendor":

        vendor

    }


# =====================================================
# CREATE CATEGORY / SERVICE
# =====================================================

def create_internal_team_service(

    db: Session,

    current_user,

    team_name: str,

    category_id: UUID | None = None,

    description: str | None = None,

    parent_vendor_id: UUID | None = None

):

    owner = (

        db.query(Vendor)

        .filter(

            Vendor.user_id ==

            current_user.user_id

        )

        .first()

    )

    if owner is None:

        raise HTTPException(

            404,

            "Vendor not found"

        )

    clean = sanitize_text(

        team_name

    )

    if not clean:

        raise HTTPException(

            400,

            "Name required"

        )

    parent = owner

    if parent_vendor_id:

        parent = (

            get_vendor_by_id(

                db,

                parent_vendor_id

            )

        )

        if parent is None:

            raise HTTPException(

                404,

                "Parent vendor not found"

            )

    depth = 0

    current = parent

    while current:

        if current.parent_vendor_id is None:

            break

        depth += 1

        current = (

            get_vendor_by_id(

                db,

                current.parent_vendor_id

            )

        )

    # ROOT → CATEGORY

    if depth == 0:

        duplicate = (

            db.query(Vendor)

            .filter(

                Vendor.parent_vendor_id

                ==

                owner.vendor_id,

                Vendor.name.ilike(

                    clean

                ),

                Vendor.is_active == True

            )

            .first()

        )

        if duplicate:

            raise HTTPException(

                400,

                "Already exists"

            )

        vendor = Vendor(

            parent_vendor_id=

            owner.vendor_id,

            name=clean,

            description=(

                sanitize_text(

                    description

                )

                if description

                else None

            ),

            category_id=

            category_id,

            business_email=(

                f"{clean.lower().replace(' ','_')}"

                f"_{str(owner.vendor_id)[:8]}"

                "@internal.ai"

            ),

            contact_phone=

            owner.contact_phone,

            city=

            owner.city,

            address=

            owner.address,

            is_available=True,

            is_active=True,

            is_verified=False

        )

        db.add(

            vendor

        )

        db.commit()

        db.refresh(

            vendor

        )

        return vendor

    # CATEGORY → SERVICE

    if depth == 1:

        duplicate = (

            service_exists(

                db,

                parent.vendor_id,

                clean

            )

        )

        if duplicate:

            raise HTTPException(

                400,

                "Already exists"

            )

        service = Service(

            service_name=

            clean,

            category_vendor_id=

            parent.vendor_id

        )

        return create_service(

            db,

            service

        )

    raise HTTPException(

        400,

        "Only Category → Service allowed"

    )


# =====================================================
# BUILD TREE
# =====================================================

def build_hierarchy_tree(

    db: Session,

    parent_vendor_id: UUID

):

    categories = (

        db.query(Vendor)

        .filter(

            Vendor.parent_vendor_id

            ==

            parent_vendor_id,

            Vendor.is_active == True

        )

        .all()

    )

    result = []

    for category in categories:

        services = (

            get_services_by_category(

                db,

                category.vendor_id

            )

        )

        result.append({

            "vendor_id":

            str(

                category.vendor_id

            ),

            "name":

            category.name,

            "parent_vendor_id":

            str(

                category.parent_vendor_id

            ),

            "managed_teams":[

                {

                    "service_id":

                    str(

                        service.service_id

                    ),

                    "name":

                    service.service_name

                }

                for service

                in services

            ]

        })

    return result


# =====================================================
# INTERNAL TEAM
# =====================================================

def get_internal_teams_service(

    db: Session,

    vendor_id: UUID

):

    vendor = (

        get_vendor_by_id(

            db,

            vendor_id

        )

    )

    if vendor is None:

        raise HTTPException(

            404,

            "Vendor not found"

        )

    return build_hierarchy_tree(

        db,

        vendor.vendor_id

    )


# =====================================================
# PROFILE
# =====================================================

def get_current_vendor_profile_service(

    db: Session,

    current_user

):

    vendor = (

        db.query(Vendor)

        .filter(

            Vendor.user_id ==

            current_user.user_id

        )

        .first()

    )

    if vendor is None:

        raise HTTPException(

            404,

            "Vendor profile not found"

        )

    return {

        "success": True,

        "message":

        "Vendor profile fetched successfully",

        "vendor":

        vendor

    }


# =====================================================
# UPDATE PROFILE
# =====================================================

def update_current_vendor_profile_service(

    db: Session,

    current_user,

    vendor_data:

    VendorProfileUpdateRequest

):

    vendor=(

        db.query(Vendor)

        .filter(

            Vendor.user_id==

            current_user.user_id

        )

        .first()

    )

    if vendor is None:

        raise HTTPException(

            404,

            "Vendor profile not found"

        )

    update_data=(

        vendor_data.model_dump(

            exclude_unset=True

        )

    )

    if "contact_phone" in update_data:

        validate_phone(

            update_data[

                "contact_phone"

            ]

        )

    if "price_min" in update_data:

        validate_price(

            update_data[

                "price_min"

            ]

        )

    if "price_max" in update_data:

        validate_price(

            update_data[

                "price_max"

            ]

        )

    vendor=(

        update_vendor(

            db,

            vendor,

            update_data

        )

    )

    return {

        "success": True,

        "message":

        "Vendor profile updated successfully",

        "vendor":

        vendor

    }

# =====================================================
# SEARCH
# =====================================================

def search_vendors_service(

    db: Session,

    **filters

):

    page = filters.get(

        "page",

        1

    )

    limit = filters.get(

        "limit",

        10

    )

    validate_page(

        page

    )

    validate_limit(

        limit

    )

    validate_rating(

        filters.get(

            "rating"

        )

    )

    vendors, total = (

        search_vendors(

            db,

            **filters

        )

    )

    return {

        "success": True,

        "message":

        "Vendors fetched successfully",

        "vendors":

        vendors,

        "total_results":

        total,

        "page":

        page,

        "limit":

        limit

    }
# =====================================================
# SINGLE
# =====================================================

def get_single_vendor_service(

    db: Session,

    vendor_id: UUID

):

    vendor = (

        get_vendor_by_id(

            db,

            vendor_id

        )

    )

    if vendor is None:

        raise HTTPException(

            404,

            "Vendor not found"

        )

    return {

        "success": True,

        "vendor": vendor

    }


# =====================================================
# ALL
# =====================================================

def get_all_vendors_service(

    db: Session

):

    vendors = (

        get_all_vendors(

            db

        )

    )

    return {

        "success": True,

        "message":

        "Vendors fetched successfully",

        "vendors":

        vendors,

        "page":

        1,

        "limit":

        len(

            vendors

        ),

        "total_results":

        len(

            vendors

        )

    }


# =====================================================
# DELETE
# =====================================================

def deactivate_vendor_service(

    db: Session,

    vendor_id: UUID

):

    vendor = (

        get_vendor_by_id(

            db,

            vendor_id

        )

    )

    if vendor is None:

        raise HTTPException(

            404,

            "Vendor not found"

        )

    db.delete(

        vendor

    )

    db.commit()

    return {

        "success": True,

        "message":

        "Deleted successfully"

    }

# =====================================================
# GET SINGLE SERVICE
# =====================================================

def get_single_service_service(

    db: Session,

    service_id: UUID

):

    service = (

        get_service_by_id(

            db,

            service_id

        )

    )

    if service is None:

        raise HTTPException(

            404,

            "Service not found"

        )

    return {

        "success": True,

        "service": {

            "service_id":

            str(

                service.service_id

            ),

            "name":

            service.service_name,

            "category_vendor_id":

            str(

                service.category_vendor_id

            )

        }

    }
# =====================================================
# RENAME
# =====================================================

def rename_vendor_service(

    db: Session,

    current_user,

    vendor_id: UUID,

    name: str

):

    vendor = (

        get_vendor_by_id(

            db,

            vendor_id

        )

    )

    if vendor is None:

        raise HTTPException(

            404,

            "Vendor not found"

        )

    clean = sanitize_text(

        name

    )

    if not clean:

        raise HTTPException(

            400,

            "Name required"

        )

    setattr(

        vendor,

        "name",

        clean

    )

    db.commit()

    db.refresh(

        vendor

    )

    return {

        "success": True,

        "vendor":

        vendor

    }


# =====================================================
# RENAME SERVICE
# =====================================================

def rename_service_service(

    db: Session,

    current_user,

    service_id: UUID,

    name: str

):

    service=(

        get_service_by_id(

            db,

            service_id

        )

    )

    if service is None:

        raise HTTPException(

            404,

            "Service not found"

        )

    clean=sanitize_text(

        name

    )

    if not clean:

        raise HTTPException(

            400,

            "Name required"

        )

    duplicate=(

        service_exists(

            db,

            service.category_vendor_id,

            clean

        )

    )

    if (

        duplicate

        and

        duplicate.service_id

        !=

        service.service_id

    ):

        raise HTTPException(

            400,

            "Service already exists"

        )

    service.service_name=clean

    db.commit()

    db.refresh(

        service

    )

    return {

        "success":True,

        "message":

        "Service updated successfully",

        "service":{

            "service_id":

            str(

                service.service_id

            ),

            "name":

            service.service_name

        }

    }


# =====================================================
# DELETE SERVICE
# =====================================================

def delete_service_service(

    db: Session,

    current_user,

    service_id: UUID

):

    service=(

        get_service_by_id(

            db,

            service_id

        )

    )

    if service is None:

        raise HTTPException(

            404,

            "Service not found"

        )

    db.delete(

        service

    )

    db.commit()

    return {

        "success":True,

        "message":

        "Service deleted successfully"

    }