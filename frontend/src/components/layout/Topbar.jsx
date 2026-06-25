import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Tooltip,
  Typography,
} from '@mui/material'
import {
  Menu as MenuIcon,
  ExitToApp as LogoutIcon,
} from '@mui/icons-material'
import { useAuth } from '../../context/AuthContext'

export default function Topbar({ onMenuClick }) {
  const { user, logout } = useAuth()
  const [anchorEl, setAnchorEl] = useState(null)
  const openMenu = Boolean(anchorEl)

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLogoutClick = () => {
    handleMenuClose()
    logout()
  }

  const initials = user?.username?.slice(0, 2).toUpperCase() || 'U'

  return (
    <AppBar
      position="fixed"
      sx={{
        width: { md: `calc(100% - 260px)` },
        ml: { md: `260px` },
        bgcolor: 'rgba(10, 10, 12, 0.8)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        boxShadow: 'none',
        backgroundImage: 'none',
      }}
    >
      <Toolbar sx={{ minHeight: 70, px: { xs: 3, sm: 4 } }}>
        <Box sx={{ display: 'flex', width: '100%', maxWidth: 1400, mx: 'auto', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Left Section (Mobile Menu Icon only) */}
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={onMenuClick}
              sx={{ mr: 2, display: { md: 'none' }, color: 'text.primary' }}
            >
              <MenuIcon />
            </IconButton>
          </Box>

          {/* Right Section (Account menu) */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Tooltip title="Account settings" arrow>
              <Avatar
                onClick={handleMenuOpen}
                sx={{
                  bgcolor: '#ff5a36',
                  color: '#ffffff',
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: '2px solid rgba(255, 255, 255, 0.1)',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.05)'
                  }
                }}
              >
                {initials}
              </Avatar>
            </Tooltip>
            <Menu
              anchorEl={anchorEl}
              open={openMenu}
              onClose={handleMenuClose}
              onClick={handleMenuClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
              PaperProps={{
                sx: {
                  bgcolor: '#111115',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                  boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5)',
                  minWidth: 200,
                  mt: 1.5,
                  '& .MuiMenuItem-root': {
                    px: 2,
                    py: 1.2,
                  }
                }
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#ffffff' }}>
                  {user?.username}
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary', fontSize: '0.8rem', wordBreak: 'break-all' }}>
                  {user?.email || 'No email provided'}
                </Typography>
              </Box>
              <Divider sx={{ my: 0.5 }} />
              <MenuItem onClick={handleLogoutClick} sx={{ color: '#ff3b30' }}>
                <ListItemIcon sx={{ color: '#ff3b30', minWidth: 32 }}>
                  <LogoutIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Sign out" primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
              </MenuItem>
            </Menu>
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  )
}
