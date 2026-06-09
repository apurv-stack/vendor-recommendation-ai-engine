from uuid import UUID

from fastapi import (

    APIRouter,
    Depends,
    Query

)

from sqlalchemy.orm import Session

from app.db.session import get_db
from sqlalchemy import func
from app.models.vendor import Vendor
from app.models.viewed_vendor import ViewedVendor
from app.models.vendor_follow import VendorFollow
from sqlalchemy import cast, Date
from app.models.notification import Notification
from sqlalchemy import desc
from app.models.saved_vendor import SavedVendor
from app.schemas.vendor_schema import (

    VendorProfileUpdateRequest,
    VendorDetailResponse,
    VendorListResponse

)

from app.services.vendor_service import (

    get_current_vendor_profile_service,
    update_current_vendor_profile_service,
    get_single_vendor_service,
    get_all_vendors_service,
    search_vendors_service,
    deactivate_vendor_service,
    create_internal_team_service,
    get_internal_teams_service,
    rename_vendor_service,
    get_single_service_service,
    rename_service_service,
    delete_service_service

)

from app.services.user_preference_service import (
    UserPreferenceService
)

from app.api.dependencies.auth_dependency import (

    require_role

)
# ==========================================
# CREATE NOTIFICATION
# ==========================================

def create_notification(

    db: Session,

    vendor_id: UUID,

    title: str,

    message: str

):

    notification=Notification(

        vendor_id=vendor_id,

        title=title,

        message=message

    )

    db.add(

        notification

    )

from app.models.user import User


router = APIRouter(

    prefix="/vendors",

    tags=["Vendors"]

)


# ==========================================
# PROFILE
# ==========================================

@router.get(

    "/profile",

    response_model=VendorDetailResponse

)
def get_current_vendor_profile_api(

    db: Session = Depends(get_db),

    current_user: User = Depends(

        require_role(

            ["vendor"]

        )

    )

):

    return get_current_vendor_profile_service(

        db=db,

        current_user=current_user

    )


# ==========================================
# UPDATE PROFILE
# ==========================================

@router.put(

    "/profile",

    response_model=VendorDetailResponse

)
def update_current_vendor_profile_api(

    vendor_data:

    VendorProfileUpdateRequest,

    db: Session = Depends(get_db),

    current_user: User = Depends(

        require_role(

            ["vendor"]

        )

    )

):

    return update_current_vendor_profile_service(

        db=db,

        current_user=current_user,

        vendor_data=vendor_data

    )


# ==========================================
# RENAME CATEGORY / SERVICE
# ==========================================

@router.put(

    "/{vendor_id}/rename"

)
def rename_vendor_api(

    vendor_id: UUID,

    name: str = Query(

        ...,

        min_length=2,

        max_length=100

    ),

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            ["vendor"]

        )

    )

):

    return rename_vendor_service(

        db=db,

        current_user=current_user,

        vendor_id=vendor_id,

        name=name.strip()

    )


# ==========================================
# CREATE CATEGORY / SERVICE
# ==========================================

@router.post(

    "/team"

)
def create_internal_team_api(

    team_name: str = Query(

        ...,

        min_length=2,

        max_length=100

    ),

    category_id: UUID | None = None,

    parent_vendor_id: UUID | None = None,

    description: str | None = Query(

        None,

        max_length=500

    ),

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            ["vendor"]

        )

    )

):

    return create_internal_team_service(

        db=db,

        current_user=current_user,

        team_name=team_name.strip(),

        category_id=category_id,

        parent_vendor_id=parent_vendor_id,

        description=(

            description.strip()

            if description

            else None

        )

    )


# ==========================================
# GET OWN HIERARCHY
# ==========================================

