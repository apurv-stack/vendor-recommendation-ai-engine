class FollowUpGenerator:

    FIELD_QUESTION_MAP = {

        "event_type":
        "What type of event are you planning?",

        "category":
        "What type of vendor are you looking for?",

        "city":
        "Which city should we search vendors in?",

        "location":
        "Which location should we search vendors in?",

        "budget":
        "What is your approximate budget range?",

        "guest_count":
        "Approximately how many guests are expected?",

        "vendor_quality":
        "Are you looking for budget, premium, or top-rated vendors?",

        "pricing_preference":
        "Do you prefer budget-friendly, standard, or premium vendors?",

        "cuisine":
        "Do you have a preferred cuisine?",

        "rating":
        "What minimum rating would you prefer?"
    }

    FIELD_PRIORITY = [

        "category",

        "event_type",

        "city",

        "location",

        "budget",

        "guest_count",

        "vendor_quality",

        "pricing_preference",

        "cuisine",

        "rating"
    ]

    @classmethod
    def get_next_question(
        cls,
        missing_fields
    ):

        if not missing_fields:
            return None

        for field in cls.FIELD_PRIORITY:

            if field in missing_fields:

                return {

                    "field": field,

                    "question":
                    cls.FIELD_QUESTION_MAP.get(
                        field
                    )
                }

        field = missing_fields[0]

        return {

            "field": field,

            "question":
            cls.FIELD_QUESTION_MAP.get(
                field,
                "Could you provide more details?"
            )
        }