import re

from typing import (
    List,
    Optional,
    TypedDict
)


class QueryFilters(
    TypedDict,
    total=False
):

    category: Optional[str]

    budget: Optional[int]

    city: Optional[str]

    guest_count: Optional[int]

    cuisine: Optional[str]

    event_type: Optional[str]

    event_date: Optional[str]

    service_style: Optional[str]

    rating: Optional[float]

    vendor_names: List[str]

    comparison_request: bool

    pricing_preference: Optional[str]

    service_request: bool

    vendor_quality: Optional[str]


class QueryParser:

    CATEGORY_PATTERNS = {

        "catering": [
            "catering",
            "caterer",
            "food"
        ],

        "photography": [
            "photography",
            "photographer",
            "photographers"
        ],

        "decoration": [
            "decoration",
            "decor",
            "decorator"
        ],

        "venue": [
            "venue",
            "banquet",
            "hall"
        ],

        "music": [
            "music",
            "dj",
            "band"
        ],

        "planner": [
            "planner",
            "event planner",
            "wedding planner"
        ],

        "makeup": [
            "makeup",
            "makeup artist",
            "bridal makeup"
        ]
    }

    CITY_MAP = {

        "delhi": "delhi",

        "new delhi": "delhi",

        "delhi ncr": "delhi",

        "ncr": "delhi",

        "mumbai": "mumbai",

        "bangalore": "bangalore",

        "bengaluru": "bangalore",

        "noida": "noida",

        "greater noida": "greater noida",

        "gurgaon": "gurgaon",

        "gurugram": "gurgaon"
    }

    CUISINES = {

        "north indian",

        "south indian",

        "continental",

        "chinese",

        "italian",

        "mexican"
    }

    EVENTS = {

        "wedding",

        "birthday",

        "corporate",

        "engagement",

        "conference",

        "party",

        "reception",

        "anniversary",

        "baby shower",

        "haldi",

        "mehendi",

        "sangeet"
    }

    CHEAPER_TERMS = {

        "cheap",

        "cheaper",

        "affordable",

        "budget",

        "economical",

        "budget friendly",

        "cost effective",

        "low cost"
    }

    PREMIUM_TERMS = {

        "premium",

        "luxury",

        "elite",

        "exclusive",

        "high end",

        "high-end"
    }

    QUALITY_TERMS = {

        "best",

        "top",

        "top rated",

        "highest rated",

        "highly rated",

        "high ratings",

        "high rating",

        "good ratings",

        "good rating",

        "trusted",

        "experienced",

        "recommended"
    }

    SERVICE_TERMS = {

        "service",

        "services",

        "provide",

        "provides",

        "offering",

        "offer",

        "facilities"
    }

    COMPARISON_TERMS = {

        "compare",

        "comparison",

        "versus",

        "vs",

        "better",

        "difference"
    }

    @staticmethod
    def extract_filters(
        query: str,
        previous: Optional[dict] = None
    ) -> QueryFilters:

        filters = dict(
            previous or {}
        )

        query_lower = (
            query
            .lower()
            .strip()
        )

        tokens = set(
            re.findall(
                r"\w+",
                query_lower
            )
        )

        category = (
            QueryParser
            ._extract_category(
                query_lower
            )
        )

        if category:
            filters["category"] = category

        city = (
            QueryParser
            ._extract_city(
                query_lower
            )
        )

        if city:
            filters["city"] = city

        budget = (
            QueryParser
            ._extract_budget(
                query_lower
            )
        )

        if budget:
            filters["budget"] = budget

        guests = (
            QueryParser
            ._extract_guest_count(
                query_lower,
                filters
            )
        )

        if guests:
            filters["guest_count"] = guests

        cuisine = next(
            (
                item
                for item
                in QueryParser.CUISINES
                if item in query_lower
            ),
            None
        )

        if cuisine:
            filters["cuisine"] = cuisine

        event = next(
            (
                item
                for item
                in QueryParser.EVENTS
                if item in query_lower
            ),
            None
        )

        if event:
            filters["event_type"] = event

        if any(
            term in query_lower
            for term
            in QueryParser.SERVICE_TERMS
        ):
            filters["service_request"] = True

        if any(
            term in query_lower
            for term
            in QueryParser.COMPARISON_TERMS
        ):
            filters["comparison_request"] = True

        if any(
            term in query_lower
            for term
            in QueryParser.CHEAPER_TERMS
        ):
            filters["pricing_preference"] = "budget"

        if any(
            term in query_lower
            for term
            in QueryParser.PREMIUM_TERMS
        ):
            filters["pricing_preference"] = "premium"

        if any(
            term in query_lower
            for term
            in QueryParser.QUALITY_TERMS
        ):
            filters["vendor_quality"] = "high"

        rating = QueryParser._extract_rating(
            query_lower
        )

        if rating:
            filters["rating"] = rating

        return filters

    @staticmethod
    def _extract_city(
        query: str
    ):

        for city, value in (
            QueryParser
            .CITY_MAP
            .items()
        ):

            if city in query:
                return value

        return None

    @staticmethod
    def _extract_category(
        query: str
    ):

        for category, terms in (
            QueryParser
            .CATEGORY_PATTERNS
            .items()
        ):

            if any(
                term in query
                for term in terms
            ):
                return category

        return None

    @staticmethod
    def _extract_budget(
        query: str
    ):

        lakh = re.search(
            r"(\d+(?:\.\d+)?)\s*lakh",
            query
        )

        if lakh:

            return int(
                float(
                    lakh.group(1)
                ) * 100000
            )

        thousand = re.search(
            r"(\d+(?:\.\d+)?)\s*thousand",
            query
        )

        if thousand:

            return int(
                float(
                    thousand.group(1)
                ) * 1000
            )

        k_format = re.search(
            r"(\d+(?:\.\d+)?)\s*k",
            query
        )

        if k_format:

            return int(
                float(
                    k_format.group(1)
                ) * 1000
            )

        numbers = re.findall(
            r"\d{4,8}",
            query
        )

        for number in numbers:

            value = int(number)

            if value > 1000:
                return value

        return None

    @staticmethod
    def _extract_rating(
        query: str
    ):

        rating_match = re.search(
            r"(\d(?:\.\d)?)\s*(star|stars)",
            query
        )

        if rating_match:

            return float(
                rating_match.group(1)
            )

        if any(

            phrase in query

            for phrase in [

                "top rated",

                "highest rated",

                "highly rated",

                "high ratings",

                "best rated"

            ]

        ):

            return 4.0

        return None

    @staticmethod
    def _extract_guest_count(
        query: str,
        filters: dict
    ):

        explicit = re.search(
            r"(\d+)\s*(guest|guests|people|persons|attendees)",
            query
        )

        if explicit:

            return int(
                explicit.group(1)
            )

    # ----------------------------------
    # SAFE MODE
    # ----------------------------------
    # Do not guess guest count from
    # standalone numbers because:
    #
    # "2 lakh"
    # "50k"
    # "1.5 lakh"
    #
    # get incorrectly interpreted
    # as guest counts.
    #
    # Guest count should only be
    # extracted when guest-related
    # words are present.
    # ----------------------------------

        return None