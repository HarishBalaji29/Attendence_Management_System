from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime


class EmployeeBase(BaseModel):
    name: str
    email: EmailStr
    mobile: Optional[str] = None
    department: str
    designation: str
    status: str = "Active"


class EmployeeCreate(EmployeeBase):
    employee_id: str  # e.g. EMP001


class EmployeeUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[EmailStr] = None
    mobile: Optional[str] = None
    department: Optional[str] = None
    designation: Optional[str] = None
    status: Optional[str] = None


class EmployeeOut(EmployeeBase):
    id: int
    employee_id: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class EmployeeListResponse(BaseModel):
    items: list[EmployeeOut]
    total: int
    page: int
    page_size: int
    total_pages: int
