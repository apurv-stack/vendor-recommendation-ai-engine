from uuid import UUID

from sqlalchemy import (
    or_,
    asc,
    desc,
    func
)

from sqlalchemy.orm import (
    Session,
    aliased,
    joinedload
)

from app.models.vendor import Vendor
from app.models.review import Review
from app.models.service import Service


# =====================================
# ROOT VENDOR
# =====================================

def create_root_vendor(

    db: Session,

    current_user_id: UUID,

    vendor_data: dict

):

    existing=(

        db.query(Vendor)

        .filter(

            Vendor.user_id
            ==
            current_user_id

        )

        .first()

    )

    if existing:

        return existing

    vendor=Vendor(

        user_id=current_user_id,

        parent_vendor_id=None,

        **vendor_data

    )

    db.add(vendor)

    db.commit()

    db.refresh(vendor)

    return vendor


# =====================================
# CATEGORY VENDOR
# =====================================

def create_vendor(

    db: Session,

    vendor_data: dict

):

    vendor=Vendor(

        **vendor_data

    )

    db.add(vendor)

    db.commit()

    db.refresh(vendor)

    return vendor


# =====================================
# SERVICES
# =====================================

def create_service(

    db: Session,

    service: Service

):

    db.add(service)

    db.commit()

    db.refresh(service)

    return service


def get_service_by_id(

    db: Session,

    service_id: UUID

):

    return (

        db.query(Service)

        .filter(

            Service.service_id
            ==
            service_id

        )

        .first()

    )


def get_services_by_category(

    db: Session,

    category_vendor_id: UUID

):

    return (

        db.query(Service)

        .filter(

            Service.category_vendor_id
            ==
            category_vendor_id

        )

        .all()

    )


def service_exists(

    db: Session,

    category_vendor_id: UUID,

    service_name: str

):

    return (

        db.query(Service)

        .filter(

            Service.category_vendor_id
            ==
            category_vendor_id,

            func.lower(

                Service.service_name

            )

            ==

            service_name.strip().lower()

        )

        .first()

    )


def rename_service(

    db: Session,

    service: Service,

    service_name: str

):

    service.service_name=service_name

    db.commit()

    db.refresh(service)

    return service


def delete_service(

    db: Session,

    service: Service

):

    db.delete(service)

    db.commit()


# =====================================
# VENDOR
# =====================================

def get_vendor_by_id(

    db: Session,

    vendor_id: UUID

):

    return (

        db.query(Vendor)

        .options(

            joinedload(

                Vendor.managed_teams

            )

            .joinedload(

                Vendor.service_records

            ),

            joinedload(

                Vendor.managed_teams

            )

        )

        .filter(

            Vendor.vendor_id
            ==
            vendor_id,

            Vendor.is_active.is_(True)

        )

        .first()

    )


def get_vendor_by_business_email(

    db: Session,

    email: str

):

    return (

        db.query(Vendor)

        .filter(

            func.lower(

                Vendor.business_email

            )

            ==

            email.strip().lower()

        )

        .first()

    )


def get_all_vendors(

    db: Session

):

    return (

        db.query(Vendor)

        .options(

            joinedload(

                Vendor.managed_teams

            )

            .joinedload(

                Vendor.service_records

            ),

            joinedload(

                Vendor.managed_teams

            )

        )

        .filter(

            Vendor.parent_vendor_id.is_(None),

            Vendor.is_active.is_(True)

        )

        .all()

    )


# =====================================
# SEARCH
# =====================================

def search_vendors(

    db: Session,

    query=None,

    city=None,

    category=None,

    cuisine=None,

    min_price=None,

    max_price=None,

    rating=None,

    min_reviews=None,

    available=None,

    verified=None,

    sort_by=None,

    page=1,

    limit=10

):

    CategoryVendor=aliased(Vendor)

    ServiceAlias=aliased(Service)

    search=(

        db.query(Vendor)

        .outerjoin(

            CategoryVendor,

            CategoryVendor.parent_vendor_id
            ==
            Vendor.vendor_id

        )

        .outerjoin(

            ServiceAlias,

            ServiceAlias.category_vendor_id
            ==
            CategoryVendor.vendor_id

        )

        .outerjoin(

            Review,

            Review.vendor_id
            ==
            Vendor.vendor_id

        )

        .options(

            joinedload(

                Vendor.managed_teams

            )

            .joinedload(

                Vendor.service_records

            ),

            joinedload(

                Vendor.managed_teams

            )

        )

        .filter(

            Vendor.parent_vendor_id.is_(None),

            Vendor.is_active.is_(True)

        )

    )

    if query:

        pattern=f"%{query}%"

        search=search.filter(

            or_(

                Vendor.name.ilike(pattern),

                Vendor.city.ilike(pattern),

                Vendor.description.ilike(pattern),

                CategoryVendor.name.ilike(pattern),

                ServiceAlias.service_name.ilike(pattern)

            )

        )

    if city:

        search=search.filter(

            Vendor.city.ilike(

                f"%{city}%"

            )

        )

    if category:

        CATEGORY_SEARCH_TERMS = {
            "photography": ["photography", "photographer", "photo", "videography", "cinematography"],
            "catering":    ["catering", "caterer", "caterers", "food", "chef"],
            "decoration":  ["decoration", "decorator", "decorators", "decor", "floral", "styling"],
            "venue":       ["venue", "banquet", "hall", "farmhouse", "resort", "lawn"],
            "entertainment": ["entertainment", "entertainer", "anchor", "comedian", "performer"],
            "dj":          ["dj", "disc jockey", "music", "sound"],
            "music":       ["music", "musician", "band", "singer", "live music"],
            "makeup":      ["makeup", "makeup artist", "bridal makeup"],
            "planner":     ["planner", "event planner", "wedding planner"],
        }

        category_terms = CATEGORY_SEARCH_TERMS.get(
            category.lower(),
            [category]
        )

        search = search.filter(

            or_(

                *[
                    CategoryVendor.name.ilike(f"%{term}%")
                    for term in category_terms
                ],

                *[
                    ServiceAlias.service_name.ilike(f"%{term}%")
                    for term in category_terms
                ],

                *[
                    Vendor.name.ilike(f"%{term}%")
                    for term in category_terms
                ],

                *[
                    Vendor.description.ilike(f"%{term}%")
                    for term in category_terms
                ]

            )

        )

    if cuisine:

        search=search.filter(

            ServiceAlias.service_name.ilike(

                f"%{cuisine}%"

            )

        )

    if min_price is not None:

        search=search.filter(
            Vendor.price_max >= min_price
        )

    if max_price is not None:

        search=search.filter(
            Vendor.price_min <= max_price
        )

    search=search.group_by(

        Vendor.vendor_id

    )

    if sort_by=="rating":

        search=search.order_by(

            desc(

                func.avg(

                    Review.rating

                )

            )

        )

    elif sort_by=="price_low":

        search=search.order_by(

            asc(

                Vendor.price_min

            )

        )

    all_vendors=search.all()

    if rating is not None:

        min_rating = float(rating)

        all_vendors = [

            v for v in all_vendors

            if (
                v.avg_rating is not None
                and float(v.avg_rating) >= min_rating
            )

        ]

    total = len(all_vendors)

    vendors = all_vendors[

        (page-1)*limit : (page-1)*limit + limit

    ]

    return vendors, total


