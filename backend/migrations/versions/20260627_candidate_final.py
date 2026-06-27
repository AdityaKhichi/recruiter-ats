"""Add parsed_resume and fit_analysis to candidates (final AI schema)

Revision ID: 20260627_candidate_final
Revises: 0399f4a433bc
Create Date: 2026-06-27 01:00:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as psql


# revision identifiers, used by Alembic.
revision = "20260627_candidate_final"
down_revision = "0399f4a433bc"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("candidates", sa.Column("parsed_resume", psql.JSONB(), nullable=True))
    op.add_column("candidates", sa.Column("fit_analysis", psql.JSONB(), nullable=True))


def downgrade() -> None:
    op.drop_column("candidates", "fit_analysis")
    op.drop_column("candidates", "parsed_resume")
