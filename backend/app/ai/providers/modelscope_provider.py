import requests

from app.core.config import settings


class ModelScopeProvider:

    BASE_URL = (
        "https://api-inference.modelscope.cn/v1/chat/completions"
    )

    MODEL = (
        "Qwen/Qwen2.5-7B-Instruct"
    )

    def generate(

        self,

        prompt:str,

        temperature:float=0.3,

        max_tokens:int=700

    ):

        headers={

            "Authorization":

            f"Bearer {settings.MODELSCOPE_API_KEY}",

            "Content-Type":

            "application/json"

        }

        payload={

            "model":

            self.MODEL,

            "messages":[

                {

                    "role":"user",

                    "content":prompt

                }

            ],

            "temperature":

            temperature,

            "max_tokens":

            max_tokens

        }

        response=requests.post(

            self.BASE_URL,

            headers=headers,

            json=payload,

            timeout=60

        )

        if response.status_code!=200:

            raise RuntimeError(

                f"ModelScope Error: "

                f"{response.status_code} "

                f"{response.text}"

            )

        data=response.json()

        return (

            data["choices"][0]

            ["message"]

            ["content"]

        )