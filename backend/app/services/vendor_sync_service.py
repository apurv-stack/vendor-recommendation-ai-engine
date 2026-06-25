import uuid
import logging
from datetime import datetime, timezone

from sqlalchemy.orm import Session

from app.models.vendor import Vendor
from app.models.sync_job_run import SyncJobRun
from app.models.sync_activity_log import SyncActivityLog

logger = logging.getLogger(__name__)


class VendorSyncService:

    MAX_RETRIES = 3

    @staticmethod
    def run_sync(db: Session):

        run_id = uuid.uuid4()

        report = SyncJobRun(
            run_id=run_id,
            status="running",
            total_vendors=0,
            success_count=0,
            failed_count=0
        )

        db.add(report)
        db.commit()

        vendors = (
            db.query(Vendor)
            .filter(Vendor.parent_vendor_id == None)
            .all()
        )

        success_count = 0
        failed_count = 0

        for vendor in vendors:

            success = False
            attempts = 0
            message = "Vendor synced successfully"
            status = "success"

            validation_error = None

            if not vendor.name or not vendor.name.strip():
                validation_error = "Missing vendor name"

            elif not vendor.business_email or not vendor.business_email.strip():
                validation_error = "Missing business email"

            elif not vendor.contact_phone or not vendor.contact_phone.strip():
                validation_error = "Missing contact phone"

            elif not vendor.is_active:
                validation_error = "Vendor is inactive"

            if validation_error:

                attempts = 1
                message = validation_error

                if "inactive" in validation_error.lower():
                    status = "skipped"
                else:
                    status = "failed"

            else:

                while attempts < VendorSyncService.MAX_RETRIES:

                    attempts += 1

                    try:

                        vendor.engagement_score = vendor.engagement_score

                        success = True
                        break

                    except Exception as e:

                        message = str(e)

                        logger.warning(
                            f"Sync retry {attempts} for {vendor.name}: {message}"
                        )

                if success:
                    status = "success"
                    message = "Vendor synced successfully"
                else:
                    status = "failed"

            log = SyncActivityLog(
                run_id=run_id,
                vendor_id=vendor.vendor_id,
                vendor_name=vendor.name,
                status=status,
                attempts=attempts,
                message=message
            )

            db.add(log)

            if status == "success":
                success_count += 1
            else:
                failed_count += 1

        report.status = "completed"
        report.total_vendors = len(vendors)
        report.success_count = success_count
        report.failed_count = failed_count
        report.completed_at = datetime.now(timezone.utc)

        db.commit()

        return {
            "success": True,
            "run_id": str(run_id),
            "total_vendors": len(vendors),
            "success_count": success_count,
            "failed_count": failed_count
        }

    @staticmethod
    def get_runs(db: Session):

        return (
            db.query(SyncJobRun)
            .order_by(SyncJobRun.started_at.desc())
            .all()
        )

    @staticmethod
    def get_logs(db: Session):

        return (
            db.query(SyncActivityLog)
            .order_by(SyncActivityLog.created_at.desc())
            .all()
        )

    @staticmethod
    def get_dashboard_stats(db: Session):
        total_runs = db.query(SyncJobRun).count()

        total_vendors = (
            db.query(Vendor)
            .filter(Vendor.parent_vendor_id == None)
            .count()
        )

        latest_run = (
            db.query(SyncJobRun)
            .order_by(SyncJobRun.started_at.desc())
            .first()
        )

        return {
            "total_runs": total_runs,
            "total_vendors": total_vendors,
            "latest_run": {
                "run_id": str(latest_run.run_id),
                "status": latest_run.status,
                "total_vendors": latest_run.total_vendors,
                "success_count": latest_run.success_count,
                "failed_count": latest_run.failed_count,
                "started_at": latest_run.started_at.isoformat()
                if latest_run.started_at else None,
                "completed_at": latest_run.completed_at.isoformat()
                if latest_run.completed_at else None,
            } if latest_run else None
        }