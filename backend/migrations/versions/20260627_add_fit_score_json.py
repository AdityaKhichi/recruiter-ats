"""Add fit_score_json column to candidates

Revision ID: 20260627_add_fit_score_json
Revises: 20260627_add_parsed_resume
Create Date: 2026-06-27 00:10:00.000000
"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql as psql


# revision identifiers, used by Alembic.
revision = "20260627_add_fit_score_json"
down_revision = "20260627_add_parsed_resume"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("candidates", sa.Column("fit_score_json", psql.JSONB(), nullable=True))


def downgrade() -> None:
    op.drop_column("candidates", "fit_score_json")
