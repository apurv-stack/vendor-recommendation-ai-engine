from app.ai.prompt_loader import (
    PromptLoader
)


class PromptChain:

    @classmethod
    def build(

        cls,

        user_message:str,

        filters:dict

    ):

        chain=[]

        chain.append(

            {

                "stage":"intent",

                "prompt":

                PromptLoader.get_prompt(

                    "vendor_discovery"

                )

            }

        )

        chain.append(

            {

                "stage":"filter_extraction",

                "prompt":

                PromptLoader.get_prompt(

                    "filter_extraction"

                )

            }

        )

        missing=[]

        if not filters.get(

            "city"

        ):

            missing.append(

                "city"

            )

        if missing:

            chain.append(

                {

                    "stage":

                    "clarification",

                    "prompt":

                    PromptLoader.get_prompt(

                        "followup_response"

                    )

                }

            )

        chain.append(

            {

                "stage":

                "response",

                "prompt":

                PromptLoader.get_prompt(

                    "recommendation_response"

                )

            }

        )

        return chain