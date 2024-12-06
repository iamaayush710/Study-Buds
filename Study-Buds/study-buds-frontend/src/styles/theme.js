// theme.js
import { createTheme } from '@mui/material/styles';

// Pastel theme as discussed
const theme = createTheme({
  palette: {
    primary: { main: '#b6927d' },
    secondary: { main: '#83cf92' },
    background: {
      default: '#fbeee4',
      paper: '#e6f2fe'
    },
    text: {
      primary: '#333',
      secondary: '#4f4f4f'
    }
  },
  typography: {
    fontFamily: 'Arial, sans-serif'
  }
});

export default theme;
