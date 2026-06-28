# 🕐 Attendance Management System (AMS)

> A full-stack, role-based Attendance Management System built with **FastAPI** + **React**.  
> Employees manage their own records; admins control everything — all secured with JWT authentication.

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Tech Stack](#tech-stack)
3. [Features](#features)
4. [Project Structure](#project-structure)
5. [Prerequisites](#prerequisites)
6. [Environment Setup](#environment-setup)
7. [Running Locally](#running-locally)
8. [Database](#database)
9. [API Reference](#api-reference)
10. [Frontend Pages](#frontend-pages)
11. [Workflows](#workflows)
12. [Troubleshooting](#troubleshooting)
13. [Production Deployment](#production-deployment)
14. [Security](#security)
15. [Future Enhancements](#future-enhancements)

---

## Overview

The **Attendance Management System** is a professional, full-stack web application designed for organisations to track and manage employee attendance with minimal friction.

| Role | What they can do |
|---|---|
| **Admin** | Manage employees, mark & edit attendance, approve/reject regularization requests, view reports & analytics |
| **Employee** | View own attendance history, request regularization for missing/incorrect entries, track request status |

> [!NOTE]
> The system uses **SQLite** by default for development and is fully **PostgreSQL-ready** for production.

---

## Tech Stack

### Backend
| Technology | Version | Purpose |
|---|---|---|
| Python | 3.9+ | Runtime |
| FastAPI | 0.111.0 | REST API framework |
| SQLAlchemy | 2.0.30 | ORM |
| Alembic | 1.13.1 | Database migrations |
| python-jose | 3.3.0 | JWT authentication |
| bcrypt | 5.0.0 | Password hashing |
| Pydantic-settings | 2.3.4 | Config management |
| Uvicorn | 0.30.1 | ASGI server |
| pandas + openpyxl | 2.2.2 / 3.1.2 | Report export |
| psycopg2-binary | 2.9.9 | PostgreSQL driver |

### Frontend
| Technology | Version | Purpose |
|---|---|---|
| React | 19.x | UI framework |
| Vite | 8.x | Build tool & dev server |
| TypeScript | 6.x | Type safety |
| MUI (Material UI) | 9.x | Component library |
| React Router DOM | 7.x | Client-side routing |
| Axios | 1.x | HTTP client |
| TanStack Query | 5.x | Server state management |
| Recharts | 3.x | Charts & analytics |
| React Hot Toast | 2.x | Toast notifications |
| date-fns | 4.x | Date utilities |

---

## Features

### 👤 Employee Features
- 🔐 **Secure Login** — JWT-based authentication with token refresh
- 📅 **My Attendance** — View personal attendance history with date filtering
- 📊 **Attendance Stats** — Present / Absent / Late / Half-Day breakdown and percentage
- 📝 **Request Regularization** — Submit requests for missing or incorrect attendance entries
- 📬 **Track Request Status** — Monitor Pending / Approved / Rejected requests in real time
- 👤 **My Profile** — View personal information and designation

### 🛠️ Admin Features
- 👥 **Employee Management** — Full CRUD: Add, edit, deactivate, delete employees
- 📋 **Attendance Management** — Mark, edit, and bulk-update attendance records
- ✅ **Regularization Approvals** — Review employee requests with full context, add notes, approve or reject
- 📈 **Dashboard** — Key metrics: total employees, today's attendance, pending requests
- 📊 **Reports & Summary** — Filter by department, date range; export to Excel/CSV
- 👤 **User Management** — Create employee login accounts and link them to employee records
- 📬 **Employee Queries** — Manage pre-login contact form submissions

### 🔒 Security Features
- JWT access + refresh token authentication
- Role-Based Access Control (RBAC) — `admin` | `employee`
- bcrypt password hashing
- CORS protection
- SQL injection prevention via SQLAlchemy ORM
- Employees can only access their own data

---

## Project Structure

```
Attendence_Management_System/
│
├── backend/                          # FastAPI application
│   ├── app/
│   │   ├── models/                   # SQLAlchemy ORM models
│   │   │   ├── user.py               # User accounts (admin/employee)
│   │   │   ├── employee.py           # Employee master records
│   │   │   ├── attendance.py         # Daily attendance log
│   │   │   ├── attendance_request.py # Regularization requests
│   │   │   └── employee_query.py     # Pre-login contact queries
│   │   ├── routers/                  # API route handlers
│   │   │   ├── auth.py               # Login, refresh, /me
│   │   │   ├── employees.py          # Employee CRUD
│   │   │   ├── attendance.py         # Attendance CRUD
│   │   │   ├── attendance_requests.py# Regularization workflow
│   │   │   ├── dashboard.py          # Stats & metrics
│   │   │   └── employee_queries.py   # Contact form submissions
│   │   ├── schemas/                  # Pydantic request/response schemas
│   │   ├── utils/
│   │   │   ├── security.py           # Password hashing
│   │   │   ├── jwt.py                # Token creation & validation
│   │   │   ├── dependencies.py       # FastAPI dependencies (auth guards)
│   │   │   └── export.py             # Excel/CSV export helpers
│   │   ├── config.py                 # App settings (pydantic-settings)
│   │   ├── database.py               # SQLAlchemy engine & session
│   │   └── main.py                   # FastAPI app, CORS, router registration
│   ├── alembic/                      # Database migrations
│   │   └── versions/
│   │       ├── 001_initial_migration.py       # users, employees, attendance
│   │       └── 002_add_attendance_requests.py # attendance_requests table
│   ├── database_schema.sql           # Standalone SQL schema script
│   ├── seed.py                       # Creates default admin user
│   ├── requirements.txt
│   ├── alembic.ini
│   └── .env.example
│
└── frontend/                         # React + Vite application
    ├── src/
    │   ├── pages/
    │   │   ├── Login.jsx             # Login page (admin + employee)
    │   │   ├── Dashboard.jsx         # Admin dashboard with stats & charts
    │   │   ├── Employees.jsx         # Employee list & management (admin)
    │   │   ├── EmployeeDetail.jsx    # Single employee detail view
    │   │   ├── Attendance.jsx        # Attendance management (admin)
    │   │   ├── EmployeeAttendance.jsx# My Attendance self-service (employee)
    │   │   ├── AttendanceRequests.jsx# Regularization review (admin)
    │   │   ├── Summary.jsx           # Attendance summary & reports
    │   │   ├── MyProfile.jsx         # Employee profile page
    │   │   ├── UserManagement.jsx    # User account management (admin)
    │   │   └── EmpQueries.jsx        # Employee contact queries (admin)
    │   ├── components/
    │   │   └── layout/
    │   │       ├── Layout.jsx        # App shell with sidebar + topbar
    │   │       ├── Sidebar.jsx       # Role-aware navigation sidebar
    │   │       ├── Topbar.jsx        # Top navigation bar
    │   │       └── ProtectedRoute.jsx# Route guards by role
    │   ├── context/
    │   │   └── AuthContext.jsx       # Auth state, login/logout, token refresh
    │   ├── api/
    │   │   ├── axios.js              # Axios instance with interceptors
    │   │   └── services.js           # All API call functions
    │   ├── App.jsx                   # Routes definition
    │   └── main.jsx                  # React entry point
    ├── package.json
    ├── vite.config.js
    └── tsconfig.json
```

---

## Prerequisites

Make sure the following are installed:

| Tool | Minimum Version | Check |
|---|---|---|
| Python | 3.9+ | `python --version` |
| pip | Latest | `pip --version` |
| Node.js | 16+ | `node --version` |
| npm | 8+ | `npm --version` |
| Git | Any | `git --version` |

---

## Environment Setup

### 1. Clone the Repository

```bash
git clone <your-repo-url>
cd Attendence_Management_System
```

### 2. Backend — Environment Variables

Create `backend/.env` (copy from `.env.example`):

```bash
cp backend/.env.example backend/.env
```

Edit `backend/.env` with your values:

```env
# ── Database ─────────────────────────────────────────────────────────
DATABASE_URL=sqlite:///./attendance.db
# PostgreSQL (production):
# DATABASE_URL=postgresql://user:password@localhost:5432/attendance_db

# ── App ──────────────────────────────────────────────────────────────
APP_NAME=Attendance Management System

# ── JWT ──────────────────────────────────────────────────────────────
SECRET_KEY=your-super-secret-key-change-in-production-12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7

# ── CORS ─────────────────────────────────────────────────────────────
FRONTEND_URL=http://localhost:5173

# ── Default Admin Credentials ────────────────────────────────────────
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=admin123
```

> [!CAUTION]
> Always change `SECRET_KEY`, `ADMIN_PASSWORD` and `DATABASE_URL` before deploying to production.

---

## Running Locally

### Backend

```bash
# Navigate to backend
cd backend

# Create & activate virtual environment
python -m venv .venv

# Windows
.venv\Scripts\activate
# Mac / Linux
source .venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Apply database migrations
alembic upgrade head

# Seed the default admin user
python seed.py

# Start the development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

| URL | Description |
|---|---|
| http://localhost:8000 | API root / health check |
| http://localhost:8000/docs | Swagger UI (interactive API docs) |
| http://localhost:8000/redoc | ReDoc API documentation |

### Frontend

Open a **new terminal**:

```bash
# Navigate to frontend
cd frontend

# Install dependencies
npm install

# Start the development server
npm run dev
```

| URL | Description |
|---|---|
| http://localhost:5173 | Main application |

### Default Login Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |

> [!NOTE]
> Credentials are set in `backend/.env` — `ADMIN_USERNAME` / `ADMIN_PASSWORD`. Run `python seed.py` to apply them to the database.

---

## Database

### Schema Overview

```
┌──────────────────────────────────────────────────────────────────┐
│                        DATABASE SCHEMA                           │
│                                                                  │
│  ┌─────────┐    ┌───────────┐    ┌────────────┐                 │
│  │  users  │    │ employees │    │ attendance │                 │
│  ├─────────┤    ├───────────┤    ├────────────┤                 │
│  │ id (PK) │───▶│ id (PK)   │◀───│ id (PK)    │                 │
│  │username │    │employee_id│    │employee_id │                 │
│  │ email   │    │ name      │    │attend_date │                 │
│  │password │    │ email     │    │ check_in   │                 │
│  │  role   │    │ mobile    │    │ check_out  │                 │
│  │is_active│    │department │    │  status    │                 │
│  └─────────┘    │designatio │    │is_regular. │                 │
│                 │  status   │    │ marked_by  │                 │
│                 │created_by │    │ updated_by │                 │
│                 └───────────┘    └────────────┘                 │
│                       │                                         │
│                       ▼                                         │
│           ┌────────────────────┐    ┌──────────────────┐        │
│           │ attendance_requests │    │ employee_queries  │        │
│           ├────────────────────┤    ├──────────────────┤        │
│           │ id (PK)            │    │ id (PK)          │        │
│           │ employee_id        │    │ username         │        │
│           │ attendance_date    │    │ email            │        │
│           │ request_type       │    │ phone            │        │
│           │ status             │    │ status           │        │
│           │ requested_status   │    └──────────────────┘        │
│           │ reason             │                                 │
│           │ admin_notes        │                                 │
│           │ reviewed_by        │                                 │
│           └────────────────────┘                                 │
└──────────────────────────────────────────────────────────────────┘
```

### Tables Summary

| Table | Purpose | Key Columns |
|---|---|---|
| `users` | Login accounts | `username`, `email`, `password_hash`, `role` |
| `employees` | Employee master data | `employee_id`, `name`, `department`, `designation`, `status` |
| `attendance` | Daily attendance log | `employee_id`, `attendance_date`, `check_in`, `check_out`, `status`, `is_regularized` |
| `attendance_requests` | Regularization requests | `employee_id`, `attendance_date`, `request_type`, `status`, `reason`, `admin_notes` |
| `employee_queries` | Pre-login contact form | `username`, `email`, `phone`, `status` |
| `alembic_version` | Migration tracking | `version_num` |

### Allowed Enum Values

| Column | Allowed Values |
|---|---|
| `users.role` | `admin`, `employee` |
| `employees.status` | `Active`, `Inactive` |
| `attendance.status` | `Present`, `Absent`, `Late`, `Half-Day` |
| `attendance.is_regularized` | `N` (original), `Y` (admin-corrected) |
| `attendance_requests.request_type` | `regularization`, `correction` |
| `attendance_requests.status` | `pending`, `approved`, `rejected` |
| `attendance_requests.requested_status` | `Present`, `Absent`, `Late`, `Half-Day` |
| `employee_queries.status` | `pending`, `resolved` |

### Migration Commands

```bash
# Apply all pending migrations
alembic upgrade head

# Check current migration version
alembic current

# View migration history
alembic history

# Create a new migration (after model changes)
alembic revision --autogenerate -m "describe your change"

# Rollback one step
alembic downgrade -1

# Reset to base (⚠️ development only)
alembic downgrade base
```

### SQL Schema Script

A standalone SQL schema script is available at:
`backend/database_schema.sql`

It can be used to inspect the schema or set up the database without Alembic.

---

## API Reference

All protected endpoints require the `Authorization: Bearer <token>` header.

### 🔑 Authentication — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/login` | ❌ Public | Login with username + password |
| `POST` | `/api/auth/refresh` | ✅ Token | Refresh access token |
| `GET` | `/api/auth/me` | ✅ Token | Get current logged-in user |

**Login request body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Login response:**
```json
{
  "access_token": "<jwt_token>",
  "refresh_token": "<jwt_token>",
  "token_type": "bearer",
  "user": { "id": 1, "username": "admin", "role": "admin" }
}
```

---

### 👥 Employees — `/api/employees`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/employees` | Admin | List all employees (with filters) |
| `POST` | `/api/employees` | Admin | Create a new employee |
| `GET` | `/api/employees/{id}` | Admin | Get employee by ID |
| `PUT` | `/api/employees/{id}` | Admin | Update employee details |
| `DELETE` | `/api/employees/{id}` | Admin | Delete employee |

---

### 📅 Attendance — `/api/attendance`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/attendance` | Admin | List attendance records (with filters) |
| `POST` | `/api/attendance` | Admin | Mark attendance for an employee |
| `PUT` | `/api/attendance/{id}` | Admin | Update an attendance record |
| `GET` | `/api/attendance/summary` | Admin | Attendance summary / report |
| `GET` | `/api/attendance/export` | Admin | Export attendance to Excel |
| `GET` | `/api/attendance/my` | Employee | Own attendance records |

---

### 📝 Attendance Requests — `/api/attendance-requests`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/attendance-requests` | Employee | Submit a regularization request |
| `GET` | `/api/attendance-requests/my-requests` | Employee | View own submitted requests |
| `GET` | `/api/attendance-requests/pending` | Admin | View all pending requests |
| `GET` | `/api/attendance-requests` | Admin | List all requests (with filters) |
| `PUT` | `/api/attendance-requests/{id}/approve` | Admin | Approve a request |
| `PUT` | `/api/attendance-requests/{id}/reject` | Admin | Reject a request |

---

### 📊 Dashboard — `/api/dashboard`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Admin | Key metrics (totals, today's status) |

---

### 📬 Employee Queries — `/api/employee-queries`

| Method | Endpoint | Role | Description |
|---|---|---|---|
| `POST` | `/api/employee-queries` | ❌ Public | Submit a pre-login contact query |
| `GET` | `/api/employee-queries` | Admin | List all queries |
| `PUT` | `/api/employee-queries/{id}` | Admin | Mark query as resolved |

---

## Frontend Pages

| Page | Route | Role | Description |
|---|---|---|---|
| Login | `/login` | Public | Authentication page |
| Dashboard | `/dashboard` | Admin | Stats, charts, quick actions |
| Employees | `/employees` | Admin | Employee list & management |
| Employee Detail | `/employees/:id` | Admin | Individual employee profile |
| Attendance | `/attendance` | Admin | Mark & manage all attendance |
| Attendance Requests | `/attendance-requests` | Admin | Review regularization requests |
| Summary | `/summary` | Admin | Attendance reports & exports |
| User Management | `/users` | Admin | Create & manage login accounts |
| Employee Queries | `/queries` | Admin | View contact form submissions |
| My Attendance | `/my-attendance` | Employee | Personal attendance history + requests |
| My Profile | `/my-profile` | Employee | View own profile & stats |

---

## Workflows

### Regularization Request Workflow

```
Employee                           System                          Admin
   │                                  │                              │
   │── View My Attendance ──────────▶ │                              │
   │                                  │                              │
   │── Click "Request Regularization" ▶│                              │
   │   (fill date, reason, times)     │                              │
   │                                  │                              │
   │── Submit Request ───────────────▶│── Save (status: pending) ──▶ │
   │                                  │                              │
   │                                  │◀─ View Pending Requests ─────│
   │                                  │                              │
   │                                  │◀─ Review Details + Add Notes ─│
   │                                  │                              │
   │                                  │◀─ Approve / Reject ──────────│
   │                                  │                              │
   │                                  │ If Approved:                 │
   │                                  │  • Create/Update attendance  │
   │                                  │  • Set is_regularized = 'Y'  │
   │                                  │  • Record reviewer + time    │
   │                                  │                              │
   │◀─ Status updated in My Attendance─│                              │
```

### Admin Creating an Employee User

```
1. Admin → Employees → Add Employee (fills in name, dept, designation)
2. Admin → User Management → Create User
   → Links the user to the employee record
   → Sets role = "employee" and password
3. Share credentials with the employee
4. Employee logs in → sees My Attendance, My Profile
```

---

## Troubleshooting

### Backend Won't Start

```bash
# Check if port 8000 is already in use (Windows)
netstat -ano | findstr :8000

# Kill the process or use a different port
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Database Error: `no such table: users`

```bash
# Migrations were not applied — run:
alembic upgrade head
python seed.py
```

### Login Fails — Admin Not Found

```bash
# Verify admin user exists in DB
cd backend
python -c "
from app.database import SessionLocal
from app.models.user import User
db = SessionLocal()
u = db.query(User).filter(User.username == 'admin').first()
print('Admin exists:', bool(u), '| Role:', u.role if u else 'N/A')
db.close()
"

# If missing, re-run seed
python seed.py
```

### Frontend Can't Connect to Backend (CORS Error)

1. Verify backend is running on `http://localhost:8000`
2. Check `FRONTEND_URL` in `backend/.env` matches the frontend port
3. Clear browser cache: `Ctrl + Shift + Delete`
4. Open browser DevTools → Console tab for details

### Token / Auth Errors

```bash
# Clear local storage from browser console
localStorage.clear()
# Then refresh and log in again
```

### Reset Database (Development Only)

```bash
cd backend
# Delete the SQLite file
del attendance.db          # Windows
rm attendance.db           # Mac/Linux

# Re-apply migrations and seed
alembic upgrade head
python seed.py
```

---

## Production Deployment

### Backend

```bash
# 1. Switch to PostgreSQL in .env
DATABASE_URL=postgresql://user:password@host:5432/attendance_db

# 2. Generate a strong secret key
python -c "import secrets; print(secrets.token_hex(32))"
# → paste result as SECRET_KEY in .env

# 3. Install gunicorn
pip install gunicorn

# 4. Run with Gunicorn (4 workers)
gunicorn -w 4 -k uvicorn.workers.UvicornWorker app.main:app --bind 0.0.0.0:8000
```

> [!IMPORTANT]
> Set up **Nginx** as a reverse proxy in front of Gunicorn and enable **HTTPS/SSL** (Let's Encrypt / Certbot).

### Frontend

```bash
# Build production bundle
npm run build

# The 'dist/' folder is ready to deploy to:
#  - Vercel      → vercel deploy
#  - Netlify     → drag & drop dist/ folder
#  - AWS S3      → aws s3 sync dist/ s3://your-bucket
#  - Firebase    → firebase deploy
```

### Production Checklist

- [ ] `SECRET_KEY` changed to a strong random value
- [ ] `DATABASE_URL` points to PostgreSQL
- [ ] `ADMIN_PASSWORD` updated and seeds re-run
- [ ] HTTPS/SSL configured
- [ ] `--reload` flag removed from Uvicorn
- [ ] Gunicorn or equivalent WSGI server used
- [ ] CORS `FRONTEND_URL` updated to production domain
- [ ] Database backups scheduled
- [ ] Monitoring & logging set up

---

## Security

| Feature | Status | Details |
|---|---|---|
| Password Hashing | ✅ | bcrypt via `passlib` |
| JWT Authentication | ✅ | Access + Refresh tokens |
| Role-Based Access | ✅ | Admin vs Employee guards on every route |
| CORS Protection | ✅ | Whitelist-based origin control |
| SQL Injection Prevention | ✅ | SQLAlchemy ORM — no raw SQL |
| Sensitive Data Exposure | ✅ | Password hashes never returned in responses |
| HTTPS | ⚠️ | Configure for production |
| Rate Limiting | ⚠️ | Recommended for production |

---

## Future Enhancements

| Feature | Description |
|---|---|
| 📧 Email Notifications | Notify employees when requests are approved/rejected |
| 📱 Mobile App | React Native version for on-the-go attendance |
| 🖐 Biometric Integration | Fingerprint / Face recognition for check-in |
| 📍 Geolocation | GPS-based check-in verification |
| 📲 QR Code Check-in | Quick self-service attendance via QR scan |
| 📆 Leave Management | Integrate attendance with a leave tracking module |
| 💰 Payroll Integration | Auto-sync attendance data with payroll system |
| 🏢 Multi-location | Support for employees across multiple offices |
| 📉 Advanced Analytics | Predictive absenteeism and trend analysis |
| 🔍 Audit Logs | Full change history for compliance and audits |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feature/your-feature`
5. Open a Pull Request

---

## Version History

| Version | Date | Notes |
|---|---|---|
| 1.0.0 | 2026-06-25 | Initial release — employee self-service + admin management |

---

**Version**: 1.0.0  
**Backend**: FastAPI 0.111 · Python 3.9+  
**Frontend**: React 19 · Vite 8
