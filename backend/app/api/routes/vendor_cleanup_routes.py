from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.api.dependencies.auth_dependency import require_role
from app.models.user import User
from app.services.vendor_cleanup_service import VendorCleanupService

router = APIRouter(
    prefix="/admin/vendor-cleanup",
    tags=["Vendor Data Quality"]
)


@router.get("/dashboard")
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    stats = VendorCleanupService.get_dashboard_stats(db)
    return {"success": True, "data": stats}


@router.post("/run")
def run_analysis(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    result = VendorCleanupService.run_analysis(
        db,
        performed_by=current_user.email
    )
    if not result["success"]:
        raise HTTPException(
            status_code=500,
            detail=result.get("error", "Analysis failed")
        )
    return {
        "success": True,
        "run_id":  result["run_id"],
        "stats":   result["stats"]
    }


@router.get("/reports")
def get_reports(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    reports = VendorCleanupService.get_reports(db)
    return {
        "success": True,
        "reports": [
            {
                "run_id":                str(r.run_id),
                "started_at":            r.started_at.isoformat() if r.started_at else None,
                "completed_at":          r.completed_at.isoformat() if r.completed_at else None,
                "status":                r.status,
                "total_scanned":         r.total_scanned,
                "total_issues":          r.total_issues,
                "issues_detected":       r.issues_detected,
                "issues_pending":        r.issues_pending,
                "issues_fixed":          r.issues_fixed,
                "duplicates_found":      r.duplicates_found,
                "invalid_emails":        r.invalid_emails,
                "missing_phones":        r.missing_phones,
                "price_inconsistencies": r.price_inconsistencies,
                "inactive_vendors":      r.inactive_vendors,
                "missing_info":          r.missing_info,
                "performed_by":          r.performed_by,
            }
            for r in reports
        ]
    }


@router.get("/logs")
def get_all_logs(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    logs = VendorCleanupService.get_all_logs(db)
    return {"success": True, "logs": _serialize_logs(logs)}


@router.get("/logs/{run_id}")
def get_logs_for_run(
    run_id: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_role(["admin"]))
):
    logs = VendorCleanupService.get_logs_for_run(db, run_id)
    return {"success": True, "logs": _serialize_logs(logs)}


def _serialize_logs(logs):
    return [
        {
            "log_id":       str(l.log_id),
            "run_id":       str(l.run_id),
            "vendor_id":    str(l.vendor_id) if l.vendor_id else None,
            "vendor_name":  l.vendor_name,
            "action":       l.action,
            "reason":       l.reason,
            "before_value": l.before_value,
            "after_value":  l.after_value,
            "severity":     l.severity,
            "created_at":   l.created_at.isoformat() if l.created_at else None,
        }
        for l in logs
    ]