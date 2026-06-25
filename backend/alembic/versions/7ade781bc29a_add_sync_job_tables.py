"""add sync job tables

Revision ID: 7ade781bc29a
Revises: c65bb42a7a31
Create Date: 2026-06-25 11:27:02.201034

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = '7ade781bc29a'
down_revision: Union[str, Sequence[str], None] = 'c65bb42a7a31'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table(
        "sync_job_runs",

        sa.Column("run_id", sa.UUID(), nullable=False),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("total_vendors", sa.Integer(), nullable=False),
        sa.Column("success_count", sa.Integer(), nullable=False),
        sa.Column("failed_count", sa.Integer(), nullable=False),
        sa.Column(
            "started_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False
        ),
        sa.Column(
            "completed_at",
            sa.DateTime(timezone=True),
            nullable=True
        ),

        sa.PrimaryKeyConstraint("run_id")
    )

    op.create_table(
        "sync_activity_logs",

        sa.Column("log_id", sa.UUID(), nullable=False),
        sa.Column("run_id", sa.UUID(), nullable=False),
        sa.Column("vendor_id", sa.UUID(), nullable=True),
        sa.Column("vendor_name", sa.String(), nullable=True),
        sa.Column("status", sa.String(), nullable=False),
        sa.Column("attempts", sa.Integer(), nullable=False),
        sa.Column("message", sa.Text(), nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            server_default=sa.text("now()"),
            nullable=False
        ),

        sa.PrimaryKeyConstraint("log_id")
    )

def downgrade() -> None:

    op.drop_table("sync_activity_logs")

    op.drop_table("sync_job_runs")
    # ### end Alembic commands ###
