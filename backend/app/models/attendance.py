from sqlalchemy import Column, Integer, String, Date, Time, DateTime, ForeignKey, Text, UniqueConstraint, func
from sqlalchemy.orm import relationship
from app.database import Base


class Attendance(Base):
    __tablename__ = "attendance"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(Integer, ForeignKey("employees.id", ondelete="CASCADE"), nullable=False, index=True)
    attendance_date = Column(Date, nullable=False, index=True)
    check_in = Column(Time(timezone=False), nullable=True)
    check_out = Column(Time(timezone=False), nullable=True)
    status = Column(String(10), nullable=False, default="Present")  # Present | Absent | Late | Half-Day
    notes = Column(Text, nullable=True)
    is_regularized = Column(String(1), nullable=False, default="N")  # Y | N (for self-marked vs admin-corrected)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    marked_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    updated_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    employee = relationship("Employee", back_populates="attendances")
    marked_by_user = relationship("User", back_populates="marked_attendances", foreign_keys=[marked_by])
    updated_by_user = relationship("User", back_populates="updated_attendances", foreign_keys=[updated_by])

    __table_args__ = (
        UniqueConstraint("employee_id", "attendance_date", name="uq_employee_date"),
    )
