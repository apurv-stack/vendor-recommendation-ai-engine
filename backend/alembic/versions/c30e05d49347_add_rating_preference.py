"""add rating preference

Revision ID: c30e05d49347
Revises: 6fc82d9995bf
Create Date: 2026-06-02 17:15:41.869694

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "c30e05d49347"
down_revision: Union[str, Sequence[str], None] = "6fc82d9995bf"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "user_preferences",
        sa.Column(
            "preferred_min_rating",
            sa.Float(),
            nullable=True
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "user_preferences",
        "preferred_min_rating"
    )