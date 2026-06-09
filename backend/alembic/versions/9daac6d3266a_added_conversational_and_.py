"""Added conversational and personalization indexes

Revision ID: 9daac6d3266a
Revises: 99b705f943ef
Create Date: 2026-05-16 15:24:36.621691
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "9daac6d3266a"
down_revision: Union[str, Sequence[str], None] = "99b705f943ef"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Conversation indexes
    op.create_index(
        "idx_conversation_intent",
        "conversations",
        ["detected_intent"],
        unique=False
    )

    op.create_index(
        "idx_conversation_session",
        "conversations",
        ["session_id"],
        unique=False
    )

    op.create_index(
        "idx_conversation_user",
        "conversations",
        ["user_id"],
        unique=False
    )

    op.create_index(
        "idx_conversation_user_created",
        "conversations",
        ["user_id", "created_at"],
        unique=False
    )

    # User preference indexes
    op.create_index(
        "idx_user_preference_category",
        "user_preferences",
        ["preferred_category_id"],
        unique=False
    )

    op.create_index(
        "idx_user_preference_vendor",
        "user_preferences",
        ["favorite_vendor_id"],
        unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Remove user preference indexes
    op.drop_index(
        "idx_user_preference_vendor",
        table_name="user_preferences"
    )

    op.drop_index(
        "idx_user_preference_category",
        table_name="user_preferences"
    )

    # Remove conversation indexes
    op.drop_index(
        "idx_conversation_user_created",
        table_name="conversations"
    )

    op.drop_index(
        "idx_conversation_user",
        table_name="conversations"
    )

    op.drop_index(
        "idx_conversation_session",
        table_name="conversations"
    )

    op.drop_index(
        "idx_conversation_intent",
        table_name="conversations"
    )