# =====================================
# AI SEARCH
# =====================================

def search_vendors_ai(

    db: Session,

    filters: dict

):
    vendors,total=(

        search_vendors(

            db=db,

            city=filters.get(

                "city"

            ),

            category=filters.get(

                "category"

            ),

            cuisine=filters.get(

                "cuisine"

            ),

            max_price=filters.get(

                "budget"

            ),

            sort_by="rating",

            page=1,

            limit=50

        )

    )

    print("AFTER DB QUERY - total:", total)
    print("AFTER DB QUERY - vendors:", [v.name for v in vendors])

    pricing = (filters.get("pricing_preference") or "").lower()

    if pricing:

        if pricing in {"premium", "luxury"}:

            vendors.sort(
                key=lambda v: (
                    float(v.avg_rating or 0),
                    int(v.review_count or 0),
                    float(v.price_max or 0),
                    bool(v.is_verified)
                ),
                reverse=True
            )

        elif pricing in {"budget", "cheap", "affordable"}:

            vendors.sort(
                key=lambda v: (
                    float(v.price_min or 0),
                    -float(v.avg_rating or 0)
                )   
            )

        total = len(vendors)

    return {

        "vendors":vendors,

        "total":total

    }
    
# =====================================
# AI HELPERS
# =====================================

def budget_vendors_ai(

    db: Session,

    budget:int

):

    vendors,_=(

        search_vendors(

            db=db,

            max_price=budget,

            sort_by="price_low"

        )

    )

    return vendors


def top_rated_vendors_ai(

    db: Session,

    limit=5

):

    vendors,_=(

        search_vendors(

            db=db,

            sort_by="rating",

            limit=limit

        )

    )

    return vendors


def vendor_by_name_ai(db: Session, name: str):
    result = db.query(Vendor).filter(
        Vendor.name.ilike(f"%{name}%")
    ).first()

    if result:
        return result
    
    words = [w for w in name.strip().split() if len(w) > 2][:2]
    if words:
        for word in words:
            result = db.query(Vendor).filter(
                Vendor.name.ilike(f"%{word}%")
            ).first()
            if result:
                return result

    return None

def compare_vendors_ai(

    db: Session,

    names:list

):

    return [

        vendor_by_name_ai(

            db,

            name

        )

        for name in names

        if vendor_by_name_ai(

            db,

            name

        )

    ]


def vendor_analytics_ai(

    db: Session

):

    return {

        "total_vendors":

        db.query(Vendor).count()

    }


# =====================================
# UPDATE
# =====================================

def update_vendor(

    db: Session,

    vendor: Vendor,

    update_data: dict

):

    for k,v in update_data.items():

        setattr(

            vendor,

            k,

            v

        )

    db.commit()

    db.refresh(vendor)

    return vendor


# =====================================
# DELETE
# =====================================

def deactivate_vendor(

    db: Session,

    vendor: Vendor

):

    vendor.is_active=False

    db.commit()

    return vendor

# =====================================
# BULK IMPORT
# =====================================

def bulk_create_vendors(

    db: Session,

    vendors_data: list[dict]

) -> list[Vendor]:

    vendors = [
        Vendor(**data)
        for data in vendors_data
    ]

    try:
        db.add_all(vendors)
        db.commit()
        for vendor in vendors:
            db.refresh(vendor)
        return vendors

    except Exception:
        db.rollback()
        raise


def email_exists(

    db: Session,

    email: str

) -> bool:

    return (
        db.query(Vendor)
        .filter(
            func.lower(Vendor.business_email)
            ==
            email.strip().lower()
        )
        .first()
    ) is not None