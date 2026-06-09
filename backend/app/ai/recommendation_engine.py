from sqlalchemy.orm import (
    Session
)


class RecommendationEngine:

    MAX_RESULTS = 5

    @staticmethod
    def calculate_budget_fit_score(

        vendor,

        budget

    ):
        
        try:
            budget = int(budget) if budget is not None else None
        except (ValueError, TypeError):
            budget = None

        if not budget:
            return 25

        min_price = getattr(vendor, "price_min", 0) or 0
        max_price = getattr(vendor, "price_max", 0) or 0

        if not min_price or not max_price:
            return 10

        if min_price <= budget <= max_price:
            return 50

        if max_price <= budget:
            return 40

        if min_price <= budget:
            return 25

        return 0


    @staticmethod
    def calculate_quality_score(

        vendor

    ):

        rating = getattr(
            vendor,
            "avg_rating",
            0
        ) or 0

        reviews = getattr(
            vendor,
            "review_count",
            0
        ) or 0

        # New vendor protection
        if reviews == 0:

            return 15

        rating_score = (

            rating / 5

        ) * 20

        if reviews >= 200:

            confidence_bonus = 10

        elif reviews >= 100:

            confidence_bonus = 7
        
        elif reviews >= 50:

            confidence_bonus = 5

        elif reviews >= 20:

            confidence_bonus = 3

        else:

            confidence_bonus = 0

        
        return (

            rating_score
            +
            confidence_bonus

        )


    @staticmethod
    def calculate_trust_score(

        vendor

    ):

        if getattr(

            vendor,

            "is_verified",

            False

        ):

            return 10

        return 0


    @staticmethod
    def calculate_activity_score(

        vendor

    ):

        followers = getattr(

            vendor,

            "followers_count",

            0

        ) or 0

        views = getattr(

            vendor,

            "profile_views",

            0

        ) or 0

        engagement = getattr(

            vendor,

            "engagement_score",

            0

        ) or 0

        followers_score = min(

            followers,

            100

        ) * 0.02

        views_score = min(

            views,

            1000

        ) * 0.002

        engagement_score = min(

            engagement,

            100

        ) * 0.05

        return (

            followers_score
            +
            views_score
            +
            engagement_score

        )


    @staticmethod
    def calculate_vendor_score(

        vendor,

        filters,

        context=None

    ):

        budget = filters.get(

            "budget"

        )

        budget_score = (

            RecommendationEngine

            .calculate_budget_fit_score(

                vendor,

                budget

            )

        )

        quality_score = (

            RecommendationEngine

            .calculate_quality_score(

                vendor

            )

        )

        trust_score = (

            RecommendationEngine

            .calculate_trust_score(

                vendor

            )

        )

        activity_score = (

            RecommendationEngine

            .calculate_activity_score(

                vendor

            )

        )

        return (

            budget_score
            +
            quality_score
            +
            trust_score
            +
            activity_score

        )
    
    @staticmethod
    def calculate_budget_relevance(
        vendor,
        filters
    ):

        try:
            budget = int(filters.get("budget")) if filters.get("budget") is not None else None
        except (ValueError, TypeError):
            budget = None

        if not budget:
            return 30

        min_price = getattr(vendor, "price_min", None) or 0
        max_price = getattr(vendor, "price_max", None) or 0

        if not min_price or not max_price:
            return 10

        if min_price <= budget <= max_price:
            return 30

        if budget > max_price:
            return 20

        return 0


    @staticmethod
    def calculate_pricing_relevance(vendor, filters):

        preference = filters.get("pricing_preference")

    # SAFE UNWRAP
        if isinstance(preference, list):
            preference = preference[0] if preference else None

        if not preference:
            return 25

        text = (
            f"{vendor.name or ''} "
            f"{vendor.description or ''}"
        ).lower()

        keywords = {

            "premium": [
                "premium",
                "luxury"
            ],

            "luxury": [
                "premium",
                "luxury"
            ],

            "budget": [
                "budget",
                "cheap",
                "affordable"
            ],

            "cheap": [
                "budget",
                "cheap",
                "affordable"
            ],

            "affordable": [
                "budget",
                "cheap",
                "affordable"
            ]
        }

        allowed = keywords.get(
            preference,
            []
        )

        if any(
            word in text
            for word in allowed
        ):
            return 25

        return 0


    @staticmethod
    def calculate_cuisine_relevance(
        vendor,
        filters
    ):

        cuisine = filters.get(
            "cuisine"
        )

        if not cuisine:
            return 20

        services = []

        for team in getattr(
            vendor,
            "managed_teams",
            []
        ):

            services.extend(
                getattr(
                    team,
                    "service_records",
                    []
                )
            )

        if not services:
            return 10

        cuisine = cuisine.lower()

        for service in services:

            service_name = (
                getattr(
                    service,
                    "service_name",
                    ""
                )
                .lower()
            )

            if cuisine in service_name:
                return 20

        return 0


    @staticmethod
    def calculate_preference_relevance(vendor, context, filters):

        preference = context.get("user_preferences")

        if not preference:
            return 15

        score = 0

        preferred_city = getattr(preference, "preferred_city", None)
        preferred_category = getattr(preference, "preferred_category", None)
        preferred_event_type = getattr(preference, "preferred_event_type", None)

    # SAFE UNWRAP - guard against list values from LLM
        def safe_str(val):
            if isinstance(val, list):
                return val[0].lower() if val else None
            return val.lower() if val else None

        category_filter = safe_str(filters.get("category"))
        event_filter = safe_str(filters.get("event_type"))

    # CITY MATCH
        if (
            preferred_city
            and vendor.city
            and preferred_city.lower() == vendor.city.lower()
        ):
            score += 5

    # CATEGORY MATCH
        if (
            preferred_category
            and category_filter
            and preferred_category.lower() == category_filter
        ):
            score += 7

    # EVENT TYPE MATCH
        if (
            preferred_event_type
            and event_filter
            and preferred_event_type.lower() == event_filter
        ):
            score += 3

        return score


    @staticmethod
    def calculate_availability_relevance(
        vendor
    ):

        available = getattr(
            vendor,
            "is_available",
            None
        )

        if available is True:
            return 10

        if available is False:
            return 0

        return 5


    @staticmethod
    def calculate_relevance_score(
        vendor,
        filters,
        context
    ):

        return (

            RecommendationEngine
            .calculate_budget_relevance(
                vendor,
                filters
            )

            +

            RecommendationEngine
            .calculate_pricing_relevance(
                vendor,
                filters
            )

            +

            RecommendationEngine
            .calculate_cuisine_relevance(
                vendor,
                filters
            )

            +

            RecommendationEngine
            .calculate_preference_relevance(
                vendor,
                context,
                filters
            )

            +

            RecommendationEngine
            .calculate_availability_relevance(
                vendor
            )

        )


    @staticmethod
    def calculate_final_score(
        vendor,
        filters,
        context
    ):

        relevance_score = (
            RecommendationEngine
            .calculate_relevance_score(
                vendor,
                filters,
                context
            )
        )

        vendor_score = (
            RecommendationEngine
            .calculate_vendor_score(
                vendor,
                filters
            )
        )

        return (

            relevance_score * 0.60

        ) + (

            vendor_score * 0.40

        )

    @staticmethod
    def get_recommendations(

        db: Session,

        context: dict,

        filters: dict

    ):

        recommendations = {}

        vendors = (

            context.get(

                "vendors",

                []

            )

        )

        if vendors:

            recommendations[

                "vendors"

            ] = (

                RecommendationEngine

                .rank_vendors(

                    vendors,

                    filters,

                    context

                )

            )

        categories = (

            context.get(

                "categories",

                []

            )

        )

        if categories:

            recommendations[

                "categories"

            ] = categories[:10]

        return {

            "recommendations":

            recommendations,

            "metadata": {

                "total_vendors":

                len(

                    recommendations.get(

                        "vendors",

                        []

                    )

                )

            }

        }

    @staticmethod
    def rank_vendors(vendors, filters, context):
        rankable = vendors 

        def safe_score(vendor):
            try:
                relevance = RecommendationEngine.calculate_relevance_score(vendor, filters, context)
                vs = RecommendationEngine.calculate_vendor_score(vendor, filters)
                final = (relevance * 0.60) + (vs * 0.40)
                vendor.match_score = round(final)
                return final
            except Exception as e:
                print(f"SCORING ERROR for vendor '{getattr(vendor, 'name', '?')}': {e}")
                return 0

        ranked = sorted(rankable, key=safe_score, reverse=True)

        print("RANKED VENDORS:", [v.name for v in ranked])

        return ranked[:RecommendationEngine.MAX_RESULTS]