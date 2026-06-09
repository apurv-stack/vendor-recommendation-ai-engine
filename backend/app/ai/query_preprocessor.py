import re


class QueryPreprocessor:

    CATEGORY_SYNONYMS = {

        "catering": [
            "caterer",
            "caterers",
            "food service",
            "food services",
            "food arrangement",
            "food arrangements"
        ],

        "photography": [
            "photographer",
            "photographers",
            "wedding shoot",
            "camera crew",
            "photo team"
        ],

        "decoration": [
            "decorator",
            "decorators",
            "decor",
            "event styling",
            "event decor",
            "venue decoration"
        ],

        "music": [
            "dj",
            "djs",
            "music band",
            "live band"
        ],

        "venue": [
            "banquet",
            "banquet hall",
            "function hall"
        ]
    }

    PREFERENCE_SYNONYMS = {

        "budget": [
            "cheap",
            "affordable",
            "economical",
            "cost effective",
            "cost-effective",
            "budget friendly",
            "budget-friendly",
            "low cost"
        ],

        "premium": [
            "luxury",
            "premium",
            "elite",
            "high end",
            "high-end",
            "exclusive"
        ]
    }

    CITY_SYNONYMS = {

        "new delhi": "delhi",

        "delhi ncr": "delhi",

        "ncr": "delhi",

        "gurugram": "gurgaon",

        "blr": "bangalore",

        "bengaluru": "bangalore"
    }

    @classmethod
    def preprocess(
        cls,
        query: str
    ) -> str:

        if not query:
            return ""

        query = query.lower().strip()

        query = cls._normalize_budget(
            query
        )

        query = cls._normalize_locations(
            query
        )

        query = cls._normalize_categories(
            query
        )

        query = cls._normalize_preferences(
            query
        )

        query = cls._clean_text(
            query
        )

        return query

    @staticmethod
    def _clean_text(
        query: str
    ) -> str:

        query = re.sub(
            r"[^\w\s]",
            " ",
            query
        )

        query = re.sub(
            r"\s+",
            " ",
            query
        )

        return query.strip()

    @classmethod
    def _normalize_locations(
        cls,
        query: str
    ) -> str:

        for source, target in (

            sorted(

                cls.CITY_SYNONYMS.items(),

                key=lambda x: len(x[0]),

                reverse=True

            )

        ):

            query = re.sub(

                rf"\b{re.escape(source)}\b",

                target,

                query

            )

        return query

    @classmethod
    def _normalize_categories(
        cls,
        query: str
    ) -> str:

        for category, synonyms in (

            cls.CATEGORY_SYNONYMS.items()

        ):

            synonyms = sorted(

                synonyms,

                key=len,

                reverse=True

            )

            for synonym in synonyms:

                query = re.sub(

                    rf"\b{re.escape(synonym)}\b",

                    category,

                    query

                )

        return query

    @classmethod
    def _normalize_preferences(
        cls,
        query: str
    ) -> str:

        for preference, synonyms in (

            cls.PREFERENCE_SYNONYMS.items()

        ):

            synonyms = sorted(

                synonyms,

                key=len,

                reverse=True

            )

            for synonym in synonyms:

                query = re.sub(

                    rf"\b{re.escape(synonym)}\b",

                    preference,

                    query

                )

        return query

    @staticmethod
    def _normalize_budget(
        query: str
    ) -> str:

        lakh_matches = re.findall(

            r"(\d+(?:\.\d+)?)\s*lakh",

            query

        )

        for value in lakh_matches:

            amount = int(

                float(value)

                * 100000

            )

            query = re.sub(

                rf"{re.escape(value)}\s*lakh",

                str(amount),

                query

            )

        k_matches = re.findall(

            r"(\d+(?:\.\d+)?)\s*k",

            query

        )

        for value in k_matches:

            amount = int(

                float(value)

                * 1000

            )

            query = re.sub(

                rf"{re.escape(value)}\s*k",

                str(amount),

                query

            )

        thousand_matches = re.findall(

            r"(\d+(?:\.\d+)?)\s*thousand",

            query

        )

        for value in thousand_matches:

            amount = int(

                float(value)

                * 1000

            )

            query = re.sub(

                rf"{re.escape(value)}\s*thousand",

                str(amount),

                query

            )

        query = re.sub(

            r"\brs\.?\b",

            "",

            query

        )

        query = query.replace(

            "₹",

            ""

        )

        return query