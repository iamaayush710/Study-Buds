import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: { main: '#6c63ff' }, 
    secondary: { main: '#83cf92' }, 
    background: {
      default: '#f0f5ff', 
      paper: '#ffffff', 
    },
    text: {
      primary: '#333',
      secondary: '#555', 
    },
    action: {
      hover: '#d1e3ff', 
    },
    error: { main: '#e57373' }, 
    warning: { main: '#ffb74d' }, 
    success: { main: '#81c784' }, 
  },
  typography: {
    fontFamily: 'Roboto, Arial, sans-serif', 
    h4: {
      fontWeight: 700,
      fontSize: '2rem',
      color: '#333', 
    },
    body2: {
      fontWeight: 400,
      fontSize: '0.9rem',
      color: '#555', 
    },
  },
  shape: {
    borderRadius: 15, 
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          backgroundColor: '#6c63ff', 
          color: '#ffffff', 
          textTransform: 'none', 
          fontWeight: 600,
          borderRadius: 12,
          '&:hover': {
            backgroundColor: '#5a54d1', 
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          padding: '20px', 
          borderRadius: 15, 
          boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', 
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          borderRadius: 0,
          boxShadow: '0 2px 5px rbga(0,0,0,0.1)',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
        },
      },
    },
  },
});

export default theme;