from typing import Dict
from typing import List
from typing import Any


class QueryValidator:

    REQUIRED_FIELDS = {
        "vendor_recommendation": ["category"],
        "catering":    ["city", "budget", "guest_count"],
        "photography": ["city", "budget"],
        "decoration":  ["city", "budget"],
        "venue":       ["city"],
        "music":       ["city", "budget"],
        "planner":     ["city"],
        "makeup":      ["city", "budget"]
    }

    VALID_CATEGORIES = {
        "catering", "photography", "decoration",
        "venue", "music", "planner", "makeup"
    }

    VALID_CITIES = {
        "delhi", "mumbai", "bangalore", "noida",
        "greater noida", "gurgaon", "hyderabad",
        "pune", "chennai", "kolkata", "jaipur", "ahmedabad"
    }

    SKIP_VALIDATION_INTENTS = {
        "comparison_query",
        "service_query",
        "review_query",
        "analytics_query",
        "session_query",
        "query_understanding",
        "greeting",
        "chitchat"
    }

    @classmethod
    def validate(
        cls,
        intent: str,
        filters: Dict[str, Any]
    ) -> Dict[str, Any]:

        if intent in cls.SKIP_VALIDATION_INTENTS:
            return {
                "is_valid": True,
                "needs_clarification": False,
                "missing_fields": [],
                "errors": []
            }

        missing_fields = []
        errors = []

        category = filters.get("category")
        budget = filters.get("budget")
        guest_count = filters.get("guest_count")
        city = filters.get("city")
        raw_category_attempt = filters.get("raw_category_attempt")

        # ----------------------------------
        # UNKNOWN CATEGORY DETECTION
        # Catches "dragon vendors", "xyz vendors"
        # ----------------------------------

        if raw_category_attempt and raw_category_attempt not in cls.VALID_CATEGORIES:
            errors.append(
                f"'{raw_category_attempt}' is not a recognized vendor category. "
                f"Available: catering, photography, decoration, venue, music, planner, makeup."
            )

        # ----------------------------------
        # INVALID CITY DETECTION
        # Catches "catering in Mars"
        # ----------------------------------

        if city and city.lower() not in cls.VALID_CITIES:
            errors.append(
                f"'{city}' is not a supported city. "
                f"We currently serve Delhi, Mumbai, Bangalore, Noida, Gurgaon and more."
            )

        # ----------------------------------
        # BUDGET VALIDATION
        # ----------------------------------

        if budget is not None:
            try:
                budget_value = float(budget)
                if budget_value < 0:
                    errors.append("Budget cannot be negative.")
                elif budget_value == 0:
                    errors.append("Budget must be greater than zero.")
            except Exception:
                errors.append("Invalid budget value.")

        # ----------------------------------
        # GUEST COUNT VALIDATION
        # ----------------------------------

        if guest_count is not None:
            try:
                guest_value = int(guest_count)
                if guest_value < 0:
                    errors.append("Guest count cannot be negative.")
                elif guest_value == 0:
                    errors.append("Guest count must be greater than zero.")
            except Exception:
                errors.append("Invalid guest count.")

        # ----------------------------------
        # If errors found — return immediately
        # No need to check missing fields
        # ----------------------------------

        if errors:
            return {
                "is_valid": False,
                "needs_clarification": False,
                "missing_fields": [],
                "errors": errors
            }

        # ----------------------------------
        # AMBIGUOUS VENDOR REQUEST
        # ----------------------------------

        if intent == "generic_platform_query" and not category:
            return {
                "is_valid": False,
                "needs_clarification": True,
                "missing_fields": ["category"],
                "errors": []
            }

        # ----------------------------------
        # GENERIC VENDOR RECOMMENDATION
        # ----------------------------------

        if intent == "vendor_recommendation":
            for field in cls.REQUIRED_FIELDS["vendor_recommendation"]:
                if not filters.get(field):
                    missing_fields.append(field)

        # ----------------------------------
        # CATEGORY SPECIFIC VALIDATION
        # ----------------------------------

        if category and category in cls.REQUIRED_FIELDS:
            for field in cls.REQUIRED_FIELDS[category]:
                if not filters.get(field):
                    missing_fields.append(field)

        # ----------------------------------
        # EVENT TYPE VALIDATION
        # ----------------------------------

        if intent == "vendor_recommendation" and not filters.get("event_type"):
            missing_fields.append("event_type")

        # ----------------------------------
        # REMOVE DUPLICATES
        # ----------------------------------

        missing_fields = list(set(missing_fields))

        return {
            "is_valid": len(missing_fields) == 0 and len(errors) == 0,
            "needs_clarification": len(missing_fields) > 0,
            "missing_fields": missing_fields,
            "errors": errors
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
            "category": (
                "Which vendor category are you looking for? "
                "(Catering, Photography, Decoration, Venue, Music)"
            ),
            "city": "Which city is the event planned in?",
            "budget": "What is your approximate budget?",
            "guest_count": "How many guests are expected?",
            "event_type": (
                "What type of event is this? "
                "(Wedding, Birthday, Corporate, etc.)"
            )
        }

        return questions.get(field, "Could you provide more details?")