import uuid
from sqlalchemy import Column, DateTime, String, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
from app.db.base import Base


class VendorCleanupLog(Base):

    __tablename__ = "vendor_cleanup_logs"

    log_id = Column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid.uuid4
    )

    run_id = Column(
        UUID(as_uuid=True),
        nullable=False
    )

    vendor_id = Column(
        UUID(as_uuid=True),
        nullable=True
    )

    vendor_name = Column(String, nullable=True)

    action = Column(String, nullable=False)
    # POTENTIAL_DUPLICATE | EMAIL_INVALID | PHONE_MISSING | PHONE_INVALID
    # PRICE_INCONSISTENT  | INACTIVE_VENDOR | CITY_MISSING | DESCRIPTION_MISSING

    reason = Column(Text, nullable=True)

    before_value = Column(Text, nullable=True)

    after_value = Column(Text, nullable=True)

    severity = Column(String, default="warning")
    # info | warning | critical

    created_at = Column(
        DateTime(timezone=True),
        server_default=func.now()
    )