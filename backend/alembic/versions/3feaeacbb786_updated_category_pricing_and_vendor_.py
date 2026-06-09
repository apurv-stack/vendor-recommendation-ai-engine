"""Updated category pricing and vendor indexing schema

Revision ID: 3feaeacbb786
Revises: 4f8b39755957
Create Date: 2026-05-16 12:50:01.697049
"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = "3feaeacbb786"
down_revision: Union[str, Sequence[str], None] = "4f8b39755957"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Upgrade schema."""

    # Create ENUM type first
    pricing_type_enum = sa.Enum(
        "FIXED",
        "HOURLY",
        "PACKAGE",
        "CUSTOM",
        name="pricingtype"
    )

    pricing_type_enum.create(op.get_bind(), checkfirst=True)

    # Categories
    op.add_column(
        "categories",
        sa.Column("slug", sa.String(), nullable=True)
    )

    op.create_unique_constraint(
        "uq_categories_slug",
        "categories",
        ["slug"]
    )

    # Pricing Models
    op.add_column(
        "pricing_models",
        sa.Column("currency", sa.String(), nullable=True)
    )

    # Convert VARCHAR to ENUM properly
    op.execute(
        """
        ALTER TABLE pricing_models
        ALTER COLUMN pricing_type
        TYPE pricingtype
        USING pricing_type::pricingtype
        """
    )

    # Subcategories
    op.add_column(
        "subcategories",
        sa.Column("slug", sa.String(), nullable=True)
    )

    op.create_unique_constraint(
        "uq_subcategories_slug",
        "subcategories",
        ["slug"]
    )

    op.create_unique_constraint(
        "uq_subcategories_name",
        "subcategories",
        ["name"]
    )

    # Vendor Indexes
    op.create_index(
        "idx_vendor_avg_rating",
        "vendors",
        ["avg_rating"],
        unique=False
    )

    op.create_index(
        "idx_vendor_category",
        "vendors",
        ["category_id"],
        unique=False
    )

    op.create_index(
        "idx_vendor_category_city",
        "vendors",
        ["category_id", "city"],
        unique=False
    )

    op.create_index(
        "idx_vendor_city",
        "vendors",
        ["city"],
        unique=False
    )

    op.create_index(
        "idx_vendor_price_max",
        "vendors",
        ["price_max"],
        unique=False
    )

    op.create_index(
        "idx_vendor_price_min",
        "vendors",
        ["price_min"],
        unique=False
    )

    op.create_index(
        "idx_vendor_subcategory",
        "vendors",
        ["subcategory_id"],
        unique=False
    )

    op.create_index(
        "idx_vendor_subcategory_city",
        "vendors",
        ["subcategory_id", "city"],
        unique=False
    )


def downgrade() -> None:
    """Downgrade schema."""

    # Drop indexes
    op.drop_index("idx_vendor_subcategory_city", table_name="vendors")
    op.drop_index("idx_vendor_subcategory", table_name="vendors")
    op.drop_index("idx_vendor_price_min", table_name="vendors")
    op.drop_index("idx_vendor_price_max", table_name="vendors")
    op.drop_index("idx_vendor_city", table_name="vendors")
    op.drop_index("idx_vendor_category_city", table_name="vendors")
    op.drop_index("idx_vendor_category", table_name="vendors")
    op.drop_index("idx_vendor_avg_rating", table_name="vendors")

    # Subcategories
    op.drop_constraint(
        "uq_subcategories_name",
        "subcategories",
        type_="unique"
    )

    op.drop_constraint(
        "uq_subcategories_slug",
        "subcategories",
        type_="unique"
    )

    op.drop_column("subcategories", "slug")

    # Pricing Models
    op.execute(
        """
        ALTER TABLE pricing_models
        ALTER COLUMN pricing_type
        TYPE VARCHAR
        USING pricing_type::text
        """
    )

    op.drop_column("pricing_models", "currency")

    # Drop ENUM type
    pricing_type_enum = sa.Enum(
        "FIXED",
        "HOURLY",
        "PACKAGE",
        "CUSTOM",
        name="pricingtype"
    )

    pricing_type_enum.drop(op.get_bind(), checkfirst=True)

    # Categories
    op.drop_constraint(
        "uq_categories_slug",
        "categories",
        type_="unique"
    )

    op.drop_column("categories", "slug")