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

// Request interceptor to add auth token and CSRF protection
api.interceptors.request.use(
  (config) => {
    // Get token from cookies
    const token = Cookies.get('token')
    
    // Get CSRF token from cookies or memory
    const csrfToken = Cookies.get('csrfToken') || localStorage.getItem('csrfToken')

    // Add Authorization header if token exists
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // Add CSRF token for state-changing requests
    if (csrfToken && ['post', 'put', 'patch', 'delete'].includes(config.method?.toLowerCase() || '')) {
      config.headers['X-CSRF-Token'] = csrfToken
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling and token refresh
api.interceptors.response.use(
  (response) => {
    // Store CSRF token if received in response
    if (response.data?.csrfToken) {
      Cookies.set('csrfToken', response.data.csrfToken, { 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax'
      })
      localStorage.setItem('csrfToken', response.data.csrfToken)
    }
    return response
  },
  async (error) => {
    const originalRequest = error.config
    
    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true
      
      try {
        // Attempt to refresh token
        const response = await axios.post(`${API_BASE_URL}/refresh-token`, {}, {
          withCredentials: true
        })
        
        const { csrfToken } = response.data
        
        // Store new CSRF token
        if (csrfToken) {
          Cookies.set('csrfToken', csrfToken, {
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax'
          })
          localStorage.setItem('csrfToken', csrfToken)
        }
        
        // Retry original request
        return api(originalRequest)
      } catch (refreshError) {
        // If refresh fails, clear tokens and redirect to login
        Cookies.remove('token')
        Cookies.remove('csrfToken')
        localStorage.removeItem('csrfToken')
        
        if (typeof window !== 'undefined') {
          window.location.href = '/login'
        }
        return Promise.reject(refreshError)
      }
    }
    
    // Handle other errors
    if (error.response?.status === 403) {
      // CSRF token mismatch - try to get a new one
      if (typeof window !== 'undefined') {
        window.location.reload()
      }
    }
    
    return Promise.reject(error)
  }
)

// Helper functions for auth flow
export const setAuthTokens = (token: string, csrfToken: string) => {
  Cookies.set('token', token, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  Cookies.set('csrfToken', csrfToken, {
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax'
  })
  localStorage.setItem('csrfToken', csrfToken)
}

export const clearAuthTokens = () => {
  Cookies.remove('token')
  Cookies.remove('csrfToken')
  localStorage.removeItem('csrfToken')
}

export const isAuthenticated = () => {
  return !!Cookies.get('token')
}

export default api