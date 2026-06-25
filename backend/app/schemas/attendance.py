from pydantic import BaseModel
from typing import Optional
from datetime import date, time, datetime


class AttendanceBase(BaseModel):
    attendance_date: date
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: str = "Present"
    notes: Optional[str] = None


class AttendanceCreate(AttendanceBase):
    employee_id: int  # DB pk of employees table


class AttendanceUpdate(BaseModel):
    check_in: Optional[time] = None
    check_out: Optional[time] = None
    status: Optional[str] = None
    notes: Optional[str] = None


class AttendanceOut(AttendanceBase):
    id: int
    employee_id: int
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    department: Optional[str] = None
    marked_by: Optional[int] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True


class AttendanceListResponse(BaseModel):
    items: list[AttendanceOut]
    total: int
    page: int
    page_size: int
    total_pages: int


class AttendanceSummary(BaseModel):
    employee_id: int
    employee_name: str
    employee_code: str
    department: str
    total_days: int
    present: int
    absent: int
    late: int
    half_day: int
    attendance_percentage: float


class DepartmentStat(BaseModel):
    department: str
    count: int


class DashboardStats(BaseModel):
    total_employees: int
    active_employees: int
    present_today: int
    absent_today: int
    late_today: int
    departments: list[DepartmentStat]
    total_marked_today: int


# ---- Attendance Request Schemas ----
class AttendanceRequestBase(BaseModel):
    attendance_date: date
    request_type: str  # "regularization" | "correction"
    requested_status: str  # Present | Absent | Late | Half-Day
    reason: Optional[str] = None
    check_in: Optional[time] = None
    check_out: Optional[time] = None


class AttendanceRequestCreate(AttendanceRequestBase):
    employee_id: int


class AttendanceRequestUpdate(BaseModel):
    status: Optional[str] = None  # "pending" | "approved" | "rejected"
    admin_notes: Optional[str] = None


class AttendanceRequestOut(AttendanceRequestBase):
    id: int
    employee_id: int
    status: str
    employee_name: Optional[str] = None
    employee_code: Optional[str] = None
    requested_at: Optional[datetime] = None
    reviewed_at: Optional[datetime] = None
    reviewed_by: Optional[int] = None
    admin_notes: Optional[str] = None

    class Config:
        from_attributes = True


class AttendanceRequestListResponse(BaseModel):
    items: list[AttendanceRequestOut]
    total: int
    page: int
    page_size: int
    total_pages: int
