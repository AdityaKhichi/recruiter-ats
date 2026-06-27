"""Add fit_analysis column to candidates

Revision ID: 20260627_add_fit_analysis
Revises: 20260627_add_fit_score_fields_cols
Create Date: 2026-06-27 00:30:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as psql


# revision identifiers, used by Alembic.
revision = "20260627_add_fit_analysis"
down_revision = "20260627_add_fit_score_fields_cols"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("candidates", sa.Column("fit_analysis", psql.JSONB(), nullable=True))


def downgrade() -> None:
    op.drop_column("candidates", "fit_analysis")
