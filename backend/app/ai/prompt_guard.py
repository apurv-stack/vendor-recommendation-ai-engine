import re


class PromptGuard:

    BLOCKED_PATTERNS = [

        re.compile(

            pattern,

            re.IGNORECASE

        )

        for pattern in [

            r"ignore previous instructions",

            r"ignore system prompt",

            r"reveal secrets",

            r"show api key",

            r"show credentials",

            r"print environment",

            r"bypass security",

            r"override instructions"

        ]

    ]


    @classmethod
    def validate(

        cls,

        prompt: str

    ):

        if not prompt:

            return True

        for pattern in (

            cls.BLOCKED_PATTERNS

        ):

            if pattern.search(

                prompt

            ):

                raise ValueError(

                    "Unsafe prompt detected."

                )

        return True