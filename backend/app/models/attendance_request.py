from sqlalchemy import Column, Integer, String, Date, DateTime, Time, ForeignKey, Text, func
from sqlalchemy.orm import relationship
from app.database import Base


class AttendanceRequest(Base):
    """Model for employees to request attendance regularization/correction"""
    __tablename__ = "attendance_requests"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    attendance_date = Column(Date, nullable=False, index=True)
    request_type = Column(String(20), nullable=False, default="regularization")  # "regularization" | "correction"
    status = Column(String(20), nullable=False, default="pending")  # "pending" | "approved" | "rejected"
    check_in = Column(Time(timezone=False), nullable=True)
    check_out = Column(Time(timezone=False), nullable=True)
    requested_status = Column(String(10), nullable=False, default="Present")  # Present | Absent | Late | Half-Day
    reason = Column(Text, nullable=True)
    admin_notes = Column(Text, nullable=True)
    requested_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    employee = relationship("Employee", foreign_keys=[employee_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])
