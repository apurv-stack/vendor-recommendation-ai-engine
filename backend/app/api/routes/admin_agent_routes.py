from uuid import UUID
import asyncio 

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.ai_agent import AIAgent
from app.models.agent_prompt import AgentPrompt
from app.models.prompt_version import PromptVersion
from app.models.agent_audit_log import AgentAuditLog
from app.schemas.agent_schema import PromptUpdateRequest
from app.services.prompt_service import PromptService
from app.api.dependencies.auth_dependency import require_role
from app.models.user import User
from app.ai.prompt_loader import PromptLoader
from app.models.agent_configuration import AgentConfiguration
from app.schemas.agent_configuration_schema import AgentConfigurationUpdate
from app.services.agent_configuration_service import AgentConfigurationService

router = APIRouter(
    prefix="/admin/agents",
    tags=["AI Agent Management"]
)


# ==========================================
# GET ALL AGENTS
# ==========================================

@router.get("")
def get_all_agents_api(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    agents = db.query(AIAgent).all()
    return {"success": True, "agents": agents}


# ==========================================
# CREATE NEW AGENT
# ==========================================

@router.post("")
def create_agent_api(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    agent = AIAgent(
        agent_name=payload.get("agent_name"),
        display_name=payload.get("display_name"),
        description=payload.get("description"),
        status="active"
    )
    db.add(agent)
    db.commit()
    db.refresh(agent)
    return {"success": True, "agent": agent}

# ==========================================
# TEST SANDBOX
# ==========================================
@router.post("/test")
async def test_agent_api(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    agent_id = payload.get("agent_id")
    test_query = payload.get("test_query")

    if not agent_id or not test_query:
        raise HTTPException(status_code=400, detail="agent_id and test_query are required")

    agent = db.query(AIAgent).filter(AIAgent.agent_id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    prompt = db.query(AgentPrompt).filter(AgentPrompt.agent_id == agent_id).first()

    from app.ai.ai_service import AIService
    ai_service = AIService()

    full_prompt = "\n\n".join(
        filter(None, [
            prompt.base_prompt if prompt else "",
            prompt.role_instructions if prompt else "",
            prompt.behavior_guidelines if prompt else "",
            prompt.formatting_rules if prompt else "",
            prompt.business_rules if prompt else "",
        ])
    )

    # Keep sandbox prompt short — long prompts cause Ollama timeouts
    combined_prompt = f"{full_prompt}\n\nUser Query:\n{test_query}"
    combined_prompt = combined_prompt[:3000]  # hard cap — Ollama slows badly on long prompts

    try:
        result = await asyncio.wait_for(
            ai_service.execute_prompt(combined_prompt),
            timeout=200.0
        )
    except asyncio.TimeoutError:
        raise HTTPException(
            status_code=503,
            detail="The model is taking too long to respond. Try a shorter prompt or simpler query."
        )

    if not result.get("success"):
        raise HTTPException(
            status_code=503,
            detail=result.get("error") or "Model failed to respond. Please try again."
        )

    return {
        "success": True,
        "agent_name": agent.display_name,
        "test_query": test_query,
        "response": result.get("response", ""),
        "prompt_version": "live"
    }

# ==========================================
# FULL WORKFLOW SANDBOX TEST
# ==========================================

@router.post("/test-workflow")
async def test_agent_workflow_api(
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    test_query = payload.get("test_query")
    if not test_query:
        raise HTTPException(status_code=400, detail="test_query is required")

    from app.graphs.graph_service import GraphService
    from app.models.user import User as UserModel
    import uuid

    # Build a fake admin user context for the graph
    class AdminContext:
        user_id = current_user.user_id
        access_token = getattr(current_user, "access_token", None)

    graph_service = GraphService()

    try:
        graph_result = await asyncio.wait_for(
            graph_service.process(
                query=test_query,
                session_id=str(uuid.uuid4()),
                user_id=str(current_user.user_id),
                access_token=getattr(current_user, "access_token", None),
                db=db,
                intent=None,
                filters={},
            ),
            timeout=120.0
        )
    except asyncio.TimeoutError:
        raise HTTPException(status_code=503, detail="Workflow timed out. Try a simpler query.")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Workflow error: {str(e)}")

    # Extract vendors
    vendors = graph_result.get("ranked_vendors", []) or graph_result.get("vendors", [])
    vendor_list = []
    for v in vendors[:10]:
        if hasattr(v, "__dict__"):
            vendor_list.append({
                "name": getattr(v, "name", ""),
                "category": getattr(v, "category", ""),
                "city": getattr(v, "city", ""),
                "rating": getattr(v, "rating", None),
                "price_min": getattr(v, "price_min", None),
                "price_max": getattr(v, "price_max", None),
                "is_available": getattr(v, "is_available", None),
            })
        elif isinstance(v, dict):
            vendor_list.append(v)

    return {
        "success": True,
        "test_query": test_query,
        "intent": graph_result.get("intent", ""),
        "filters": graph_result.get("filters", {}),
        "ai_response": graph_result.get("ai_response", ""),
        "vendors": vendor_list,
        "vendor_count": len(vendor_list),
        "workflow_trace": graph_result.get("workflow_trace", []),
        "current_question": graph_result.get("current_question", None),
        "missing_fields": graph_result.get("missing_fields", []),
    }

# ==========================================
# GET SINGLE AGENT
# ==========================================

@router.get("/{agent_id}")
def get_single_agent_api(
    agent_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    agent = db.query(AIAgent).filter(AIAgent.agent_id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    return {"success": True, "agent": agent}


# ==========================================
# TOGGLE AGENT STATUS
# ==========================================

@router.patch("/{agent_id}/status")
def toggle_agent_status_api(
    agent_id: UUID,
    payload: dict,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    agent = db.query(AIAgent).filter(AIAgent.agent_id == agent_id).first()
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")

    old_status = agent.status
    new_status = payload.get("status")

    if new_status not in ["active", "inactive", True, False]:
        raise HTTPException(status_code=400, detail="Status must be active or inactive")

    agent.status = new_status == "active" if isinstance(new_status, str) else bool(new_status)

    log = AgentAuditLog(
        agent_id=agent_id,
        action="status_changed",
        old_value={"status": old_status},
        new_value={"status": new_status},
        modified_by=current_user.email
    )
    db.add(log)
    db.commit()

    return {"success": True, "message": f"Agent status updated to {new_status}"}


# ==========================================
# GET AGENT PROMPT
# ==========================================

@router.get("/{agent_id}/prompt")
def get_agent_prompt_api(
    agent_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    prompt = db.query(AgentPrompt).filter(AgentPrompt.agent_id == agent_id).first()
    return {"success": True, "prompt": prompt}


# ==========================================
# UPDATE PROMPT
# ==========================================

@router.put("/{agent_id}/prompt")
def update_prompt_api(
    agent_id: UUID,
    payload: PromptUpdateRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    prompt = db.query(AgentPrompt).filter(AgentPrompt.agent_id == agent_id).first()

    if not prompt:
        prompt = AgentPrompt(agent_id=agent_id)
        db.add(prompt)
        db.flush()

    # Always save a version on every update
    existing_versions = (
        db.query(PromptVersion)
        .filter(PromptVersion.agent_id == agent_id)
        .count()
    )
    version = PromptVersion(
        agent_id=agent_id,
        version_number=existing_versions + 1,
        base_prompt=payload.base_prompt,
        role_instructions=payload.role_instructions,
        behavior_guidelines=payload.behavior_guidelines,
        formatting_rules=payload.formatting_rules,
        business_rules=payload.business_rules,
        change_notes=payload.change_notes,
        created_by=current_user.email
    )
    db.add(version)

    # Write audit log
    log = AgentAuditLog(
        agent_id=agent_id,
        action="prompt_updated",
        old_value={"base_prompt": prompt.base_prompt},
        new_value={"base_prompt": payload.base_prompt},
        modified_by=current_user.email
    )
    db.add(log)

    # Update prompt
    prompt.base_prompt = payload.base_prompt
    prompt.role_instructions = payload.role_instructions
    prompt.behavior_guidelines = payload.behavior_guidelines
    prompt.formatting_rules = payload.formatting_rules
    prompt.business_rules = payload.business_rules
    prompt.updated_by = current_user.email

    db.commit()

    # Invalidate both caches
    PromptService.clear_cache()
    PromptLoader.invalidate_all()

    return {"success": True, "message": "Prompt updated successfully"}

@router.get("/{agent_id}/config")
def get_agent_configuration(
    agent_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    config = AgentConfigurationService.get_configuration(db, str(agent_id))

    return {
        "success": True,
        "configuration": config.configuration if config else {}  # <-- return the DICT, not the ORM object
    }


@router.put("/{agent_id}/config")
def update_agent_configuration(
    agent_id: UUID,
    payload: AgentConfigurationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    # Capture old value BEFORE update for audit log
    existing = AgentConfigurationService.get_configuration(db, str(agent_id))
    old_value = existing.configuration if existing else {}

    # Increment config version number
    old_version_number = existing.config_version if existing and hasattr(existing, 'config_version') else 0

    config = AgentConfigurationService.update_configuration(
        db=db,
        agent_id=str(agent_id),
        configuration=payload.configuration,
        updated_by=current_user.email
    )

    # Write audit log for config change
    log = AgentAuditLog(
        agent_id=agent_id,
        action="configuration_updated",
        old_value={"configuration": old_value},
        new_value={"configuration": payload.configuration},
        modified_by=current_user.email
    )
    db.add(log)
    db.commit()

    return {
        "success": True,
        "message": "Configuration updated successfully",
        "configuration": config.configuration if config else {}
    }
# ==========================================
# GET VERSION HISTORY
# ==========================================

@router.get("/{agent_id}/versions")
def get_versions_api(
    agent_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    versions = (
        db.query(PromptVersion)
        .filter(PromptVersion.agent_id == agent_id)
        .order_by(PromptVersion.version_number.desc())
        .all()
    )
    return {"success": True, "versions": versions}


# ==========================================
# ROLLBACK
# ==========================================

@router.post("/{agent_id}/rollback/{version_id}")
def rollback_prompt_api(
    agent_id: UUID,
    version_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    version = db.query(PromptVersion).filter(PromptVersion.version_id == version_id).first()
    if not version:
        raise HTTPException(status_code=404, detail="Version not found")

    prompt = db.query(AgentPrompt).filter(AgentPrompt.agent_id == agent_id).first()
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")

    # Write audit log
    log = AgentAuditLog(
        agent_id=agent_id,
        action="prompt_rollback",
        old_value={"base_prompt": prompt.base_prompt},
        new_value={"base_prompt": version.base_prompt, "rolled_back_to_version": version.version_number},
        modified_by=current_user.email
    )
    db.add(log)

    prompt.base_prompt = version.base_prompt
    prompt.role_instructions = version.role_instructions
    prompt.behavior_guidelines = version.behavior_guidelines
    prompt.formatting_rules = version.formatting_rules
    prompt.business_rules = version.business_rules

    db.commit()

    # Invalidate both caches
    PromptService.clear_cache()
    PromptLoader.invalidate_all()

    return {"success": True, "message": "Rollback completed"}

# ==========================================
# GET AUDIT LOGS
# ==========================================

@router.get("/{agent_id}/audit-logs")
def get_audit_logs_api(
    agent_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    logs = (
        db.query(AgentAuditLog)
        .filter(AgentAuditLog.agent_id == agent_id)
        .order_by(AgentAuditLog.modified_at.desc())
        .all()
    )
    return {"success": True, "logs": logs}