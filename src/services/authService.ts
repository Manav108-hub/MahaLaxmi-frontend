import api from '@/lib/api'
import { ApiResponse, User } from '@/lib/types'

// Simple cache for auth data
const authCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for auth data

const getCachedAuth = (key: string) => {
  const cached = authCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  return null;
};

const setCachedAuth = (key: string, data: any) => {
  authCache.set(key, { data, timestamp: Date.now() });
};

const createErrorResponse = <T = unknown>(error: any, fallbackMessage: string): ApiResponse<T> => ({
  success: false,
  error: error.response?.data?.message || fallbackMessage,
  message: error.response?.data?.message || fallbackMessage
})

export const authService = {
  async register(userData: {
    name: string
    username: string
    email: string
    phone: string
    password: string
    adminToken?: string
  }): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.post('/api/register', userData)
      return response.data
    } catch (error: any) {
      return createErrorResponse<{ user: User }>(error, 'Registration failed')
    }
  },

  async login(credentials: {
    username: string
    password: string
  }): Promise<ApiResponse<{
    token: any; user: User 
}>> {
    try {
      const response = await api.post('/api/login', credentials)
      
      console.log('Login API Response:', response.data)
      
      // Handle different response structures
      let userData;
      if (response.data.success) {
        userData = response.data.data?.user || response.data.data || response.data.user
      } else {
        userData = response.data.user || response.data.data
      }
      
      if (userData) {
        // Store in localStorage immediately
        if (typeof window !== 'undefined') {
          localStorage.setItem('user', JSON.stringify(userData))
          localStorage.setItem('isAuthenticated', 'true')
        }
        
        // Cache it
        setCachedAuth('currentUser', userData);
      }
      
      return {
        success: response.data.success !== false,
        data: { user: userData },
        message: response.data.message || 'Login successful'
      }
    } catch (error: any) {
      console.error('Login API Error:', error)
      return createErrorResponse<{ user: User }>(error, 'Login failed')
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      // Check localStorage first for immediate response
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user')
        const isAuthenticated = localStorage.getItem('isAuthenticated')
        
        if (storedUser && isAuthenticated === 'true') {
          try {
            const user = JSON.parse(storedUser)
            return {
              success: true,
              data: user,
              message: 'User data retrieved from storage'
            }
          } catch (e) {
            localStorage.removeItem('user')
            localStorage.removeItem('isAuthenticated')
          }
        }
      }
      
      // Check cache
      const cached = getCachedAuth('currentUser');
      if (cached) {
        return {
          success: true,
          data: cached,
          message: 'User data retrieved from cache'
        };
      }
      
      // Only fetch from API if we think user should be authenticated
      if (typeof window !== 'undefined' && !localStorage.getItem('isAuthenticated')) {
        return { success: false, error: 'Not authenticated' }
      }
      
      // Fetch from API
      const response = await api.get('/api/me')
      const userData = response.data.data || response.data
      
      // Store in localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('user', JSON.stringify(userData))
        localStorage.setItem('isAuthenticated', 'true')
      }
      
      // Cache the result
      setCachedAuth('currentUser', userData);
      
      return {
        success: true,
        data: userData,
        message: 'User data retrieved successfully'
      };
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Clear storage on unauthorized
        if (typeof window !== 'undefined') {
          localStorage.removeItem('user')
          localStorage.removeItem('isAuthenticated')
        }
        return { success: false, error: 'Not authenticated' }
      }
      
      // For other errors, if we have cached user, return it
      if (typeof window !== 'undefined') {
        const storedUser = localStorage.getItem('user')
        if (storedUser) {
          try {
            return {
              success: true,
              data: JSON.parse(storedUser),
              message: 'Using cached user data'
            }
          } catch (e) {
            // ignore
          }
        }
      }
      
      return createErrorResponse<User>(error, 'Failed to get current user')
    }
  },

  async getProfile(): Promise<ApiResponse<{
    token: string | null; user: User 
}>> {
    try {
      // Check cache first
      const cached = getCachedAuth('profile');
      if (cached) return cached;
      
      const response = await api.get('/api/profile')
      let result;
      
      // Handle different response structures
      if (response.data.success && response.data.data) {
        result = {
          success: true,
          data: response.data.data,
          message: 'Profile retrieved successfully'
        };
      } else {
        const userData = response.data.user || response.data.data || response.data
        
        result = {
          success: true,
          data: { user: userData },
          message: 'Profile retrieved successfully'
        };
      }
      
      // Cache the result
      setCachedAuth('profile', result);
      
      return result;
    } catch (error: any) {
      return createErrorResponse<{ user: User }>(error, 'Failed to get profile')
    }
  },

  async updateProfile(userData: {
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
  }): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.post('/api/user-details', userData)
      
      if (response.data.success) {
        const updatedUser = response.data.data || response.data.user
        
        const result = {
          success: true,
          data: { user: updatedUser },
          message: response.data.message || 'Profile updated successfully'
        };
        
        // Update localStorage
        if (typeof window !== 'undefined' && updatedUser) {
          localStorage.setItem('user', JSON.stringify(updatedUser))
        }
        
        // Clear cache when profile is updated
        authCache.clear();
        
        return result;
      }
      
      authCache.clear();
      return response.data
    } catch (error: any) {
      return createErrorResponse<{ user: User }>(error, 'Failed to update profile')
    }
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/logout')
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Clear all auth cache on logout
      authCache.clear();
      
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        localStorage.removeItem('isAuthenticated')
        setTimeout(() => window.location.href = '/login', 100)
      }
    }
  }
}