@router.get(

    "/internal-team"

)
def get_my_internal_team_api(

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            ["vendor"]

        )

    )

):

    vendor_data=(

        get_current_vendor_profile_service(

            db=db,

            current_user=current_user

        )

    )

    vendor=(

        vendor_data["vendor"]

    )

    hierarchy=(

        get_internal_teams_service(

            db=db,

            vendor_id=vendor.vendor_id

        )

    )

    return {

        "teams":

        hierarchy

    }


# ==========================================
# GET CHILDREN
# ==========================================

@router.get(

    "/{vendor_id}/children"

)
def get_internal_teams_api(

    vendor_id: UUID,

    db: Session = Depends(

        get_db

    )

):

    return {

        "teams":

        get_internal_teams_service(

            db=db,

            vendor_id=vendor_id

        )

    }

# ==========================================
# SINGLE SERVICE
# ==========================================

@router.get(

    "/service/{service_id}"

)
def get_single_service_api(

    service_id: UUID,

    db: Session = Depends(

        get_db

    )

):

    return get_single_service_service(

        db=db,

        service_id=service_id

    )

# ==========================================
# RENAME SERVICE
# ==========================================

@router.put(

    "/service/{service_id}/rename"

)
def rename_service_api(

    service_id: UUID,

    name: str = Query(

        ...,

        min_length=2,

        max_length=100

    ),

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            ["vendor"]

        )

    )

):

    return rename_service_service(

        db=db,

        current_user=current_user,

        service_id=service_id,

        name=name.strip()

    )

# ==========================================
# DELETE SERVICE
# ==========================================

@router.delete(

    "/service/{service_id}"

)
def delete_service_api(

    service_id: UUID,

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            [

                "vendor",

                "admin"

            ]

        )

    )

):

    return delete_service_service(

        db=db,

        current_user=current_user,

        service_id=service_id

    )

# ==========================================
# PROFILE VIEWS
# ==========================================

@router.get(

    "/profile/views"

)
def get_profile_views_api(

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            [

                "vendor"

            ]

        )

    )

):

    vendor_data=(

        get_current_vendor_profile_service(

            db=db,

            current_user=current_user

        )

    )

    vendor=vendor_data["vendor"]

    total_views=(

        db.query(

            ViewedVendor

        )

        .filter(

            ViewedVendor.vendor_id

            ==

            vendor.vendor_id

        )

        .count()

    )

    followers=(

        db.query(

            VendorFollow

        )

        .filter(

            VendorFollow.vendor_id

            ==

            vendor.vendor_id

        )

        .count()

    )
    message=(

        f"{total_views} people viewed your profile"

    )

    latest=(

        db.query(

            Notification

        )

        .filter(

            Notification.vendor_id

            ==

            vendor.vendor_id,

            Notification.title

            ==

            "Profile Activity"

        )

        .order_by(

            desc(

                Notification.created_at

            )

        )


        .first()

    )

    if(

        not latest

        or

        latest.message

        !=

        message

    ):

        create_notification(

            db,

            vendor.vendor_id,

            "Profile Activity",

            message

        )

        db.commit()

    return {

        "views":

        total_views,

        "followers":

        followers

    }

# ==========================================
# FOLLOW VENDOR
# ==========================================

@router.post(

    "/{vendor_id}/follow"

)
def follow_vendor_api(

    vendor_id: UUID,

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            [

                "user",

                "vendor",

                "admin"

            ]

        )

    )

):

    vendor=(

        db.query(

            Vendor

        )

        .filter(

            Vendor.vendor_id

            ==

            vendor_id

        )

        .first()

    )

    if not vendor:

        return {

            "success":False,

            "message":

            "Vendor not found"

        }
    
    if(

        vendor.user_id
        ==
        current_user.user_id

    ):

        return {

            "success":False,

            "message":

            "Cannot follow own vendor"

        }

    existing=(

        db.query(

            VendorFollow

        )

        .filter(

            VendorFollow.user_id

            ==

            current_user.user_id,

            VendorFollow.vendor_id

            ==

            vendor_id

        )

        .first()

    )

    if existing:

        return {

            "success":True,

            "message":

            "Already followed"

        }

    follow=VendorFollow(

        user_id=
        current_user.user_id,

        vendor_id=
        vendor_id

    )

    db.add(

        follow

    )

    vendor.followers_count=(

        vendor.followers_count

        or 0

    )+1

    create_notification(

        db,

        vendor.vendor_id,

        "New Follower",

        f"{current_user.full_name} followed your vendor profile"

    )

    db.commit()

    db.refresh(

        vendor

    )

    return {

        "success":True,

        "followers":

        vendor.followers_count

    }
