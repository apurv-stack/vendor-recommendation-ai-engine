"""Enhanced user preference and conversational memory architecture

Revision ID: 99b705f943ef
Revises: a592ac9a08ab
Create Date: 2026-05-16 14:42:37.750131
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "99b705f943ef"
down_revision: Union[str, Sequence[str], None] = "a592ac9a08ab"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Conversations table
    op.add_column(
        "conversations",
        sa.Column(
            "session_id",
            sa.UUID(),
            nullable=True
        )
    )

    op.add_column(
        "conversations",
        sa.Column(
            "detected_intent",
            sa.String(),
            nullable=True
        )
    )

    op.add_column(
        "conversations",
        sa.Column(
            "applied_filters",
            sa.Text(),
            nullable=True
        )
    )

    op.add_column(
        "conversations",
        sa.Column(
            "is_follow_up",
            sa.Boolean(),
            nullable=True
        )
    )

    op.add_column(
        "conversations",
        sa.Column(
            "context_summary",
            sa.Text(),
            nullable=True
        )
    )

    # User Preferences table
    op.add_column(
        "user_preferences",
        sa.Column(
            "preferred_event_type",
            sa.String(),
            nullable=True
        )
    )

    op.add_column(
        "user_preferences",
        sa.Column(
            "favorite_vendor_id",
            sa.UUID(),
            nullable=True
        )
    )

    op.add_column(
        "user_preferences",
        sa.Column(
            "preference_notes",
            sa.String(),
            nullable=True
        )
    )

    op.create_foreign_key(
        "fk_user_preferences_favorite_vendor",
        "user_preferences",
        "vendors",
        ["favorite_vendor_id"],
        ["vendor_id"]
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Remove foreign key
    op.drop_constraint(
        "fk_user_preferences_favorite_vendor",
        "user_preferences",
        type_="foreignkey"
    )

    # Remove user preference columns
    op.drop_column(
        "user_preferences",
        "preference_notes"
    )

    op.drop_column(
        "user_preferences",
        "favorite_vendor_id"
    )

    op.drop_column(
        "user_preferences",
        "preferred_event_type"
    )

    # Remove conversation columns
    op.drop_column(
        "conversations",
        "context_summary"
    )

    op.drop_column(
        "conversations",
        "is_follow_up"
    )

    op.drop_column(
        "conversations",
        "applied_filters"
    )

    op.drop_column(
        "conversations",
        "detected_intent"
    )

    op.drop_column(
        "conversations",
        "session_id"
    )