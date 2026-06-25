# Quick Start Guide - Running the Attendance System

## Prerequisites

- Python 3.9+
- Node.js 16+ and npm
- Git

## Step-by-Step Setup

### 1. Clone/Navigate to Project
```bash
cd c:\Users\Rohith M\OneDrive\Desktop\Attendance
```

### 2. Backend Setup

#### 2a. Create Python Virtual Environment
```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Mac/Linux:
source venv/bin/activate
```

#### 2b. Install Dependencies
```bash
pip install -r requirements.txt
```

#### 2c. Create .env File (Backend)
```bash
# Create file: backend\.env
DATABASE_URL=sqlite:///./attendance.db
SECRET_KEY=your-super-secret-key-change-in-production-12345
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=60
REFRESH_TOKEN_EXPIRE_DAYS=7
APP_NAME=Attendance Management System
FRONTEND_URL=http://localhost:5173
ADMIN_USERNAME=admin
ADMIN_EMAIL=admin@company.com
ADMIN_PASSWORD=admin123
```

#### 2d. Initialize Database
```bash
# Apply migrations
alembic upgrade head

# Seed initial admin user
python seed.py
```

#### 2e. Start Backend Server
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

**Success! Backend running at**: http://localhost:8000
- **API Docs**: http://localhost:8000/docs (Swagger UI)
- **Alternative Docs**: http://localhost:8000/redoc (ReDoc)

### 3. Frontend Setup (New Terminal/Tab)

#### 3a. Navigate to Frontend
```bash
cd frontend
```

#### 3b. Install Dependencies
```bash
npm install
```

#### 3c. Start Development Server
```bash
npm run dev
```

**Success! Frontend running at**: http://localhost:5173

---

## Testing the System

### Login Credentials

**Admin User** (for managing system):
- Username: `admin`
- Password: `admin123`

### First Time Login

1. Open http://localhost:5173
2. Login with credentials above
3. You'll be redirected to Dashboard

### Admin Features
- Navigate to **Employees** → Add employees to the system
- Navigate to **Attendance** → Mark attendance for employees
- Navigate to **Regularization** → Review employee requests
- Navigate to **Reports** → View attendance summaries

### Employee Features (Create Test Employee User)

1. **Create an employee** (as admin):
   - Go to Employees page
   - Click "Add Employee"
   - Fill in details and save

2. **Create login for employee** (as admin):
   - Go to User Management page
   - Click "Create User"
   - Link it to the employee
   - Give credentials to employee

3. **Login as employee**:
   - Use the new employee credentials
   - View **My Attendance** page
   - Click **Request Regularization**
   - Submit a request with reason

4. **Admin approves request**:
   - Switch to admin account
   - Go to **Regularization** page
   - Review pending requests
   - Click **Review** and Approve/Reject

---

## Troubleshooting

### Backend Won't Start
```bash
# Check if port 8000 is in use
# Windows: netstat -ano | findstr :8000
# Mac/Linux: lsof -i :8000

# Try different port:
uvicorn app.main:app --reload --host 0.0.0.0 --port 8001
```

### Database Error: "no such table: users"
```bash
# Reset database (development only)
# Delete attendance.db if it exists
rm attendance.db
alembic upgrade head
python seed.py
```

### Frontend Can't Connect to Backend
1. Verify backend is running on http://localhost:8000
2. Check FRONTEND_URL in backend .env matches frontend port
3. Open browser console (F12) for error details
4. Clear browser cache: Ctrl+Shift+Delete

### CORS Errors
- Ensure FRONTEND_URL in backend .env is correct
- If using different ports/domains, update app/main.py CORS settings

### Login Issues
```bash
# Verify admin user exists
python -c "
from app.database import SessionLocal
from app.models.user import User
db = SessionLocal()
admin = db.query(User).filter(User.username == 'admin').first()
print(f'Admin exists: {bool(admin)}')
db.close()
"
```

---

## API Testing with Swagger

1. Open http://localhost:8000/docs
2. Login endpoint:
   ```
   POST /api/auth/login
   Body: {"username": "admin", "password": "admin123"}
   ```
3. Copy the `access_token` from response
4. Click "Authorize" (top right)
5. Paste token: `Bearer <token>`
6. Now all endpoints are authenticated

---

## Next Steps

### View the Complete System
- Check `/SETUP.md` for architecture overview
- Review `/backend/app/routers/` for all API endpoints
- Check `/frontend/src/pages/` for UI implementation

### Create Test Data
```bash
# Backend - Add sample employee and attendance
python seed.py  # Creates admin
# Then create employee via API/UI
```

### Make Changes
- Backend changes: Automatic reload with `--reload`
- Frontend changes: Automatic hot reload
- Database changes: Run `alembic revision --autogenerate -m "description"` then `alembic upgrade head`

---

## Running on Different Machines

### For Remote Access
```bash
# Backend: Allow external connections
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Then access from other machines:
# http://192.168.x.x:8000 (replace x.x with your machine IP)

# Update frontend .env or services.js:
# API_URL=http://192.168.x.x:8000
```

---

## Production Deployment (Reference)

### Backend (Gunicorn + Nginx)
```bash
# Install gunicorn
pip install gunicorn

# Run with gunicorn
gunicorn -w 4 -b 0.0.0.0:8000 app.main:app

# Use Nginx as reverse proxy
# Configure SSL/HTTPS
```

### Frontend (Build & Deploy)
```bash
# Build for production
npm run build

# Deploy 'dist' folder to:
# - Vercel
# - AWS S3 + CloudFront
# - Firebase Hosting
# - Any static hosting
```

---

## Need Help?

- **Backend Issues**: Check `/backend/alembic` logs and terminal output
- **Frontend Issues**: Open browser DevTools (F12) → Console tab
- **Database Issues**: Check `attendance.db` file and run `alembic current`
- **API Issues**: Test with Swagger at http://localhost:8000/docs

---

**Happy coding! 🚀**
