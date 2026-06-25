import api from './axios'

// ---- Employees ----
export const getEmployees = (params) => api.get('/api/employees', { params })
export const getEmployee = (id) => api.get(`/api/employees/${id}`)
export const createEmployee = (data) => api.post('/api/employees', data)
export const updateEmployee = (id, data) => api.put(`/api/employees/${id}`, data)
export const deleteEmployee = (id) => api.delete(`/api/employees/${id}`)
export const getDepartments = () => api.get('/api/employees/departments')

// ---- Attendance ----
export const getAttendance = (params) => api.get('/api/attendance', { params })
export const markAttendance = (data) => api.post('/api/attendance', data)
export const updateAttendance = (id, data) => api.put(`/api/attendance/${id}`, data)
export const getAttendanceSummary = (params) => api.get('/api/attendance/summary', { params })
export const getEmployeeHistory = (empId, params) => api.get(`/api/attendance/employee/${empId}`, { params })
export const exportAttendanceCSV = (params) => api.get('/api/attendance/export/csv', { params, responseType: 'blob' })

// ---- Attendance Requests (Employee Self-Service) ----
export const requestAttendanceRegularization = (data) => api.post('/api/attendance-requests', data)
export const getMyRequests = (params) => api.get('/api/attendance-requests/my-requests', { params })
export const getPendingRequests = (params) => api.get('/api/attendance-requests/pending', { params })
export const getAllRequests = (params) => api.get('/api/attendance-requests', { params })
export const approveRequest = (id, notes) => api.put(`/api/attendance-requests/${id}/approve`, null, { params: { notes } })
export const rejectRequest = (id, notes) => api.put(`/api/attendance-requests/${id}/reject`, null, { params: { notes } })

// ---- Dashboard ----
export const getDashboardStats = () => api.get('/api/dashboard/stats')

// ---- Auth / Users ----
export const getUsers = () => api.get('/api/auth/users')
export const createUser = (data) => api.post('/api/auth/users', data)

// ---- Employee Queries ----
export const createEmployeeQuery = (data) => api.post('/api/employee-queries', data)
export const getEmployeeQueries = (params) => api.get('/api/employee-queries', { params })
export const resolveEmployeeQuery = (id) => api.put(`/api/employee-queries/${id}/resolve`)
export const deleteEmployeeQuery = (id) => api.delete(`/api/employee-queries/${id}`)
