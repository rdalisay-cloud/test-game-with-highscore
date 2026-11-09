import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  typography: {
    fontFamily: '"Cabin", "Helvetica Neue", Arial, sans-serif',
    h3: { fontWeight: 600, fontSize: '1.75rem', lineHeight: 1.25 },
    h4: { fontWeight: 600, fontSize: '1.25rem', lineHeight: 1.3 },
    body1: { fontSize: '1rem', lineHeight: 1.5 },
    body2: { fontSize: '0.875rem', lineHeight: 1.45 },
    caption: { fontSize: '0.8125rem', fontWeight: 600, letterSpacing: '0.01em' },
  },
  palette: {
    primary: {
      main: '#0A6E7A',
      dark: '#085660',
      light: '#0D9AA8',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#F2F4F5',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#1A1A1A',
      secondary: '#6B6B6B',
    },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 6,
          boxShadow: 'none',
          '&:hover': { boxShadow: 'none' },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { fontWeight: 600, borderRadius: 4 },
      },
    },
  },
})
