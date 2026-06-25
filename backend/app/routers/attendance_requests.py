from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional
from datetime import date
import math

from app.database import get_db
from app.models.attendance_request import AttendanceRequest
from app.models.attendance import Attendance
from app.models.employee import Employee
from app.models.user import User
from app.schemas.attendance import (
    AttendanceRequestCreate, AttendanceRequestUpdate, AttendanceRequestOut,
    AttendanceRequestListResponse
)
from app.utils.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/attendance-requests", tags=["Attendance Requests"])


def _enrich(record: AttendanceRequest) -> dict:
    return {
        "id": record.id,
        "employee_id": record.employee_id,
        "employee_name": record.employee.name if record.employee else None,
        "employee_code": record.employee.employee_id if record.employee else None,
        "attendance_date": record.attendance_date,
        "check_in": record.check_in,
        "check_out": record.check_out,
        "request_type": record.request_type,
        "status": record.status,
        "requested_status": record.requested_status,
        "reason": record.reason,
        "admin_notes": record.admin_notes,
        "requested_at": record.requested_at,
        "reviewed_at": record.reviewed_at,
        "reviewed_by": record.reviewed_by,
    }


# Employee endpoint: Request attendance regularization
@router.post("", response_model=AttendanceRequestOut)
def request_regularization(
    payload: AttendanceRequestCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Employee can request regularization for their own attendance"""
    # Employees can only request for themselves
    if current_user.role == "employee":
        if not current_user.employee_id or current_user.employee_id != payload.employee_id:
            raise HTTPException(status_code=403, detail="You can only request for your own attendance")

    employee = db.query(Employee).filter(Employee.id == payload.employee_id).first()
    if not employee:
        raise HTTPException(status_code=404, detail="Employee not found")

    # Check if request already exists for this date
    existing = db.query(AttendanceRequest).filter(
        AttendanceRequest.employee_id == payload.employee_id,
        AttendanceRequest.attendance_date == payload.attendance_date,
        AttendanceRequest.status == "pending"
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="A pending request already exists for this date")

    request_obj = AttendanceRequest(
        **payload.model_dump(),
        status="pending"
    )
    db.add(request_obj)
    db.commit()
    db.refresh(request_obj)
    return AttendanceRequestOut(**_enrich(request_obj))


# Employee endpoint: Get their own requests
@router.get("/my-requests", response_model=AttendanceRequestListResponse)
def get_my_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """Get current employee's regularization requests"""
    if current_user.role == "employee" and not current_user.employee_id:
        raise HTTPException(status_code=400, detail="Employee record not linked")

    query = db.query(AttendanceRequest)
    if current_user.role == "employee":
        query = query.filter(AttendanceRequest.employee_id == current_user.employee_id)
    
    if status:
        query = query.filter(AttendanceRequest.status == status)

    total = query.count()
    records = query.order_by(AttendanceRequest.requested_at.desc())\
        .offset((page - 1) * page_size).limit(page_size).all()

    return AttendanceRequestListResponse(
        items=[AttendanceRequestOut(**_enrich(r)) for r in records],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 1,
    )


# Admin endpoint: Get all pending requests
@router.get("/pending", response_model=AttendanceRequestListResponse)
def get_pending_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin: Get all pending attendance requests"""
    query = db.query(AttendanceRequest).filter(AttendanceRequest.status == "pending").join(Employee)
    
    if department:
        query = query.filter(Employee.department == department)

    total = query.count()
    records = query.order_by(AttendanceRequest.requested_at.desc())\
        .offset((page - 1) * page_size).limit(page_size).all()

    return AttendanceRequestListResponse(
        items=[AttendanceRequestOut(**_enrich(r)) for r in records],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 1,
    )


# Admin endpoint: Approve request
@router.put("/{request_id}/approve", response_model=AttendanceRequestOut)
def approve_request(
    request_id: int,
    notes: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin: Approve an attendance regularization request"""
    req = db.query(AttendanceRequest).filter(AttendanceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending requests can be approved")

    # Update the attendance record
    attendance = db.query(Attendance).filter(
        Attendance.employee_id == req.employee_id,
        Attendance.attendance_date == req.attendance_date
    ).first()

    if not attendance:
        # Create new attendance record if it doesn't exist
        attendance = Attendance(
            employee_id=req.employee_id,
            attendance_date=req.attendance_date,
            check_in=req.check_in,
            check_out=req.check_out,
            status=req.requested_status,
            notes=f"Regularized: {req.reason or 'No reason provided'}",
            is_regularized="Y",
            marked_by=current_user.id,
        )
        db.add(attendance)
    else:
        # Update existing attendance
        attendance.check_in = req.check_in or attendance.check_in
        attendance.check_out = req.check_out or attendance.check_out
        attendance.status = req.requested_status
        attendance.is_regularized = "Y"
        attendance.updated_by = current_user.id
        attendance.notes = f"Updated: {req.reason or ''}"

    # Mark request as approved
    req.status = "approved"
    req.reviewed_by = current_user.id
    req.admin_notes = notes
    req.reviewed_at = func.now()

    db.commit()
    db.refresh(req)
    return AttendanceRequestOut(**_enrich(req))


# Admin endpoint: Reject request
@router.put("/{request_id}/reject", response_model=AttendanceRequestOut)
def reject_request(
    request_id: int,
    notes: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin: Reject an attendance regularization request"""
    req = db.query(AttendanceRequest).filter(AttendanceRequest.id == request_id).first()
    if not req:
        raise HTTPException(status_code=404, detail="Request not found")
    if req.status != "pending":
        raise HTTPException(status_code=400, detail="Only pending requests can be rejected")

    req.status = "rejected"
    req.reviewed_by = current_user.id
    req.admin_notes = notes or "Request rejected"
    req.reviewed_at = func.now()

    db.commit()
    db.refresh(req)
    return AttendanceRequestOut(**_enrich(req))


# Admin endpoint: Get all requests with filters
@router.get("", response_model=AttendanceRequestListResponse)
def list_requests(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    employee_id: Optional[int] = Query(None),
    department: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    """Admin: List all attendance requests with filters"""
    query = db.query(AttendanceRequest).join(Employee)

    if status:
        query = query.filter(AttendanceRequest.status == status)
    if employee_id:
        query = query.filter(AttendanceRequest.employee_id == employee_id)
    if department:
        query = query.filter(Employee.department == department)

    total = query.count()
    records = query.order_by(AttendanceRequest.requested_at.desc())\
        .offset((page - 1) * page_size).limit(page_size).all()

    return AttendanceRequestListResponse(
        items=[AttendanceRequestOut(**_enrich(r)) for r in records],
        total=total,
        page=page,
        page_size=page_size,
        total_pages=math.ceil(total / page_size) if total else 1,
    )
