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

        while isinstance(configuration, dict) and "configuration" in configuration:
            configuration = configuration["configuration"]

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
        from sqlalchemy.orm.attributes import flag_modified
        from app.models.prompt_version import PromptVersion

        try:
            agent_uuid = _uuid.UUID(str(agent_id))
        except (ValueError, AttributeError):
            agent_uuid = agent_id

    # Unwrap nested {"configuration": {...}} if sent by frontend
        while isinstance(configuration, dict) and "configuration" in configuration:
            configuration = configuration["configuration"]

        config = (
            db.query(AgentConfiguration)
            .filter(AgentConfiguration.agent_id == agent_uuid)
            .first()
        )

        if not config:
            config = AgentConfiguration(
                agent_id=agent_uuid,
                configuration=configuration,
                updated_by=updated_by
            )
            db.add(config)
        else:
            config.configuration = configuration
            config.updated_by = updated_by
            flag_modified(config, "configuration")

    # Save a config version snapshot into prompt_versions table
    # using change_notes to mark it as a config version
        existing_versions = (
            db.query(PromptVersion)
            .filter(PromptVersion.agent_id == agent_uuid)
            .count()
        )
        import json
        version_snapshot = PromptVersion(
            agent_id=agent_uuid,
            version_number=existing_versions + 1,
            base_prompt=None,
            role_instructions=None,
            behavior_guidelines=None,
            formatting_rules=None,
            business_rules=None,
            change_notes=f"[CONFIG] {json.dumps(configuration, ensure_ascii=False)[:500]}",
            created_by=updated_by
        )
        db.add(version_snapshot)

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