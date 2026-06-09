"""Enhanced review schema with moderation and sentiment support

Revision ID: a592ac9a08ab
Revises: 3feaeacbb786
Create Date: 2026-05-16 14:21:16.356551
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "a592ac9a08ab"
down_revision: Union[str, Sequence[str], None] = "3feaeacbb786"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Add new review fields
    op.add_column(
        "reviews",
        sa.Column(
            "review_title",
            sa.String(),
            nullable=True
        )
    )

    op.add_column(
        "reviews",
        sa.Column(
            "is_approved",
            sa.Boolean(),
            nullable=False,
            server_default=sa.true()
        )
    )

    op.add_column(
        "reviews",
        sa.Column(
            "sentiment_score",
            sa.Float(),
            nullable=True
        )
    )

    # Create indexes
    op.create_index(
        "idx_review_created_at",
        "reviews",
        ["created_at"],
        unique=False
    )

    op.create_index(
        "idx_review_rating",
        "reviews",
        ["rating"],
        unique=False
    )

    op.create_index(
        "idx_review_user",
        "reviews",
        ["user_id"],
        unique=False
    )

    op.create_index(
        "idx_review_vendor",
        "reviews",
        ["vendor_id"],
        unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Drop indexes
    op.drop_index(
        "idx_review_vendor",
        table_name="reviews"
    )

    op.drop_index(
        "idx_review_user",
        table_name="reviews"
    )

    op.drop_index(
        "idx_review_rating",
        table_name="reviews"
    )

    op.drop_index(
        "idx_review_created_at",
        table_name="reviews"
    )

    # Drop columns
    op.drop_column("reviews", "sentiment_score")

    op.drop_column("reviews", "is_approved")

    op.drop_column("reviews", "review_title")