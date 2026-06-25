from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import date

from app.database import get_db
from app.models.employee import Employee
from app.models.attendance import Attendance
from app.models.user import User
from app.schemas.attendance import DashboardStats, DepartmentStat
from app.utils.dependencies import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    today = date.today()

    total_employees = db.query(Employee).count()
    active_employees = db.query(Employee).filter(Employee.status == "Active").count()

    today_records = db.query(Attendance).filter(Attendance.attendance_date == today).all()
    present_today = sum(1 for r in today_records if r.status in ("Present", "Late", "Half-Day"))
    absent_today = sum(1 for r in today_records if r.status == "Absent")
    late_today = sum(1 for r in today_records if r.status == "Late")
    total_marked_today = len(today_records)

    dept_rows = (
        db.query(Employee.department, func.count(Employee.id).label("count"))
        .group_by(Employee.department)
        .all()
    )
    departments = [DepartmentStat(department=r[0], count=r[1]) for r in dept_rows]

    return DashboardStats(
        total_employees=total_employees,
        active_employees=active_employees,
        present_today=present_today,
        absent_today=absent_today,
        late_today=late_today,
        departments=departments,
        total_marked_today=total_marked_today,
    )
