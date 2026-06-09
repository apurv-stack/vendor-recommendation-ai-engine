"""add notifications

Revision ID: 289dd562ef51
Revises: 5695551905b1
Create Date: 2026-05-25 14:50:19.575357
"""

from typing import Sequence, Union

from alembic import op

import sqlalchemy as sa

from sqlalchemy.dialects import postgresql


# revision identifiers

revision: str = "289dd562ef51"

down_revision: Union[
    str,
    Sequence[str],
    None
] = "5695551905b1"

branch_labels: Union[
    str,
    Sequence[str],
    None
] = None

depends_on: Union[
    str,
    Sequence[str],
    None
] = None


def upgrade() -> None:

    op.create_table(

        "notifications",

        sa.Column(

            "notification_id",

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

            "title",

            sa.String(),

            nullable=False

        ),

        sa.Column(

            "message",

            sa.String(),

            nullable=False

        ),

        sa.Column(

            "is_read",

            sa.Boolean(),

            nullable=False,

            server_default="false"

        ),

        sa.Column(

            "created_at",

            sa.DateTime(

                timezone=True

            ),

            nullable=False,

            server_default=sa.func.now()

        ),

        sa.ForeignKeyConstraint(

            [

                "vendor_id"

            ],

            [

                "vendors.vendor_id"

            ],

            ondelete="CASCADE"

        ),

        sa.PrimaryKeyConstraint(

            "notification_id"

        )

    )


def downgrade() -> None:

    op.drop_table(

        "notifications"

    )