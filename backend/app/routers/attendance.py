from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
import math

from app.database import get_db
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.user import User
from app.schemas.attendance import (
    AttendanceCreate, AttendanceUpdate, AttendanceOut,
    AttendanceListResponse, AttendanceSummary
)
from app.utils.dependencies import get_current_user, require_admin
from app.utils.export import generate_csv_response

router = APIRouter(prefix="/api/attendance", tags=["Attendance"])


def _enrich(record: Attendance) -> dict:
    return {
        "id": record.id,
        "employee_id": record.employee_id,
        "employee_name": record.employee.name if record.employee else None,
        "employee_code": record.employee.employee_id if record.employee else None,
        "department": record.employee.department if record.employee else None,
        "attendance_date": record.attendance_date,
        "check_in": record.check_in,
        "check_out": record.check_out,
        "status": record.status,
        "notes": record.notes,
        "marked_by": record.marked_by,
        "created_at": record.created_at,
        "updated_at": record.updated_at,
    }


@router.get("", response_model=AttendanceListResponse)
def list_attendance(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    employee_id: Optional[int] = Query(None),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    status: Optional[str] = Query(None),
    department: Optional[str] = Query(None),
    sort_order: Optional[str] = Query("desc"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Attendance).join(Employee)

    if current_user.role == "employee" and current_user.employee_id:
        query = query.filter(Attendance.employee_id == current_user.employee_id)
    elif employee_id:
        query = query.filter(Attendance.employee_id == employee_id)

    if date_from:
        query = query.filter(Attendance.attendance_date >= date_from)
    if date_to:
        query = query.filter(Attendance.attendance_date <= date_to)
    if status:
        query = query.filter(Attendance.status == status)
    if department:
        query = query.filter(Employee.department == department)

    if sort_order == "asc":
        query = query.order_by(Attendance.attendance_date.asc())
    else:
        query = query.order_by(Attendance.attendance_date.desc())

    total = query.count()
    records = query.offset((page - 1) * page_size).limit(page_size).all()

    return AttendanceListResponse(
        items=[AttendanceOut(**_enrich(r)) for r in records],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 1,
    )


@router.post("", response_model=AttendanceOut)
def mark_attendance(
    payload: AttendanceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Employees can only mark their own attendance
    if current_user.role == "employee":
        if not current_user.employee_id or current_user.employee_id != payload.employee_id:
            raise HTTPException(status_code=403, detail="You can only mark your own attendance")

    employee = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    existing = db.query(Attendance).filter(
        Attendance.employee_id == payload.employee_id,
        Attendance.attendance_date == payload.attendance_date,
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Attendance already marked for this date")

    record = Attendance(**payload.model_dump(), marked_by=current_user.id)
    db.add(record)
    db.commit()
    db.refresh(record)
    return AttendanceOut(**_enrich(record))


@router.put("/{attendance_id}", response_model=AttendanceOut)
def update_attendance(
    attendance_id: int,
    payload: AttendanceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    record = db.query(Attendance).filter(Attendance.id == attendance_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Attendance record not found")

    if current_user.role == "employee":
        if not current_user.employee_id or current_user.employee_id != record.employee_id:
            raise HTTPException(status_code=403, detail="Access denied")

    for field, value in payload.model_dump(exclude_none=True).items():
        setattr(record, field, value)
    db.commit()
    db.refresh(record)
    return AttendanceOut(**_enrich(record))


@router.get("/summary", response_model=list[AttendanceSummary])
def get_summary(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = db.query(Attendance).join(Employee)
    if date_from:
        query = query.filter(Attendance.attendance_date >= date_from)
    if date_to:
        query = query.filter(Attendance.attendance_date <= date_to)
    if department:
        query = query.filter(Employee.department == department)

    records = query.all()

    # Aggregate by employee
    summary_map = {}
    for r in records:
        emp = r.employee
        key = r.employee_id
        if key not in summary_map:
            summary_map[key] = {
                "employee_id": emp.id,
                "employee_name": emp.name,
                "employee_code": emp.employee_id,
                "department": emp.department,
                "total_days": 0,
                "present": 0,
                "absent": 0,
                "late": 0,
                "half_day": 0,
            }
        summary_map[key]["total_days"] += 1
        s = r.status.lower()
        if s == "present":
            summary_map[key]["present"] += 1
        elif s == "absent":
            summary_map[key]["absent"] += 1
        elif s == "late":
            summary_map[key]["late"] += 1
        elif s == "half-day":
            summary_map[key]["half_day"] += 1

    result = []
    for v in summary_map.values():
        pct = round((v["present"] / v["total_days"]) * 100, 1) if v["total_days"] else 0
        result.append(AttendanceSummary(**v, attendance_percentage=pct))

    return result


@router.get("/employee/{employee_db_id}", response_model=AttendanceListResponse)
def employee_attendance_history(
    employee_db_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "employee" and current_user.employee_id != employee_db_id:
        raise HTTPException(status_code=403, detail="Access denied")

    query = db.query(Attendance).filter(Attendance.employee_id == employee_db_id)
    if date_from:
        query = query.filter(Attendance.attendance_date >= date_from)
    if date_to:
        query = query.filter(Attendance.attendance_date <= date_to)
    query = query.order_by(Attendance.attendance_date.desc())

    total = query.count()
    records = query.offset((page - 1) * page_size).limit(page_size).all()

    return AttendanceListResponse(
        items=[AttendanceOut(**_enrich(r)) for r in records],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 1,
    )


@router.get("/export/csv")
def export_csv(
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    department: Optional[str] = Query(None),
    employee_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    query = db.query(Attendance).join(Employee)
    if employee_id:
        query = query.filter(Attendance.employee_id == employee_id)
    if date_from:
        query = query.filter(Attendance.attendance_date >= date_from)
    if date_to:
        query = query.filter(Attendance.attendance_date <= date_to)
    if department:
        query = query.filter(Employee.department == department)

    records = query.order_by(Attendance.attendance_date.desc()).all()

    data = [
        {
            "Employee ID": r.employee.employee_id,
            "Employee Name": r.employee.name,
            "Department": r.employee.department,
            "Date": str(r.attendance_date),
            "Check In": str(r.check_in) if r.check_in else "",
            "Check Out": str(r.check_out) if r.check_out else "",
            "Status": r.status,
            "Notes": r.notes or "",
        }
        for r in records
    ]

    return generate_csv_response(data, "attendance_report.csv")
