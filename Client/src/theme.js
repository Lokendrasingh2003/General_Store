import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: {
      main: '#1d4ed8'
    },
    secondary: {
      main: '#0f172a'
    },
    background: {
      default: '#f5f7fb'
    }
  },
  shape: {
    borderRadius: 10
  },
  typography: {
    fontFamily: '"Poppins", "Segoe UI", sans-serif'
  }
});

export default theme;
