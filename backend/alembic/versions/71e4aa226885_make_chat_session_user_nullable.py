"""make_chat_session_user_nullable

Revision ID: 71e4aa226885
Revises: 53d9afcde31c
Create Date: 2026-05-29 17:16:49.920704

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "71e4aa226885"
down_revision: Union[str, Sequence[str], None] = "53d9afcde31c"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Make user_id nullable to support
    guest conversations.
    """

    op.alter_column(
        "chat_sessions",
        "user_id",
        existing_type=sa.UUID(),
        nullable=True
    )


def downgrade() -> None:
    """
    Revert user_id back to required.
    """

    op.alter_column(
        "chat_sessions",
        "user_id",
        existing_type=sa.UUID(),
        nullable=False
    )