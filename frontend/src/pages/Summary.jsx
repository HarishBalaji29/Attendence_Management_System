import { useState, useEffect } from 'react'
import { getAttendanceSummary, getDepartments } from '../api/services'
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
  LinearProgress,
  CircularProgress,
  Tooltip
} from '@mui/material'
import { Print as PrintIcon } from '@mui/icons-material'
import { BarChart, Bar, XAxis, YAxis, Tooltip as ChartTooltip, ResponsiveContainer, Legend } from 'recharts'
import toast from 'react-hot-toast'

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
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 0.5, fontWeight: 600 }}>
          {label}
        </Typography>
        {payload.map((p, i) => (
          <Typography key={i} variant="body2" sx={{ color: p.color, fontWeight: 600 }}>
            {p.name}: {p.value}
          </Typography>
        ))}
      </Box>
    )
  }
  return null
}

export default function Summary() {
  const [data, setData] = useState([])
  const [depts, setDepts] = useState([])
  const [filters, setFilters] = useState({ date_from: '', date_to: '', department: '' })
  const [loading, setLoading] = useState(false)

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }))

  useEffect(() => {
    getDepartments().then(r => setDepts(r.data))
  }, [])

  const load = async () => {
    setLoading(true)
    try {
      const params = {}
      if (filters.date_from) params.date_from = filters.date_from
      if (filters.date_to) params.date_to = filters.date_to
      if (filters.department) params.department = filters.department
      const res = await getAttendanceSummary(params)
      setData(res.data)
    } catch { toast.error('Failed to load summary') }
    finally { setLoading(false) }
  }

  useEffect(() => { load() }, [])

  const chartData = data.map(d => ({
    name: d.employee_name.split(' ')[0],
    Present: d.present,
    Absent: d.absent,
    Late: d.late,
    'Half-Day': d.half_day,
  }))

  const getPercentColor = (percentage) => {
    if (percentage >= 75) return 'success'
    if (percentage >= 50) return 'warning'
    return 'error'
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, '@media print': { display: 'none' } }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Attendance Reports
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Summary across all employees
          </Typography>
        </Box>
        {data.length > 0 && (
          <Tooltip title="Print attendance report sheet" arrow>
            <Button
              variant="contained"
              color="primary"
              startIcon={<PrintIcon />}
              onClick={() => window.print()}
            >
              Generate Report
            </Button>
          </Tooltip>
        )}
      </Box>

      {/* Print-only Header */}
      <Box sx={{ display: 'none', '@media print': { display: 'block', mb: 4 } }}>
        <Typography variant="h3" sx={{ fontWeight: 800, mb: 1, color: '#000000' }}>
          AttendX Attendance Summary Report
        </Typography>
        <Typography variant="body1" sx={{ color: '#333333', mb: 2 }}>
          Generated on: {new Date().toLocaleDateString()}
        </Typography>
        <Divider sx={{ borderColor: '#000000', borderWidth: '1px' }} />
      </Box>

      {/* Filters */}
      <Card sx={{ mb: 4, '@media print': { display: 'none' } }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                label="Date From"
                type="date"
                fullWidth
                value={filters.date_from}
                onChange={e => setFilter('date_from', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                label="Date To"
                type="date"
                fullWidth
                value={filters.date_to}
                onChange={e => setFilter('date_to', e.target.value)}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={4} md={3}>
              <TextField
                select
                label="Department"
                fullWidth
                value={filters.department}
                onChange={e => setFilter('department', e.target.value)}
              >
                <MenuItem value="">All Departments</MenuItem>
                {depts.map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} md={3}>
              <Button
                variant="contained"
                color="primary"
                onClick={load}
                fullWidth
                sx={{ py: 1.2 }}
              >
                View Report
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Chart */}
      {data.length > 0 && (
        <Card sx={{ mb: 4, '@media print': { display: 'none' } }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 3 }}>
              Attendance Breakdown by Employee
            </Typography>
            <Box sx={{ width: '100%', height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} barSize={14} barGap={2}>
                  <XAxis dataKey="name" tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#a1a1aa', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <ChartTooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
                  <Legend iconType="circle" iconSize={8} formatter={v => <span style={{ color: '#a1a1aa', fontSize: 13 }}>{v}</span>} />
                  <Bar dataKey="Present" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Absent" fill="#ef4444" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Late" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="Half-Day" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* Summary table */}
      <Card sx={{ '@media print': { boxShadow: 'none', border: 'none', bgcolor: 'transparent' } }}>
        <CardContent sx={{ p: 0, '&:last-child': { pb: 0 } }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 10 }}>
              <CircularProgress color="primary" />
            </Box>
          ) : data.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <Typography variant="h3" sx={{ mb: 1 }}>📊</Typography>
              <Typography variant="body2" color="text.secondary">Set date range and click View Report</Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
              <Table sx={{ '@media print': { '& td, & th': { color: '#000000 !important' } } }}>
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)', '@media print': { bgcolor: '#f0f0f0' } }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Employee ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Total Days</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Present</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Absent</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Late</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 600 }}>Half-Day</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Attendance %</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map(row => (
                    <TableRow key={row.employee_id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Chip label={row.employee_code} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary', fontWeight: 500, '@media print': { border: '1px solid #ccc', bgcolor: 'transparent' } }} />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.employee_name}</TableCell>
                      <TableCell>{row.department}</TableCell>
                      <TableCell align="center">{row.total_days}</TableCell>
                      <TableCell align="center" sx={{ color: 'success.main', fontWeight: 700 }}>{row.present}</TableCell>
                      <TableCell align="center" sx={{ color: 'error.main', fontWeight: 700 }}>{row.absent}</TableCell>
                      <TableCell align="center" sx={{ color: 'warning.main', fontWeight: 700 }}>{row.late}</TableCell>
                      <TableCell align="center" sx={{ color: 'info.main', fontWeight: 700 }}>{row.half_day}</TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Box sx={{ flex: 1, width: 80, height: 6, '@media print': { display: 'none' } }}>
                            <LinearProgress
                              variant="determinate"
                              value={row.attendance_percentage}
                              color={getPercentColor(row.attendance_percentage)}
                              sx={{ height: 6, borderRadius: 3 }}
                            />
                          </Box>
                          <Typography variant="body2" sx={{ fontWeight: 700, minWidth: 42, color: `${getPercentColor(row.attendance_percentage)}.main` }}>
                            {row.attendance_percentage}%
                          </Typography>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  )
}
