class RecommendationFormatter:

    @staticmethod
    def build_reason(vendor, filters):

        category = filters.get(
            "category"
        )

        pricing = filters.get(
            "pricing_preference"
        )

        rating = getattr(
            vendor,
            "avg_rating",
            0
        ) or 0

        review_count = getattr(
            vendor,
            "review_count",
            0
        ) or 0

        if pricing == "premium":

            return (
                "Premium vendor matching your requirements"
            )

        if pricing == "budget":

            return (
                "Budget-friendly option within your range"
            )

        if rating >= 4.5:

            return (
                f"Highly rated {category} vendor with excellent customer reviews"
            )

        if review_count >= 20:

            return (
                f"Popular {category} vendor with strong customer engagement"
            )

        return (
            f"Recommended {category} vendor based on your search"
        )

    @staticmethod
    def format_vendor(vendor, filters=None):

        filters = filters or {}

        category = filters.get(
            "category"
        )

        if category:

            category = category.title()

        else:

            teams = getattr(
                vendor,
                "managed_teams",
                []
            ) or []

            category = (
                teams[0].name
                if teams
                else None
            )

        print(
            "FORMATTER:",
            vendor.name,
            getattr(
                vendor,
                "match_score",
                "MISSING"
            )
        )

        return {

            "vendor_id": str(
                vendor.vendor_id
            ),

            "vendor_name": vendor.name,

            "category": category,

            "city": vendor.city,

            "rating": float(
                getattr(
                    vendor,
                    "avg_rating",
                    0
                ) or 0
            ),

            "review_count": int(
                getattr(
                    vendor,
                    "review_count",
                    0
                ) or 0
            ),

            "price_min": vendor.price_min,

            "price_max": vendor.price_max,

            "price_range": (
                f"₹{vendor.price_min:,} - ₹{vendor.price_max:,}"
                if vendor.price_min
                and vendor.price_max
                else None
            ),

            "vendor_description": getattr(
                vendor,
                "description",
                None
            ),

            "recommendation_reason":
                RecommendationFormatter.build_reason(
                    vendor,
                    filters
                ),

            "match_score": int(
                getattr(
                    vendor,
                    "match_score",
                    0
                )
            ),

            "featured_badge":
            (
                "Top Rated"
                if getattr(
                    vendor,
                    "avg_rating",
                    0
                ) >= 4.5
                else None
            )
        }

    @staticmethod
    def format_vendors(vendors, filters=None):

        return [

        RecommendationFormatter.format_vendor(
            vendor,
            filters
        )

        for vendor in vendors
    ]
