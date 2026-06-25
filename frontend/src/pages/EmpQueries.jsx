import { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Tooltip,
  Chip,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Divider
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import DeleteIcon from '@mui/icons-material/Delete'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'
import RefreshIcon from '@mui/icons-material/Refresh'
import toast from 'react-hot-toast'
import { getEmployeeQueries, resolveEmployeeQuery, deleteEmployeeQuery } from '../api/services'

export default function EmpQueries() {
  const [queries, setQueries] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [tabVal, setTabVal] = useState(0) // 0 = All, 1 = Pending, 2 = Resolved

  const fetchQueries = async () => {
    setLoading(true)
    setError('')
    try {
      const data = await getEmployeeQueries()
      setQueries(data)
    } catch (err) {
      console.error(err)
      setError('Failed to fetch employee queries.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchQueries()
  }, [])

  const handleResolve = async (id) => {
    try {
      await resolveEmployeeQuery(id)
      toast.success('Query marked as resolved')
      fetchQueries()
    } catch (err) {
      toast.error('Failed to resolve query')
    }
  }

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this query request?')) return
    try {
      await deleteEmployeeQuery(id)
      toast.success('Query request deleted')
      fetchQueries()
    } catch (err) {
      toast.error('Failed to delete query')
    }
  }

  // Filter queries based on selected tab
  const filteredQueries = queries.filter(q => {
    if (tabVal === 1) return q.status === 'pending'
    if (tabVal === 2) return q.status === 'resolved'
    return true
  })

  return (
    <Box sx={{ p: { xs: 2, md: 4 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 800, color: 'text.primary', display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <QuestionAnswerIcon sx={{ color: '#ff5a36', fontSize: 32 }} />
            Employee Queries
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Manage employee password help and login support requests.
          </Typography>
        </Box>
        <IconButton 
          onClick={fetchQueries} 
          disabled={loading}
          sx={{ 
            bgcolor: 'background.paper', 
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
            '&:hover': {
              bgcolor: 'action.hover'
            }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 2 }}>
          <Tabs 
            value={tabVal} 
            onChange={(e, newVal) => setTabVal(newVal)}
            textColor="primary"
            indicatorColor="primary"
            sx={{
              '& .MuiTab-root': {
                color: 'text.secondary',
                textTransform: 'none',
                fontWeight: 600,
                fontSize: '0.95rem',
                minHeight: 48,
                '&.Mui-selected': {
                  color: '#ff5a36'
                }
              },
              '& .MuiTabs-indicator': {
                bgcolor: '#ff5a36'
              }
            }}
          >
            <Tab label={`All (${queries.length})`} />
            <Tab label={`Pending (${queries.filter(q => q.status === 'pending').length})`} />
            <Tab label={`Resolved (${queries.filter(q => q.status === 'resolved').length})`} />
          </Tabs>
        </Box>
      </Card>

      {/* Content */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress color="primary" />
        </Box>
      ) : error ? (
        <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>
      ) : filteredQueries.length === 0 ? (
        <Card sx={{ textAlign: 'center', py: 8 }}>
          <CardContent>
            <QuestionAnswerIcon sx={{ fontSize: 48, color: 'text.secondary', opacity: 0.5, mb: 2 }} />
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
              No queries found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              There are no help queries in this category.
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <TableContainer component={Paper} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Table>
            <TableHead sx={{ bgcolor: 'rgba(255, 255, 255, 0.02)' }}>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Employee Username</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Email Address</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Contact Number</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date Submitted</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }} align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredQueries.map((query) => (
                <TableRow 
                  key={query.id}
                  sx={{ 
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.01)' },
                    transition: 'background-color 0.2s'
                  }}
                >
                  <TableCell sx={{ fontWeight: 500, color: 'text.primary' }}>
                    {query.username}
                  </TableCell>
                  <TableCell>{query.email}</TableCell>
                  <TableCell>{query.phone}</TableCell>
                  <TableCell>
                    {new Date(query.created_at).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={query.status}
                      size="small"
                      sx={{
                        fontWeight: 600,
                        textTransform: 'capitalize',
                        bgcolor: query.status === 'pending' ? 'rgba(255, 152, 0, 0.12)' : 'rgba(38, 166, 154, 0.12)',
                        color: query.status === 'pending' ? '#ff9800' : '#26a69a',
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                      {query.status === 'pending' && (
                        <Tooltip title="Mark as Resolved">
                          <IconButton 
                            color="success" 
                            size="small" 
                            onClick={() => handleResolve(query.id)}
                            sx={{
                              bgcolor: 'rgba(76, 175, 80, 0.08)',
                              '&:hover': { bgcolor: 'rgba(76, 175, 80, 0.18)' }
                            }}
                          >
                            <CheckCircleIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Delete Request">
                        <IconButton 
                          color="error" 
                          size="small" 
                          onClick={() => handleDelete(query.id)}
                          sx={{
                            bgcolor: 'rgba(244, 67, 54, 0.08)',
                            '&:hover': { bgcolor: 'rgba(244, 67, 54, 0.18)' }
                          }}
                        >
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
      )}
    </Box>
  )
}
