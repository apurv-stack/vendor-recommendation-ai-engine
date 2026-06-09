from typing import Dict
from typing import Any


class FilterGenerator:

    DEFAULT_FILTER = {

        "category": None,

        "location": None,

        "event_type": None,

        "budget_min": None,

        "budget_max": None,

        "rating_min": None,

        "rating_max": None,

        "guest_count": None,

        "vendor_quality": None,

        "pricing_preference": None,

        "cuisine": None,

        "service_style": None,

        "service_request": False,

        "comparison_request": False,

        "vendor_names": []
    }

    @classmethod
    def generate(

        cls,

        filters: Dict[str, Any]

    ) -> Dict[str, Any]:

        structured_filter = dict(

            cls.DEFAULT_FILTER

        )

        # -----------------------------
        # CATEGORY
        # -----------------------------

        structured_filter["category"] = (

            filters.get("category")

        )

        # -----------------------------
        # LOCATION
        # -----------------------------

        structured_filter["location"] = (

            filters.get("city")

        )

        # -----------------------------
        # EVENT
        # -----------------------------

        structured_filter["event_type"] = (

            filters.get("event_type")

        )

        # -----------------------------
        # BUDGET
        # -----------------------------

        if filters.get("budget"):

            structured_filter["budget_max"] = (

                filters["budget"]

            )

        # -----------------------------
        # RATING
        # -----------------------------

        if filters.get("rating"):

            structured_filter["rating_min"] = (

                filters["rating"]

            )

        # -----------------------------
        # QUALITY
        # -----------------------------

        structured_filter["vendor_quality"] = (

            filters.get(

                "vendor_quality"

            )

        )

        # -----------------------------
        # PRICING
        # -----------------------------

        structured_filter[

            "pricing_preference"

        ] = filters.get(

            "pricing_preference"

        )

        # -----------------------------
        # GUEST COUNT
        # -----------------------------

        structured_filter["guest_count"] = (

            filters.get(

                "guest_count"

            )

        )

        # -----------------------------
        # CUISINE
        # -----------------------------

        structured_filter["cuisine"] = (

            filters.get(

                "cuisine"

            )

        )

        # -----------------------------
        # SERVICE STYLE
        # -----------------------------

        structured_filter["service_style"] = (

            filters.get(

                "service_style"

            )

        )

        # -----------------------------
        # FLAGS
        # -----------------------------

        structured_filter["service_request"] = (

            filters.get(

                "service_request",

                False

            )

        )

        structured_filter["comparison_request"] = (

            filters.get(

                "comparison_request",

                False

            )

        )

        # -----------------------------
        # VENDOR NAMES
        # -----------------------------

        structured_filter["vendor_names"] = (

            filters.get(

                "vendor_names",

                []

            )

        )

        return structured_filter