from typing import Any

def success_response(

    message: str,

    data: Any = None

):

    return {

        "success": True,

        "message": message,

        "data": data,

        "error": None

    }


def error_response(

    message: str,

    code: str,

    details=None

):

    return {

        "success": False,

        "message": message,

        "error": {

            "code": code,

            "details": details

        }

    }