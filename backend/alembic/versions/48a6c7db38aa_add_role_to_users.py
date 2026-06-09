"""add role to users

Revision ID: 48a6c7db38aa
Revises: e62d9ea39306
Create Date: 2026-05-18 09:45:09.654623
"""

from typing import Sequence, Union

from alembic import op

import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "48a6c7db38aa"

down_revision: Union[str, Sequence[str], None] = "e62d9ea39306"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "users",

        sa.Column(
            "role",
            sa.String(),
            nullable=False,
            server_default="user"
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        "users",
        "role"
    )