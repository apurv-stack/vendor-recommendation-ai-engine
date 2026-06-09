"""add chat sessions table

Revision ID: 53d9afcde31c
Revises: 19fc22ae5a5b
Create Date: 2026-05-29 15:58:25.018480

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "53d9afcde31c"
down_revision: Union[str, Sequence[str], None] = "19fc22ae5a5b"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.create_table(

        "chat_sessions",

        sa.Column(
            "session_id",
            postgresql.UUID(as_uuid=True),
            nullable=False
        ),

        sa.Column(
            "user_id",
            postgresql.UUID(as_uuid=True),
            nullable=False
        ),

        sa.Column(
            "status",
            sa.String(),
            nullable=False
        ),

        sa.Column(
            "detected_intent",
            sa.String(),
            nullable=True
        ),

        sa.Column(
            "current_question",
            sa.Text(),
            nullable=True
        ),

        sa.Column(
            "context_data",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False
        ),

        sa.Column(
            "missing_fields",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False
        ),

        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True
        ),

        sa.ForeignKeyConstraint(
            ["user_id"],
            ["users.user_id"]
        ),

        sa.PrimaryKeyConstraint(
            "session_id"
        )

    )

    op.create_index(
        "idx_chat_session_user",
        "chat_sessions",
        ["user_id"]
    )

    op.create_index(
        "idx_chat_session_status",
        "chat_sessions",
        ["status"]
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_index(
        "idx_chat_session_status",
        table_name="chat_sessions"
    )

    op.drop_index(
        "idx_chat_session_user",
        table_name="chat_sessions"
    )

    op.drop_table(
        "chat_sessions"
    )