import { useState, useEffect, useCallback } from 'react'
import { getPendingRequests, approveRequest, rejectRequest } from '../api/services'
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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  CircularProgress
} from '@mui/material'
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  Close as CloseIcon
} from '@mui/icons-material'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

function ApprovalModal({ request, onClose, onSuccess }) {
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  const handleApprove = async () => {
    setLoading(true)
    try {
      await approveRequest(request.id, notes)
      toast.success('Request approved!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to approve')
    } finally {
      setLoading(false)
    }
  }

  const handleReject = async () => {
    setLoading(true)
    try {
      await rejectRequest(request.id, notes)
      toast.success('Request rejected!')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to reject')
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
          Review Request
        </Typography>
        <IconButton onClick={onClose} sx={{ color: 'text.secondary' }}>
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ borderColor: 'rgba(255, 255, 255, 0.08)', py: 3 }}>
        <Grid container spacing={2.5}>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
              Employee
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
              {request.employee_name} ({request.employee_code})
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600 }}>
              Date
            </Typography>
            <Typography variant="body2" sx={{ fontWeight: 600, mt: 0.5 }}>
              {format(new Date(request.attendance_date), 'MMM dd, yyyy')}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', fontWeight: 600, display: 'block', mb: 0.8 }}>
              Request Reason
            </Typography>
            <Box sx={{
              p: 2,
              bgcolor: 'rgba(255, 255, 255, 0.03)',
              borderRadius: 2,
              border: '1px solid rgba(255, 255, 255, 0.06)',
              minHeight: 60,
              fontSize: '0.9rem',
              color: 'text.secondary'
            }}>
              {request.reason}
            </Box>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Admin Notes (Optional)"
              placeholder="Add any notes..."
              fullWidth
              multiline
              rows={2}
              value={notes}
              onChange={e => setNotes(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions sx={{ p: 2.5, gap: 1.5 }}>
        <Button onClick={onClose} variant="outlined" color="inherit">
          Close
        </Button>
        <Button
          variant="contained"
          color="error"
          startIcon={<CancelIcon />}
          onClick={handleReject}
          disabled={loading}
        >
          Reject
        </Button>
        <Button
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={handleApprove}
          disabled={loading}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default function AttendanceRequests() {
  const [requests, setRequests] = useState({ items: [], total: 0 })
  const [loading, setLoading] = useState(true)
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [page, setPage] = useState(1)

  const loadRequests = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getPendingRequests({ page, page_size: 15 })
      setRequests(res.data)
    } catch (err) {
      toast.error('Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [page])

  useEffect(() => { loadRequests() }, [loadRequests])

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress color="primary" />
      </Box>
    )
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

  return (
    <Box>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" sx={{ fontWeight: 800 }}>
          Attendance Regularization Requests
        </Typography>
      </Box>

      {/* Stats */}
      <Grid container spacing={2.5} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={4}>
          <Card sx={{ borderLeft: '4px solid #FFA500', py: 2 }}>
            <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2.5 }}>
              <Box>
                <Typography variant="h4" sx={{ fontWeight: 800, color: '#FFA500', mb: 0.5 }}>
                  {requests.total}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                  Pending Requests
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Table */}
      <Card>
        {requests.items.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h3" sx={{ mb: 1 }}>✅</Typography>
            <Typography variant="body2" color="text.secondary">No pending requests!</Typography>
          </Box>
        ) : (
          <Box>
            <TableContainer component={Paper} sx={{ bgcolor: 'transparent', backgroundImage: 'none', border: 'none', boxShadow: 'none' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'rgba(255,255,255,0.02)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Employee</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Type</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Requested Status</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reason</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Requested At</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 600 }}>Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {requests.items.map(req => (
                    <TableRow key={req.id} hover sx={{ '&:last-child td, &:last-child th': { border: 0 } }}>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {req.employee_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {req.employee_code}
                        </Typography>
                      </TableCell>
                      <TableCell>{format(new Date(req.attendance_date), 'MMM dd, yyyy')}</TableCell>
                      <TableCell sx={{ textTransform: 'capitalize', fontSize: '0.85rem' }}>{req.request_type}</TableCell>
                      <TableCell>
                        <Chip {...getChipProps(req.requested_status)} />
                      </TableCell>
                      <TableCell sx={{ color: 'text.secondary', fontSize: '0.85rem', maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={req.reason}>
                        {req.reason || '—'}
                      </TableCell>
                      <TableCell sx={{ fontSize: '0.85rem' }}>{format(new Date(req.requested_at), 'MMM dd')}</TableCell>
                      <TableCell align="right">
                        <Button
                          variant="contained"
                          color="primary"
                          size="small"
                          onClick={() => setSelectedRequest(req)}
                        >
                          Review
                        </Button>
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
                    disabled={page === 1}
                    onClick={() => setPage(p => p - 1)}
                  >
                    Previous
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={page === requests.total_pages}
                    onClick={() => setPage(p => p + 1)}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Card>

      {selectedRequest && (
        <ApprovalModal request={selectedRequest} onClose={() => setSelectedRequest(null)} onSuccess={loadRequests} />
      )}
    </Box>
  )
}
