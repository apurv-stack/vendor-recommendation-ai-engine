from typing import Dict
from typing import Any
from typing import Optional
from typing import List


class StructuredResponseBuilder:

    DEFAULT_STRUCTURE = {

        "intent": "vendor_recommendation",

        "secondary_intents": [],

        "filters": {},

        "missing_fields": [],

        "needs_clarification": False,

        "confidence": 0.0
    }

    @classmethod
    def build(

        cls,

        parser_filters: Dict[str, Any],

        llm_filters: Optional[Dict[str, Any]],

        intent: str,

        confidence: float,

        secondary_intents: Optional[List[str]] = None

    ) -> Dict[str, Any]:

        final_filters = {

            **parser_filters

        }

        if llm_filters:

            for key, value in llm_filters.items():

                if (

                    value is not None

                    and

                    value != ""

                ):

                    final_filters[key] = value

        missing_fields = cls._find_missing(

            intent=intent,

            filters=final_filters

        )

        needs_clarification = (

            len(

                missing_fields

            ) > 0

        )

        return {

            "intent":

            intent,

            "secondary_intents":

            secondary_intents or [],

            "filters":

            final_filters,

            "missing_fields":

            missing_fields,

            "needs_clarification":

            needs_clarification,

            "confidence":

            round(

                confidence,

                2

            )

        }

    @staticmethod
    def _find_missing(

        intent: str,

        filters: Dict[str, Any]

    ) -> List[str]:

        # ----------------------------------
        # INTENTS THAT DO NOT REQUIRE
        # CLARIFICATION
        # ----------------------------------

        if intent in [

            "comparison_query",

            "service_query",

            "review_query",

            "analytics_query",

            "saved_vendor_query"

        ]:

            return []

        missing = []

        category = (

            filters.get(

                "category"

            )

        )

        event_type = (

            filters.get(

                "event_type"

            )

        )

        city = (

            filters.get(

                "city"

            )

        )

        # ----------------------------------
        # CATEGORY
        # ----------------------------------

        if not category:

            return ["category"]

        # ----------------------------------
        # LOCATION
        # ----------------------------------

        if not city:

            missing.append(

                "city"

            )

        # ----------------------------------
        # EVENT TYPE
        # ----------------------------------

        if not event_type:

            missing.append(

                "event_type"

            )

        # ----------------------------------
        # CATEGORY SPECIFIC RULES
        # ----------------------------------

        if (

            category

            ==

            "catering"

        ):

            if filters.get(
                "budget"
            ) is None:

                missing.append(

                    "budget"

                )

            if filters.get(
                "guest_count"
            ) is None:

                missing.append(

                    "guest_count"

                )

        elif (

            category

            ==

            "venue"

        ):

            if not filters.get(

                "budget"

            ):

                missing.append(

                    "budget"

                )

        elif (

            category

            in [

                "photography",

                "decoration",

                "music",

                "planner",

                "makeup"

            ]

        ):

            if filters.get(

                "budget"

            ) is None:

                missing.append(

                    "budget"

                )

        return list(

            set(

                missing

            )

        )