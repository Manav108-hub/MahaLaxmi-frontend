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
    const response = await api.post('/api/register', userData)
    return response.data
  },

  async login(credentials: {
    username: string
    password: string
  }): Promise<ApiResponse<{ user: User }>> {
    const response = await api.post('/api/login', credentials, {
      withCredentials: true // Important: This ensures cookies are sent/received
    })
    return response.data
  },

  async refreshToken(): Promise<ApiResponse<{ user: User }>> {
    const response = await api.post('/api/refresh-token', {}, {
      withCredentials: true
    })
    return response.data
  },

  async getProfile(): Promise<ApiResponse<{ user: User }>> {
    const response = await api.get('/api/profile', {
      withCredentials: true
    })
    return response.data
  },

  async updateProfile(userData: {
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
  }): Promise<ApiResponse<{ user: User }>> {
    const response = await api.post('/api/user-details', userData, {
      withCredentials: true
    })
    return response.data
  },

  async logout(): Promise<void> {
    try {
      await api.post('/api/logout', {}, {
        withCredentials: true
      })
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always redirect to login after logout attempt
      window.location.href = '/login'
    }
  },

  async getCurrentUser(): Promise<ApiResponse<User>> {
    const response = await api.get('/api/me', { // Fixed: Changed from '/api/auth/me' to '/api/me'
      withCredentials: true
    })
    return response.data
  },

  // Check if user is authenticated by trying to get current user
  async isAuthenticated(): Promise<boolean> {
    try {
      await this.getCurrentUser()
      return true
    } catch {
      return false
    }
  }
}