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
        "venue", "music", "planner", "makeup",
        "entertainment", "transport", "invitation",
        "cake", "security", "dj"
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

    @staticmethod
    def _is_gibberish(query: str) -> bool:
        """Detect random character strings with no real words."""
        import re
        words = re.findall(r"[a-zA-Z]{2,}", query)
        if not words:
            return False
        # If >60% of words are consonant clusters with no vowels, it's gibberish
        gibberish_count = 0
        for word in words:
            vowels = sum(1 for c in word.lower() if c in "aeiou")
            if len(word) >= 4 and vowels == 0:
                gibberish_count += 1
            elif len(word) >= 6 and vowels / len(word) < 0.1:
                gibberish_count += 1
        return gibberish_count >= max(1, len(words) * 0.6)

    @classmethod
    def validate(
        cls,
        intent: str,
        filters: Dict[str, Any],
        config: Dict[str, Any] = None
    ) -> Dict[str, Any]:
        cfg = config or {}
        # Detect gibberish before anything else
        raw_query = filters.get("_raw_query", "")
        if raw_query and cls._is_gibberish(raw_query):
            return {
                "is_valid": False,
                "needs_clarification": False,
                "missing_fields": [],
                "errors": [
                    "I didn't quite catch that! Could you tell me what kind of "
                    "vendor you're looking for and for which city? "
                    "I'll find the best options for you. 🎉"
                ]
            }
        valid_cities = set(cfg.get("valid_cities", [])) or cls.VALID_CITIES
        valid_categories = set(cfg.get("valid_categories", [])) or cls.VALID_CATEGORIES
        required_fields_override = cfg.get("required_fields", {})
        required_fields = {**cls.REQUIRED_FIELDS, **required_fields_override}
        
        # -------------------------------------------------------
# Fictional / Impossible Requests
# -------------------------------------------------------

        FICTIONAL_TERMS = {
            "alien",
            "aliens",
            "mars",
            "moon",
            "jupiter",
            "saturn",
            "pluto",
            "dragon",
            "dragons",
            "unicorn",
            "unicorns",
            "zombie",
            "zombies",
            "ghost",
            "ghosts",
            "wizard",
            "wizards",
            "vampire",
            "vampires"
        }

        import re

        tokens = set(
            re.findall(r"[a-zA-Z]+", raw_query.lower())
        )

        matched = tokens & FICTIONAL_TERMS

        if matched:
            return {
                "is_valid": False,
                "needs_clarification": False,
                "missing_fields": [],
                "errors": [
                    "That's not something I can help with on this platform! "
                    "I specialise in real event vendors — catering, photography, "
                    "decoration, venue, music, makeup and more. "
                    "What would you like help with for your event? 😊"
                ]
            }
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

        CATEGORY_SYNONYMS = {
            "photo", "photos", "photographer", "photographers",
            "videography", "cinematography",
            "caterer", "caterers", "chef", "food",
            "decorator", "decorators", "decor",
            "dj", "disc jockey", "band", "singer",
            "anchor", "entertainer", "comedian",
            "hall", "banquet", "farmhouse", "lawn",
        }

        if (
            raw_category_attempt
            and raw_category_attempt not in valid_categories
            and raw_category_attempt not in CATEGORY_SYNONYMS
        ):
            errors.append(
                f"'{raw_category_attempt}' is not a recognized vendor category. "
                f"Available: catering, photography, decoration, venue, music, planner, makeup."
            )   

        # ----------------------------------
        # INVALID CITY DETECTION
        # Catches "catering in Mars"
        # ----------------------------------

        if city and city.lower() not in valid_cities:
            errors.append(
                f"Sorry, '{city}' isn't a location we currently support. "
                f"We serve Delhi, Mumbai, Bangalore, Noida, Gurgaon, Hyderabad, "
                f"Pune, Chennai, Kolkata, Jaipur and Ahmedabad. "
                f"Which of these cities works for you? 🏙️"
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
            for field in required_fields.get("vendor_recommendation", cls.REQUIRED_FIELDS.get("vendor_recommendation", [])):
                if not filters.get(field):
                    missing_fields.append(field)

        # ----------------------------------
        # CATEGORY SPECIFIC VALIDATION
        # ----------------------------------

        if category and category in required_fields:
            for field in required_fields[category]:
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
        missing_fields: List[str],
        config: Dict[str, Any] = None
    ) -> str:

        if not missing_fields:
            return ""

        field = missing_fields[0]

    # Default built-in questions
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

    # Admin-configured overrides take priority
        if config:
            followup_overrides = config.get("followup_questions", {})
            if followup_overrides and field in followup_overrides:
                return followup_overrides[field]

        return questions.get(field, "Could you provide more details?")