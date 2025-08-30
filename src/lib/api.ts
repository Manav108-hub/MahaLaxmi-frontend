// @/lib/api.ts
import axios from 'axios'
import Cookies from 'js-cookie'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

// Create axios instance with default config
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true // Required for cookies to be sent automatically
})

// Request interceptor - removed CSRF handling since backend doesn't use it
api.interceptors.request.use(
  (config) => {
    // The accessToken is automatically sent via httpOnly cookies
    // No need to manually add Authorization header
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Attempt to refresh token
        await api.post('/api/refresh-token')
        
        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }
    
    return Promise.reject(error)
  }
)

// Helper functions for auth flow - simplified since no manual token management needed
export const isAuthenticated = () => {
  return !!Cookies.get('accessToken')
}

export default api