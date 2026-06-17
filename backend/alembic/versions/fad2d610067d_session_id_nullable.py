"""session_id nullable

Revision ID: fad2d610067d
Revises: d124b61eaa2f
Create Date: 2026-06-16 18:12:16.822160
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "fad2d610067d"
down_revision: Union[str, Sequence[str], None] = "d124b61eaa2f"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Make recommendation_history.session_id nullable."""

    op.alter_column(
        "recommendation_history",
        "session_id",
        existing_type=sa.UUID(),
        nullable=True,
    )


def downgrade() -> None:
    """Revert recommendation_history.session_id to NOT NULL."""

    op.alter_column(
        "recommendation_history",
        "session_id",
        existing_type=sa.UUID(),
        nullable=False,
    )