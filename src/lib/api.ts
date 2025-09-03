// @/lib/api.ts
import axios from 'axios'

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

// Helper function to check if we have authentication cookies
const hasAuthCookies = (): boolean => {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('accessToken=')
}

// Helper function to clear all auth-related data
const clearAuthData = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('user')
  }
}

// Helper function to redirect to login
const redirectToLogin = () => {
  if (typeof window !== 'undefined' && window.location.pathname !== '/login') {
    console.log('🔄 Redirecting to login page')
    window.location.href = '/login'
  }
}

// Routes that should not trigger auth redirects
const PUBLIC_ROUTES = [
  '/api/login',
  '/api/register',
  '/api/refresh-token',
  '/api/products',
  '/api/categories',
  '/api/product/',
  '/api/products/slug/'
]

// Check if route is public
const isPublicRoute = (url: string): boolean => {
  return PUBLIC_ROUTES.some(route => url.startsWith(route))
}

// Request interceptor - no changes needed since cookies are automatic
api.interceptors.request.use(
  (config) => {
    // Log the request for debugging
    console.log(`📡 API Request: ${config.method?.toUpperCase()} ${config.url}`)
    return config
  },
  (error) => {
    console.error('📡 Request Error:', error)
    return Promise.reject(error)
  }
)

// Response interceptor with improved error handling
api.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const requestUrl = originalRequest?.url || ''
    
    console.log(`❌ API Error: ${originalRequest?.method?.toUpperCase()} ${requestUrl} - ${error.response?.status}`)

    // Handle network errors
    if (!error.response) {
      console.error('🌐 Network error:', error.message)
      return Promise.reject(error)
    }

    // Handle 401 Unauthorized errors
    if (error.response?.status === 401 && !originalRequest._retry) {
      
      // Don't handle auth for public routes
      if (isPublicRoute(requestUrl)) {
        console.log('🔓 Public route 401, not handling auth')
        return Promise.reject(error)
      }

      // If we're already on the login page, don't redirect
      if (typeof window !== 'undefined' && window.location.pathname === '/login') {
        console.log('🔓 Already on login page, not redirecting')
        return Promise.reject(error)
      }

      // Check if we have access token cookie
      if (!hasAuthCookies()) {
        console.log('🔓 No auth cookies found, clearing data and redirecting')
        clearAuthData()
        redirectToLogin()
        return Promise.reject(error)
      }

      // If we're already refreshing, queue this request
      if (isRefreshing) {
        console.log('🔄 Already refreshing, queuing request')
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

      console.log('🔄 Attempting token refresh...')

      try {
        // Attempt to refresh token
        const response = await api.post('/api/refresh-token')
        
        if (response.data?.success) {
          console.log('✅ Token refresh successful')
          processQueue(null)
          // Retry original request
          return api(originalRequest)
        } else {
          throw new Error('Token refresh failed')
        }
      } catch (refreshError) {
        console.error('❌ Token refresh failed:', refreshError)
        
        // Clear queue and auth data
        processQueue(refreshError)
        clearAuthData()
        
        // Only redirect if we're not already on login page
        redirectToLogin()
        
        return Promise.reject(refreshError)
      } finally {
        isRefreshing = false
      }
    }
    
    // Handle other errors normally
    return Promise.reject(error)
  }
)

// Helper function to check if user has a valid session
export const hasValidSession = (): boolean => {
  return hasAuthCookies()
}

// Helper function to clear auth state
export const clearAuthState = () => {
  clearAuthData()
}

export default api