from sqlalchemy.orm import Session

from app.models.user_preference import UserPreference


class UserPreferenceService:

    @staticmethod
    def get_user_preferences(
        db: Session,
        user_id
    ):

        return (

            db.query(
                UserPreference
            )

            .filter(
                UserPreference.user_id == user_id
            )

            .first()
        )

    @staticmethod
    def create_or_update_preferences(
        db: Session,
        user_id,
        category=None,
        city=None,
        event_type=None,
        vendor_id=None,
        price_range=None,
        min_rating=None
    ):

        preference = (

            db.query(
                UserPreference
            )

            .filter(
                UserPreference.user_id == user_id
            )

            .first()
        )

        if not preference:

            preference = UserPreference(

                user_id=user_id,

                preferred_category=category,

                preferred_city=city,

                preferred_event_type=event_type,

                favorite_vendor_id=vendor_id,

                preferred_price_range=price_range,

                preferred_min_rating=(
                    float(min_rating)
                    if min_rating is not None
                    else None
                )
            )

            db.add(
                preference
            )

        else:

            if category:

                preference.preferred_category = (
                    category
                )

            if city:

                preference.preferred_city = (
                    city
                )

            if event_type:

                preference.preferred_event_type = (
                    event_type
                )

            if vendor_id:

                preference.favorite_vendor_id = (
                    vendor_id
                )

            if price_range:

                preference.preferred_price_range = (
                    price_range
                )

            if min_rating is not None:

                preference.preferred_min_rating = (
                    float(min_rating)
                )  

        db.commit()

        db.refresh(
            preference
        )

        return preference

    @staticmethod
    def learn_from_chat(
        db: Session,
        user_id,
        filters: dict
    ):

        if not filters:

            return None

        return UserPreferenceService.create_or_update_preferences(

            db=db,

            user_id=user_id,

            category=filters.get(
                "category"
            ),

            city=filters.get(
                "city"
            ),

            event_type=filters.get(
                "event_type"
            ),

            price_range=(
                str(
                    filters.get(
                        "budget"
                    )
                )
                if filters.get(
                    "budget"
                )
                else None
            ),

            min_rating=filters.get(
                "rating"
            )
        )

    @staticmethod
    def learn_from_vendor_view(
        db: Session,
        user_id,
        vendor_id
    ):

        return UserPreferenceService.create_or_update_preferences(

            db=db,

            user_id=user_id,

            vendor_id=vendor_id
        )