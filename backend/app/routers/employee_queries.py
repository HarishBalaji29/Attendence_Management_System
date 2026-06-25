from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.employee_query import EmployeeQuery
from app.models.user import User
from app.schemas.employee_query import EmployeeQueryCreate, EmployeeQueryOut
from app.utils.dependencies import get_current_user, require_admin

router = APIRouter(prefix="/api/employee-queries", tags=["Employee Queries"])


@router.post("", response_model=EmployeeQueryOut, status_code=status.HTTP_201_CREATED)
def create_query(payload: EmployeeQueryCreate, db: Session = Depends(get_db)):
    """Public endpoint for employees to submit help queries on the login page."""
    query = EmployeeQuery(
        username=payload.username,
        email=payload.email,
        phone=payload.phone,
    )
    db.add(query)
    db.commit()
    db.refresh(query)
    return query


@router.get("", response_model=list[EmployeeQueryOut])
def list_queries(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Admin-only endpoint to list all help queries."""
    return db.query(EmployeeQuery).order_by(EmployeeQuery.created_at.desc()).all()


@router.put("/{query_id}/resolve", response_model=EmployeeQueryOut)
def resolve_query(
    query_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Admin-only endpoint to mark a query as resolved."""
    query = db.query(EmployeeQuery).filter(EmployeeQuery.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    query.status = "resolved"
    db.commit()
    db.refresh(query)
    return query


@router.delete("/{query_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_query(
    query_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_admin)
):
    """Admin-only endpoint to delete a query."""
    query = db.query(EmployeeQuery).filter(EmployeeQuery.id == query_id).first()
    if not query:
        raise HTTPException(status_code=404, detail="Query not found")
    db.delete(query)
    db.commit()
    return None
