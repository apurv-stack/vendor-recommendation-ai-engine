"""vendor user mapping fixed

Revision ID: 28a4ebae163d
Revises: e61dad1d6541
Create Date: 2026-05-19 15:22:17.687390

"""

from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.

revision: str = '28a4ebae163d'

down_revision: Union[str, Sequence[str], None] = 'e61dad1d6541'

branch_labels: Union[str, Sequence[str], None] = None

depends_on: Union[str, Sequence[str], None] = None


# ---------------------------------------------------
# UPGRADE
# ---------------------------------------------------

def upgrade() -> None:

    # ---------------------------------------------
    # ADD user_id COLUMN
    # ---------------------------------------------

    op.add_column(

        'vendors',

        sa.Column(
            'user_id',
            sa.UUID(),
            nullable=True
        )
    )

    # ---------------------------------------------
    # MAKE OPTIONAL FIELDS NULLABLE
    # ---------------------------------------------

    op.alter_column(

        'vendors',

        'slug',

        existing_type=sa.VARCHAR(),

        nullable=True
    )

    op.alter_column(

        'vendors',

        'category_id',

        existing_type=sa.UUID(),

        nullable=True
    )

    op.alter_column(

        'vendors',

        'subcategory_id',

        existing_type=sa.UUID(),

        nullable=True
    )

    op.alter_column(

        'vendors',

        'city',

        existing_type=sa.VARCHAR(),

        nullable=True
    )

    # ---------------------------------------------
    # UNIQUE CONSTRAINT
    # ---------------------------------------------

    op.create_unique_constraint(

        'uq_vendors_user_id',

        'vendors',

        ['user_id']
    )

    # ---------------------------------------------
    # FOREIGN KEY
    # ---------------------------------------------

    op.create_foreign_key(

        'fk_vendors_user_id',

        'vendors',

        'users',

        ['user_id'],

        ['user_id']
    )


# ---------------------------------------------------
# DOWNGRADE
# ---------------------------------------------------

def downgrade() -> None:

    # ---------------------------------------------
    # DROP FOREIGN KEY
    # ---------------------------------------------

    op.drop_constraint(

        'fk_vendors_user_id',

        'vendors',

        type_='foreignkey'
    )

    # ---------------------------------------------
    # DROP UNIQUE CONSTRAINT
    # ---------------------------------------------

    op.drop_constraint(

        'uq_vendors_user_id',

        'vendors',

        type_='unique'
    )

    # ---------------------------------------------
    # REVERT NULLABLE CHANGES
    # ---------------------------------------------

    op.alter_column(

        'vendors',

        'city',

        existing_type=sa.VARCHAR(),

        nullable=False
    )

    op.alter_column(

        'vendors',

        'subcategory_id',

        existing_type=sa.UUID(),

        nullable=False
    )

    op.alter_column(

        'vendors',

        'category_id',

        existing_type=sa.UUID(),

        nullable=False
    )

    op.alter_column(

        'vendors',

        'slug',

        existing_type=sa.VARCHAR(),

        nullable=False
    )

    # ---------------------------------------------
    # DROP user_id COLUMN
    # ---------------------------------------------

    op.drop_column('vendors', 'user_id')