import React, { useMemo, useState, useEffect } from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import App from './App.jsx'
import getTheme from './theme.js'
import { ColorModeContext } from './context/ThemeContext.jsx'
import './index.css'

const defaultMode = localStorage.getItem('color-mode') || 'dark'

function Root() {
  const [mode, setMode] = useState(defaultMode)

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', mode)
  }, [mode])

  const colorMode = useMemo(
    () => ({
      toggleColorMode: () => {
        setMode((prevMode) => {
          const nextMode = prevMode === 'light' ? 'dark' : 'light'
          localStorage.setItem('color-mode', nextMode)
          return nextMode
        })
      },
    }),
    [],
  )

  const theme = useMemo(() => getTheme(mode), [mode])

  return (
    <ColorModeContext.Provider value={colorMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <App />
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: theme.palette.mode === 'light' ? '#f8fafc' : '#111827',
                color: theme.palette.text.primary,
                border: `1px solid ${theme.palette.divider}`,
                borderRadius: '12px',
                fontSize: '14px',
              },
              success: { iconTheme: { primary: '#22c55e', secondary: theme.palette.background.default } },
              error: { iconTheme: { primary: '#ef4444', secondary: theme.palette.background.default } },
            }}
          />
        </BrowserRouter>
      </ThemeProvider>
    </ColorModeContext.Provider>
  )
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>,
)
