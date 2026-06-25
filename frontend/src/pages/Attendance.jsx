import { useState, useEffect, useCallback } from 'react'
import { getAttendance, markAttendance, updateAttendance, getEmployees, exportAttendanceCSV } from '../api/services'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Pagination,
  CircularProgress,
  Tooltip
} from '@mui/material'
import {
  Add as AddIcon,
  Download as DownloadIcon,
  Edit as EditIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

const STATUS_OPTS = ['Present', 'Absent', 'Late', 'Half-Day']

function MarkModal({ employees, onClose, onSave }) {
  const { isAdmin, user } = useAuth()
  const [form, setForm] = useState({
    employee_id: isAdmin ? '' : String(user?.employee_id || ''),
    attendance_date: format(new Date(), 'yyyy-MM-dd'),
    check_in: '',
    check_out: '',
    status: 'Present',
    notes: '',
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.employee_id) return toast.error('Select an employee')
    setLoading(true)
    try {
      await markAttendance({
        ...form,
        employee_id: parseInt(form.employee_id),
        check_in: form.check_in || null,
        check_out: form.check_out || null,
      })
      toast.success('Attendance marked!')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to mark attendance')
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
          Mark Attendance
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', py: 3 }}>
          <Grid container spacing={2.5}>
            {isAdmin && (
              <Grid item xs={12}>
                <TextField
                  select
                  label="Employee *"
                  fullWidth
                  value={form.employee_id}
                  onChange={e => set('employee_id', e.target.value)}
                  required
                >
                  <option value="" disabled style={{ background: '#111115' }}>Select employee...</option>
                  {employees.map(e => (
                    <MenuItem key={e.id} value={e.id}>
                      {e.employee_id} — {e.name}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date *"
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
                value={form.status}
                onChange={e => set('status', e.target.value)}
                required
              >
                {STATUS_OPTS.map(s => (
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
                label="Notes"
                placeholder="Optional notes..."
                fullWidth
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Mark Attendance'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

function EditModal({ record, onClose, onSave }) {
  const [form, setForm] = useState({
    check_in: record.check_in || '',
    check_out: record.check_out || '',
    status: record.status,
    notes: record.notes || '',
  })
  const [loading, setLoading] = useState(false)
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      await updateAttendance(record.id, {
        ...form,
        check_in: form.check_in || null,
        check_out: form.check_out || null,
      })
      toast.success('Updated!')
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to update')
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
          Edit Attendance
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', py: 3 }}>
          <Box sx={{ mb: 3, p: 2, bgcolor: 'rgba(255, 255, 255, 0.03)', borderRadius: 2, border: '1px solid rgba(255, 255, 255, 0.06)' }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              {record.employee_name}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {record.attendance_date}
            </Typography>
          </Box>
          <Grid container spacing={2.5}>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status *"
                fullWidth
                value={form.status}
                onChange={e => set('status', e.target.value)}
                required
              >
                {STATUS_OPTS.map(s => (
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
                label="Notes"
                fullWidth
                value={form.notes}
                onChange={e => set('notes', e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Update'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default function Attendance() {
  const { isAdmin } = useAuth()
  const [data, setData] = useState({ items: [], total: 0, total_pages: 1 })
  const [employees, setEmployees] = useState([])
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({ status: '', date: '', department: '' })
  const [loading, setLoading] = useState(true)
  const [showMark, setShowMark] = useState(false)
  const [editRecord, setEditRecord] = useState(null)
  const [exporting, setExporting] = useState(false)

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const params = { page, page_size: 10 }
      if (filters.status) params.status = filters.status
      if (filters.date) {
        params.date_from = filters.date
        params.date_to = filters.date
      }
      if (filters.department) params.department = filters.department
      const res = await getAttendance(params)
      setData(res.data)
      if (isAdmin) {
        const eRes = await getEmployees({ page_size: 100 })
        setEmployees(eRes.data.items.filter(e => e.status === 'Active'))
      }
    } catch { toast.error('Failed to load attendance') }
    finally { setLoading(false) }
  }, [page, filters, isAdmin])

  useEffect(() => { load() }, [load])

  const handleExport = async () => {
    setExporting(true)
    try {
      const params = {}
      if (filters.date) {
        params.date_from = filters.date
        params.date_to = filters.date
      }
      if (filters.department) params.department = filters.department
      const res = await exportAttendanceCSV(params)
      const url = URL.createObjectURL(new Blob([res.data]))
      const a = document.createElement('a')
      a.href = url; a.download = 'attendance_report.csv'; a.click()
      URL.revokeObjectURL(url)
      toast.success('CSV downloaded!')
    } catch { toast.error('Export failed') }
    finally { setExporting(false) }
  }

  const clearFilters = () => setFilters({ status: '', date: '', department: '' })
  const hasFilters = Object.values(filters).some(Boolean)

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
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Attendance
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.total} records total
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {isAdmin && (
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<DownloadIcon />}
              onClick={handleExport}
              disabled={exporting}
            >
              {exporting ? 'Exporting...' : 'Export CSV'}
            </Button>
          )}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={() => setShowMark(true)}
          >
            Mark Attendance
          </Button>
        </Box>
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                label="Filter Date"
                type="date"
                fullWidth
                value={filters.date}
                onChange={e => { setFilter('date', e.target.value); setPage(1) }}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                select
                label="Filter Status"
                fullWidth
                value={filters.status}
                onChange={e => { setFilter('status', e.target.value); setPage(1) }}
              >
                <MenuItem value="">All Status</MenuItem>
                {STATUS_OPTS.map(s => (
                  <MenuItem key={s} value={s}>{s}</MenuItem>
                ))}
              </TextField>
            </Grid>
            {hasFilters && (
              <Grid item xs={12} sm={4} md={2}>
                <Button
                  variant="text"
                  color="inherit"
                  startIcon={<CloseIcon />}
                  onClick={() => { clearFilters(); setPage(1) }}
                  fullWidth
                >
                  Clear
                </Button>
              </Grid>
            )}
          </Grid>
        </CardContent>
      </Card>

      {/* Table Card */}
      <Card>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
            <CircularProgress color="primary" />
          </Box>
        ) : data.items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h3" sx={{ mb: 1 }}>📋</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>No attendance records found</Typography>
            <Button variant="contained" size="small" onClick={() => setShowMark(true)}>
              Mark Attendance
            </Button>
          </Box>
        ) : (
          <Box>
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow>
                    {isAdmin && <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>}
                    {isAdmin && <TableCell sx={{ fontWeight: 600 }}>Dept</TableCell>}
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Notes</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map(r => (
                    <TableRow key={r.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {isAdmin && <TableCell sx={{ fontWeight: 500 }}>{r.employee_name}</TableCell>}
                      {isAdmin && (
                        <TableCell>
                          <Chip label={r.department} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary', fontWeight: 500 }} />
                        </TableCell>
                      )}
                      <TableCell>{r.attendance_date}</TableCell>
                      <TableCell sx={{ color: 'success.main', fontWeight: 500 }}>{r.check_in || '—'}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{r.check_out || '—'}</TableCell>
                      <TableCell>
                        <Chip {...getChipProps(r.status)} />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.notes || '—'}
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Edit attendance record" arrow>
                          <IconButton onClick={() => setEditRecord(r)} sx={{ color: 'text.secondary' }}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {data.total_pages > 1 && (
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 3, borderTop: '1px solid rgba(255, 255, 255, 0.08)' }}>
                <Typography variant="body2" color="text.secondary">
                  Page {page} of {data.total_pages} ({data.total} records)
                </Typography>
                <Pagination
                  count={data.total_pages}
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
      </Card>

      {showMark && <MarkModal employees={employees} onClose={() => setShowMark(false)} onSave={() => { setShowMark(false); load() }} />}
      {editRecord && <EditModal record={editRecord} onClose={() => setEditRecord(null)} onSave={() => { setEditRecord(null); load() }} />}
    </Box>
  )
}