# ==========================================
# UNFOLLOW
# ==========================================

@router.delete(

    "/{vendor_id}/follow"

)
def unfollow_vendor_api(

    vendor_id: UUID,

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            [

                "user",

                "vendor",

                "admin"

            ]

        )

    )

):

    follow=(

        db.query(

            VendorFollow

        )

        .filter(

            VendorFollow.user_id

            ==

            current_user.user_id,

            VendorFollow.vendor_id

            ==

            vendor_id

        )

        .first()

    )

    if not follow:

        return {

            "success":True

        }

    vendor=(

        db.query(

            Vendor

        )

        .filter(

            Vendor.vendor_id

            ==

            vendor_id

        )

        .first()

    )

    db.delete(

        follow

    )

    if vendor:

        vendor.followers_count=max(

            0,

            vendor.followers_count-1

        )

    db.commit()

    return {

        "success":True

    }

# ==========================================
# SAVE VENDOR
# ==========================================

@router.post(

    "/{vendor_id}/save"

)
def save_vendor_api(

    vendor_id: UUID,

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            [

                "user",

                "vendor",

                "admin"

            ]

        )

    )

):

    vendor=(

        db.query(

            Vendor

        )

        .filter(

            Vendor.vendor_id

            ==

            vendor_id

        )

        .first()

    )

    if not vendor:

        return {

            "success":False,

            "message":

            "Vendor not found"

        }

    if(

        vendor.user_id
        ==
        current_user.user_id

    ):

        return {

            "success":False,

            "message":

            "Cannot save own vendor"

        }   

    existing=(

        db.query(

            SavedVendor

        )

        .filter(

            SavedVendor.user_id

            ==

            current_user.user_id,

            SavedVendor.vendor_id

            ==

            vendor_id

        )

        .first()

    )

    if existing:

        return {

            "success":True,

            "message":

            "Already saved"

        }

    saved=SavedVendor(

        user_id=

        current_user.user_id,

        vendor_id=

        vendor_id

    )

    db.add(

        saved

    )

    create_notification(

        db,

        vendor.vendor_id,

        "Vendor Saved",

        f"{current_user.full_name} bookmarked your vendor profile"

    )

    db.commit()

    return {

        "success":True,

        "message":

        "Vendor saved"

    }

# ==========================================
# REMOVE SAVED
# ==========================================

@router.delete(

    "/{vendor_id}/save"

)
def remove_saved_vendor_api(

    vendor_id: UUID,

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            [

                "user",

                "vendor",

                "admin"

            ]

        )

    )

):

    saved=(

        db.query(

            SavedVendor

        )

        .filter(

            SavedVendor.user_id

            ==

            current_user.user_id,

            SavedVendor.vendor_id

            ==

            vendor_id

        )

        .first()

    )

    if not saved:

        return {

            "success":True

        }

    db.delete(

        saved

    )

    db.commit()

    return {

        "success":True

    }

# ==========================================
# SAVED VENDORS
# ==========================================

@router.get(

    "/saved"

)
def get_saved_vendors_api(

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            [

                "user",

                "vendor",

                "admin"

            ]

        )

    )

):

    saved=(

        db.query(

            SavedVendor

        )

        .filter(

            SavedVendor.user_id

            ==

            current_user.user_id

        )

        .all()

    )

    vendors=[]

    for item in saved:

        vendor=(

            db.query(

                Vendor

            )

            .filter(

                Vendor.vendor_id

                ==

                item.vendor_id

            )

            .first()

        )

        if vendor:

            vendors.append(

                vendor

            )

    return {

        "vendors":

        vendors

    }

