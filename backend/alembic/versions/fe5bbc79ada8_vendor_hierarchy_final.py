"""vendor hierarchy final

Revision ID: fe5bbc79ada8
Revises: 35b275d81a1f
Create Date: 2026-05-23 13:48:23.662632

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers

revision: str = "fe5bbc79ada8"

down_revision: Union[str, Sequence[str], None] = "35b275d81a1f"

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """
    Upgrade schema
    """

    # ==========================================
    # REMOVE OLD CATEGORY MAPPING TABLE
    # ==========================================

    op.drop_table(
        "vendor_categories"
    )

    # ==========================================
    # CONTACT FIELDS REQUIRED
    # ==========================================

    op.alter_column(

        "vendors",

        "business_email",

        existing_type=sa.VARCHAR(),

        nullable=False

    )

    op.alter_column(

        "vendors",

        "contact_phone",

        existing_type=sa.VARCHAR(),

        nullable=False

    )


def downgrade() -> None:
    """
    Downgrade schema
    """

    # ==========================================
    # CONTACT OPTIONAL AGAIN
    # ==========================================

    op.alter_column(

        "vendors",

        "contact_phone",

        existing_type=sa.VARCHAR(),

        nullable=True

    )

    op.alter_column(

        "vendors",

        "business_email",

        existing_type=sa.VARCHAR(),

        nullable=True

    )

    # ==========================================
    # RESTORE OLD TABLE
    # ==========================================

    op.create_table(

        "vendor_categories",

        sa.Column(

            "vendor_category_id",

            sa.UUID(),

            nullable=False

        ),

        sa.Column(

            "vendor_id",

            sa.UUID(),

            nullable=False

        ),

        sa.Column(

            "category_id",

            sa.UUID(),

            nullable=False

        ),

        sa.ForeignKeyConstraint(

            ["vendor_id"],

            ["vendors.vendor_id"]

        ),

        sa.ForeignKeyConstraint(

            ["category_id"],

            ["categories.category_id"]

        ),

        sa.PrimaryKeyConstraint(

            "vendor_category_id"

        )

    )