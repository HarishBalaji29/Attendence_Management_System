import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  IconButton,
  InputAdornment,
  Alert,
  CircularProgress,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import FingerprintIcon from '@mui/icons-material/Fingerprint'
import HelpIcon from '@mui/icons-material/Help'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import toast from 'react-hot-toast'
import { createEmployeeQuery } from '../api/services'

export default function Login() {
  const [form, setForm] = useState({ username: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  // Contact Admin Form States
  const [openContactModal, setOpenContactModal] = useState(false)
  const [contactForm, setContactForm] = useState({ username: '', email: '', phone: '' })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleContactSubmit = async (e) => {
    e.preventDefault()
    try {
      await createEmployeeQuery(contactForm)
      setIsSubmitted(true)
    } catch (err) {
      const msg = err.response?.data?.detail || 'Failed to submit request'
      toast.error(msg)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const user = await login(form.username, form.password)
      toast.success(`Welcome back, ${user.username}!`)
      navigate('/dashboard')
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid username or password'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: 'background.default',
      position: 'relative',
      overflow: 'hidden',
      p: 2
    }}>
      {/* Decorative blobs */}
      <Box sx={{
        position: 'absolute', top: '15%', left: '10%',
        width: 400, height: 400,
        background: 'radial-gradient(circle, rgba(255, 90, 54, 0.08) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />
      <Box sx={{
        position: 'absolute', bottom: '10%', right: '8%',
        width: 300, height: 300,
        background: 'radial-gradient(circle, rgba(255, 59, 48, 0.06) 0%, transparent 70%)',
        borderRadius: '50%', pointerEvents: 'none'
      }} />

      <Card sx={{
        maxWidth: 420,
        width: '100%',
        zIndex: 1,
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.4)'
      }}>
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          {/* Logo */}
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1.5, mb: 4 }}>
            <Box sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 42,
              height: 42,
              borderRadius: 1.5,
              background: 'linear-gradient(135deg, #ff5a36 0%, #ff3b30 100%)',
              color: '#ffffff',
              boxShadow: '0 4px 12px rgba(255, 90, 54, 0.3)'
            }}>
              <FingerprintIcon fontSize="medium" />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.5px' }}>
              Attend<Box component="span" sx={{ color: '#ff5a36' }}>X</Box>
            </Typography>
          </Box>

          <Typography variant="h5" align="center" sx={{ fontWeight: 700, mb: 1 }}>
            Welcome back
          </Typography>
          <Typography variant="body2" align="center" color="text.secondary" sx={{ mb: 4 }}>
            Sign in to your account to continue
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              id="username"
              label="Username"
              variant="outlined"
              placeholder="Enter your username"
              value={form.username}
              onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
              required
              fullWidth
              autoFocus
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              id="password"
              label="Password"
              variant="outlined"
              type={showPass ? 'text' : 'password'}
              placeholder="Enter your password"
              value={form.password}
              onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
              required
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPass(v => !v)}
                      edge="end"
                      sx={{ color: 'text.secondary' }}
                    >
                      {showPass ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                )
              }}
            />

            <Button
              id="login-btn"
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              disabled={loading}
              sx={{ mt: 1, py: 1.5, fontSize: '0.95rem' }}
            >
              {loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <CircularProgress size={18} color="inherit" />
                  Signing in...
                </Box>
              ) : 'Sign In'}
            </Button>

            <Box sx={{ mt: 2, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5, flexWrap: 'wrap' }}>
                <Typography variant="body2" color="text.secondary">
                  Forgot Password?
                </Typography>
                <Button
                  variant="text"
                  size="small"
                  onClick={() => {
                    setContactForm({ username: '', email: '', phone: '' })
                    setIsSubmitted(false)
                    setOpenContactModal(true)
                  }}
                  sx={{
                    color: '#ff5a36',
                    textTransform: 'none',
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    p: 0,
                    minWidth: 'auto',
                    '&:hover': {
                      textDecoration: 'underline',
                      background: 'none'
                    }
                  }}
                >
                  Contact administrator
                </Button>
                <Tooltip title="Request password reset help from admin">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setContactForm({ username: '', email: '', phone: '' })
                      setIsSubmitted(false)
                      setOpenContactModal(true)
                    }}
                    sx={{ color: 'text.secondary', p: 0.2 }}
                  >
                    <HelpIcon sx={{ fontSize: 16 }} />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Contact Admin Dialog */}
      <Dialog
        open={openContactModal}
        onClose={() => setOpenContactModal(false)}
        PaperProps={{
          sx: {
            bgcolor: '#121214',
            backgroundImage: 'none',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: 3,
            p: 2,
            maxWidth: 400,
            width: '100%'
          }
        }}
      >
        <DialogTitle sx={{ fontWeight: 700, pb: 1, color: '#ffffff', display: 'flex', alignItems: 'center', gap: 1 }}>
          <HelpIcon sx={{ color: '#ff5a36' }} />
          Contact Administrator
        </DialogTitle>
        <DialogContent>
          {!isSubmitted ? (
            <Box component="form" onSubmit={handleContactSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Please provide your details below. The administrator will contact you to reset your password.
              </Typography>
              <TextField
                label="Username"
                variant="outlined"
                placeholder="Enter your username"
                value={contactForm.username}
                onChange={e => setContactForm(f => ({ ...f, username: e.target.value }))}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Email Address"
                variant="outlined"
                type="email"
                placeholder="Enter your email"
                value={contactForm.email}
                onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                required
                fullWidth
                size="small"
              />
              <TextField
                label="Contact Number"
                variant="outlined"
                placeholder="Enter your contact number"
                value={contactForm.phone}
                onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                required
                fullWidth
                size="small"
              />
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 1, py: 1 }}
              >
                Submit Request
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', py: 3, gap: 1.5 }}>
              <Box sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 50,
                height: 50,
                borderRadius: '50%',
                bgcolor: 'rgba(38, 166, 154, 0.1)',
                color: '#26a69a'
              }}>
                <CheckCircleIcon fontSize="large" />
              </Box>
              <Typography variant="h6" sx={{ fontWeight: 600, color: '#ffffff' }}>
                Request Submitted
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Admin will contact you soon.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 1 }}>
          <Button onClick={() => setOpenContactModal(false)} sx={{ color: 'text.secondary' }}>
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}
