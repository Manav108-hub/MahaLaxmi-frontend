// @/services/authService.ts
import api from '@/lib/api'
import { ApiResponse, User } from '@/lib/types'

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
      console.error('Register error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Registration failed',
        message: error.response?.data?.message || 'Registration failed'
      }
    }
  },

  async login(credentials: {
    username: string
    password: string
  }): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.post('/api/login', credentials, {
        withCredentials: true
      })
      console.log('Login response:', response.data)
      return response.data
    } catch (error: any) {
      console.error('Login error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
        message: error.response?.data?.message || 'Login failed'
      }
    }
  },

  async refreshToken(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.post('/api/refresh-token', {}, {
        withCredentials: true
      })
      return response.data
    } catch (error: any) {
      console.error('Refresh token error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Token refresh failed',
        message: error.response?.data?.message || 'Token refresh failed'
      }
    }
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    try {
      const response = await api.get('/api/profile', {
        withCredentials: true
      })
      return response.data
    } catch (error: any) {
      console.error('Get profile error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get profile',
        message: error.response?.data?.message || 'Failed to get profile'
      }
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
      const response = await api.post('/api/user-details', userData, {
        withCredentials: true
      })
      return response.data
    } catch (error: any) {
      console.error('Update profile error:', error)
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to update profile',
        message: error.response?.data?.message || 'Failed to update profile'
      }
    }
  },

  async logout(): Promise<void> {
    try {
      console.log('Attempting logout...')
      await api.post('/api/logout', {}, {
        withCredentials: true
      })
      console.log('Logout successful')
    } catch (error) {
      console.error('Logout error:', error)
      // Don't throw error, just log it - we still want to clear local state
    } finally {
      // Always clear local storage and redirect
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
        // Small delay to ensure state is cleared before redirect
        setTimeout(() => {
          window.location.href = '/login'
        }, 100)
      }
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    try {
      const response = await api.get('/api/me', {
        withCredentials: true
      })
      
      // Handle both data formats (wrapped in data property or direct)
      const userData = response.data.data || response.data
      
      return {
        success: true,
        data: userData,
        message: 'User data retrieved successfully'
      }
    } catch (error: any) {
      console.error('Get current user error:', error)
      
      // Don't log 401 errors as they're expected when not authenticated
      if (error.response?.status !== 401) {
        console.error('Unexpected error getting current user:', error)
      }
      
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get current user',
        message: error.response?.data?.message || 'Failed to get current user'
      }
    }
  },

  // Check if user is authenticated by checking cookies (don't make API call)
  isAuthenticated(): boolean {
    if (typeof document === 'undefined') return false
    return document.cookie.includes('accessToken=')
  },

  // Verify authentication with server (makes API call)
  async verifyAuthentication(): Promise<boolean> {
    try {
      const response = await this.getCurrentUser()
      return response.success
    } catch {
      return false
    }
  }
}