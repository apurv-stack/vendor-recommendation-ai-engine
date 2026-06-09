"""add user id to recommendation history

Revision ID: 3af134d87de1
Revises: 71e4aa226885
Create Date: 2026-06-02

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "3af134d87de1"
down_revision: Union[str, Sequence[str], None] = "71e4aa226885"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.add_column(
        "recommendation_history",
        sa.Column(
            "user_id",
            sa.UUID(),
            nullable=True
        )
    )

    op.create_foreign_key(
        "fk_recommendation_history_user",
        "recommendation_history",
        "users",
        ["user_id"],
        ["user_id"],
        ondelete="CASCADE"
    )

    op.create_index(
        "ix_recommendation_history_user_id",
        "recommendation_history",
        ["user_id"],
        unique=False
    )


def downgrade() -> None:

    op.drop_index(
        "ix_recommendation_history_user_id",
        table_name="recommendation_history"
    )

    op.drop_constraint(
        "fk_recommendation_history_user",
        "recommendation_history",
        type_="foreignkey"
    )

    op.drop_column(
        "recommendation_history",
        "user_id"
    )