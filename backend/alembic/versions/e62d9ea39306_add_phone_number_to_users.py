"""add phone number to users

Revision ID: e62d9ea39306
Revises: 9daac6d3266a
Create Date: 2026-05-16 17:43:30.659874

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'e62d9ea39306'
down_revision: Union[str, Sequence[str], None] = '9daac6d3266a'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        'users',
        sa.Column(
            'phone_number',
            sa.String(),
            nullable=True
        )
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.drop_column(
        'users',
        'phone_number'
    )