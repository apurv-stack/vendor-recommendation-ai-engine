"""saved vendors

Revision ID: 19fc22ae5a5b
Revises: 289dd562ef51
Create Date: 2026-05-25

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


revision: str = "19fc22ae5a5b"

down_revision: Union[
    str,
    Sequence[str],
    None

] = "289dd562ef51"

branch_labels = None

depends_on = None


def upgrade() -> None:

    op.create_table(

        "saved_vendors",

        sa.Column(

            "saved_id",

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

            server_default=

            sa.text(

                "now()"

            ),

            nullable=True

        ),

        sa.ForeignKeyConstraint(

            ["user_id"],

            ["users.user_id"],

            ondelete=

            "CASCADE"

        ),

        sa.ForeignKeyConstraint(

            ["vendor_id"],

            ["vendors.vendor_id"],

            ondelete=

            "CASCADE"

        ),

        sa.PrimaryKeyConstraint(

            "saved_id"

        ),

        sa.UniqueConstraint(

            "user_id",

            "vendor_id",

            name=

            "unique_saved_vendor"

        )

    )


def downgrade() -> None:

    op.drop_table(

        "saved_vendors"

    )