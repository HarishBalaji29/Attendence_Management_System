# Attendance Management System - Complete Setup Guide

## Project Overview

A professional attendance management system with:
- **Employee Self-Service**: Employees can view their attendance and request regularization for missing or incorrect entries
- **Admin Dashboard**: Admins can manage employees, view attendance records, approve/reject regularization requests
- **Role-Based Access**: Separate interfaces for employees and administrators
- **Database Integrity**: SQLite for development, PostgreSQL ready for production

## Architecture

```
├── Backend (FastAPI + SQLAlchemy + SQLite/PostgreSQL)
│   ├── Models: User, Employee, Attendance, AttendanceRequest
│   ├── Routers: Auth, Employees, Attendance, AttendanceRequests, Dashboard
│   ├── Database Migrations: Alembic
│   └── Security: JWT tokens + password hashing
│
└── Frontend (React + Vite + TailwindCSS)
    ├── Pages: Dashboard, Attendance, EmployeeAttendance, AttendanceRequests, etc.
    ├── Components: Layout, Sidebar, Navigation
    ├── Context: Auth (JWT management)
    └── API: Axios with interceptors
```

## Quick Start

### Backend Setup

1. **Navigate to backend**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   pip install -r requirements.txt
   ```

3. **Run database migrations**
   ```bash
   alembic upgrade head
   ```

4. **Seed initial data (optional)**
   ```bash
   python seed.py
   ```

5. **Start the server**
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

   Server will be available at: http://localhost:8000
   API Docs: http://localhost:8000/docs

### Frontend Setup

1. **Navigate to frontend**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start development server**
   ```bash
   npm run dev
   ```

   Application will be available at: http://localhost:5173

## Database Schema

### Users Table
- User login credentials and role management
- Links to Employee records (optional for employees)

### Employees Table
- Employee master data: name, email, department, designation
- Status tracking (Active/Inactive)

### Attendance Table
- Daily attendance records per employee
- Check-in/Check-out times
- Attendance status: Present, Absent, Late, Half-Day
- Regularization flag

### AttendanceRequests Table
- Employee requests for attendance regularization/correction
- Request status: Pending, Approved, Rejected
- Admin review notes

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Employees (Admin)
- `GET /api/employees` - List employees
- `GET /api/employees/{id}` - Get employee details
- `POST /api/employees` - Create employee
- `PUT /api/employees/{id}` - Update employee
- `DELETE /api/employees/{id}` - Delete employee

### Attendance (Admin)
- `GET /api/attendance` - List all attendance records
- `POST /api/attendance` - Mark attendance
- `PUT /api/attendance/{id}` - Update attendance
- `GET /api/attendance/summary` - Get attendance summary

### Attendance Requests (Employee Self-Service)
- `POST /api/attendance-requests` - Submit regularization request
- `GET /api/attendance-requests/my-requests` - Employee's own requests
- `GET /api/attendance-requests/pending` - Admin: Pending requests
- `PUT /api/attendance-requests/{id}/approve` - Admin: Approve request
- `PUT /api/attendance-requests/{id}/reject` - Admin: Reject request

### Dashboard
- `GET /api/dashboard/stats` - Dashboard statistics

## Features

### For Employees
1. **View Profile**: Personal information and designation
2. **View Attendance**: Historical attendance records with filtering
3. **Request Regularization**: 
   - Submit requests for missing attendance
   - Provide reason and supporting times
   - Track request status (Pending/Approved/Rejected)
4. **Attendance Statistics**: Overall attendance percentage and breakdown

### For Admins
1. **Manage Employees**: CRUD operations
2. **Mark Attendance**: For all employees or by batch
3. **Attendance Reports**: Summaries by department, date ranges
4. **Regularization Approvals**:
   - Review pending requests with employee details
   - Add notes and approve/reject
   - Automatic attendance record update upon approval
5. **Dashboard**: Key metrics and statistics

## File Structure

```
backend/
├── app/
│   ├── models/
│   │   ├── user.py
│   │   ├── employee.py
│   │   ├── attendance.py
│   │   └── attendance_request.py
│   ├── routers/
│   │   ├── auth.py
│   │   ├── employees.py
│   │   ├── attendance.py
│   │   ├── attendance_requests.py (NEW)
│   │   └── dashboard.py
│   ├── schemas/
│   │   ├── auth.py
│   │   ├── employee.py
│   │   └── attendance.py (with AttendanceRequest schemas)
│   ├── utils/
│   │   ├── security.py
│   │   ├── jwt.py
│   │   ├── dependencies.py
│   │   └── export.py
│   ├── config.py
│   ├── database.py
│   └── main.py
├── alembic/
│   └── versions/
│       ├── 001_initial_migration.py
│       └── 002_add_attendance_requests.py (NEW)
├── requirements.txt
├── alembic.ini
└── seed.py

