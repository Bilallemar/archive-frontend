import { createTheme } from "@mui/material/styles";

export const createAppTheme = (mode = "light", direction = "rtl") => {
  console.log("Creating theme with direction:", direction);

  return createTheme({
    direction: direction,
    palette: {
      mode,
      primary: {
        main: mode === "dark" ? "#90caf9" : "#1976d2",
      },
      secondary: {
        main: mode === "dark" ? "#f48fb1" : "#dc004e",
      },
      background: {
        default: mode === "dark" ? "#121212" : "#fafafa",
        paper: mode === "dark" ? "#1e1e1e" : "#ffffff",
      },
      text: {
        primary: mode === "dark" ? "#ffffff" : "#000000",
        secondary: mode === "dark" ? "#b0b0b0" : "#666666",
      },
    },
    typography: {
      fontFamily:
        direction === "rtl"
          ? '"Vazirmatn", "Tahoma", "Arial", sans-serif'
          : '"Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontSize: "2.5rem", fontWeight: 700 },
      h2: { fontSize: "2rem", fontWeight: 600 },
      h3: { fontSize: "1.75rem", fontWeight: 600 },
      h4: { fontSize: "1.5rem", fontWeight: 600 },
      h5: { fontSize: "1.25rem", fontWeight: 600 },
      h6: { fontSize: "1rem", fontWeight: 600 },
      body1: { fontSize: "1rem", fontWeight: 400 },
      body2: { fontSize: "0.875rem", fontWeight: 400 },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            direction: direction,
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            direction: direction,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            direction: direction,
          },
        },
      },
      MuiButton: {
        styleOverrides: {
          root: {
            textTransform: "none",
            borderRadius: 8,
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 12,
          },
        },
      },
    },
  });
};
