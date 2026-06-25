from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.models.user import User
from app.api.dependencies.auth_dependency import require_role

from app.services.vendor_sync_service import VendorSyncService

router = APIRouter(
    prefix="/admin/vendor-sync",
    tags=["Vendor Sync"]
)


# ==========================================
# DASHBOARD
# ==========================================

@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):

    stats = VendorSyncService.get_dashboard_stats(db)

    return {
        "success": True,
        "data": stats
    }


# ==========================================
# RUN SYNC
# ==========================================

@router.post("/run")
def run_sync(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):

    result = VendorSyncService.run_sync(db)

    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail="Sync failed"
        )

    return result


# ==========================================
# GET RUNS
# ==========================================

@router.get("/runs")
def get_runs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):

    runs = VendorSyncService.get_runs(db)

    return {
        "success": True,
        "runs": [
            {
                "run_id": str(r.run_id),
                "status": r.status,
                "total_vendors": r.total_vendors,
                "success_count": r.success_count,
                "failed_count": r.failed_count,
                "started_at": (
                    r.started_at.isoformat()
                    if r.started_at else None
                ),
                "completed_at": (
                    r.completed_at.isoformat()
                    if r.completed_at else None
                )
            }
            for r in runs
        ]
    }


# ==========================================
# GET LOGS
# ==========================================

@router.get("/logs")
def get_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):

    logs = VendorSyncService.get_logs(db)

    return {
        "success": True,
        "logs": [
            {
                "log_id": str(l.log_id),
                "run_id": str(l.run_id),
                "vendor_id": (
                    str(l.vendor_id)
                    if l.vendor_id else None
                ),
                "vendor_name": l.vendor_name,
                "status": l.status,
                "attempts": l.attempts,
                "message": l.message,
                "created_at": (
                    l.created_at.isoformat()
                    if l.created_at else None
                )
            }
            for l in logs
        ]
    }