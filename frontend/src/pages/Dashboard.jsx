import { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getDashboardStats, getAttendance, markAttendance } from '../api/services'
import { useAuth } from '../context/AuthContext'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
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
  IconButton,
  Chip,
  CircularProgress,
  Tooltip
} from '@mui/material'
import {
  People as PeopleIcon,
  PersonAdd as PersonAddIcon,
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Schedule as ScheduleIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const COLORS = ['#22c55e', '#ef4444', '#f59e0b', '#3b82f6']

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload?.length) {
    return (
      <Box sx={{
        bgcolor: '#111115',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: 2,
        p: '8px 14px',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)'
      }}>
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5 }}>
          {label}
        </Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="body2" sx={{ color: p.color || '#ffffff', fontWeight: 600 }}>
            {p.name}: {p.value}
          </Typography>
        ))}
      </Box>
    )
  }
  return null
}

function StatCard({ icon, value, label, color, tooltip }) {
  return (
    <Tooltip title={tooltip} arrow placement="top">
      <Card sx={{
        height: '100%',
        position: 'relative',
        overflow: 'hidden',
        cursor: 'help',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 12px 40px 0 rgba(0, 0, 0, 0.4)'
        }
      }}>
        <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5, p: 3 }}>
          <Box sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 52,
            height: 52,
            borderRadius: 2,
            bgcolor: color + '1a',
            color: color
          }}>
            {icon}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h4" sx={{ fontWeight: 800, color: color, mb: 0.5, lineHeight: 1.1 }}>
              {value}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
              {label}
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Tooltip>
  )
}

const STATUS_OPTS = ['Present', 'Absent', 'Late', 'Half-Day']

