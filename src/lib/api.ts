import axios, { AxiosError } from 'axios'
import { apiRateLimiter } from './validation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const PUBLIC_ROUTES = ['/api/login', '/api/register', '/api/refresh-token', '/api/products', '/api/categories']

const isPublicRoute = (url: string) => PUBLIC_ROUTES.some(route => url.startsWith(route))
const isLoginPage = () => typeof window !== 'undefined' && window.location.pathname === '/login'
const redirectToLogin = () => !isLoginPage() && (window.location.href = '/login')

let refreshPromise: Promise<any> | null = null

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
  timeout: 10000, // 10 second timeout
})

// Request interceptor for rate limiting and security
api.interceptors.request.use(
  (config) => {
    // Rate limiting check
    const clientId = typeof window !== 'undefined' ? 
      (localStorage.getItem('clientId') || 'anonymous') : 'server'
    
    if (!apiRateLimiter.isAllowed(clientId)) {
      return Promise.reject(new Error('Too many requests. Please slow down.'))
    }

    // Add security headers
    config.headers['X-Requested-With'] = 'XMLHttpRequest'
    
    return config
  },
  (error) => Promise.reject(error)
)

api.interceptors.response.use(
  response => response,
  async (error: AxiosError) => {
    const { config: originalRequest, response } = error
    const url = originalRequest?.url || ''

    if (response?.status !== 401 || isPublicRoute(url) || (originalRequest as any)?._retry || isLoginPage()) {
      return Promise.reject(error)
    }

    (originalRequest as any)._retry = true

    try {
      if (!refreshPromise) {
        refreshPromise = api.post('/api/refresh-token').finally(() => {
          refreshPromise = null
        })
      }

      const refreshResponse = await refreshPromise

      if (refreshResponse.data?.success) {
        return api(originalRequest!)
      }
      
      throw new Error('Token refresh failed')
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        redirectToLogin()
      }
      return Promise.reject(error)
    }
  }
)

export default api