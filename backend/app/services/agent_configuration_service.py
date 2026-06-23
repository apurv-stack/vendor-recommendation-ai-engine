from sqlalchemy.orm import Session

from app.models.ai_agent import AIAgent
from app.models.agent_configuration import AgentConfiguration


class AgentConfigurationService:

    @staticmethod
    def get_configuration(
        db: Session,
        agent_id: str
    ):
        import uuid as _uuid
        try:
            agent_uuid = _uuid.UUID(str(agent_id))
        except (ValueError, AttributeError):
            agent_uuid = agent_id

        return (
            db.query(AgentConfiguration)
            .filter(
                AgentConfiguration.agent_id == agent_uuid
            )
            .first()
        )

    @staticmethod
    def create_configuration(
        db: Session,
        agent_id: str,
        configuration: dict,
        updated_by: str = "admin"
    ):

        import uuid as _uuid
        try:
            agent_uuid = _uuid.UUID(str(agent_id))
        except (ValueError, AttributeError):
            agent_uuid = agent_id

        existing = (
            db.query(AgentConfiguration)
            .filter(
                AgentConfiguration.agent_id == agent_uuid
            )
            .first()
        )

        if existing:
            return existing

        config = AgentConfiguration(
            agent_id=agent_uuid,
            configuration=configuration,
            updated_by=updated_by
        )

        db.add(config)
        db.commit()
        db.refresh(config)

        return config

    @staticmethod
    def update_configuration(
        db: Session,
        agent_id: str,
        configuration: dict,
        updated_by: str = "admin"
    ):

        import uuid as _uuid
        try:
            agent_uuid = _uuid.UUID(str(agent_id))
        except (ValueError, AttributeError):
            agent_uuid = agent_id

        import uuid as _uuid
        try:
            agent_uuid = _uuid.UUID(str(agent_id))
        except (ValueError, AttributeError):
            agent_uuid = agent_id

        config = (
            db.query(AgentConfiguration)
            .filter(
                AgentConfiguration.agent_id == agent_uuid
            )
            .first()
        )

        if not config:

            config = AgentConfiguration(
                agent_id=agent_uuid,
                configuration=configuration,
                updated_by=updated_by
            )

            db.add(config)
            db.flush()

        else:

            config.configuration = configuration
            config.updated_by = updated_by

        db.commit()
        db.refresh(config)

        return config

    @staticmethod
    def delete_configuration(
        db: Session,
        agent_id: str
    ):

        config = (
            db.query(AgentConfiguration)
            .filter(
                AgentConfiguration.agent_id == agent_id
            )
            .first()
        )

        if not config:
            return False

        db.delete(config)
        db.commit()

        return True

    @staticmethod
    def get_agent_with_configuration(
        db: Session,
        agent_id: str
    ):

        return (
            db.query(AIAgent)
            .filter(
                AIAgent.agent_id == agent_id
            )
            .first()
        )

    @staticmethod
    def get_configuration_by_agent_name(
        db: Session,
        agent_name: str
    ):

        agent = (
            db.query(AIAgent)
            .filter(
                AIAgent.agent_name == agent_name
            )
            .first()
        )

        if not agent:
            return None

        return (
            db.query(AgentConfiguration)
            .filter(
                AgentConfiguration.agent_id == agent.agent_id
            )
            .first()
        )

    @staticmethod
    def get_configuration_value(
        db: Session,
        agent_name: str,
        key: str,
        default=None
    ):

        config = (
            AgentConfigurationService
            .get_configuration_by_agent_name(
                db,
                agent_name
            )
        )

        if not config:
            return default

        return config.configuration.get(
            key,
            default
        )