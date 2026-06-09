from typing import Dict
from typing import Any
from typing import List


class FilterValidator:

    VALID_CATEGORIES = {

        "catering",
        "photography",
        "decoration",
        "venue",
        "music",
        "planner",
        "makeup"
    }

    VALID_QUALITY_LEVELS = {

        "high",
        "premium",
        "budget"
    }

    @classmethod
    def validate(

        cls,

        filters: Dict[str, Any]

    ) -> Dict[str, Any]:

        errors = []

        # -----------------------------
        # CATEGORY VALIDATION
        # -----------------------------

        category = filters.get(
            "category"
        )

        if (

            category

            and

            category not in cls.VALID_CATEGORIES

        ):

            errors.append(

                f"Invalid category: {category}"

            )

        # -----------------------------
        # BUDGET VALIDATION
        # -----------------------------

        budget_min = filters.get(
            "budget_min"
        )

        budget_max = filters.get(
            "budget_max"
        )

        if (

            budget_min is not None

            and

            budget_min < 0

        ):

            errors.append(

                "budget_min cannot be negative"

            )

        if (

            budget_max is not None

            and

            budget_max < 0

        ):

            errors.append(

                "budget_max cannot be negative"

            )

        if (

            budget_min is not None

            and

            budget_max is not None

            and

            budget_min > budget_max

        ):

            errors.append(

                "budget_min cannot exceed budget_max"

            )

        # -----------------------------
        # RATING VALIDATION
        # -----------------------------

        rating_min = filters.get(
            "rating_min"
        )

        rating_max = filters.get(
            "rating_max"
        )

        if (

            rating_min is not None

            and

            not (1 <= rating_min <= 5)

        ):

            errors.append(

                "rating_min must be between 1 and 5"

            )

        if (

            rating_max is not None

            and

            not (1 <= rating_max <= 5)

        ):

            errors.append(

                "rating_max must be between 1 and 5"

            )

        if (

            rating_min is not None

            and

            rating_max is not None

            and

            rating_min > rating_max

        ):

            errors.append(

                "rating_min cannot exceed rating_max"

            )

        # -----------------------------
        # GUEST COUNT VALIDATION
        # -----------------------------

        guest_count = filters.get(
            "guest_count"
        )

        if (

            guest_count is not None

            and

            guest_count <= 0

        ):

            errors.append(

                "guest_count must be greater than zero"

            )

        # -----------------------------
        # QUALITY VALIDATION
        # -----------------------------

        vendor_quality = filters.get(
            "vendor_quality"
        )

        if (

            vendor_quality

            and

            vendor_quality not in cls.VALID_QUALITY_LEVELS

        ):

            errors.append(

                f"Invalid vendor quality: {vendor_quality}"

            )

        return {

            "is_valid":

            len(errors) == 0,

            "errors":

            errors
        }