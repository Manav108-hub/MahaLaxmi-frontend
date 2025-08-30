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

// Track if we're currently refreshing to prevent multiple refresh attempts
let isRefreshing = false
let failedQueue: Array<{ resolve: Function; reject: Function }> = []

const processQueue = (error: any, token = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error)
    } else {
      resolve(token)
    }
  })
  
  failedQueue = []
}

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
      
      // Don't try to refresh token for login, register, or refresh-token endpoints
      const skipRefreshRoutes = ['/api/login', '/api/register', '/api/refresh-token']
      if (skipRefreshRoutes.includes(originalRequest.url)) {
        return Promise.reject(error)
      }

      // Check if we have an access token cookie - if not, user is logged out
      const hasAccessToken = document.cookie.includes('accessToken=')
      if (!hasAccessToken) {
        // No token means user is logged out, redirect to login
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }

      if (isRefreshing) {
        // If we're already refreshing, queue this request
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject })
        }).then(() => {
          return api(originalRequest)
        }).catch((err) => {
          return Promise.reject(err)
        })
      }

      originalRequest._retry = true
      isRefreshing = true

      try {
        // Attempt to refresh token
        const response = await api.post('/api/refresh-token')
        
        if (response.data?.success) {
          processQueue(null)
          // Retry original request
          return api(originalRequest)
        } else {
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        // If refresh fails, clear queue and redirect to login
        processQueue(refreshError)
        
        if (typeof window !== 'undefined') {
          // Clear any auth-related data
          localStorage.removeItem('user')
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    return Promise.reject(error)
  }
)

// Helper function to check if user has a valid session
export const hasValidSession = () => {
  return document.cookie.includes('accessToken=')
}

// Helper function to clear auth state
export const clearAuthState = () => {
  localStorage.removeItem('user')
  // Note: We can't clear httpOnly cookies from JavaScript
  // The backend will clear them on logout
}

export default api