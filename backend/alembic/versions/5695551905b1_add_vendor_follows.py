"""add vendor follows

Revision ID: 5695551905b1
Revises: 12522cbe8b68
Create Date: 2026-05-25

"""

from typing import Sequence, Union

from alembic import op

import sqlalchemy as sa

from sqlalchemy import inspect

from sqlalchemy.dialects import postgresql


revision: str = "5695551905b1"

down_revision: Union[str, Sequence[str], None] = "12522cbe8b68"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    bind = op.get_bind()

    inspector = inspect(bind)

    existing_tables = inspector.get_table_names()

    if "vendor_follows" not in existing_tables:

        op.create_table(

            "vendor_follows",

            sa.Column(

                "follower_id",

                postgresql.UUID(

                    as_uuid=True

                ),

                nullable=False

            ),

            sa.Column(

                "user_id",

                postgresql.UUID(

                    as_uuid=True

                ),

                nullable=False

            ),

            sa.Column(

                "vendor_id",

                postgresql.UUID(

                    as_uuid=True

                ),

                nullable=False

            ),

            sa.Column(

                "created_at",

                sa.DateTime(

                    timezone=True

                ),

                server_default=sa.text(

                    "now()"

                ),

                nullable=False

            ),

            sa.ForeignKeyConstraint(

                ["user_id"],

                ["users.user_id"],

                ondelete="CASCADE"

            ),

            sa.ForeignKeyConstraint(

                ["vendor_id"],

                ["vendors.vendor_id"],

                ondelete="CASCADE"

            ),

            sa.PrimaryKeyConstraint(

                "follower_id"

            ),

            sa.UniqueConstraint(

                "user_id",

                "vendor_id",

                name=

                "unique_user_vendor_follow"

            )

        )


def downgrade() -> None:

    bind = op.get_bind()

    inspector = inspect(bind)

    existing_tables = inspector.get_table_names()

    if "vendor_follows" in existing_tables:

        op.drop_table(

            "vendor_follows"

        )