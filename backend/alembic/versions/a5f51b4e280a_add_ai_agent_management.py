"""add_ai_agent_management

Revision ID: a5f51b4e280a
Revises: 344d8906e268
Create Date: 2026-06-22 12:45:24.969199

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'a5f51b4e280a'
down_revision: Union[str, Sequence[str], None] = '344d8906e268'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:

    op.create_table(
        'ai_agents',
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('agent_name', sa.String(), nullable=False),
        sa.Column('display_name', sa.String(), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('status', sa.Boolean(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'),
                  nullable=True),
        sa.Column('updated_at', sa.DateTime(timezone=True),
                  server_default=sa.text('now()'),
                  nullable=True),
        sa.PrimaryKeyConstraint('agent_id'),
        sa.UniqueConstraint('agent_name')
    )

    op.create_table(
        'agent_audit_logs',
        sa.Column('audit_id', sa.UUID(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('action', sa.String(), nullable=False),
        sa.Column('old_value',
                  postgresql.JSONB(astext_type=sa.Text()),
                  nullable=True),
        sa.Column('new_value',
                  postgresql.JSONB(astext_type=sa.Text()),
                  nullable=True),
        sa.Column('modified_by', sa.String(), nullable=True),
        sa.Column('modified_at',
                  sa.DateTime(timezone=True),
                  server_default=sa.text('now()'),
                  nullable=True),
        sa.ForeignKeyConstraint(
            ['agent_id'],
            ['ai_agents.agent_id']
        ),
        sa.PrimaryKeyConstraint('audit_id')
    )

    op.create_table(
        'agent_prompts',
        sa.Column('prompt_id', sa.UUID(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('base_prompt', sa.Text(), nullable=True),
        sa.Column('role_instructions', sa.Text(), nullable=True),
        sa.Column('behavior_guidelines', sa.Text(), nullable=True),
        sa.Column('formatting_rules', sa.Text(), nullable=True),
        sa.Column('business_rules', sa.Text(), nullable=True),
        sa.Column('updated_by', sa.Text(), nullable=True),
        sa.Column('updated_at',
                  sa.DateTime(timezone=True),
                  server_default=sa.text('now()'),
                  nullable=True),
        sa.ForeignKeyConstraint(
            ['agent_id'],
            ['ai_agents.agent_id']
        ),
        sa.PrimaryKeyConstraint('prompt_id')
    )

    op.create_table(
        'prompt_versions',
        sa.Column('version_id', sa.UUID(), nullable=False),
        sa.Column('agent_id', sa.UUID(), nullable=False),
        sa.Column('version_number', sa.Integer(), nullable=False),
        sa.Column('base_prompt', sa.Text(), nullable=True),
        sa.Column('role_instructions', sa.Text(), nullable=True),
        sa.Column('behavior_guidelines', sa.Text(), nullable=True),
        sa.Column('formatting_rules', sa.Text(), nullable=True),
        sa.Column('business_rules', sa.Text(), nullable=True),
        sa.Column('change_notes', sa.Text(), nullable=True),
        sa.Column('created_by', sa.Text(), nullable=True),
        sa.Column('created_at',
                  sa.DateTime(timezone=True),
                  server_default=sa.text('now()'),
                  nullable=True),
        sa.ForeignKeyConstraint(
            ['agent_id'],
            ['ai_agents.agent_id']
        ),
        sa.PrimaryKeyConstraint('version_id')
    )


def downgrade() -> None:

    op.drop_table('prompt_versions')
    op.drop_table('agent_prompts')
    op.drop_table('agent_audit_logs')
    op.drop_table('ai_agents')
