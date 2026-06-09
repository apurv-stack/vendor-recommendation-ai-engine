"""add_title_to_chat_sessions

Revision ID: da4b562d01fa
Revises: c30e05d49347
Create Date: 2026-06-04 10:37:43.487262

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

# revision identifiers, used by Alembic.
revision: str = "da4b562d01fa"
down_revision: Union[str, Sequence[str], None] = "c30e05d49347"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "chat_sessions",
        sa.Column(
            "title",
            sa.String(),
            nullable=True
        )
    )


def downgrade() -> None:

    op.drop_column(
        "chat_sessions",
        "title"
    )