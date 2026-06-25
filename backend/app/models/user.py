from sqlalchemy import Column, Integer, String, Boolean, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String, nullable=False)
    role = Column(String(20), nullable=False, default="employee")  # "admin" | "employee"
    is_active = Column(Boolean, default=True)
    employee_id = Column(Integer, nullable=True)  # linked employee record (for employee users)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    # Relationships
    marked_attendances = relationship("Attendance", back_populates="marked_by_user", foreign_keys="Attendance.marked_by")
    updated_attendances = relationship("Attendance", back_populates="updated_by_user", foreign_keys="Attendance.updated_by")
