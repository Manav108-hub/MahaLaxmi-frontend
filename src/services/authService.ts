import api from '@/lib/api'
import { ApiResponse, User } from '@/lib/types'

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
      return response.data
    } catch (error: any) {
      return createErrorResponse<{ user: User }>(error, 'Login failed')
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get('/api/me')
      const userData = response.data.data || response.data
      
      return {
        success: true,
        data: userData,
        message: 'User data retrieved successfully'
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        return { success: false, error: 'Not authenticated' }
      }
      return createErrorResponse<User>(error, 'Failed to get current user')
    }
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.get('/api/profile')
      // Handle different response structures
      if (response.data.success && response.data.data) {
        return {
          success: true,
          data: response.data.data,
          message: 'Profile retrieved successfully'
        }
      }
      
      // If the response structure is different, try to extract the user data
      const userData = response.data.user || response.data.data || response.data
      
      return {
        success: true,
        data: { user: userData },
        message: 'Profile retrieved successfully'
      }
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
        
        return {
          success: true,
          data: { user: updatedUser },
          message: response.data.message || 'Profile updated successfully'
        }
      }
      
      // If success is not explicitly true but we got a 200 response
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
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        setTimeout(() => window.location.href = '/login', 100)
      }
    }
  }
}