import time


class CacheHandler:

    """
    Lightweight in-memory cache

    Future support:

    - Redis
    - Distributed cache
    - Persistent cache
    """

    _cache = {}


    async def get(

        self,

        key: str

    ):

        item = (

            self._cache.get(

                key

            )

        )

        if not item:

            return None

        expires_at = (

            item["expires_at"]

        )

        if (

            time.time()

            >

            expires_at

        ):

            del self._cache[

                key

            ]

            return None

        return item[

            "value"

        ]


    async def set(

        self,

        key: str,

        value,

        ttl: int = 300

    ):

        self._cache[

            key

        ] = {

            "value":

            value,

            "expires_at":

            time.time()

            +

            ttl

        }


    async def delete(

        self,

        key: str

    ):

        self._cache.pop(

            key,

            None

        )


    async def clear(

        self

    ):

        self._cache.clear()