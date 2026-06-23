from datetime import datetime, timedelta

from sqlalchemy.orm import Session

from app.db.session import SessionLocal

from app.models.ai_agent import AIAgent
from app.models.agent_prompt import AgentPrompt


class PromptService:

    _cache = {}

    CACHE_DURATION = timedelta(seconds=30)

    @classmethod
    def get_prompt(cls, agent_name: str):

        now = datetime.utcnow()

        if agent_name in cls._cache:

            cached_data = cls._cache[agent_name]

            if now < cached_data["expires_at"]:
                return cached_data["prompt"]

        db: Session = SessionLocal()

        try:

            agent = (
                db.query(AIAgent)
                .filter(
                    AIAgent.agent_name == agent_name
                )
                .first()
            )

            if not agent:
                return None

            prompt = (
                db.query(AgentPrompt)
                .filter(
                    AgentPrompt.agent_id == agent.agent_id
                )
                .first()
            )

            cls._cache[agent_name] = {
                "prompt": prompt,
                "expires_at": now + cls.CACHE_DURATION
            }

            return prompt

        finally:
            db.close()

    @classmethod
    def clear_cache(cls):
        cls._cache = {}

    @classmethod
    def invalidate_agent(cls, agent_name: str):

        if agent_name in cls._cache:
            del cls._cache[agent_name]