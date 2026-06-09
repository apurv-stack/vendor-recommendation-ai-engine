class FallbackHandler:

    @staticmethod
    def get_fallback_response():

        return {

            "success": False,

            "response": (

                "I'm having difficulty processing "

                "your request right now. "

                "Please try again in a moment "

                "or provide a little more detail "

                "about what you're looking for."

            ),

            "error": (

                "AI temporarily unavailable"

            ),

            "metadata": {

                "fallback": True,

                "retry_allowed": True

            }

        }


    @staticmethod
    def vendor_fallback():

        return (

            "I'm unable to retrieve vendor "

            "recommendations right now. "

            "Please try again shortly."

        )


    @staticmethod
    def generic_fallback():

        return (

            "Could you provide a bit more "

            "information so I can help "

            "better?"

        )