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
            "error_code": "AI_UNAVAILABLE",
            "metadata": {
                "fallback": True,
                "retry_allowed": True
            }
        }


    @staticmethod
    def vendor_fallback():

        return {
            "success": False,
            "message": (
                "I'm unable to retrieve vendor "
                "recommendations right now. "
                "Please try again shortly."
            ),
            "error": (
                "Vendor service unavailable"
            ),
            "error_code": "VENDOR_UNAVAILABLE",
            "metadata": {
                "fallback": True,
                "retry_allowed": True
            }
        }


    @staticmethod
    def generic_fallback():

        return {
            "success": False,
            "message": (
                "Could you provide a bit more "
                "information so I can help "
                "better?"
            ),
            "error": (
                "Insufficient information"
            ),
            "error_code": "INSUFFICIENT_INFORMATION",
            "metadata": {
                "fallback": True
            }
        }