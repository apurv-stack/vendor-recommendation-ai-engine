"""update preference category field

Revision ID: 6fc82d9995bf
Revises: 3af134d87de1
Create Date: 2026-06-02 16:12:17.444251

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "6fc82d9995bf"
down_revision: Union[str, Sequence[str], None] = "3af134d87de1"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    op.add_column(
        "user_preferences",
        sa.Column(
            "preferred_category",
            sa.String(),
            nullable=True
        )
    )

    op.drop_index(
        "idx_user_preference_category",
        table_name="user_preferences"
    )

    op.create_index(
        "idx_user_preference_category",
        "user_preferences",
        ["preferred_category"],
        unique=False
    )

    op.drop_constraint(
        "user_preferences_preferred_category_id_fkey",
        "user_preferences",
        type_="foreignkey"
    )

    op.drop_column(
        "user_preferences",
        "preferred_category_id"
    )


def downgrade() -> None:
    """Downgrade schema."""

    op.add_column(
        "user_preferences",
        sa.Column(
            "preferred_category_id",
            sa.UUID(),
            nullable=True
        )
    )

    op.drop_index(
        "idx_user_preference_category",
        table_name="user_preferences"
    )

    op.create_index(
        "idx_user_preference_category",
        "user_preferences",
        ["preferred_category_id"],
        unique=False
    )

    op.create_foreign_key(
        "user_preferences_preferred_category_id_fkey",
        "user_preferences",
        "categories",
        ["preferred_category_id"],
        ["category_id"]
    )

    op.drop_column(
        "user_preferences",
        "preferred_category"
    )