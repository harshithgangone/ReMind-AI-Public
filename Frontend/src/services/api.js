import axios from "axios"

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"
console.log("API URL:", API_URL)

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("authToken")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error("API Error:", error.message)

    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login
      localStorage.removeItem("authToken")
      localStorage.removeItem("user")
      localStorage.removeItem("uid")
      window.location.href = "/"
    }
    return Promise.reject(error)
  },
)

// Auth services
export const authService = {
  verifyUser: async () => {
    return api.get("/auth/verify")
  },
  updateOnboarding: async (data) => {
    return api.post("/auth/onboarding", data)
  },
  logout: async () => {
    return api.post("/auth/logout")
  },
}

// User services
export const userService = {
  getProfile: async () => {
    return api.get("/users/profile")
  },
  updatePreferences: async (preferences) => {
    return api.put("/users/preferences", { preferences })
  },
}

export default api