function MarkModal({ onClose, onSave }) {
  const { user } = useAuth()
  const [form, setForm] = useState({
    employee_id: String(user?.employee_id || ''),
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
    if (!form.employee_id) return toast.error('Employee record not linked')
    setLoading(true)
    try {
      await markAttendance({
        ...form,
        employee_id: parseInt(form.employee_id),
        check_in: form.check_in || null,
        check_out: form.check_out || null,
      })
      toast.success('Attendance marked successfully!')
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
          <Button onClick={onClose} variant="outlined" color="inherit">
            Cancel
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : 'Mark Attendance'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

export default function Dashboard() {
  const [stats, setStats] = useState(null)
  const [recent, setRecent] = useState([])
  const [loading, setLoading] = useState(true)
  const [showMarkModal, setShowMarkModal] = useState(false)
  const { isAdmin, user } = useAuth()
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [sRes, aRes] = await Promise.all([
        getDashboardStats(),
        getAttendance({ page: 1, page_size: 5, sort_order: 'desc' }),
      ])
      setStats(sRes.data)
      setRecent(aRes.data.items)
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    )
  }

  const pieData = [
    { name: 'Present', value: stats?.present_today || 0 },
    { name: 'Absent', value: stats?.absent_today || 0 },
    { name: 'Late', value: stats?.late_today || 0 },
  ].filter(d => d.value > 0)

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

  return (
    <Box sx={{ width: '100%' }}>
      <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'space-between', alignItems: { xs: 'flex-start', sm: 'center' }, gap: 2, mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, <Box component="span" sx={{ fontWeight: 600, color: 'text.primary' }}>{user?.username}</Box> — {format(new Date(), 'MMMM d, yyyy')}
          </Typography>
        </Box>
        {isAdmin ? (
          <Tooltip title="Mark new attendance record" arrow>
            <Button variant="contained" color="primary" onClick={() => navigate('/attendance')}>
              Mark Attendance
            </Button>
          </Tooltip>
        ) : (
          user?.employee_id && (
            <Tooltip title="Mark your attendance for today" arrow>
              <Button variant="contained" color="primary" onClick={() => setShowMarkModal(true)}>
                Mark Attendance
              </Button>
            </Tooltip>
          )
        )}
      </Box>

      {/* KPI Stats */}
      {isAdmin && (
        <Grid container spacing={3} columns={10} sx={{ mb: 4 }}>
          <Grid item xs={10} sm={5} md={2}>
            <StatCard icon={<PeopleIcon size={22} />} value={stats?.total_employees} label="Total Employees" color="#ff5a36" tooltip="Total employees registered in the company database" />
          </Grid>
          <Grid item xs={10} sm={5} md={2}>
            <StatCard icon={<PersonAddIcon size={22} />} value={stats?.active_employees} label="Active Employees" color="#22c55e" tooltip="Employees currently set to Active status" />
          </Grid>
          <Grid item xs={10} sm={5} md={2}>
            <StatCard icon={<CheckCircleIcon size={22} />} value={stats?.present_today} label="Present Today" color="#3b82f6" tooltip="Employees marked present or checked-in today" />
          </Grid>
          <Grid item xs={10} sm={5} md={2}>
            <StatCard icon={<CancelIcon size={22} />} value={stats?.absent_today} label="Absent Today" color="#ef4444" tooltip="Employees marked absent today" />
          </Grid>
          <Grid item xs={10} sm={5} md={2}>
            <StatCard icon={<ScheduleIcon size={22} />} value={stats?.late_today} label="Late Today" color="#f59e0b" tooltip="Employees marked late today" />
          </Grid>
        </Grid>
      )}

      {/* Charts */}
      {isAdmin && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Department chart */}
          <Grid item xs={12} md={7}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
                  Department-wise Employees
                </Typography>
                <Box sx={{ width: '100%', height: 240 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats?.departments || []} barSize={32}>
                      <XAxis dataKey="department" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                      <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                      <Bar dataKey="count" name="Employees" fill="url(#barGrad)" radius={[6, 6, 0, 0]} />
                      <defs>
                        <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ff5a36" />
                          <stop offset="100%" stopColor="#ff3b30" />
                        </linearGradient>
                      </defs>
                    </BarChart>
                  </ResponsiveContainer>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Today attendance donut */}
          <Grid item xs={12} md={5}>
            <Card sx={{ height: '100%' }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
                  Today's Attendance Status
                </Typography>
                <Box sx={{ width: '100%', height: 240, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {pieData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} dataKey="value" cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4}>
                          {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <ChartTooltip content={<CustomTooltip />} />
                        <Legend iconType="circle" iconSize={8} formatter={(val) => <span style={{ color: '#a1a1aa', fontSize: 13 }}>{val}</span>} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 3 }}>
                      <Typography variant="h3" sx={{ mb: 1 }}>📊</Typography>
                      <Typography variant="body2" color="text.secondary">No attendance marked today</Typography>
                    </Box>
                  )}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Recent attendance */}
      <Card sx={{ mb: 4 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Recent Attendance
            </Typography>
            <Tooltip title="View full attendance sheet" arrow>
              <Button size="small" color="inherit" onClick={() => navigate(isAdmin ? '/attendance' : '/my-attendance')}>
                View all →
              </Button>
            </Tooltip>
          </Box>
          {recent.length > 0 ? (
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow>
                    {isAdmin && <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>}
                    {isAdmin && <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>}
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Check In</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Check Out</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recent.map(r => (
                    <TableRow key={r.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      {isAdmin && <TableCell sx={{ fontWeight: 500 }}>{r.employee_name}</TableCell>}
                      {isAdmin && (
                        <TableCell>
                          <Chip label={r.department} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary', fontWeight: 500 }} />
                        </TableCell>
                      )}
                      <TableCell>{r.attendance_date}</TableCell>
                      <TableCell>{r.check_in || '—'}</TableCell>
                      <TableCell>{r.check_out || '—'}</TableCell>
                      <TableCell>
                        <Chip {...getChipProps(r.status)} />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ textAlign: 'center', py: 5 }}>
              <Typography variant="h3" sx={{ mb: 1 }}>📋</Typography>
              <Typography variant="body2" color="text.secondary">No recent attendance records</Typography>
            </Box>
          )}
        </CardContent>
      </Card>
      {showMarkModal && <MarkModal onClose={() => setShowMarkModal(false)} onSave={() => { setShowMarkModal(false); load() }} />}
    </Box>
  )
}
