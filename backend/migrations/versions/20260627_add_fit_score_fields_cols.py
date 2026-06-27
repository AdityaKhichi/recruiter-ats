"""Add fit score denormalized fields to candidates

Revision ID: 20260627_add_fit_score_fields_cols
Revises: 20260627_add_fit_score_json
Create Date: 2026-06-27 00:20:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as psql


# revision identifiers, used by Alembic.
revision = "20260627_add_fit_score_fields_cols"
down_revision = "20260627_add_fit_score_json"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("candidates", sa.Column("fit_score", sa.Integer(), nullable=True))
    op.add_column("candidates", sa.Column("fit_summary", sa.Text(), nullable=True))
    op.add_column("candidates", sa.Column("fit_strengths", psql.JSONB(), nullable=True))
    op.add_column("candidates", sa.Column("fit_gaps", psql.JSONB(), nullable=True))
    op.add_column("candidates", sa.Column("fit_recommendation", sa.String(length=64), nullable=True))


def downgrade() -> None:
    op.drop_column("candidates", "fit_recommendation")
    op.drop_column("candidates", "fit_gaps")
    op.drop_column("candidates", "fit_strengths")
    op.drop_column("candidates", "fit_summary")
    op.drop_column("candidates", "fit_score")
