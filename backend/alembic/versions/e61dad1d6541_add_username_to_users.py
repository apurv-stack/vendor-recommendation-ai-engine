"""add username to users

Revision ID: e61dad1d6541
Revises: 48a6c7db38aa
Create Date: 2026-05-18 10:41:13.423902
"""

from typing import Sequence, Union

from alembic import op

import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "e61dad1d6541"

down_revision: Union[str, Sequence[str], None] = "48a6c7db38aa"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "users",

        sa.Column(
            "username",
            sa.String(),
            nullable=True
        )
    )

    op.create_unique_constraint(
        "uq_users_username",
        "users",
        ["username"]
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_constraint(
        "uq_users_username",
        "users",
        type_="unique"
    )

    op.drop_column(
        "users",
        "username"
    )