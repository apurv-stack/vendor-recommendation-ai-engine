"""add_agent_configurations

Revision ID: 10d2bd1b67a3
Revises: a5f51b4e280a
Create Date: 2026-06-22 15:19:53.588139

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "10d2bd1b67a3"
down_revision: Union[str, Sequence[str], None] = "a5f51b4e280a"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table(
        "agent_configurations",

        sa.Column(
            "config_id",
            sa.UUID(),
            nullable=False
        ),

        sa.Column(
            "agent_id",
            sa.UUID(),
            nullable=False
        ),

        sa.Column(
            "configuration",
            postgresql.JSONB(astext_type=sa.Text()),
            nullable=False
        ),

        sa.Column(
            "updated_by",
            sa.Text(),
            nullable=True
        ),

        sa.Column(
            "updated_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=True
        ),

        sa.ForeignKeyConstraint(
            ["agent_id"],
            ["ai_agents.agent_id"],
            ondelete="CASCADE"
        ),

        sa.PrimaryKeyConstraint("config_id"),

        sa.UniqueConstraint("agent_id")
    )


def downgrade() -> None:

    op.drop_table("agent_configurations")