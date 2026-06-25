from uuid import uuid4

from sqlalchemy import String, Text, Integer, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped

from app.db.base import Base


class SyncActivityLog(Base):

    __tablename__ = "sync_activity_logs"

    log_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )

    run_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        nullable=False
    )

    vendor_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        nullable=True
    )

    vendor_name: Mapped[str] = mapped_column(
        String,
        nullable=True
    )

    status: Mapped[str] = mapped_column(
        String,
        nullable=False
    )

    attempts: Mapped[int] = mapped_column(
        Integer,
        default=1
    )

    message: Mapped[str] = mapped_column(
        Text,
        nullable=True
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )