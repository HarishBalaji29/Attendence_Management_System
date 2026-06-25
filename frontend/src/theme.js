import { createTheme } from '@mui/material/styles'

const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          primary: {
            main: '#ff5a36',
            light: '#ff8164',
            dark: '#e04422',
            contrastText: '#ffffff',
          },
          background: {
            default: '#f5f7fb',
            paper: '#ffffff',
          },
          text: {
            primary: '#111827',
            secondary: '#6b7280',
          },
          divider: 'rgba(15, 23, 42, 0.12)',
        }
      : {
          primary: {
            main: '#ff5a36',
            light: '#ff7657',
            dark: '#e04422',
            contrastText: '#ffffff',
          },
          background: {
            default: '#0a0a0c',
            paper: '#111115',
          },
          text: {
            primary: '#ffffff',
            secondary: '#a1a1aa',
          },
          divider: 'rgba(255, 255, 255, 0.08)',
        }),
  },
  typography: {
    fontFamily: 'Inter, sans-serif',
    h1: { fontWeight: 800 },
    h2: { fontWeight: 700 },
    h3: { fontWeight: 700 },
    h4: { fontWeight: 600 },
    h5: { fontWeight: 600 },
    h6: { fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: (theme) => ({
        body: {
          backgroundColor: theme.palette.background.default,
          color: theme.palette.text.primary,
          fontFamily: 'Inter, sans-serif',
          transition: 'background-color 0.3s ease, color 0.3s ease',
        },
        '::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '::-webkit-scrollbar-track': {
          background: theme.palette.mode === 'light' ? '#f3f4f6' : '#0a0a0c',
        },
        '::-webkit-scrollbar-thumb': {
          background: theme.palette.mode === 'light' ? '#cbd5e1' : '#23232a',
          borderRadius: 4,
        },
        '::-webkit-scrollbar-thumb:hover': {
          background: theme.palette.primary.main,
        },
      }),
    },
    MuiCard: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light' ? '#ffffff' : 'rgba(25, 25, 30, 0.45)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          border: `1px solid ${theme.palette.divider}`,
          backgroundImage: 'none',
          boxShadow: theme.palette.mode === 'light' ? '0 8px 32px rgba(15, 23, 42, 0.08)' : '0 8px 32px rgba(0, 0, 0, 0.35)',
        }),
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
        },
        containedPrimary: ({ theme }) => ({
          background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
          boxShadow: theme.palette.mode === 'light' ? '0 10px 20px rgba(255, 90, 54, 0.2)' : '0 4px 14px 0 rgba(255, 90, 54, 0.35)',
          '&:hover': {
            background: `linear-gradient(135deg, ${theme.palette.primary.light} 0%, ${theme.palette.primary.main} 100%)`,
          },
        }),
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: ({ theme }) => ({
          backgroundColor: theme.palette.mode === 'light' ? '#f8fafc' : 'rgba(255, 255, 255, 0.03)',
          '&:hover .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
          '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
            borderColor: theme.palette.primary.main,
          },
        }),
        notchedOutline: ({ theme }) => ({
          borderColor: theme.palette.divider,
        }),
      },
    },
    MuiListItemButton: {
      styleOverrides: {
        root: ({ theme }) => ({
          '&.Mui-selected': {
            backgroundColor: theme.palette.mode === 'light' ? 'rgba(255, 90, 54, 0.12)' : 'rgba(255, 90, 54, 0.12)',
          },
        }),
      },
    },
  },
})

export default function getTheme(mode) {
  return createTheme(getDesignTokens(mode))
}
