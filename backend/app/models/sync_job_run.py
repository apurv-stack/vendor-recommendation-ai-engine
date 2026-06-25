from uuid import uuid4
from sqlalchemy import String, Integer, DateTime
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import mapped_column, Mapped

from app.db.base import Base


class SyncJobRun(Base):

    __tablename__ = "sync_job_runs"

    run_id: Mapped[str] = mapped_column(
        UUID(as_uuid=True),
        primary_key=True,
        default=uuid4
    )

    status: Mapped[str] = mapped_column(
        String,
        default="completed"
    )

    total_vendors: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    success_count: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    failed_count: Mapped[int] = mapped_column(
        Integer,
        default=0
    )

    started_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now()
    )

    completed_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        nullable=True
    )