# ==========================================
# TRACK PROFILE VIEW
# ==========================================

@router.post(

    "/{vendor_id}/view"

)
def track_vendor_view_api(

    vendor_id: UUID,

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            [

                "user",

                "vendor",

                "admin"

            ]

        )

    )

):

    vendor=(

        db.query(

            Vendor

        )

        .filter(

            Vendor.vendor_id

            ==

            vendor_id

        )

        .first()

    )

    if(

        vendor

        and

        vendor.user_id

        ==

        current_user.user_id

    ):

        return {

            "success":True,

            "message":

            "Own profile"

        }

    if not vendor:

        return {

            "success":False,

            "message":

            "Vendor not found"

        }

    already=(

        db.query(

            ViewedVendor

        )

        .filter(

            ViewedVendor.user_id

            ==

            current_user.user_id,

            ViewedVendor.vendor_id

            ==

            vendor_id

        )

        .first()

    )

    if already:

        return {

            "success":True,

            "message":

            "Already viewed"

        }

    view=ViewedVendor(

        user_id=

        current_user.user_id,

        vendor_id=

        vendor_id

    )

    db.add(

        view

    )

    UserPreferenceService.learn_from_vendor_view(
        db=db,
        user_id=current_user.user_id,
        vendor_id=vendor_id
    )

    vendor.profile_views=(

        vendor.profile_views

        or 0

    )+1

    if vendor.profile_views in [

    5,
    10,
    25,
    50,
    100

    ]:

        create_notification(

            db,

            vendor.vendor_id,

            "Profile Milestone",

            f"Your vendor profile reached {vendor.profile_views} views"

        )
    db.commit()

    db.refresh(

        vendor

    )

    return {

        "success":True,

        "views":

        vendor.profile_views

    }

# ==========================================
# PROFILE ANALYTICS
# ==========================================

@router.get(

    "/profile/analytics"

)
def get_profile_analytics_api(

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            ["vendor"]

        )

    )

):

    vendor_data=(

        get_current_vendor_profile_service(

            db=db,

            current_user=current_user

        )

    )

    vendor=vendor_data["vendor"]

    analytics=(

        db.query(

            cast(

                ViewedVendor.viewed_at,

                Date

            ).label(

                "day"

            ),

            func.count(

                ViewedVendor.view_id

            ).label(

                "views"

            )

        )

        .filter(

            ViewedVendor.vendor_id

            ==

            vendor.vendor_id

        )

        .group_by(

            cast(

                ViewedVendor.viewed_at,

                Date

            )

        )

        .order_by(

            cast(

                ViewedVendor.viewed_at,

                Date

            )

        )

        .all()

    )

    graph=[]

    for row in analytics:

        graph.append({

            "day":

            row.day.strftime(

                "%d %b"

            ),

            "views":

            row.views

        })

    total_views=sum(

        item["views"]

        for item

        in graph

    )

    followers=(

        db.query(

            VendorFollow

        )

        .filter(

            VendorFollow.vendor_id

            ==

            vendor.vendor_id

        )

        .count()

    )

    previous_views=0

    current_views=0

    midpoint=max(

        1,

        len(graph)//2

    )

    for index,item in enumerate(graph):

        if index<midpoint:

            previous_views+=item["views"]

        else:

            current_views+=item["views"]

    growth=0

    if previous_views>0:

        growth=round(

            (

                (

                    current_views-

                    previous_views

                )

                /

                previous_views

            )*100,

            1

        )

    engagement=0

    if total_views>0:

        engagement=round(

            (

                followers/

                total_views

            )*100,

            1

        )

    vendor.profile_views=total_views

    vendor.followers_count=followers

    vendor.engagement_score=engagement

    existing=(
        db.query(
            Notification
        )
        .filter(
            Notification.vendor_id
            ==
            vendor.vendor_id,

            Notification.title
            ==
            "High Engagement"
        )
        .first()
    )

    if engagement>=20 and not existing:

        create_notification(

            db,

            vendor.vendor_id,

            "High Engagement",

            f"Vendor engagement reached {engagement}%"

        )

    db.commit()

    db.refresh(

        vendor

    )

    return {

        "analytics":

        graph,

        "growth":

        growth,

        "views":

        total_views,

        "followers":

        followers,

        "engagement":

        engagement

    }

