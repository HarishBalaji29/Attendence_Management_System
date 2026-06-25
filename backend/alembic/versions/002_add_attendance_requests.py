"""Add attendance request table and update attendance table

Revision ID: 002
Revises: 001
Create Date: 2026-06-25

"""
from alembic import op
import sqlalchemy as sa

revision = '002'
down_revision = '001'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add new columns to attendance table
    op.add_column('attendance', sa.Column('is_regularized', sa.String(1), nullable=False, server_default='N'))
    op.add_column('attendance', sa.Column('updated_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True))
    
    # Create attendance_requests table
    op.create_table(
        'attendance_requests',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('employee_id', sa.Integer(), sa.ForeignKey('employees.id', ondelete='CASCADE'), nullable=False),
        sa.Column('attendance_date', sa.Date(), nullable=False),
        sa.Column('request_type', sa.String(length=20), nullable=False, server_default='regularization'),
        sa.Column('status', sa.String(length=20), nullable=False, server_default='pending'),
        sa.Column('check_in', sa.DateTime(timezone=False), nullable=True),
        sa.Column('check_out', sa.DateTime(timezone=False), nullable=True),
        sa.Column('requested_status', sa.String(length=10), nullable=False, server_default='Present'),
        sa.Column('reason', sa.Text(), nullable=True),
        sa.Column('admin_notes', sa.Text(), nullable=True),
        sa.Column('requested_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('reviewed_at', sa.DateTime(timezone=True), nullable=True),
        sa.Column('reviewed_by', sa.Integer(), sa.ForeignKey('users.id'), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()')),
        sa.Column('updated_at', sa.DateTime(timezone=True), nullable=True),
        sa.PrimaryKeyConstraint('id'),
    )
    op.create_index(op.f('ix_attendance_requests_id'), 'attendance_requests', ['id'], unique=False)
    op.create_index(op.f('ix_attendance_requests_employee_id'), 'attendance_requests', ['employee_id'], unique=False)
    op.create_index(op.f('ix_attendance_requests_attendance_date'), 'attendance_requests', ['attendance_date'], unique=False)


def downgrade() -> None:
    op.drop_table('attendance_requests')
    op.drop_column('attendance', 'updated_by')
    op.drop_column('attendance', 'is_regularized')
