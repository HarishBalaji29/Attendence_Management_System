import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/layout/ProtectedRoute'
import Layout from './components/layout/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Employees from './pages/Employees'
import EmployeeDetail from './pages/EmployeeDetail'
import Attendance from './pages/Attendance'
import EmployeeAttendance from './pages/EmployeeAttendance'
import AttendanceRequests from './pages/AttendanceRequests'
import Summary from './pages/Summary'
import UserManagement from './pages/UserManagement'
import MyProfile from './pages/MyProfile'
import EmpQueries from './pages/EmpQueries'

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Protected — all authenticated users */}
        <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* Employee self-service */}
          <Route path="/my-profile" element={<MyProfile />} />
          <Route path="/my-attendance" element={<EmployeeAttendance />} />
        </Route>

        {/* Protected — admin only */}
        <Route element={<ProtectedRoute requireAdmin><Layout /></ProtectedRoute>}>
          <Route path="/attendance" element={<Attendance />} />
          <Route path="/attendance-requests" element={<AttendanceRequests />} />
          <Route path="/employees" element={<Employees />} />
          <Route path="/employees/:id" element={<EmployeeDetail />} />
          <Route path="/summary" element={<Summary />} />
          <Route path="/users" element={<UserManagement />} />
          <Route path="/queries" element={<EmpQueries />} />
        </Route>

        {/* 404 */}
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </AuthProvider>
  )
}
