import uuid

from sqlalchemy import (
    Column,
    ForeignKey,
    DateTime,
    Text
)

from sqlalchemy.dialects.postgresql import (
    UUID,
    JSONB
)

from sqlalchemy.sql import func

from sqlalchemy.orm import relationship

from app.db.base import Base


class RecommendationHistory(Base):

    __tablename__ = "recommendation_history"

    history_id = Column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4
    )

    user_id = Column(

        UUID(as_uuid=True),

        ForeignKey(
            "users.user_id",
            ondelete="CASCADE"
        ),

        nullable=True,

        index=True
    )

    session_id = Column(

        UUID(as_uuid=True),

        ForeignKey(
            "chat_sessions.session_id",
            ondelete="CASCADE"
        ),

        nullable=False,

        index=True
    )

    vendor_id = Column(

        UUID(as_uuid=True),

        ForeignKey(
            "vendors.vendor_id",
            ondelete="CASCADE"
        ),

        nullable=False,

        index=True
    )

    filters_snapshot = Column(

        JSONB,

        nullable=False
    )

    recommendation_reason = Column(

        Text,

        nullable=True
    )

    recommended_at = Column(

        DateTime(timezone=True),

        server_default=func.now(),

        nullable=False
    )

    user = relationship(

        "User",

        back_populates="recommendation_history"
    )

    session = relationship(

        "ChatSession",

        back_populates="recommendation_history"
    )

    vendor = relationship(

        "Vendor"
    )