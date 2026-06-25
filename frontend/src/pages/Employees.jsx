import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { getEmployees, createEmployee, updateEmployee, deleteEmployee, getDepartments } from '../api/services'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  TextField,
  MenuItem,
  InputAdornment,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Pagination,
  CircularProgress,
  Tooltip
} from '@mui/material'
import {
  Search as SearchIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import toast from 'react-hot-toast'

const INITIAL_FORM = {
  employee_id: '', name: '', email: '', mobile: '',
  department: '', designation: '', status: 'Active'
}

function EmployeeModal({ mode, employee, onClose, onSave }) {
  const [form, setForm] = useState(mode === 'edit' ? { ...employee } : { ...INITIAL_FORM })
  const [loading, setLoading] = useState(false)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (mode === 'edit') {
        await updateEmployee(employee.id, form)
        toast.success('Employee updated!')
      } else {
        await createEmployee(form)
        toast.success('Employee added!')
      }
      onSave()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to save employee')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog
      open
      onClose={onClose}
      maxWidth="md"
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
          {mode === 'edit' ? 'Edit Employee' : 'Add Employee'}
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', py: 3 }}>
          <Grid container spacing={2.5}>
            {mode === 'add' && (
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Employee ID *"
                  placeholder="e.g. EMP001"
                  fullWidth
                  value={form.employee_id}
                  onChange={e => set('employee_id', e.target.value)}
                  required
                />
              </Grid>
            )}
            <Grid item xs={12} sm={6}>
              <TextField
                label="Full Name *"
                placeholder="John Doe"
                fullWidth
                value={form.name}
                onChange={e => set('name', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Email *"
                type="email"
                placeholder="john@company.com"
                fullWidth
                value={form.email}
                onChange={e => set('email', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Mobile"
                placeholder="+91 9876543210"
                fullWidth
                value={form.mobile}
                onChange={e => set('mobile', e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Department *"
                placeholder="Engineering"
                fullWidth
                value={form.department}
                onChange={e => set('department', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Designation *"
                placeholder="Software Engineer"
                fullWidth
                value={form.designation}
                onChange={e => set('designation', e.target.value)}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                select
                label="Status"
                fullWidth
                value={form.status}
                onChange={e => set('status', e.target.value)}
              >
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
          <Button onClick={onClose} variant="outlined" color="inherit">Cancel</Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? <CircularProgress size={20} color="inherit" /> : mode === 'edit' ? 'Update' : 'Add Employee'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  )
}

function DeleteConfirm({ employee, onClose, onConfirm }) {
  const [loading, setLoading] = useState(false)
  const handleConfirm = async () => {
    setLoading(true)
    await onConfirm()
    setLoading(false)
  }
  return (
    <Dialog
      open
      onClose={onClose}
      PaperProps={{
        sx: {
          bgcolor: '#111115',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          borderRadius: 3,
          backgroundImage: 'none',
          maxWidth: 400
        }
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pt: 4, pb: 1 }}>
        <Box sx={{ fontSize: '2.5rem', mb: 1 }}>🗑️</Box>
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Delete Employee?
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ pb: 3, textAlign: 'center' }}>
        <DialogContentText sx={{ color: 'text.secondary', fontSize: '0.95rem' }}>
          Are you sure you want to delete <b>{employee.name}</b>? This will also remove all their attendance records.
        </DialogContentText>
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', p: 3, gap: 2, pt: 0 }}>
        <Button onClick={onClose} variant="outlined" color="inherit" sx={{ minWidth: 100 }}>
          Cancel
        </Button>
        <Button onClick={handleConfirm} variant="contained" color="error" disabled={loading} sx={{ minWidth: 100 }}>
          {loading ? <CircularProgress size={18} color="inherit" /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function Employees() {
  const [data, setData] = useState({ items: [], total: 0, total_pages: 1 })
  const [page, setPage] = useState(1)
  const [search, setSearch] = useState('')
  const [dept, setDept] = useState('')
  const [status, setStatus] = useState('')
  const [depts, setDepts] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null) // null | { mode, employee? }
  const [delTarget, setDelTarget] = useState(null)
  const navigate = useNavigate()

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const [empRes, deptRes] = await Promise.all([
        getEmployees({ page, page_size: 10, search: search || undefined, department: dept || undefined, status: status || undefined }),
        getDepartments(),
      ])
      setData(empRes.data)
      setDepts(deptRes.data)
    } catch (e) {
      toast.error('Failed to load employees')
    } finally {
      setLoading(false)
    }
  }, [page, search, dept, status])

  useEffect(() => { load() }, [load])

  const handleDelete = async () => {
    try {
      await deleteEmployee(delTarget.id)
      toast.success('Employee deleted')
      setDelTarget(null)
      load()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Delete failed')
    }
  }

  const handlePageChange = (event, value) => {
    setPage(value)
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, mb: 0.5 }}>
            Employees
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {data.total} total employees
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          startIcon={<AddIcon />}
          onClick={() => setModal({ mode: 'add' })}
        >
          Add Employee
        </Button>
      </Box>

      {/* Filter bar */}
      <Card sx={{ mb: 3 }}>
        <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={5}>
              <TextField
                placeholder="Search by name, ID, email..."
                fullWidth
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1) }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: 'text.secondary' }} />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <TextField
                select
                fullWidth
                value={dept}
                onChange={e => { setDept(e.target.value); setPage(1) }}
                displayEmpty
              >
                <MenuItem value="">All Departments</MenuItem>
                {depts.map(d => (
                  <MenuItem key={d} value={d}>{d}</MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={2}>
              <TextField
                select
                fullWidth
                value={status}
                onChange={e => { setStatus(e.target.value); setPage(1) }}
              >
                <MenuItem value="">All Status</MenuItem>
                <MenuItem value="Active">Active</MenuItem>
                <MenuItem value="Inactive">Inactive</MenuItem>
              </TextField>
            </Grid>
            {(search || dept || status) && (
              <Grid item xs={12} md={2}>
                <Button
                  variant="text"
                  color="inherit"
                  startIcon={<CloseIcon />}
                  onClick={() => { setSearch(''); setDept(''); setStatus(''); setPage(1) }}
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
            <Typography variant="h3" sx={{ mb: 1 }}>👥</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>No employees found</Typography>
            <Button variant="contained" size="small" onClick={() => setModal({ mode: 'add' })}>
              Add Employee
            </Button>
          </Box>
        ) : (
          <Box>
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Emp ID</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Department</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Designation</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Email</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Mobile</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.items.map(emp => (
                    <TableRow key={emp.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Chip label={emp.employee_id} size="small" sx={{ bgcolor: 'rgba(255,255,255,0.05)', color: 'text.secondary', fontWeight: 500 }} />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ width: 32, height: 32, fontSize: '0.85rem', bgcolor: 'rgba(255, 255, 255, 0.08)', color: '#ffffff' }}>
                            {emp.name.slice(0, 2).toUpperCase()}
                          </Avatar>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {emp.name}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{emp.department}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{emp.designation}</TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem' }}>{emp.email}</TableCell>
                      <TableCell sx={{ color: 'text.secondary' }}>{emp.mobile || '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={emp.status}
                          size="small"
                          color={emp.status === 'Active' ? 'success' : 'default'}
                          variant="outlined"
                          sx={{ fontWeight: 600 }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 0.5 }}>
                          <Tooltip title="View employee profile history" arrow>
                            <IconButton onClick={() => navigate(`/employees/${emp.id}`)} sx={{ color: 'text.secondary' }}>
                              <PersonIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Edit employee details" arrow>
                            <IconButton onClick={() => setModal({ mode: 'edit', employee: emp })} sx={{ color: 'text.secondary' }}>
                              <EditIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Delete employee from system" arrow>
                            <IconButton onClick={() => setDelTarget(emp)} sx={{ color: '#ff3b30' }}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Box>
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
                  Showing {((page - 1) * 10) + 1}–{Math.min(page * 10, data.total)} of {data.total}
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

      {modal && (
        <EmployeeModal
          mode={modal.mode}
          employee={modal.employee}
          onClose={() => setModal(null)}
          onSave={() => { setModal(null); load() }}
        />
      )}
      {delTarget && (
        <DeleteConfirm employee={delTarget} onClose={() => setDelTarget(null)} onConfirm={handleDelete} />
      )}
    </Box>
  )
}
