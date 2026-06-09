import uuid

from sqlalchemy import (
    CheckConstraint,
    Column,
    DateTime,
    ForeignKey,
    Text
)

from sqlalchemy.dialects.postgresql import UUID

from sqlalchemy.orm import relationship

from sqlalchemy.sql import func

from app.db.base import Base


class SearchHistory(Base):

    __tablename__ = "search_history"

    __table_args__ = (

        CheckConstraint(

            "length(trim(search_query)) > 0",

            name="check_search_query_not_empty"

        ),

    )

    search_id = Column(

        UUID(as_uuid=True),

        primary_key=True,

        default=uuid.uuid4

    )

    user_id = Column(

        UUID(as_uuid=True),

        ForeignKey(

            "users.user_id"

        ),

        nullable=False

    )

    search_query = Column(

        Text,

        nullable=False

    )

    searched_at = Column(

        DateTime(

            timezone=True

        ),

        server_default=func.now()

    )

    user = relationship(

        "User",

        back_populates=

        "search_history"

    )