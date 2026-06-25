import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { getEmployee, getEmployeeHistory } from '../api/services'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
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
  IconButton,
  Pagination,
  CircularProgress
} from '@mui/material'
import {
  ArrowBack as ArrowBackIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Business as BusinessIcon,
  Work as WorkIcon
} from '@mui/icons-material'
import { format } from 'date-fns'

export default function EmployeeDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [employee, setEmployee] = useState(null)
  const [attendance, setAttendance] = useState({ items: [], total: 0, total_pages: 1 })
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      try {
        const [eRes, aRes] = await Promise.all([
          getEmployee(id),
          getEmployeeHistory(id, { page, page_size: 10 }),
        ])
        setEmployee(eRes.data)
        setAttendance(aRes.data)
      } catch {
        navigate('/employees')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id, page, navigate])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }
  if (!employee) return null

  const present = attendance.items.filter(a => a.status === 'Present').length
  const absent = attendance.items.filter(a => a.status === 'Absent').length
  const late = attendance.items.filter(a => a.status === 'Late').length

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

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: 'text.primary' }}>
          <ArrowBackIcon />
        </IconButton>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Employee Profile
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {employee.employee_id}
          </Typography>
        </Box>
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

              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, textAlign: 'left', mb: 1 }}>
                {[
                  { icon: <EmailIcon fontSize="small" />, label: 'Email', value: employee.email },
                  { icon: <PhoneIcon fontSize="small" />, label: 'Mobile', value: employee.mobile || '—' },
                  { icon: <BusinessIcon fontSize="small" />, label: 'Department', value: employee.department },
                  { icon: <WorkIcon fontSize="small" />, label: 'Designation', value: employee.designation },
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

              <Grid container spacing={2}>
                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'success.main', lineHeight: 1.2 }}>
                    {present}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Present
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'error.main', lineHeight: 1.2 }}>
                    {absent}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Absent
                  </Typography>
                </Grid>
                <Grid item xs={4} sx={{ textAlign: 'center' }}>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: 'warning.main', lineHeight: 1.2 }}>
                    {late}
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 500 }}>
                    Late
                  </Typography>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Attendance History */}
        <Grid item xs={12} md={8} lg={8.5}>
          <Card>
            <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                  Attendance History
                </Typography>
                <Chip label={`${attendance.total} records`} size="small" sx={{ bgcolor: 'rgba(255, 255, 255, 0.05)', color: 'text.secondary', fontWeight: 500 }} />
              </Box>
              {attendance.items.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8 }}>
                  <Typography variant="h3" sx={{ mb: 1 }}>📋</Typography>
                  <Typography variant="body2" color="text.secondary">No attendance records found</Typography>
                </Box>
              ) : (
                <Box>
                  <TableContainer component={Paper} sx={{ bgcolor: 'transparent', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
                    <Table>
                      <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                        <TableRow>
                          <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                          <TableCell sx={{ fontWeight: 600 }}>Day</TableCell>
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
                            <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>
                              {format(new Date(a.attendance_date), 'EEE')}
                            </TableCell>
                            <TableCell>{a.check_in || '—'}</TableCell>
                            <TableCell>{a.check_out || '—'}</TableCell>
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