frontend/
├── src/
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Employees.jsx
│   │   ├── Attendance.jsx (Admin)
│   │   ├── EmployeeAttendance.jsx (NEW - Employee self-service)
│   │   ├── AttendanceRequests.jsx (NEW - Admin review)
│   │   ├── MyProfile.jsx
│   │   ├── Summary.jsx
│   │   └── UserManagement.jsx
│   ├── components/
│   │   └── layout/
│   │       ├── Layout.jsx
│   │       ├── Sidebar.jsx
│   │       ├── Topbar.jsx
│   │       └── ProtectedRoute.jsx
│   ├── context/
│   │   └── AuthContext.jsx
│   ├── api/
│   │   ├── axios.js
│   │   └── services.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
├── vite.config.js
└── index.html
```

## Testing

### Backend
1. Access API documentation: http://localhost:8000/docs
2. Use Swagger UI to test endpoints
3. Test with sample data from seed.py

### Frontend
1. Login with test credentials (from seed.py)
2. Employee user: Test attendance view, request regularization
3. Admin user: Test employee management, attendance marking, request approval

## Production Deployment

### Backend
1. Update DATABASE_URL to PostgreSQL connection string
2. Set JWT_SECRET_KEY to a strong random value
3. Disable hot reload: Remove `--reload` flag
4. Use Gunicorn or similar for production WSGI

### Frontend
1. Build: `npm run build`
2. Deploy `dist/` folder to static hosting (Vercel, AWS S3, etc.)
3. Configure API endpoint for production

## Security Considerations

✅ Implemented:
- Password hashing with bcrypt
- JWT token authentication
- Role-based access control (RBAC)
- CORS configuration
- SQL injection prevention (SQLAlchemy ORM)
- Proper error handling without exposing sensitive info

⚠️ For Production:
- Enable HTTPS/SSL
- Add rate limiting
- Implement request validation
- Set secure cookie flags
- Regular security audits
- Database backups and monitoring

## Default Test Credentials

Check `seed.py` for initial data, including:
- Admin user
- Sample employees
- Test attendance records

## Troubleshooting

### Database Issues
```bash
# Reset database (development only!)
python inspect_db.py
alembic downgrade base
alembic upgrade head
python seed.py
```

### API Connection Issues
- Check CORS configuration in `app/config.py`
- Ensure backend server is running
- Verify frontend .env.local settings

### Authentication Issues
- Clear browser local storage
- Check JWT tokens in browser console
- Verify token expiration settings

## Next Steps / Enhancements

1. **Biometric Integration**: Add fingerprint/face recognition for check-in/out
2. **Mobile App**: React Native version for on-the-go attendance
3. **Email Notifications**: Notify employees of request approval/rejection
4. **Advanced Analytics**: Predictive analytics for absenteeism
5. **Integration with HR Systems**: Connect with payroll, leave management
6. **Multi-location Support**: Handle employees across multiple offices
7. **Geolocation Tracking**: GPS-based check-in verification
8. **Audit Trails**: Complete change history for compliance

## Support

For issues or questions:
1. Check API documentation at /docs
2. Review database schema
3. Check browser console for frontend errors
4. Check terminal logs for backend errors

---

**Version**: 1.0.0
**Last Updated**: 2026-06-25
