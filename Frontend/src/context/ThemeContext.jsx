"use client"

import { createContext, useContext, useState, useMemo } from "react"
import { createTheme, ThemeProvider } from "@mui/material/styles"

const ThemeContext = createContext()

export const useThemeContext = () => useContext(ThemeContext)

export const ThemeContextProvider = ({ children }) => {
  const [mode, setMode] = useState("dark")

  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === "light" ? "dark" : "light"))
  }

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          primary: {
            main: "#8aa2d3",
            light: "#a6b8dd",
            dark: "#6b8ac9",
          },
          secondary: {
            main: "#9c89b8",
            light: "#b0a1c7",
            dark: "#8871a9",
          },
          background: {
            default: mode === "dark" ? "#0f172a" : "#f8f9fc",
            paper: mode === "dark" ? "#1e293b" : "#f1f5f9",
          },
          text: {
            primary: mode === "dark" ? "#f1f5f9" : "#334155",
            secondary: mode === "dark" ? "#cbd5e1" : "#64748b",
          },
        },
        typography: {
          fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
          h1: {
            fontWeight: 700,
          },
          h2: {
            fontWeight: 600,
          },
          h3: {
            fontWeight: 600,
          },
          button: {
            fontWeight: 600,
            textTransform: "none",
          },
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                padding: "10px 24px",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 4px 20px 0 rgba(61, 71, 82, 0.1), 0 0 0 5px rgba(0, 127, 255, 0.05)",
                  transform: "translateY(-2px)",
                },
                transition: "all 0.2s ease-in-out",
              },
              contained: {
                boxShadow: "0 4px 6px rgba(50, 50, 93, 0.11), 0 1px 3px rgba(0, 0, 0, 0.08)",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: mode === "dark" ? "0 4px 20px 0 rgba(0, 0, 0, 0.2)" : "0 4px 20px 0 rgba(61, 71, 82, 0.1)",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-8px)",
                  boxShadow:
                    mode === "dark" ? "0 12px 30px 0 rgba(0, 0, 0, 0.3)" : "0 12px 30px 0 rgba(61, 71, 82, 0.15)",
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                borderRadius: 16,
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 8,
                },
              },
            },
          },
        },
      }),
    [mode],
  )

  return (
    <ThemeContext.Provider value={{ theme, mode, toggleTheme }}>
      <ThemeProvider theme={theme}>{children}</ThemeProvider>
    </ThemeContext.Provider>
  )
}

