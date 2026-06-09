"""add analytics fields

Revision ID: 12522cbe8b68
Revises: 792259af2fa6
Create Date: 2026-05-25
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


revision = "12522cbe8b68"

down_revision = "792259af2fa6"

branch_labels = None

depends_on = None


def upgrade():

    op.add_column(

        "vendors",

        sa.Column(

            "followers_count",

            sa.Integer(),

            nullable=False,

            server_default="0"

        )

    )

    op.add_column(

        "vendors",

        sa.Column(

            "profile_views",

            sa.Integer(),

            nullable=False,

            server_default="0"

        )

    )

    op.add_column(

        "vendors",

        sa.Column(

            "engagement_score",

            sa.Float(),

            nullable=False,

            server_default="0"

        )

    )


def downgrade():

    op.drop_column(

        "vendors",

        "engagement_score"

    )

    op.drop_column(

        "vendors",

        "profile_views"

    )

    op.drop_column(

        "vendors",

        "followers_count"

    )