# ==========================================
# PROFILE PRICING
# ==========================================

@router.get(

    "/profile/pricing"

)
def get_profile_pricing_api(

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            ["vendor"]

        )

    )

):

    vendor_data=(

        get_current_vendor_profile_service(

            db=db,

            current_user=current_user

        )

    )

    vendor=vendor_data["vendor"]

    avg_price=0

    if(

        vendor.price_min

        and

        vendor.price_max

    ):

        avg_price=(

            vendor.price_min

            +

            vendor.price_max

        )//2

    market_avg=(

        db.query(

            func.avg(

                (

                    Vendor.price_min+

                    Vendor.price_max

                )/2

            )

        )

        .filter(

            Vendor.is_active==True,

            Vendor.price_min.isnot(

                None

            ),

            Vendor.price_max.isnot(

                None

            )

        )

        .scalar()

    )

    return {

        "avg_pricing":

        avg_price,

        "benchmark":

        int(

            market_avg or 0

        )

    }

# ==========================================
# GET NOTIFICATIONS
# ==========================================

@router.get(

    "/notifications"

)
def get_notifications_api(

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            ["vendor"]

        )

    )

):

    vendor_data=(

        get_current_vendor_profile_service(

            db=db,

            current_user=current_user

        )

    )

    vendor=vendor_data["vendor"]

    notifications=(

        db.query(

            Notification

        )

        .filter(

            Notification.vendor_id

            ==

            vendor.vendor_id

        )

        .order_by(

            desc(

                Notification.created_at

            )

        )

        .all()

    )

    return {

        "notifications":[

            {

                "notification_id":

                str(

                    item.notification_id

                ),

                "title":

                item.title,

                "message":

                item.message,

                "is_read":

                item.is_read,

                "created_at":

                item.created_at

            }

            for item

            in notifications

        ]

    }


# ==========================================
# MARK READ
# ==========================================

@router.put(

    "/notifications/{notification_id}"

)
def mark_notification_read_api(

    notification_id: UUID,

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            [

                "vendor"

            ]

        )

    )

):

    vendor_data=(

        get_current_vendor_profile_service(

            db=db,

            current_user=current_user

        )

    )

    vendor=vendor_data["vendor"]

    notification=(

        db.query(

            Notification

        )

        .filter(

            Notification.notification_id

            ==

            notification_id,

            Notification.vendor_id

            ==

            vendor.vendor_id

        )

        .first()

    )

    if not notification:

        return {

            "success":False,

            "message":

            "Notification not found"

        }

    notification.is_read=True

    db.commit()

    return {

        "success":True

    }

# ==========================================
# SEARCH
# ==========================================

@router.get(

    "/search",

    response_model=VendorListResponse

)
def search_vendors_api(

    query: str | None = None,

    city: str | None = None,

    category: str | None = None,

    min_price: int | None = None,

    max_price: int | None = None,

    rating: float | None = None,

    min_reviews: int | None = None,

    available: bool | None = None,

    verified: bool | None = None,

    sort_by: str | None = None,

    page: int = 1,

    limit: int = 10,

    db: Session = Depends(

        get_db

    )

):

    return search_vendors_service(

        db=db,

        query=query,

        city=city,

        category=category,

        min_price=min_price,

        max_price=max_price,

        rating=rating,

        min_reviews=min_reviews,

        available=available,

        verified=verified,

        sort_by=sort_by,

        page=page,

        limit=limit

    )

