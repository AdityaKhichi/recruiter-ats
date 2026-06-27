"""Add parsed_resume column to candidates

Revision ID: 20260627_add_parsed_resume
Revises: 0399f4a433bc
Create Date: 2026-06-27 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as psql


# revision identifiers, used by Alembic.
revision = "20260627_add_parsed_resume"
down_revision = "0399f4a433bc"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("candidates", sa.Column("parsed_resume", psql.JSONB(), nullable=True))


def downgrade() -> None:
    op.drop_column("candidates", "parsed_resume")
