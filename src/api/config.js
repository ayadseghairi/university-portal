import axios from "axios"
import { removeAuthTokens } from "../utils/auth"

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api"

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // Important for cookie-based auth
  timeout: 10000, // 10 second timeout
})

// Request interceptor to add auth token and CSRF token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add CSRF token if available
    const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute("content")
    if (csrfToken) {
      config.headers["X-CSRF-TOKEN"] = csrfToken
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response interceptor to handle errors
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config

    // Handle 401 errors (unauthorized)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true

      try {
        // Try to refresh token
        await apiClient.post("/auth/refresh")
        // Retry original request
        return apiClient(originalRequest)
      } catch (refreshError) {
        // Refresh failed, redirect to login
        removeAuthTokens()
        window.location.href = "/login"
        return Promise.reject(refreshError)
      }
    }

    // Handle 403 errors (forbidden)
    if (error.response?.status === 403) {
      // Show permission denied message
      console.error("Permission denied:", error.response.data.error)
    }

    // Handle 429 errors (rate limit)
    if (error.response?.status === 429) {
      console.error("Rate limit exceeded:", error.response.data.error)
    }

    return Promise.reject(error)
  },
)

export default apiClient
