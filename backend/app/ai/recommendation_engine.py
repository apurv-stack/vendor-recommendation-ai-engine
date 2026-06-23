from sqlalchemy.orm import (
    Session
)


class RecommendationEngine:

    MAX_RESULTS = 10

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
            return 50

        min_price = getattr(vendor, "price_min", None) or 0
        max_price = getattr(vendor, "price_max", None) or 0

        if not min_price or not max_price:
            return 30

    # Perfect fit — vendor range contains the budget
        if min_price <= budget <= max_price:
            return 100

    # Vendor is fully under budget (affordable)
        if max_price < budget:
            overshoot = (budget - max_price) / budget
            if overshoot <= 0.2:
                return 80
            return 60

    # Vendor starts above budget — how far over?
        over_by = (min_price - budget) / budget
        if over_by <= 0.10:
            return 70   # just slightly above, still show
        if over_by <= 0.25:
            return 40
        if over_by <= 0.50:
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
    def calculate_location_score(vendor, context):
        preference = context.get("user_preferences")
        if not preference:
            return 0
        preferred_city = getattr(preference, "preferred_city", None)
        vendor_city = getattr(vendor, "city", None)
        if preferred_city and vendor_city:
            if preferred_city.lower() == vendor_city.lower():
                return 100
        return 0

    CATEGORY_SYNONYMS = {
        "photography": ["photography", "photographer", "photo", "wedding photography",
                        "candid photography", "cinematography", "videography", "photos"],
        "catering":    ["catering", "caterer", "caterers", "food", "meals",
                        "buffet", "catered", "chef", "cuisine"],
        "decoration":  ["decoration", "decorator", "decorators", "decor", "floral",
                        "flowers", "theme decoration", "stage decoration", "styling"],
        "venue":       ["venue", "venues", "hall", "banquet", "farmhouse", "resort",
                        "location", "lawn", "garden venue", "banquet hall"],
        "entertainment": ["entertainment", "entertainer", "anchor", "host", "comedian",
                        "performer", "dance", "live entertainment"],
        "dj":           ["dj", "disc jockey", "music", "sound", "audio", "beats"],
        "music":        ["music", "musician", "band", "singer", "live music", "orchestra"],
    }

    @staticmethod
    def normalize_category(raw: str) -> str:
        if not raw:
            return ""
        raw_lower = raw.strip().lower()
        for canonical, synonyms in RecommendationEngine.CATEGORY_SYNONYMS.items():
            if raw_lower in synonyms:
                return canonical
        return raw_lower

    @staticmethod
    def calculate_category_score(vendor, filters):
        category = filters.get("category")
        if not category:
            return 50

        query_norm = RecommendationEngine.normalize_category(category)

    # Check vendor's direct category field first
        vendor_category = getattr(vendor, "category", "") or ""
        vendor_norm = RecommendationEngine.normalize_category(vendor_category)

        if vendor_norm == query_norm:
            return 100
        if vendor_norm in query_norm or query_norm in vendor_norm:
            return 75

    # Fallback: check managed_teams name
        teams = getattr(vendor, "managed_teams", []) or []
        for team in teams:
            team_name = team["name"] if isinstance(team, dict) else getattr(team, "name", "") or ""
            team_norm = RecommendationEngine.normalize_category(team_name)
            if team_norm == query_norm:
                return 100
            if team_norm in query_norm or query_norm in team_norm:
                return 75

        # Fallback: check vendor name for category terms
        vendor_name = getattr(vendor, "name", "") or ""
        vendor_desc = getattr(vendor, "description", "") or ""
        synonyms = RecommendationEngine.CATEGORY_SYNONYMS.get(query_norm, [query_norm])
        combined = (vendor_name + " " + vendor_desc).lower()
        for syn in synonyms:
            if syn in combined:
                return 60
        return 0

    @staticmethod
    def calculate_rating_score(vendor):
        rating = getattr(vendor, "avg_rating", 0) or 0
        return (rating / 5) * 100

    @staticmethod
    def calculate_review_score(vendor):
        reviews = getattr(vendor, "review_count", 0) or 0
        if reviews >= 200:
            return 100
        elif reviews >= 100:
            return 80
        elif reviews >= 50:
            return 60
        elif reviews >= 20:
            return 40
        elif reviews > 0:
            return 20
        return 10

    @staticmethod
    def calculate_verification_score(vendor):
        return 100 if getattr(vendor, "is_verified", False) else 0

    @staticmethod
    def calculate_availability_score(vendor):
        available = getattr(vendor, "is_available", None)
        if available is True:
            return 100
        if available is False:
            return 0
        return 50

    CATEGORY_WEIGHTS = {
        "photography": {
            "category": 0.25,
            "budget":   0.10,
            "location": 0.10,
            "rating":   0.30,  # rating & portfolio matters most
            "reviews":  0.20,
            "verified": 0.03,
            "available": 0.02,
        },
        "catering": {
            "category": 0.25,
            "budget":   0.30,  # budget & capacity matters most
            "location": 0.10,
            "rating":   0.15,
            "reviews":  0.15,
            "verified": 0.03,
            "available": 0.02,
        },
        "venue": {
            "category": 0.25,
            "budget":   0.20,
            "location": 0.30,  # location matters most for venue
            "rating":   0.12,
            "reviews":  0.08,
            "verified": 0.03,
            "available": 0.02,
        },
        "decoration": {
            "category": 0.25,
            "budget":   0.15,
            "location": 0.10,
            "rating":   0.28,  # visual quality = rating driven
            "reviews":  0.17,
            "verified": 0.03,
            "available": 0.02,
        },
        "dj": {
            "category": 0.25,
            "budget":   0.15,
            "location": 0.10,
            "rating":   0.28,
            "reviews":  0.17,
            "verified": 0.03,
            "available": 0.02,
        },
        "entertainment": {
            "category": 0.25,
            "budget":   0.12,
            "location": 0.10,
            "rating":   0.30,
            "reviews":  0.18,
            "verified": 0.03,
            "available": 0.02,
        },
        "music": {
            "category": 0.25,
            "budget":   0.12,
            "location": 0.10,
            "rating":   0.30,
            "reviews":  0.18,
            "verified": 0.03,
            "available": 0.02,
        },
        # default — original mentor formula
        "default": {
            "category": 0.35,
            "budget":   0.20,
            "location": 0.15,
            "rating":   0.15,
            "reviews":  0.10,
            "verified": 0.03,
            "available": 0.02,
        },
    }

    @staticmethod
    def calculate_final_score(vendor, filters, context):

        category_score  = RecommendationEngine.calculate_category_score(vendor, filters)
        budget_score    = RecommendationEngine.calculate_budget_relevance(vendor, filters)
        location_score  = RecommendationEngine.calculate_location_score(vendor, context)
        rating_score    = RecommendationEngine.calculate_rating_score(vendor)
        review_score    = RecommendationEngine.calculate_review_score(vendor)
        verify_score    = RecommendationEngine.calculate_verification_score(vendor)
        avail_score     = RecommendationEngine.calculate_availability_score(vendor)

        # Pick category-specific weights, fall back to default
        category = filters.get("category", "")
        category_norm = RecommendationEngine.normalize_category(category)
        w = RecommendationEngine.CATEGORY_WEIGHTS.get(
            category_norm,
            RecommendationEngine.CATEGORY_WEIGHTS["default"]
        )

        # Admin config override — if ranking_config present in context, apply it
        ranking_config = context.get("ranking_config", {}) if context else {}
        if ranking_config:
            w = dict(w)  # copy so we don't mutate the class-level dict
            if "rating_weight" in ranking_config:
                w["rating"] = ranking_config["rating_weight"] / 100
            if "review_weight" in ranking_config:
                w["reviews"] = ranking_config["review_weight"] / 100
            if "budget_weight" in ranking_config:
                w["budget"] = ranking_config["budget_weight"] / 100
            if "availability_weight" in ranking_config:
                w["available"] = ranking_config["availability_weight"] / 100
            if ranking_config.get("availability_priority"):
                w["available"] = 0.40
                w["rating"] = max(w.get("rating", 0.15) - 0.20, 0.05)

        final = (
            (category_score * w["category"]) +
            (budget_score   * w["budget"])   +
            (location_score * w["location"]) +
            (rating_score   * w["rating"])   +
            (review_score   * w["reviews"])  +
            (verify_score   * w["verified"]) +
            (avail_score    * w["available"])
        )

        return round(final, 2)

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
    def rank_vendors(vendors, filters, context, max_results=None):
        rankable = vendors

        def safe_score(vendor):
            try:
                final = RecommendationEngine.calculate_final_score(vendor, filters, context)
                vendor.match_score = min(100, round(final))
                return final
            except Exception as e:
                print(f"SCORING ERROR for vendor '{getattr(vendor, 'name', '?')}': {e}")
                return 0

        ranked = sorted(rankable, key=safe_score, reverse=True)

        print("RANKED VENDORS:", [v.name for v in ranked])

        limit = max_results if max_results is not None else RecommendationEngine.MAX_RESULTS
        return ranked[:limit]