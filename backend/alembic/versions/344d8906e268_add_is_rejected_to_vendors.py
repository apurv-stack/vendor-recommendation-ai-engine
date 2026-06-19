"""add is_rejected to vendors

Revision ID: 344d8906e268
Revises: fad2d610067d
Create Date: 2026-06-19 15:52:44.681863
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "344d8906e268"
down_revision: Union[str, Sequence[str], None] = "fad2d610067d"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "vendors",
        sa.Column(
            "is_rejected",
            sa.Boolean(),
            nullable=False,
            server_default=sa.text("false")
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column("vendors", "is_rejected")