import { createTheme } from '@mui/material/styles';

// A custom theme for this app
const theme = createTheme({
  palette: {
    primary: {
      main: '#1C49D0',
    },
    success: {
      main: '#17a948',
    },
    error: {
      main: '#c12126',
    },
  },
});

export default theme;