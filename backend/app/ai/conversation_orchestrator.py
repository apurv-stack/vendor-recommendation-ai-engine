from app.ai.followup_generator import (
    FollowUpGenerator
)


class ConversationOrchestrator:

    @staticmethod
    def build_session_state(

        filters,

        missing_fields,

        intent=None

    ):

        next_question = (

            FollowUpGenerator
            .get_next_question(
                missing_fields
            )
        )

        return {

            "status":

            (
                "WAITING_CLARIFICATION"

                if missing_fields

                else

                "COMPLETED"
            ),

            "detected_intent":

            intent,

            "context_data":

            filters or {},

            "missing_fields":

            missing_fields or [],

            "current_question":

            (
                next_question["question"]

                if next_question

                else None
            )
        }

    @staticmethod
    def merge_context(

        existing_context,

        new_filters

    ):

        merged = {

            **(
                existing_context or {}
            ),

            **(
                new_filters or {}
            )
        }

        return {

            key: value

            for key, value

            in merged.items()

            if value is not None
        }

    @staticmethod
    def is_conversation_complete(

        missing_fields

    ):

        return len(
            missing_fields
        ) == 0