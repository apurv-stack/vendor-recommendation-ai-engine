from typing import Any


class QueueHandler:

    """
    Queue abstraction layer.

    Future integrations:

    - Celery
    - RabbitMQ
    - Kafka
    - Redis Queue
    """

    async def enqueue(

        self,

        task_name: str,

        payload: dict[str, Any]

    ):

        return {

            "queued": False,

            "task": task_name,

            "payload": payload

        }


    async def get_status(

        self,

        task_id: str

    ):

        return {

            "task_id": task_id,

            "status": "not_implemented"

        }