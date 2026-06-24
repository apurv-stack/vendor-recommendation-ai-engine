import uuid
from sqlalchemy import Column, DateTime, Integer, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base


class VendorCleanupReport(Base):

    __tablename__ = "vendor_cleanup_reports"

    run_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    started_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    completed_at = Column(
        DateTime(timezone=True),
        nullable=True
    )

    status = Column(String, default="running")
    # running | completed | failed

    total_scanned          = Column(Integer, default=0)
    duplicates_found       = Column(Integer, default=0)
    invalid_emails         = Column(Integer, default=0)
    missing_phones         = Column(Integer, default=0)
    price_inconsistencies  = Column(Integer, default=0)
    inactive_vendors       = Column(Integer, default=0)
    missing_info           = Column(Integer, default=0)  # city + description issues

    # Summary counters
    total_issues           = Column(Integer, default=0)
    issues_detected        = Column(Integer, default=0)
    issues_pending         = Column(Integer, default=0)  # needs admin review
    issues_fixed           = Column(Integer, default=0)  # always 0 until Phase 2

    performed_by           = Column(String, nullable=True)
    notes                  = Column(Text, nullable=True)