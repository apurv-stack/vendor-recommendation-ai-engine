from typing import Dict
from app.ai.prompts.ai_prompts import (
    VENDOR_DISCOVERY_PROMPT,
    FILTER_EXTRACTION_PROMPT,
    FOLLOWUP_RESPONSE_PROMPT,
    RECOMMENDATION_RESPONSE_PROMPT
)
from app.ai.prompts.model_prompts import (
    SQLALCHEMY_MODEL_PROMPT,
    POSTGRES_TABLE_PROMPT,
    RELATIONSHIP_MAPPING_PROMPT,
    QUERY_OPTIMIZATION_PROMPT
)
from app.ai.prompts.workflow_prompts import (
    CURSOR_AI_ENGINEERING_PROMPT,
    BACKEND_WORKFLOW_PROMPT,
    FRONTEND_WORKFLOW_PROMPT,
    DATABASE_WORKFLOW_PROMPT,
    AI_WORKFLOW_PROMPT,
    PROMPT_ENGINEERING_STRATEGY_PROMPT,
    AI_VALIDATION_PROMPT
)


class PromptLoader:

    _cache: Dict[str, str] = {}

    _prompt_registry = {
        "vendor_discovery": VENDOR_DISCOVERY_PROMPT,
        "filter_extraction": FILTER_EXTRACTION_PROMPT,
        "followup_response": FOLLOWUP_RESPONSE_PROMPT,
        "recommendation_response": RECOMMENDATION_RESPONSE_PROMPT,
        "ai_service_system": (
            "You are a warm, friendly, and emotionally intelligent "
            "event planning assistant. "
            "Adapt your tone based on the user's event type, budget, "
            "preferences, and context. "
            "Be conversational, natural, and engaging. "
            "Use occasional emojis when appropriate. "
            "Avoid robotic responses."
        ),
        "sqlalchemy_model": SQLALCHEMY_MODEL_PROMPT,
        "postgres_table": POSTGRES_TABLE_PROMPT,
        "relationship_mapping": RELATIONSHIP_MAPPING_PROMPT,
        "query_optimization": QUERY_OPTIMIZATION_PROMPT,
        "cursor_engineering": CURSOR_AI_ENGINEERING_PROMPT,
        "backend_workflow": BACKEND_WORKFLOW_PROMPT,
        "frontend_workflow": FRONTEND_WORKFLOW_PROMPT,
        "database_workflow": DATABASE_WORKFLOW_PROMPT,
        "ai_workflow": AI_WORKFLOW_PROMPT,
        "prompt_strategy": PROMPT_ENGINEERING_STRATEGY_PROMPT,
        "validation": AI_VALIDATION_PROMPT
    }

    _agent_slug_map = {
        "vendor_discovery": "discovery_agent",
        "filter_extraction": "query_analysis_agent",
        "followup_response": "response_agent",
        "recommendation_response": "response_agent",
        "ai_service_system": "response_agent",
    }

    @classmethod
    def get_prompt(cls, name: str, db=None) -> str:

        cached = cls._cache.get(name)
        if cached:
            return cached

        agent_slug = cls._agent_slug_map.get(name)
        if db and agent_slug:
            try:
                from app.models.agent_prompt import AgentPrompt
                from app.models.ai_agent import AIAgent
                result = (
                    db.query(AgentPrompt)
                    .join(AIAgent, AIAgent.id == AgentPrompt.agent_id)
                    .filter(AIAgent.agent_name == agent_slug)
                    .first()
                )
                if result and result.base_prompt:
                    parts = []
                    if result.base_prompt:
                        parts.append(result.base_prompt)
                    if result.role_instructions:
                        parts.append(result.role_instructions)
                    if result.behavior_guidelines:
                        parts.append(result.behavior_guidelines)
                    if result.formatting_rules:
                        parts.append(result.formatting_rules)
                    if result.business_rules:
                        parts.append(result.business_rules)
                    full_prompt = "\n\n".join(parts)
                    cls._cache[name] = full_prompt
                    return full_prompt
            except Exception as e:
                import logging
                logging.getLogger(__name__).warning(
                    f"[PromptLoader] DB fetch failed for '{name}', using fallback: {e}"
                )

        prompt = cls._prompt_registry.get(name)
        if not prompt:
            available = ", ".join(sorted(cls._prompt_registry.keys()))
            raise ValueError(
                f"Prompt '{name}' not found. Available: {available}"
            )
        cls._cache[name] = prompt
        return prompt

    @classmethod
    def invalidate(cls, name: str):
        cls._cache.pop(name, None)

    @classmethod
    def invalidate_all(cls):
        cls._cache.clear()

    @classmethod
    def register_prompt(cls, name: str, content: str):
        cls._prompt_registry[name] = content
        cls._cache.pop(name, None)

    @classmethod
    def clear_cache(cls):
        cls._cache.clear()

    @classmethod
    def available_prompts(cls):
        return sorted(cls._prompt_registry.keys())