from typing import Dict
from typing import Any


class QueryTransformer:

    @classmethod
    def transform(
        cls,
        filters: Dict[str, Any]
    ) -> Dict[str, Any]:

        transformed = {}

        # ----------------------------------
        # CATEGORY
        # ----------------------------------

        if filters.get("category"):

            transformed["category"] = (
                filters["category"]
            )

        # ----------------------------------
        # LOCATION
        # ----------------------------------

        if filters.get("city"):

            transformed["city"] = (
                filters["city"]
            )

        # ----------------------------------
        # BUDGET
        # ----------------------------------

        if filters.get("budget"):

            transformed["max_budget"] = (
                filters["budget"]
            )

        # ----------------------------------
        # EVENT TYPE
        # ----------------------------------

        if filters.get("event_type"):

            transformed["event_type"] = (
                filters["event_type"]
            )

        # ----------------------------------
        # GUEST COUNT
        # ----------------------------------

        if filters.get("guest_count"):

            transformed["guest_count"] = (
                filters["guest_count"]
            )

        # ----------------------------------
        # CUISINE
        # ----------------------------------

        if filters.get("cuisine"):

            transformed["cuisine"] = (
                filters["cuisine"]
            )

        # ----------------------------------
        # RATING
        # ----------------------------------

        if filters.get("rating"):

            transformed["min_rating"] = (
                filters["rating"]
            )

        # ----------------------------------
        # VENDOR QUALITY
        # ----------------------------------

        if filters.get("vendor_quality"):

            transformed["vendor_quality"] = (
                filters["vendor_quality"]
            )

        # ----------------------------------
        # VENDOR NAMES
        # ----------------------------------

        if filters.get("vendor_names"):

            transformed["vendor_names"] = (
                filters["vendor_names"]
            )

        # ----------------------------------
        # PRICING PREFERENCE
        # ----------------------------------

        if filters.get(
            "pricing_preference"
        ):

            transformed[
                "pricing_preference"
            ] = filters[
                "pricing_preference"
            ]

        # ----------------------------------
        # SERVICE STYLE
        # ----------------------------------

        if filters.get(
            "service_style"
        ):

            transformed[
                "service_style"
            ] = filters[
                "service_style"
            ]

        # ----------------------------------
        # SEARCH FLAGS
        # ----------------------------------

        transformed[
            "service_request"
        ] = filters.get(
            "service_request",
            False
        )

        transformed[
            "comparison_request"
        ] = filters.get(
            "comparison_request",
            False
        )

        return transformed

    @classmethod
    def build_search_payload(
        cls,
        filters: Dict[str, Any]
    ) -> Dict[str, Any]:

        payload = cls.transform(
            filters
        )

        # ----------------------------------
        # SEARCH MODE
        # ----------------------------------

        payload[
            "search_mode"
        ] = "ai"

        # ----------------------------------
        # COMPARISON MODE
        # ----------------------------------

        if payload.get(
            "comparison_request"
        ):

            payload[
                "search_mode"
            ] = "comparison"

        return payload