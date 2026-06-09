"""create service table

Revision ID: 792259af2fa6
Revises: fe5bbc79ada8
Create Date: 2026-05-25 12:12:34.423664

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql


# revision identifiers

revision: str = "792259af2fa6"

down_revision: Union[
    str,
    Sequence[str],
    None
] = "fe5bbc79ada8"

branch_labels = None

depends_on = None


def upgrade():

    # ==========================
    # REMOVE FK FIRST
    # ==========================

    op.drop_constraint(

        "user_preferences_preferred_subcategory_id_fkey",

        "user_preferences",

        type_="foreignkey"

    )

    # ==========================
    # REMOVE COLUMN
    # ==========================

    op.drop_column(

        "user_preferences",

        "preferred_subcategory_id"

    )

    # ==========================
    # REMOVE SUBCATEGORY TABLE
    # ==========================

    op.drop_table(

        "subcategories"

    )

    # ==========================
    # CREATE SERVICES TABLE
    # ==========================

    op.create_table(

        "services",

        sa.Column(

            "service_id",

            postgresql.UUID(

                as_uuid=True

            ),

            nullable=False

        ),

        sa.Column(

            "service_name",

            sa.String(),

            nullable=False

        ),

        sa.Column(

            "category_vendor_id",

            postgresql.UUID(

                as_uuid=True

            ),

            nullable=False

        ),

        sa.ForeignKeyConstraint(

            [

                "category_vendor_id"

            ],

            [

                "vendors.vendor_id"

            ],

            ondelete="CASCADE"

        ),

        sa.PrimaryKeyConstraint(

            "service_id"

        ),

        sa.UniqueConstraint(

            "category_vendor_id",

            "service_name",

            name=

            "unique_service_per_category"

        )

    )


def downgrade():

    op.drop_table(

        "services"

    )

    op.create_table(

        "subcategories",

        sa.Column(

            "subcategory_id",

            postgresql.UUID(

                as_uuid=True

            ),

            nullable=False

        ),

        sa.Column(

            "category_id",

            postgresql.UUID(

                as_uuid=True

            ),

            nullable=False

        ),

        sa.Column(

            "name",

            sa.String(),

            nullable=False

        ),

        sa.Column(

            "slug",

            sa.String(),

            nullable=False

        ),

        sa.Column(

            "description",

            sa.Text(),

            nullable=True

        ),

        sa.Column(

            "is_active",

            sa.Boolean(),

            nullable=True

        ),

        sa.PrimaryKeyConstraint(

            "subcategory_id"

        )

    )

    op.add_column(

        "user_preferences",

        sa.Column(

            "preferred_subcategory_id",

            postgresql.UUID(

                as_uuid=True

            ),

            nullable=True

        )

    )

    op.create_foreign_key(

        "user_preferences_preferred_subcategory_id_fkey",

        "user_preferences",

        "subcategories",

        [

            "preferred_subcategory_id"

        ],

        [

            "subcategory_id"

        ]

    )