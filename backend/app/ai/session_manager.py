from collections import (
    defaultdict,
    deque
)

from threading import (
    Lock
)

import time


class SessionManager:

    MAX_MESSAGES = 12

    MAX_CONTEXT_CHARS = 1500

    SESSION_TTL = 7200

    _lock = Lock()

    _sessions = defaultdict(

        lambda: {

            "messages": deque(

                maxlen=
                SessionManager.MAX_MESSAGES

            ),

            "updated_at":

            time.time()

        }

    )

    _filters = defaultdict(

        dict

    )

    _vendor_memory = defaultdict(

        list

    )

    @classmethod
    def _touch(

        cls,

        session_id:str

    ):

        if (

            session_id

            in

            cls._sessions

        ):

            cls._sessions[
                session_id
            ][
                "updated_at"
            ]=time.time()

    @classmethod
    def _cleanup(

        cls

    ):

        now=time.time()

        expired=[]

        for session_id,data in (

            cls._sessions.items()

        ):

            if (

                now

                -

                data[
                    "updated_at"
                ]

                >

                cls.SESSION_TTL

            ):

                expired.append(

                    session_id

                )

        for session_id in expired:

            cls.clear(

                session_id

            )

    @classmethod
    def add_message(

        cls,

        session_id:str,

        role:str,

        content:str

    ):

        if not content:

            return

        cleaned=(

            content

            .strip()

        )

        if not cleaned:

            return

        with cls._lock:

            cls._cleanup()

            cls._touch(

                session_id

            )

            cls._sessions[
                session_id
            ][
                "messages"
            ].append(

                {

                    "role":

                    role,

                    "content":

                    cleaned

                }

            )

    @classmethod
    def get_context(

        cls,

        session_id:str,

        limit:int=8

    ):

        with cls._lock:

            cls._cleanup()

            cls._touch(

                session_id

            )

            messages=list(

                cls._sessions
                .get(

                    session_id,

                    {}

                )
                .get(

                    "messages",

                    []

                )

            )[-limit:]

        history=[]

        chars=0

        for msg in messages:

            line=(

                f"{msg['role']}: "

                f"{msg['content']}"

            )

            size=len(

                line

            )

            if (

                chars

                +

                size

                >

                cls.MAX_CONTEXT_CHARS

            ):

                break

            history.append(

                line

            )

            chars+=size

        return "\n".join(

            history

        )

    @classmethod
    def set_filters(

        cls,

        session_id:str,

        filters:dict

    ):

        with cls._lock:

            cls._touch(

                session_id

            )

            existing=(

                cls._filters.get(

                    session_id,

                    {}

                )

            )

            merged={

                **existing,

                **{

                    k:v

                    for k,v

                    in filters.items()

                    if v is not None

                }

            }

            cls._filters[
                session_id
            ]=merged

    @classmethod
    def get_filters(

        cls,

        session_id:str

    ):

        with cls._lock:

            cls._cleanup()

            cls._touch(

                session_id

            )

            return dict(

                cls._filters.get(

                    session_id,

                    {}

                )

            )

    @classmethod
    def set_vendor_memory(

        cls,

        session_id:str,

        vendors:list

    ):

        with cls._lock:

            cls._touch(

                session_id

            )

            cls._vendor_memory[
                session_id
            ]=vendors

    @classmethod
    def get_vendor_memory(

        cls,

        session_id:str

    ):

        with cls._lock:

            cls._cleanup()

            cls._touch(

                session_id

            )

            return (

                cls._vendor_memory.get(

                    session_id,

                    []

                )

            )

    @classmethod
    def memory_summary(

        cls,

        session_id:str

    ):

        filters=(

            cls.get_filters(

                session_id

            )

        )

        if not filters:

            return ""

        return ", ".join(

            f"{k}:{v}"

            for k,v

            in filters.items()

        )

    @classmethod
    def session_exists(

        cls,

        session_id:str

    ):

        return (

            session_id

            in

            cls._sessions

        )

    @classmethod
    def clear(

        cls,

        session_id:str

    ):

        cls._sessions.pop(

            session_id,

            None

        )

        cls._filters.pop(

            session_id,

            None

        )

        cls._vendor_memory.pop(

            session_id,

            None

        )