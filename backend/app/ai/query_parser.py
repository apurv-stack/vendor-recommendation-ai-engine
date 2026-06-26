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
             "catering", "caterer", "caterers", "food", "buffet", "meals", "chef", "cuisine"
        ],

        "photography": [
            "photography", "photographer", "photographers",
            "pre wedding", "pre-wedding",
            "videography", "cinematography"
        ],

        "decoration": [
            "decoration", "decor", "decorator", "decorators",
           "floral decor", "stage decor", "styling", "flowers", "floral"
        ],

        "venue": [
            "venue", "banquet", "hall",
            "farmhouse", "resort",
            "lawn", "wedding venue"
        ],

        "music": [
            "music", "dj", "band",
            "live music", "singer", "musician", "orchestra", "disc jockey"
        ],

        "planner": [
            "planner",
            "event planner",
            "wedding planner",
            "event management"
        ],

        "makeup": [
            "makeup",
            "makeup artist",
            "bridal makeup",
            "groom makeup"
        ],

        "entertainment": [
            "entertainment",
            "anchor",
            "emcee",
            "comedian",
            "performer",
            "magician"
        ],

        "transport": [
            "transport",
            "car rental",
            "luxury car",
            "bus service"
        ],

        "invitation": [
            "invitation",
            "wedding card",
            "invite",
            "invites"
        ],

        "cake": [
            "cake",
            "cakes",
            "bakery",
            "pastry"
        ],

        "security": [
            "security",
            "bouncer",
            "guards"
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
        "hyderabad": "hyderabad",
        "chennai": "chennai",
        "kolkata": "kolkata",
        "pune": "pune",
        "ahmedabad": "ahmedabad",
        "jaipur": "jaipur",
        "lucknow": "lucknow",
        "indore": "indore",
        "surat": "surat",
        "chandigarh": "chandigarh",
        "noida": "noida",  
        "greater noida": "greater noida",
        "gurgaon": "gurgaon",
        "gurugram": "gurgaon"
    }

    CUISINES = {
        "north indian",
        "south indian",
        "chinese",
        "thai",
        "japanese",
        "korean",
        "italian",
        "mexican",
        "continental",
        "mediterranean",
        "mughlai",
        "bengali",
        "gujarati",
        "rajasthani",
        "punjabi",
        "hyderabadi",
        "street food",
        "desserts",
        "live counters",
        "bbq",
        "seafood",
        "vegan",
        "jain"
    }

    EVENTS = {
        "wedding",
        "engagement",
        "reception",
        "haldi",
        "mehendi",
        "sangeet",
        "birthday",
        "anniversary",
        "baby shower",
        "housewarming",
        "naming ceremony",
        "party",
        "farewell",
        "freshers",
        "convocation",
        "corporate",
        "conference",
        "seminar",
        "workshop",
        "annual meet",
        "townhall",
        "product launch",
        "award ceremony",
        "networking event",
        "trade show",
        "exhibition",
        "inauguration",
        "festival",
        "cultural event",
        "religious event",
        "fashion show",
        "roadshow",
        "charity event", 
        "fundraiser",   
        "college fest",
        "sports event",
        "concert",
        "music festival",
        "brand activation"
    }

    CHEAPER_TERMS = {
        "cheap",
        "cheaper",
        "affordable",
        "budget",
        "economical",
        "budget friendly",
        "cost effective",
        "low cost",
        "low budget",
        "reasonable",
        "value for money",
        "inexpensive",
        "lowest price"
    }

    PREMIUM_TERMS = {
        "premium",
        "luxury",
        "elite",
        "exclusive",
        "high end",
        "high-end",
        "luxurious",
        "vip",
        "high profile"
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
        "recommended",
        "excellent",
        "popular",
        "famous",
        "professional",
        "top class",
        "best reviewed",
        "5 star"
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
        previous: Optional[dict] = None,
        config: dict = None
    ) -> QueryFilters:
        cfg = config or {}

        extra_cities = {
            k.lower(): v.lower()
            for k, v in cfg.get("extra_cities", {}).items()
        }
        extra_categories = cfg.get("extra_categories", {})
        extra_cuisines = set(cfg.get("extra_cuisines", []))
        extra_events = set(cfg.get("extra_events", []))

        dynamic_city_map = {**QueryParser.CITY_MAP, **extra_cities}
        dynamic_cuisines = QueryParser.CUISINES | extra_cuisines
        dynamic_events = QueryParser.EVENTS | extra_events

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

        if not category and extra_categories:
            for cat_name, terms in extra_categories.items():
                if isinstance(terms, list) and any(t in query_lower for t in terms):
                    category = cat_name
                    break
                elif isinstance(terms, str) and any(
                    t.strip() in query_lower for t in terms.split(",")
                ):
                    category = cat_name
                    break

        if category:
            filters["category"] = category
            # Also detect if multiple categories were requested
            all_cats = QueryParser._extract_all_categories(query_lower)
            if len(all_cats) > 1:
                filters["multiple_categories"] = all_cats

        else:
    # Detect unknown category attempt
            unknown = re.search(
                r"(\w+)\s+vendor",
                query_lower
            )
            if unknown:
                word = unknown.group(1)
                skip = {
                    "need","find","best","top","good",
                    "cheap","premium","any","some","a",
                    "the","my","our","for","new","all"
                }
                if word not in skip:
                    filters["raw_category_attempt"] = word

        city = QueryParser._extract_city_dynamic(
            query_lower, dynamic_city_map
        )

        if city:
            filters["city"] = city

        budget = (
            QueryParser
            ._extract_budget(
                query_lower
            )
        )

        if budget is not None:
            filters["budget"] = budget

        guests = (
            QueryParser
            ._extract_guest_count(
                query_lower,
                filters
            )
        )

        if guests is not None:
            filters["guest_count"] = guests

        cuisine = next(
            (
                item
                for item
                in dynamic_cuisines
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
                in dynamic_events
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

            vendor_names = QueryParser._extract_vendor_names(query)

            if vendor_names:
                filters["vendor_names"] = vendor_names

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
    def _extract_city_dynamic(query: str, city_map: dict):
        for city, value in city_map.items():
            if city in query:
                return value
        return None

    @staticmethod
    def _extract_category(
        query: str
    ):
        """Returns the FIRST matched category for single-category flows."""
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
    def _extract_all_categories(
        query: str
    ):
        """Returns ALL matched categories for multi-category queries."""
        found = []
        for category, terms in QueryParser.CATEGORY_PATTERNS.items():
            if any(term in query for term in terms):
                found.append(category)
        return found

    @staticmethod
    def _extract_budget(
        query: str
    ):
        
        negative_lakh = re.search(
            r"under\s*-\s*(\d+(?:\.\d+)?)\s*lakh",
            query
        )
        if negative_lakh:
            return -int(float(negative_lakh.group(1)) * 100000)

        negative_k = re.search(
            r"under\s*-\s*(\d+(?:\.\d+)?)\s*k",
            query
        )
        if negative_k:
            return -int(float(negative_k.group(1)) * 1000)

        negative_plain = re.search(
            r"under\s*-\s*(\d+)",
            query
        )
        if negative_plain:
            return -int(negative_plain.group(1))

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
            r"(-?\d+)\s*(guest|guests|people|persons|attendees)",
            query
        )

        if explicit:
            return int(explicit.group(1))
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
    
    @staticmethod
    def _extract_vendor_names(query: str):

    # Pattern 1: "compare X and Y" or "compare X vs Y"
        pattern = re.search(
            r"(?:compare)\s+(.+?)\s+(?:and|vs\.?|versus)\s+(.+)",
            query,
            re.IGNORECASE
        )

    # Pattern 2: "X vs Y" or "X versus Y" (no leading compare)
        if not pattern:
            pattern = re.search(
                r"(.+?)\s+(?:vs\.?|versus)\s+(.+)",
                query,
                re.IGNORECASE
            )

        if not pattern:
            return []

        vendor1 = QueryParser._clean_vendor_name(pattern.group(1))
        vendor2 = QueryParser._clean_vendor_name(pattern.group(2))

    # Reject pure category words or too-short names
        known_categories = {
            term
            for terms in QueryParser.CATEGORY_PATTERNS.values()
            for term in terms
        }

        result = []
        for name in [vendor1, vendor2]:
            if (
                name
                and len(name) >= 3
                and name.lower() not in known_categories
            ):
                result.append(name)

        return result if len(result) == 2 else []


    @staticmethod
    def _clean_vendor_name(raw: str) -> str:

        if not raw:
            return ""

    # Strip trailing "in delhi", "for wedding", "near noida" etc.
        noise_pattern = re.compile(
            r"\s+(?:in|at|for|near|from|within|under|above|with|by)\b.*$",
            re.IGNORECASE
        )
        cleaned = noise_pattern.sub("", raw.strip())

    # Remove trailing punctuation
        cleaned = re.sub(r"[^\w\s]+$", "", cleaned).strip()

        return cleaned