"""add recommendations to conversations

Revision ID: d124b61eaa2f
Revises: da4b562d01fa
Create Date: 2026-06-10 14:53:21.399622

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers, used by Alembic.
revision: str = "d124b61eaa2f"
down_revision: Union[str, Sequence[str], None] = "da4b562d01fa"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column(
        "conversations",
        sa.Column(
            "recommendations",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=True
        )
    )


def downgrade() -> None:
    op.drop_column(
        "conversations",
        "recommendations"
    )