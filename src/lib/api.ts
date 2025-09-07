import axios, { AxiosError } from 'axios'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
const PUBLIC_ROUTES = ['/api/login', '/api/register', '/api/refresh-token', '/api/products', '/api/categories']

// Simple cache for GET requests only
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

const getCacheKey = (url: string, params: any) => {
  return `${url}_${JSON.stringify(params || {})}`;
};

const isPublicRoute = (url: string) => PUBLIC_ROUTES.some(route => url.startsWith(route))
const isLoginPage = () => typeof window !== 'undefined' && window.location.pathname === '/login'
const redirectToLogin = () => !isLoginPage() && (window.location.href = '/login')

let refreshPromise: Promise<any> | null = null

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true
})

// Add simple request caching for GET requests
api.interceptors.request.use(
  async (config) => {
    // Only cache GET requests for products and categories
    if (config.method === 'get' && 
        (config.url?.includes('/products') || config.url?.includes('/categories'))) {
      
      const cacheKey = getCacheKey(config.url, config.params);
      const cached = cache.get(cacheKey);
      
      if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
        // Return cached data by throwing a special error that we'll catch
        throw { 
          cached: true, 
          data: cached.data,
          config
        };
      }
    }
    return config;
  }
);

api.interceptors.response.use(
  response => {
    // Cache successful GET responses for products and categories
    if (response.config.method === 'get' && 
        (response.config.url?.includes('/products') || response.config.url?.includes('/categories'))) {
      
      const cacheKey = getCacheKey(response.config.url, response.config.params);
      cache.set(cacheKey, {
        data: response,
        timestamp: Date.now()
      });
    }
    return response;
  },
  async (error: any) => {
    // Handle cached responses
    if (error.cached) {
      return Promise.resolve(error.data);
    }

    // Existing auth logic - UNCHANGED
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