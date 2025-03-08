import React from "react"
import ReactDOM from "react-dom/client"
import { SnackbarProvider } from "notistack"
import App from "./App.jsx"
import { ThemeContextProvider } from "./context/ThemeContext"
import { AuthProvider } from "./context/AuthContext"
import "./index.css"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ThemeContextProvider>
      <AuthProvider>
        <SnackbarProvider maxSnack={3} autoHideDuration={2000}>
          <App />
        </SnackbarProvider>
      </AuthProvider>
    </ThemeContextProvider>
  </React.StrictMode>,
)

