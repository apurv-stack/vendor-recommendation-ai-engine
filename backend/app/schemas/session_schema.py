from pydantic import BaseModel


class SessionRenameRequest(
    BaseModel
):

    title: str