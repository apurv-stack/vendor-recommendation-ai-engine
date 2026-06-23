from app.db.session import SessionLocal
from app.models.ai_agent import AIAgent
from app.models.agent_prompt import AgentPrompt
from app.ai.prompts.ai_prompts import (
    VENDOR_DISCOVERY_PROMPT,
    FILTER_EXTRACTION_PROMPT,
    FOLLOWUP_RESPONSE_PROMPT,
    RECOMMENDATION_RESPONSE_PROMPT
)
from app.models.prompt_version import PromptVersion
from app.models.agent_audit_log import AgentAuditLog

SEED_DATA = {
    "discovery_agent": {
        "base_prompt": VENDOR_DISCOVERY_PROMPT,
        "role_instructions": "Finds and surfaces relevant vendors from the database.",
        "behavior_guidelines": "Only recommend vendors present in DB results. Never invent vendors.",
        "formatting_rules": "2 to 4 short sentences. Friendly and engaging.",
        "business_rules": "Never expose filters, ranking logic, or backend details."
    },
    "query_analysis_agent": {
        "base_prompt": FILTER_EXTRACTION_PROMPT,
        "role_instructions": "Extract structured search filters from user queries.",
        "behavior_guidelines": "Never invent information. Missing values stay null.",
        "formatting_rules": "Return valid JSON only. No markdown, no extra text.",
        "business_rules": "Budget must be numeric. Guest count must be numeric."
    },
    "response_agent": {
        "base_prompt": RECOMMENDATION_RESPONSE_PROMPT,
        "role_instructions": FOLLOWUP_RESPONSE_PROMPT,
        "behavior_guidelines": "Sound warm, friendly, and human. Adapt tone to event type.",
        "formatting_rules": "2 to 4 sentences maximum. Use emojis occasionally.",
        "business_rules": "Never reveal filters, ranking logic, or backend details."
    },
    "ranking_agent": {
        "base_prompt": "Ranks vendors by relevance score based on filters and user preferences.",
        "role_instructions": "Pure scoring logic. No LLM call.",
        "behavior_guidelines": "Prioritize rating, review count, location match, budget match.",
        "formatting_rules": "",
        "business_rules": ""
    },
    "comparison_agent": {
        "base_prompt": "Compares two vendors side by side.",
        "role_instructions": "Fetch vendors from session memory first. Fall back to DB.",
        "behavior_guidelines": "",
        "formatting_rules": "",
        "business_rules": ""
    },
    "context_agent": {
        "base_prompt": "Fetches conversation context and user preferences from DB.",
        "role_instructions": "Pure data fetching. No LLM call.",
        "behavior_guidelines": "",
        "formatting_rules": "",
        "business_rules": ""
    },
    "supervisor_agent": {
        "base_prompt": "Keyword and regex based intent detection.",
        "role_instructions": "No LLM call. Pure rule-based classification.",
        "behavior_guidelines": "",
        "formatting_rules": "",
        "business_rules": ""
    },
    "tool_calling_agent": {
        "base_prompt": "Orchestrates tool calls for vendor search and session queries.",
        "role_instructions": "No LLM call. Routes to correct tool based on intent.",
        "behavior_guidelines": "",
        "formatting_rules": "",
        "business_rules": ""
    },
}


def seed():
    db = SessionLocal()
    try:
        for slug, data in SEED_DATA.items():
            agent = db.query(AIAgent).filter(
                AIAgent.agent_name == slug
            ).first()
            if not agent:
                print(f"Skipped — agent not found in DB: {slug}")
                continue
            existing = db.query(AgentPrompt).filter(
                AgentPrompt.agent_id == agent.agent_id
            ).first()
            if existing:
                print(f"Already seeded — skipping: {slug}")
                continue
            prompt = AgentPrompt(
                agent_id=agent.agent_id,
                base_prompt=data["base_prompt"],
                role_instructions=data["role_instructions"],
                behavior_guidelines=data["behavior_guidelines"],
                formatting_rules=data["formatting_rules"],
                business_rules=data["business_rules"],
                updated_by="system"
            )
            db.add(prompt)
            print(f"Seeded: {slug}")
        db.commit()
        print("Done.")
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
    finally:
        db.close()


if __name__ == "__main__":
    seed()