# ==========================================
# RECOMMENDATIONS
# ==========================================

@router.get(
    "/recommendations"
)
def get_recommendations_api(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        require_role(
            [
                "user",
                "vendor",
                "admin"
            ]
        )
    )

):

    vendors=(

        db.query(
            Vendor
        )

        .filter(
            Vendor.is_active==True
        )

        .order_by(
            desc(
                Vendor.avg_rating
            )
        )

        .limit(
            10
        )

        .all()

    )

    return {

        "vendors":

        vendors

    }
# ==========================================
# USER PREFERENCES
# ==========================================

@router.get(
    "/preferences/me"
)
def get_my_preferences_api(

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        require_role(
            [
                "user",
                "vendor",
                "admin"
            ]
        )
    )

):

    preference = (
        UserPreferenceService.get_user_preferences(
            db=db,
            user_id=current_user.user_id
        )
    )

    if not preference:

        return {
            "success": True,
            "preferences": None
        }

    return {
        "success": True,
        "preferences": {
            "preferred_category":
                preference.preferred_category,

            "preferred_city":
                preference.preferred_city,

            "preferred_price_range":
                preference.preferred_price_range,

            "preferred_event_type":
                preference.preferred_event_type,

            "preferred_min_rating":
                preference.preferred_min_rating,

            "favorite_vendor_id":
                (
                    str(
                        preference.favorite_vendor_id
                    )
                    if preference.favorite_vendor_id
                    else None
                )
        }
    }

# ==========================================
# UPDATE USER PREFERENCES
# ==========================================

@router.put(
    "/preferences/me"
)
def update_my_preferences_api(

    category: str | None = None,

    city: str | None = None,

    event_type: str | None = None,

    price_range: str | None = None,

    min_rating: float | None = None,

    vendor_id: UUID | None = None,

    db: Session = Depends(
        get_db
    ),

    current_user: User = Depends(
        require_role(
            [
                "user",
                "vendor",
                "admin"
            ]
        )
    )

):

    preference = (

        UserPreferenceService.create_or_update_preferences(

            db=db,

            user_id=current_user.user_id,

            category=category,

            city=city,

            event_type=event_type,

            vendor_id=vendor_id,

            price_range=price_range,

            min_rating=min_rating
        )

    )

    return {

        "success": True,

        "preferences": {

            "preferred_category":
                preference.preferred_category,

            "preferred_city":
                preference.preferred_city,

            "preferred_price_range":
                preference.preferred_price_range,

            "preferred_event_type":
                preference.preferred_event_type,

            "preferred_min_rating":
                preference.preferred_min_rating,

            "favorite_vendor_id":
                (
                    str(
                        preference.favorite_vendor_id
                    )
                    if preference.favorite_vendor_id
                    else None
                )
        }
    }

# ==========================================
# SINGLE
# ==========================================

@router.get(

    "/{vendor_id}",

    response_model=VendorDetailResponse

)
def get_single_vendor_api(

    vendor_id: UUID,

    db: Session = Depends(

        get_db

    )

):

    return get_single_vendor_service(

        db=db,

        vendor_id=vendor_id

    )


# ==========================================
# ALL
# ==========================================

@router.get(

    "/",

    response_model=VendorListResponse

)
def get_all_vendors_api(

    db: Session = Depends(

        get_db

    )

):

    return get_all_vendors_service(

        db=db

    )


# ==========================================
# DELETE
# ==========================================

@router.delete(

    "/{vendor_id}"

)
def deactivate_vendor_api(

    vendor_id: UUID,

    db: Session = Depends(

        get_db

    ),

    current_user: User = Depends(

        require_role(

            [

                "admin",

                "vendor"

            ]

        )

    )

):

    return deactivate_vendor_service(

        db=db,

        vendor_id=vendor_id

    )