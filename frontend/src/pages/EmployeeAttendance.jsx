import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyRequests, requestAttendanceRegularization, getEmployeeHistory } from '../api/services'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
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
  Add as AddIcon,
  Close as CloseIcon,
  CalendarToday as CalendarTodayIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_BADGE = {
  pending: { color: 'warning', label: 'Pending' },
  approved: { color: 'success', label: 'Approved' },
  rejected: { color: 'error', label: 'Rejected' },
}

const ATTENDANCE_STATUSES = ['Present', 'Absent', 'Late', 'Half-Day']

function RegularizationRequestModal({ employeeId, onClose, onSuccess }) {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    attendance_date: format(new Date(), 'yyyy-MM-dd'),
    request_type: 'regularization',
    requested_status: 'Present',
    check_in: '',
    check_out: '',
    reason: '',
  })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.reason.trim()) return toast.error('Reason is required')

    setLoading(true)
    try {
      await requestAttendanceRegularization({
        ...form,
        employee_id: employeeId,
        check_in: form.check_in || null,
        check_out: form.check_out || null,
      })
      toast.success('Request submitted! Admin will review it soon.')
      onSuccess()
      onClose()
      navigate('/dashboard')
    } catch (err) {
      const detail = err.response?.data?.detail
      let msg = 'Failed to submit request'
      if (typeof detail === 'string') {
        msg = detail
      } else if (Array.isArray(detail)) {
        msg = detail.map(d => `${d.loc.slice(1).join('.')}: ${d.msg}`).join(', ')
      } else if (detail && typeof detail === 'object') {
        msg = JSON.stringify(detail)
      }
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          bgcolor: '#111115',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 3,
          backgroundImage: 'none'
        }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pb: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Request Attendance Regularization
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', py: 3 }}>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Attendance Date *"
                type="date"
                fullWidth
                value={form.attendance_date}
                onChange={e => set('attendance_date', e.target.value)}
                required
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status *"
                fullWidth
                value={form.requested_status}
                onChange={e => set('requested_status', e.target.value)}
                required
              >
                {ATTENDANCE_STATUSES.map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Check In"
                type="time"
                fullWidth
                value={form.check_in}
                onChange={e => set('check_in', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Check Out"
                type="time"
                fullWidth
                value={form.check_out}
                onChange={e => set('check_out', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reason for Request *"
                placeholder="Please explain why you need this regularization..."
                fullWidth
                multiline
                rows={3}
                value={form.reason}
                onChange={e => set('reason', e.target.value)}
                required
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Submit Request'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default function EmployeeAttendance() {
  const { user } = useAuth()
  const [requests, setRequests] = useState({ items: [], total: 0 })
  const [history, setHistory] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [pageRequest, setPageRequest] = useState(1)
  const [pageHistory, setPageHistory] = useState(1)
  const [filterStatus, setFilterStatus] = useState(null)

  const loadData = useCallback(async () => {
    if (!user?.employee_id) {
      setLoading(false)
      return
    }
    setLoading(true)
    try {
      const [reqRes, histRes] = await Promise.all([
        getMyRequests({ page: pageRequest, page_size: 5, status: filterStatus }),
        getEmployeeHistory(user.employee_id, { page: pageHistory, page_size: 10 }),
      ])
      setRequests(reqRes.data)
      setHistory(histRes.data)
    } catch (err) {
      toast.error('Failed to load data')
    } finally {
      setLoading(false)
    }
  }, [user?.employee_id, pageRequest, pageHistory, filterStatus])

  useEffect(() => { loadData() }, [loadData])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  if (!user?.employee_id) {
    return (
      <Box>
        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" sx={{ fontWeight: 800 }}>
            My Attendance
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

  const stats = {
    pending: requests.items.filter(r => r.status === 'pending').length,
    approved: requests.items.filter(r => r.status === 'approved').length,
    rejected: requests.items.filter(r => r.status === 'rejected').length,
  }

  const attendanceStats = {
    present: history.items.filter(a => a.status === 'Present').length,
    absent: history.items.filter(a => a.status === 'Absent').length,
    late: history.items.filter(a => a.status === 'Late').length,
    halfDay: history.items.filter(a => a.status === 'Half-Day').length,
  }

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

  const getReqBadgeProps = (status) => {
    const badge = STATUS_BADGE[status] || { color: 'default', label: status }
    return {
      color: badge.color,
      label: badge.label,
      size: 'small',
      variant: 'outlined',
      sx: { fontWeight: 600 }
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          My Attendance
        </Typography>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setShowModal(true)}
        >
          Request Regularization
        </Button>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {[
          { label: 'Present', value: attendanceStats.present, color: '#4CAF50' },
          { label: 'Absent', value: attendanceStats.absent, color: '#f44336' },
          { label: 'Late', value: attendanceStats.late, color: '#FF9800' },
          { label: 'Half-Day', value: attendanceStats.halfDay, color: '#2196F3' },
        ].map(stat => (
          <Grid item xs={12} sm={6} md={3} key={stat.label}>
            <Card sx={{ textAlign: 'center', py: 3.5 }}>
              <Typography variant="h4" sx={{ fontWeight: 800, color: stat.color, mb: 1 }}>
                {stat.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                {stat.label}
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Requests Status Summary */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        {Object.entries(stats).map(([key, value]) => (
          <Grid item xs={12} sm={4} key={key}>
            <Card sx={{
              borderLeft: `4px solid`,
              borderColor: `${STATUS_BADGE[key].color}.main`,
              p: 2.5
            }}>
              <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
                {value}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ textTransform: 'capitalize', fontWeight: 500 }}>
                {key} Requests
              </Typography>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Regularization Requests */}
      <Card sx={{ mb: 4 }}>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.08)', display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            My Regularization Requests
          </Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['pending', 'approved', 'rejected'].map(s => (
              <Button
                key={s}
                variant={filterStatus === s ? 'contained' : 'text'}
                color={filterStatus === s ? 'primary' : 'inherit'}
                size="small"
                onClick={() => setFilterStatus(filterStatus === s ? null : s)}
                sx={{ textTransform: 'capitalize' }}
              >
                {s}
              </Button>
            ))}
          </Box>
        </Box>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {requests.items.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h3" sx={{ mb: 1 }}>📋</Typography>
              <Typography variant="body2" color="text.secondary">No requests yet</Typography>
            </Box>
          ) : (
            <Box>
              <TableContainer component={Paper} sx={{ bgcolor: 'transparent', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
                <Table>
                  <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Requested</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {requests.items.map(req => (
                      <TableRow key={req.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarTodayIcon fontSize="small" sx={{ color: 'primary.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {format(new Date(req.attendance_date), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell sx={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{req.request_type}</TableCell>
                        <TableCell>
                          <Chip {...getReqBadgeProps(req.status)} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem' }}>{format(new Date(req.requested_at), 'MMM dd')}</TableCell>
                        <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.reason}>
                          {req.reason || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {requests.total_pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Typography variant="body2" color="text.secondary">
                    Page {requests.page} of {requests.total_pages}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={pageRequest === 1}
                      onClick={() => setPageRequest(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={pageRequest === requests.total_pages}
                      onClick={() => setPageRequest(p => p + 1)}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>

      {/* Attendance History */}
      <Card>
        <Box sx={{ p: 3, borderBottom: '1px solid rgba(255, 255, 255, 0.08)' }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Attendance History
          </Typography>
        </Box>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {history.items.length === 0 ? (
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
                    {history.items.map(att => (
                      <TableRow key={att.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CalendarTodayIcon fontSize="small" sx={{ color: 'primary.main' }} />
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>
                              {format(new Date(att.attendance_date), 'MMM dd, yyyy')}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          {att.check_in ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}>
                              <AccessTimeIcon fontSize="inherit" /> {att.check_in}
                            </Box>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          {att.check_out ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontSize: '0.85rem' }}>
                              <AccessTimeIcon fontSize="inherit" /> {att.check_out}
                            </Box>
                          ) : '—'}
                        </TableCell>
                        <TableCell>
                          <Chip {...getChipProps(att.status)} />
                        </TableCell>
                        <TableCell sx={{ fontSize: '0.85rem', color: 'text.secondary' }}>{att.notes || '—'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              {/* Pagination */}
              {history.total_pages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                  <Typography variant="body2" color="text.secondary">
                    Page {history.page} of {history.total_pages}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={pageHistory === 1}
                      onClick={() => setPageHistory(p => p - 1)}
                    >
                      Previous
                    </Button>
                    <Button
                      size="small"
                      variant="outlined"
                      disabled={pageHistory === history.total_pages}
                      onClick={() => setPageHistory(p => p + 1)}
                    >
                      Next
                    </Button>
                  </Box>
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
      {showModal && <RegularizationRequestModal employeeId={user.employee_id} onClose={() => setShowModal(false)} onSuccess={loadData} />}
    </Box>
  )
}
