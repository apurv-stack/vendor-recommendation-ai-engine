import re

from app.ai.query_parser import (
    QueryParser
)


class IntentExtractor:

    COMPARISON = {

        "compare",
        "comparison",
        "difference",
        "better",
        "vs",
        "versus"

    }

    PRICING = {

        "price",
        "pricing",
        "budget",
        "cheap",
        "premium",
        "luxury",
        "cost",
        "affordable",
        "economical"

    }

    CATEGORY = {

        "category",
        "categories"

    }

    REVIEW = {

        "rating",
        "review",
        "reviews",
        "best",
        "top",
        "highest",
        "recommended"
    }

    QUALITY = {

        "best",
        "top",
        "trusted",
        "experienced",
        "highest",
        "recommended",
        "top rated",
        "highly rated"
    }

    AVAILABILITY = {

        "available",
        "availability"

    }

    ANALYTICS = {

        "analytics",
        "trend",
        "statistics",
        "insights"

    }

    SAVED = {

        "saved",
        "wishlist",
        "bookmark"

    }

    SESSION = {

        "history",
        "previous",
        "earlier",
        "conversation",
        "context",
        "session",
        "chat",
        "discussed",
        "before"
    }

    SERVICE = {

        "service",
        "services",
        "provide",
        "provides",
        "offering",
        "offer",
        "facilities"
    }

    COMPARE_PATTERNS = [

        r"\bcompare\b",

        r"\bvs\b",

        r"\bversus\b",

        r"\bbetter\b",

        r"\bdifference\b"
    ]

    @staticmethod
    def extract(
        query: str
    ):

        query_lower = (
            query
            .lower()
            .strip()
        )

        filters = (
            QueryParser
            .extract_filters(
                query
            )
        )

        vendor_names = (
            IntentExtractor
            ._extract_vendor_names(
                query
            )
        )

        if len(vendor_names) >= 2:

            filters[
                "comparison_request"
            ] = True

            filters[
                "vendor_names"
            ] = vendor_names

        tokens = set(

            re.findall(
                r"\w+",
                query_lower
            )

        )

        intent_data = (
            IntentExtractor
            .detect_intent(
                query_lower,
                tokens,
                filters
            )
        )

        return {

            "intent":
            intent_data["intent"],

            "secondary_intents":
            intent_data["secondary_intents"],

            "confidence":
            intent_data["confidence"],

            "filters":
            filters
        }

    @staticmethod
    def detect_intent(
        query: str,
        tokens: set,
        filters: dict
    ):

        secondary_intents = []

        confidence = 0.70

        # ----------------------------------
        # COMPARISON QUERY
        # ----------------------------------

        if filters.get(
            "comparison_request"
        ):

            if filters.get(
                "pricing_preference"
            ):
                secondary_intents.append(
                    "pricing_query"
                )

            return {

                "intent":
                "comparison_query",

                "secondary_intents":
                secondary_intents,

                "confidence":
                0.99
            }

        for pattern in (
            IntentExtractor
            .COMPARE_PATTERNS
        ):

            if re.search(
                pattern,
                query
            ):

                return {

                    "intent":
                    "comparison_query",

                    "secondary_intents":
                    secondary_intents,

                    "confidence":
                    0.99
                }

        # ----------------------------------
        # SERVICE QUERY
        # ----------------------------------

        if filters.get(
            "service_request"
        ):

            return {

                "intent":
                "service_query",

                "secondary_intents":
                secondary_intents,

                "confidence":
                0.98
            }

        # ----------------------------------
        # QUALITY QUERY
        # ----------------------------------

        if any(
            term in query
            for term
            in IntentExtractor.QUALITY
        ):

            secondary_intents.append(
                "vendor_recommendation"
            )

            return {

                "intent":
                "quality_query",

                "secondary_intents":
                secondary_intents,

                "confidence":
                0.95
            }

        # ----------------------------------
        # REVIEW QUERY
        # ----------------------------------

        if tokens & (
            IntentExtractor
            .REVIEW
        ):

            return {

                "intent":
                "review_query",

                "secondary_intents":
                secondary_intents,

                "confidence":
                0.95
            }

        # ----------------------------------
        # PRICING QUERY
        # ----------------------------------

        if tokens & (
            IntentExtractor
            .PRICING
        ):

            if filters.get(
                "category"
            ):

                secondary_intents.append(
                    "vendor_recommendation"
                )

            return {

                "intent":
                "pricing_query",

                "secondary_intents":
                secondary_intents,

                "confidence":
                0.92
            }

        # ----------------------------------
        # CATEGORY QUERY
        # ----------------------------------

        if tokens & (
            IntentExtractor
            .CATEGORY
        ):

            return {

                "intent":
                "category_query",

                "secondary_intents":
                secondary_intents,

                "confidence":
                0.90
            }

        # ----------------------------------
        # AVAILABILITY
        # ----------------------------------

        if tokens & (
            IntentExtractor
            .AVAILABILITY
        ):

            return {

                "intent":
                "availability_query",

                "secondary_intents":
                secondary_intents,

                "confidence":
                0.90
            }

        # ----------------------------------
        # ANALYTICS
        # ----------------------------------

        if tokens & (
            IntentExtractor
            .ANALYTICS
        ):

            return {

                "intent":
                "analytics_query",

                "secondary_intents":
                secondary_intents,

                "confidence":
                0.90
            }

        # ----------------------------------
        # SAVED VENDORS
        # ----------------------------------

        if tokens & (
            IntentExtractor
            .SAVED
        ):

            return {

                "intent":
                "saved_vendor_query",

                "secondary_intents":
                secondary_intents,

                "confidence":
                0.90
            }
        
        # ----------------------------------
        # SESSION QUERY
        # ----------------------------------
        SESSION_STRONG = {
            "history",
            "previous",
            "earlier",
            "discussed",
            "before",
            "last time",
            "we talked",
            "you said",
            "remember"
        }
        
        if tokens & SESSION_STRONG:

            return {

                "intent":
                "session_query",

                "secondary_intents":
                secondary_intents,

                "confidence":
                0.95
            }

        # ----------------------------------
        # RECOMMENDATION
        # ----------------------------------

        recommendation_signals = [

            "category",

            "budget",

            "city",

            "guest_count",

            "cuisine",

            "event_type"
        ]

        if any(

            filters.get(
                field
            )

            for field in recommendation_signals

        ):

            return {

                "intent":
                "vendor_recommendation",

                "secondary_intents":
                secondary_intents,

                "confidence":
                0.95
            }

        # ----------------------------------
        # GENERIC
        # ----------------------------------

        return {

            "intent":
            "generic_platform_query",

            "secondary_intents":
            secondary_intents,

            "confidence":
            confidence
        }

    @staticmethod
    def _extract_vendor_names(
        query: str
    ):

        lowered = (
            query.lower()
        )

        separators = [

            " vs ",

            " versus ",

            " and "
        ]

        for separator in separators:

            if separator in lowered:

                pieces = [

                    item.strip()

                    for item

                    in lowered.split(
                        separator
                    )
                ]

                cleaned = []

                for piece in pieces:

                    piece = re.sub(

                        r"\b(compare|better|difference|between|which|is|vendor)\b",

                        "",

                        piece
                    )

                    piece = piece.strip()

                    if piece:

                        cleaned.append(
                            piece
                        )

                return cleaned

        return []