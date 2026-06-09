from typing import Dict
from typing import List
from typing import Any


class QueryValidator:

    REQUIRED_FIELDS = {

        "vendor_recommendation": [
            "category"
        ],

        "catering": [
            "city",
            "budget",
            "guest_count"
        ],

        "photography": [
            "city"
        ],

        "decoration": [
            "city"
        ],

        "venue": [
            "city"
        ],

        "music": [
            "city"
        ],

        "planner": [
            "city"
        ],

        "makeup": [
            "city"
        ]
    }

    @classmethod
    def validate(
        cls,
        intent: str,
        filters: Dict[str, Any]
    ) -> Dict[str, Any]:

        # ----------------------------------
        # COMPARISON QUERIES
        # ----------------------------------

        if intent == "comparison_query":

            return {

                "is_valid": True,

                "needs_clarification": False,

                "missing_fields": []

            }

        # ----------------------------------
        # SERVICE QUERIES
        # ----------------------------------

        if intent == "service_query":

            return {

                "is_valid": True,

                "needs_clarification": False,

                "missing_fields": []

            }

        # ----------------------------------
        # REVIEW QUERIES
        # ----------------------------------

        if intent == "review_query":

            return {

                "is_valid": True,

                "needs_clarification": False,

                "missing_fields": []

            }

        # ----------------------------------
        # ANALYTICS QUERIES
        # ----------------------------------

        if intent == "analytics_query":

            return {

                "is_valid": True,

                "needs_clarification": False,

                "missing_fields": []

            }

        missing_fields = []

        category = filters.get(
            "category"
        )

        # ----------------------------------
        # AMBIGUOUS VENDOR REQUEST
        # ----------------------------------

        if (

            intent
            ==
            "generic_platform_query"

            and

            not category

        ):

            return {

                "is_valid": False,

                "needs_clarification": True,

                "missing_fields": [
                    "category"
                ]

            }

        # ----------------------------------
        # GENERIC VENDOR RECOMMENDATION
        # ----------------------------------

        if intent == "vendor_recommendation":

            for field in cls.REQUIRED_FIELDS[
                "vendor_recommendation"
            ]:

                if not filters.get(
                    field
                ):

                    missing_fields.append(
                        field
                    )

        # ----------------------------------
        # CATEGORY SPECIFIC VALIDATION
        # ----------------------------------

        if category in cls.REQUIRED_FIELDS:

            for field in cls.REQUIRED_FIELDS[
                category
            ]:

                if not filters.get(
                    field
                ):

                    missing_fields.append(
                        field
                    )

        # ----------------------------------
        # EVENT TYPE VALIDATION
        # ----------------------------------

        if (

            intent
            ==
            "vendor_recommendation"

            and

            not filters.get(
                "event_type"
            )

        ):

            missing_fields.append(
                "event_type"
            )

        # ----------------------------------
        # REMOVE DUPLICATES
        # ----------------------------------

        missing_fields = list(
            set(
                missing_fields
            )
        )

        return {

            "is_valid":

            len(
                missing_fields
            ) == 0,

            "needs_clarification":

            len(
                missing_fields
            ) > 0,

            "missing_fields":

            missing_fields
        }

    @classmethod
    def get_clarification_question(
        cls,
        missing_fields: List[str]
    ) -> str:

        if not missing_fields:

            return ""

        field = missing_fields[0]

        questions = {

            "category":

            (
                "Which vendor category are you looking for? "
                "(Catering, Photography, Decoration, Venue, Music)"
            ),

            "city":

            (
                "Which city is the event planned in?"
            ),

            "budget":

            (
                "What is your approximate budget?"
            ),

            "guest_count":

            (
                "How many guests are expected?"
            ),

            "event_type":

            (
                "What type of event is this? "
                "(Wedding, Birthday, Corporate, etc.)"
            )

        }

        return questions.get(

            field,

            "Could you provide more details?"

        )