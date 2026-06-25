from pydantic import BaseModel, EmailStr
from datetime import datetime


class EmployeeQueryCreate(BaseModel):
    username: str
    email: EmailStr
    phone: str


class EmployeeQueryOut(BaseModel):
    id: int
    username: str
    email: str
    phone: str
    status: str
    created_at: datetime
    updated_at: datetime | None = None

    class Config:
        from_attributes = True
