import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, useTheme } from '@mui/material'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function Layout({ title }) {
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default', color: 'text.primary' }}>
      <Sidebar 
        mobileOpen={mobileOpen} 
        onClose={() => setMobileOpen(false)} 
        drawerWidth={260} 
      />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
          width: { md: `calc(100% - 260px)` },
          ml: { md: `260px` },
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Topbar title={title} onMenuClick={() => setMobileOpen(true)} />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 3, sm: 4 },
            mt: '70px',
            width: '100%',
            maxWidth: 1400,
            mx: 'auto',
            overflowX: 'hidden',
          }}
        >
          <Outlet />
        </Box>
      </Box>
    </Box>
  )
}

