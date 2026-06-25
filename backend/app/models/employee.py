from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base


class Employee(Base):
    __tablename__ = "employees"

    id = Column(Integer, primary_key=True, index=True)
    employee_id = Column(String(20), unique=True, nullable=False, index=True)  # e.g. EMP001
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, nullable=False, index=True)
    mobile = Column(String(15), nullable=True)
    department = Column(String(50), nullable=False)
    designation = Column(String(50), nullable=False)
    status = Column(String(10), nullable=False, default="Active")  # Active | Inactive
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    created_by = Column(Integer, ForeignKey("users.id"), nullable=True)

    # Relationships
    attendances = relationship("Attendance", back_populates="employee", cascade="all, delete-orphan")
    creator = relationship("User", foreign_keys=[created_by])
