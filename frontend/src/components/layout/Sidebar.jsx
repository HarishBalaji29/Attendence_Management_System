import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
  Box,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
  Button,
  Chip,
  useTheme
} from '@mui/material'
import {
  Dashboard as DashboardIcon,
  People as PeopleIcon,
  AccessTime as AccessTimeIcon,
  BarChart as BarChartIcon,
  ExitToApp as LogoutIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminPanelSettingsIcon,
  Fingerprint as FingerprintIcon
} from '@mui/icons-material'
import QuestionAnswerIcon from '@mui/icons-material/QuestionAnswer'

const adminNav = [
  { to: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
  { to: '/employees', icon: <PeopleIcon />, label: 'Employees' },
  { to: '/attendance', icon: <AccessTimeIcon />, label: 'Attendance' },
  { to: '/attendance-requests', icon: <FingerprintIcon />, label: 'Regularization' },
  { to: '/summary', icon: <BarChartIcon />, label: 'Reports' },
  { to: '/users', icon: <AdminPanelSettingsIcon />, label: 'User Management' },
  // { to: '/queries', icon: <QuestionAnswerIcon />, label: 'EMP Queries' },
]

const employeeNav = [
  { to: '/dashboard', icon: <DashboardIcon />, label: 'Dashboard' },
  { to: '/my-profile', icon: <PersonIcon />, label: 'My Profile' },
  { to: '/my-attendance', icon: <AccessTimeIcon />, label: 'My Attendance' },
]

export default function Sidebar({ mobileOpen, onClose, drawerWidth = 260 }) {
  const { user, logout, isAdmin } = useAuth()
  const navigate = useNavigate()
  const theme = useTheme()

  const navItems = isAdmin ? adminNav : employeeNav

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  const drawerContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', bgcolor: theme.palette.mode === 'light' ? '#ffffff' : '#111115', borderRight: '1px solid', borderRightColor: 'divider' }}>
      {/* Logo */}
      <Box sx={{ p: 3, display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 1.5,
          bgcolor: 'rgba(255, 90, 54, 0.1)',
          color: '#ff5a36'
        }}>
          <FingerprintIcon />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: 'text.primary', letterSpacing: '0.5px' }}>
          Attend<Box component="span" sx={{ color: '#ff5a36' }}>X</Box>
        </Typography>
      </Box>

      {/* Nav Link Section */}
      <Box sx={{ flexGrow: 1, px: 2, py: 1 }}>
        <Typography variant="caption" sx={{ px: 2, color: 'text.secondary', fontWeight: 600, textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '1px', display: 'block', mb: 1 }}>
          Menu
        </Typography>
        <List sx={{ p: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}>
          {navItems.map((item) => (
            <ListItem key={item.to} disablePadding>
              <ListItemButton
                component={NavLink}
                to={item.to}
                onClick={onClose}
                sx={{
                  borderRadius: 2,
                  px: 2,
                  py: 1.2,
                  color: 'text.secondary',
                  '&.active': {
                    bgcolor: 'rgba(255, 90, 54, 0.12)',
                    color: '#ff5a36',
                    '& .MuiListItemIcon-root': {
                      color: '#ff5a36'
                    }
                  },
                  '&:hover:not(.active)': {
                    bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.04)',
                    color: 'text.primary',
                    '& .MuiListItemIcon-root': {
                      color: 'text.primary'
                    }
                  }
                }}
              >
                <ListItemIcon sx={{ minWidth: 40, color: 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: 500 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{
          p: 2,
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.02)' : 'rgba(25, 25, 30, 0.45)',
          border: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
            Logged in as
          </Typography>
          <Typography variant="body2" sx={{ fontWeight: 600, color: 'text.primary', mb: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {user?.username}
          </Typography>
          <Chip
            label={user?.role}
            size="small"
            sx={{
              bgcolor: user?.role === 'admin' ? 'rgba(255, 90, 54, 0.15)' : theme.palette.mode === 'light' ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)',
              color: user?.role === 'admin' ? '#ff5a36' : 'text.secondary',
              fontWeight: 600,
              textTransform: 'capitalize',
              height: 20,
              fontSize: '0.75rem'
            }}
          />
        </Box>
        <Button
          variant="text"
          startIcon={<LogoutIcon />}
          onClick={handleLogout}
          sx={{
            justifyContent: 'flex-start',
            px: 2,
            py: 1.2,
            color: '#ff3b30',
            borderRadius: 2,
            '&:hover': {
              bgcolor: 'rgba(255, 59, 48, 0.1)',
            }
          }}
        >
          Logout
        </Button>
      </Box>
    </Box>
  )

  return (
    <Box component="nav">
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={onClose}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderRightColor: 'divider' },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth, borderRight: '1px solid', borderRightColor: 'divider' },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  )
}

