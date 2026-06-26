import re
import uuid
import logging
from datetime import datetime, timezone
from sqlalchemy.orm import Session
from app.models.vendor import Vendor
from app.models.vendor_cleanup_log import VendorCleanupLog
from app.models.vendor_cleanup_report import VendorCleanupReport

logger = logging.getLogger(__name__)

EMAIL_REGEX = re.compile(r"^[^@\s]+@[^@\s]+\.[^@\s]+$")
PHONE_REGEX = re.compile(r"^[\d\s\+\-\(\)]{7,15}$")


class VendorCleanupService:

    @staticmethod
    def run_analysis(db: Session, performed_by: str = "admin") -> dict:

        run_id = uuid.uuid4()
        report = VendorCleanupReport(
            run_id=run_id,
            status="running",
            performed_by=performed_by
        )
        db.add(report)
        db.commit()

        logs = []
        stats = {
            "total_scanned":         0,
            "duplicates_found":      0,
            "invalid_emails":        0,
            "missing_phones":        0,
            "price_inconsistencies": 0,
            "inactive_vendors":      0,
            "missing_info":          0,
            "total_issues":          0,
            "issues_detected":       0,
            "issues_pending":        0,
            "issues_fixed":          0,
        }

        try:
            vendors = db.query(Vendor).filter(Vendor.parent_vendor_id == None).all()
            stats["total_scanned"] = len(vendors)

            seen_emails        = {}
            seen_phones        = {}
            seen_name_emails   = {}
            seen_name_phones   = {}

            for vendor in vendors:
                vendor_logs = []

                email    = (vendor.business_email or "").strip().lower()
                phone    = (vendor.contact_phone  or "").strip()
                name_key = (vendor.name            or "").strip().lower()

                # ── 1. Smart duplicate detection ──────────────────────
                if email and name_key:
                    combined = f"{name_key}::{email}"
                    if combined in seen_name_emails:
                        vendor_logs.append(VendorCleanupLog(
                            run_id=run_id,
                            vendor_id=vendor.vendor_id,
                            vendor_name=vendor.name,
                            action="POTENTIAL_DUPLICATE",
                            reason=(
                                f"Same name + email as "
                                f"'{seen_name_emails[combined]}'"
                            ),
                            before_value=f"name={vendor.name}, email={email}",
                            after_value=None,
                            severity="critical"
                        ))
                        stats["duplicates_found"] += 1
                    else:
                        seen_name_emails[combined] = vendor.name
                        # Also track bare email for shared corporate email warning
                        if email in seen_emails:
                            vendor_logs.append(VendorCleanupLog(
                                run_id=run_id,
                                vendor_id=vendor.vendor_id,
                                vendor_name=vendor.name,
                                action="POTENTIAL_DUPLICATE",
                                reason=(
                                    f"Email '{email}' shared with "
                                    f"'{seen_emails[email]}' — "
                                    f"may be a corporate address"
                                ),
                                before_value=email,
                                after_value=None,
                                severity="warning"
                            ))
                            stats["duplicates_found"] += 1
                        else:
                            seen_emails[email] = vendor.name

                if phone and name_key:
                    combined_phone = f"{name_key}::{phone}"
                    if combined_phone in seen_name_phones:
                        vendor_logs.append(VendorCleanupLog(
                            run_id=run_id,
                            vendor_id=vendor.vendor_id,
                            vendor_name=vendor.name,
                            action="POTENTIAL_DUPLICATE",
                            reason=(
                                f"Same name + phone as "
                                f"'{seen_name_phones[combined_phone]}'"
                            ),
                            before_value=f"name={vendor.name}, phone={phone}",
                            after_value=None,
                            severity="critical"
                        ))
                        stats["duplicates_found"] += 1
                    else:
                        seen_name_phones[combined_phone] = vendor.name

                # ── 2. Invalid email format ────────────────────────────
                if email and not EMAIL_REGEX.match(email):
                    vendor_logs.append(VendorCleanupLog(
                        run_id=run_id,
                        vendor_id=vendor.vendor_id,
                        vendor_name=vendor.name,
                        action="EMAIL_INVALID",
                        reason=f"Email '{email}' does not match valid format",
                        before_value=email,
                        after_value=None,
                        severity="critical"
                    ))
                    stats["invalid_emails"] += 1

                # ── 3. Missing or invalid phone ────────────────────────
                if not phone:
                    vendor_logs.append(VendorCleanupLog(
                        run_id=run_id,
                        vendor_id=vendor.vendor_id,
                        vendor_name=vendor.name,
                        action="PHONE_MISSING",
                        reason="Contact phone is empty",
                        before_value=None,
                        after_value=None,
                        severity="warning"
                    ))
                    stats["missing_phones"] += 1
                elif not PHONE_REGEX.match(phone):
                    vendor_logs.append(VendorCleanupLog(
                        run_id=run_id,
                        vendor_id=vendor.vendor_id,
                        vendor_name=vendor.name,
                        action="PHONE_INVALID",
                        reason=f"Phone '{phone}' does not match valid format",
                        before_value=phone,
                        after_value=None,
                        severity="warning"
                    ))
                    stats["missing_phones"] += 1

                # ── 4. Price inconsistency ─────────────────────────────
                if (
                    vendor.price_min is not None
                    and vendor.price_max is not None
                    and vendor.price_min > vendor.price_max
                ):
                    vendor_logs.append(VendorCleanupLog(
                        run_id=run_id,
                        vendor_id=vendor.vendor_id,
                        vendor_name=vendor.name,
                        action="PRICE_INCONSISTENT",
                        reason=(
                            f"price_min ({vendor.price_min}) "
                            f"> price_max ({vendor.price_max})"
                        ),
                        before_value=(
                            f"min={vendor.price_min}, "
                            f"max={vendor.price_max}"
                        ),
                        after_value=None,
                        severity="warning"
                    ))
                    stats["price_inconsistencies"] += 1

                # ── 5. Inactive vendor ─────────────────────────────────
                if not vendor.is_active:
                    vendor_logs.append(VendorCleanupLog(
                        run_id=run_id,
                        vendor_id=vendor.vendor_id,
                        vendor_name=vendor.name,
                        action="INACTIVE_VENDOR",
                        reason="Vendor is marked inactive (is_active=False)",
                        before_value="inactive",
                        after_value=None,
                        severity="info"
                    ))
                    stats["inactive_vendors"] += 1

                # ── 6. Missing city ────────────────────────────────────
                if not vendor.city or not vendor.city.strip():
                    vendor_logs.append(VendorCleanupLog(
                        run_id=run_id,
                        vendor_id=vendor.vendor_id,
                        vendor_name=vendor.name,
                        action="CITY_MISSING",
                        reason="Vendor has no city assigned",
                        before_value=None,
                        after_value=None,
                        severity="warning"
                    ))
                    stats["missing_info"] += 1

                # ── 7. Missing description ─────────────────────────────
                if not vendor.description or not vendor.description.strip():
                    vendor_logs.append(VendorCleanupLog(
                        run_id=run_id,
                        vendor_id=vendor.vendor_id,
                        vendor_name=vendor.name,
                        action="DESCRIPTION_MISSING",
                        reason="Vendor has no description",
                        before_value=None,
                        after_value=None,
                        severity="info"
                    ))
                    stats["missing_info"] += 1

                logs.extend(vendor_logs)

            # Bulk insert all logs
            for log in logs:
                db.add(log)

            total = len(logs)
            stats["total_issues"]    = total
            stats["issues_detected"] = total
            stats["issues_pending"]  = total
            stats["issues_fixed"]    = 0

            # Update report
            report.status                 = "completed"
            report.completed_at           = datetime.now(timezone.utc)
            report.total_scanned          = stats["total_scanned"]
            report.duplicates_found       = stats["duplicates_found"]
            report.invalid_emails         = stats["invalid_emails"]
            report.missing_phones         = stats["missing_phones"]
            report.price_inconsistencies  = stats["price_inconsistencies"]
            report.inactive_vendors       = stats["inactive_vendors"]
            report.missing_info           = stats["missing_info"]
            report.total_issues           = total
            report.issues_detected        = total
            report.issues_pending         = total
            report.issues_fixed           = 0

            db.commit()

            return {
                "success": True,
                "run_id":  str(run_id),
                "stats":   stats
            }

        except Exception as e:
            logger.error(
                f"[VendorCleanupService] Error: {e}",
                exc_info=True
            )
            report.status       = "failed"
            report.notes        = str(e)
            report.completed_at = datetime.now(timezone.utc)
            db.commit()
            return {
                "success": False,
                "run_id":  str(run_id),
                "error":   str(e)
            }

    @staticmethod
    def get_reports(db: Session, limit: int = 20):
        return (
            db.query(VendorCleanupReport)
            .order_by(VendorCleanupReport.started_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_logs_for_run(db: Session, run_id: str, limit: int = 500):
        import uuid as _uuid
        try:
            run_uuid = _uuid.UUID(str(run_id))
        except Exception:
            return []
        return (
            db.query(VendorCleanupLog)
            .filter(VendorCleanupLog.run_id == run_uuid)
            .order_by(VendorCleanupLog.created_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_all_logs(db: Session, limit: int = 10000):
        return (
            db.query(VendorCleanupLog)
            .order_by(VendorCleanupLog.created_at.desc())
            .limit(limit)
            .all()
        )

    @staticmethod
    def get_dashboard_stats(db: Session):
        total_vendors = db.query(Vendor).count()
        total_runs    = db.query(VendorCleanupReport).count()
        last_report   = (
            db.query(VendorCleanupReport)
            .filter(VendorCleanupReport.status == "completed")
            .order_by(VendorCleanupReport.completed_at.desc())
            .first()
        )
        return {
            "total_vendors": total_vendors,
            "total_runs":    total_runs,
            "last_run": {
                "run_id":                str(last_report.run_id),
                "completed_at":          last_report.completed_at.isoformat() if last_report.completed_at else None,
                "total_scanned":         last_report.total_scanned,
                "total_issues":          last_report.total_issues,
                "issues_detected":       last_report.issues_detected,
                "issues_pending":        last_report.issues_pending,
                "issues_fixed":          last_report.issues_fixed,
                "duplicates_found":      last_report.duplicates_found,
                "invalid_emails":        last_report.invalid_emails,
                "missing_phones":        last_report.missing_phones,
                "price_inconsistencies": last_report.price_inconsistencies,
                "inactive_vendors":      last_report.inactive_vendors,
                "missing_info":          last_report.missing_info,
            } if last_report else None
        }