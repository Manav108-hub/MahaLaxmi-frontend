import api from '@/lib/api'
import { ApiResponse, User } from '@/lib/types'

// Simple cache for auth data
const authCache = new Map();
const CACHE_TTL = 2 * 60 * 1000; // 2 minutes for auth data

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
  }): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.post('/api/login', credentials)
      
      // Cache successful login result
      if (response.data.success) {
        setCachedAuth('currentUser', response.data);
      }
      
      return response.data
    } catch (error: any) {
      return createErrorResponse<{ user: User }>(error, 'Login failed')
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      // Check cache first
      const cached = getCachedAuth('currentUser');
      if (cached && cached.data) {
        return {
          success: true,
          data: cached.data,
          message: 'User data retrieved successfully'
        };
      }
      
      const response = await api.get('/api/me')
      const userData = response.data.data || response.data
      
      const result = {
        success: true,
        data: userData,
        message: 'User data retrieved successfully'
      };
      
      // Cache the result
      setCachedAuth('currentUser', result);
      
      return result;
    } catch (error: any) {
      if (error.response?.status === 401) {
        return { success: false, error: 'Not authenticated' }
      }
      return createErrorResponse<User>(error, 'Failed to get current user')
    }
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
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
        // If the response structure is different, try to extract the user data
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
      
      // Handle the response properly
      if (response.data.success) {
        // If the API returns the updated user data
        const updatedUser = response.data.data || response.data.user
        
        const result = {
          success: true,
          data: { user: updatedUser },
          message: response.data.message || 'Profile updated successfully'
        };
        
        // Clear cache when profile is updated
        authCache.clear();
        
        return result;
      }
      
      // If success is not explicitly true but we got a 200 response
      authCache.clear(); // Clear cache on update
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
        setTimeout(() => window.location.href = '/login', 100)
      }
    }
  }
}