from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base


class EmployeeQuery(Base):
    __tablename__ = "employee_queries"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), nullable=False)
    email = Column(String(100), nullable=False)
    phone = Column(String(20), nullable=False)
    status = Column(String(20), nullable=False, default="pending")  # "pending" | "resolved"
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
