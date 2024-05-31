// src/theme.js
import { createTheme } from "@mui/material/styles";

const theme = createTheme({
  palette: {
    primary: {
      // Bright green for action buttons and primary elements (support/help)
      main: "#28A745",
      dark: "#1B6B23",
    },
    secondary: {
      // Warm red for alerts and secondary actions
      main: "#C62828",
    },
    warning: {
      // Yellow for highlighting warning states
      main: "#FFB300",
    },
    background: {
      // Neutral light gray for a pleasant contrast
      default: "#F4F6F8",
      paper: "#FFFFFF",
      dark: "#F5F5F5",
    },
    text: {
      // Strong black for primary text
      primary: "#1A1A1A",
      // Subtle dark gray for secondary text
      secondary: "#4A4A4A",
    },
  },
  typography: {
    fontFamily: "'Roboto', 'Helvetica', 'Arial', sans-serif",
    h1: {
      fontWeight: 700,
      fontSize: "2.5rem",
    },
    h2: {
      fontWeight: 600,
      fontSize: "2rem",
    },
    h3: {
      fontWeight: 500,
      fontSize: "1.75rem",
    },
    body1: {
      fontSize: "1rem",
      lineHeight: "1.5",
    },
    button: {
      textTransform: "uppercase",
      fontWeight: 700,
    },
  },
  spacing: 8, // Base spacing for consistent padding and margin
  shape: {
    borderRadius: 8, // Smooth rounded corners
  },
});

export default theme;
