import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getEmployee, getEmployeeHistory } from '../api/services'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Avatar,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  LinearProgress,
  Pagination,
  CircularProgress
} from '@mui/material'
import {
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon
} from '@mui/icons-material'

export default function MyProfile() {
  const { user } = useAuth()
  const [employee, setEmployee] = useState(null)
  const [attendance, setAttendance] = useState({ items: [], total: 0, total_pages: 1 })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)

  useEffect(() => {
    if (!user?.employee_id) { setLoading(false); return }
    async function load() {
      try {
        const [eRes, aRes] = await Promise.all([
          getEmployee(user.employee_id),
          getEmployeeHistory(user.employee_id, { page, page_size: 10 }),
        ])
        setEmployee(eRes.data)
        setAttendance(aRes.data)
      } catch {} finally { setLoading(false) }
    }
    load()
  }, [user?.employee_id, page])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (!user?.employee_id || !employee) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            My Profile
          </Typography>
        </Box>
        <Card sx={{ p: 5, textAlign: 'center' }}>
          <Box sx={{ fontSize: '3rem', mb: 2 }}>🔗</Box>
          <Typography variant="h6" sx={{ mb: 1, fontWeight: 700 }}>
            No Employee Record Linked
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Ask your administrator to link your account to an employee record.
          </Typography>
        </Card>
      </Box>
    )
  }

  const present = attendance.items.filter(a => a.status === 'Present').length
  const pct = attendance.total > 0 ? Math.round((present / attendance.total) * 100) : 0

  const getChipProps = (status) => {
    const map = {
      Present: { color: 'success', label: 'Present' },
      Absent: { color: 'error', label: 'Absent' },
      Late: { color: 'warning', label: 'Late' },
      'Half-Day': { color: 'info', label: 'Half-Day' }
    }
    const props = map[status] || { color: 'default', label: status }
    return {
      color: props.color,
      label: props.label,
      variant: 'outlined',
      size: 'small',
      sx: { fontWeight: 600 }
    }
  }

  const getPercentColor = (percentage) => {
    if (percentage >= 75) return 'success'
    if (percentage >= 50) return 'warning'
    return 'error'
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          My Profile
        </Typography>
      </Box>

      <Grid container spacing={3} alignItems="start">
        {/* Profile Card */}
        <Grid item xs={12} md={4} lg={3.5}>
          <Card sx={{ p: 1.5 }}>
            <CardContent sx={{ textAlign: 'center', pt: 4 }}>
              <Avatar sx={{ width: 80, height: 80, fontSize: '1.75rem', mx: 'auto', mb: 2, bgcolor: '#ff5a36', color: '#ffffff' }}>
                {employee.name.slice(0, 2).toUpperCase()}
              </Avatar>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
                {employee.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontWeight: 500 }}>
                {employee.designation}
              </Typography>
              <Chip
                label={employee.status}
                color={employee.status === 'Active' ? 'success' : 'default'}
                size="small"
                variant="outlined"
                sx={{ fontWeight: 600 }}
              />

              <Divider sx={{ my: 3 }} />

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, textAlign: 'left', mb: 3 }}>
                {[
                  { icon: <EmailIcon fontSize="small" />, label: 'Email', value: employee.email },
                  { icon: <PhoneIcon fontSize="small" />, label: 'Mobile', value: employee.mobile || '—' },
                  { icon: <BusinessIcon fontSize="small" />, label: 'Department', value: employee.department },
                  { icon: <WorkIcon fontSize="small" />, label: 'Employee ID', value: employee.employee_id },
                ].map(({ icon, label, value }) => (
                  <Box key={label} sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Box sx={{ color: '#ff5a36', display: 'flex', alignItems: 'center' }}>
                      {icon}
                    </Box>
                    <Box>
                      <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.5px', display: 'block' }}>
                        {label}
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 500, mt: 0.2 }}>
                        {value}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Box>

              <Divider sx={{ my: 3 }} />

              <Box sx={{ textAlign: 'left', mb: 1 }}>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500, mb: 0.5 }}>
                  Overall Attendance
                </Typography>
                <Typography variant="h4" sx={{ fontWeight: 800, color: `${getPercentColor(pct)}.main`, mb: 1.5 }}>
                  {pct}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={pct}
                  color={getPercentColor(pct)}
                  sx={{ height: 8, borderRadius: 4 }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {attendance.total} total records
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance History */}
        <Grid item xs={12} md={8} lg={8.5}>
          <Card>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  My Attendance History
                </Typography>
              </Box>
              {attendance.items.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h3" sx={{ mb: 1 }}>📋</Typography>
                  <Typography variant="body2" color="text.secondary">No attendance records yet</Typography>
                </Box>
              ) : (
                <Box>
                  <TableContainer component={Paper} sx={{ bgcolor: 'transparent', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {attendance.items.map(a => (
                          <TableRow key={a.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                            <TableCell sx={{ fontWeight: 500 }}>{a.attendance_date}</TableCell>
                            <TableCell sx={{ color: 'success.main', fontWeight: 500 }}>{a.check_in || '—'}</TableCell>
                            <TableCell sx={{ color: 'text.secondary' }}>{a.check_out || '—'}</TableCell>
                            <TableCell>
                              <Chip {...getChipProps(a.status)} />
                            </TableCell>
                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                              {a.notes || '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>

                  {/* Pagination */}
                  {attendance.total_pages > 1 && (
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                      <Pagination
                        count={attendance.total_pages}
                        page={page}
                        onChange={handlePageChange}
                        color="primary"
                        variant="outlined"
                        shape="rounded"
                      />
                    </Box>
                  )}
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
}
