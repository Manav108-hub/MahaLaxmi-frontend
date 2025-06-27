// @/services/authService.ts
import api from '@/lib/api'
import { ApiResponse, User } from '@/lib/types'
import Cookies from 'js-cookie'

export const authService = {
  async register(userData: {
    name: string
    username: string
    password: string
    adminToken?: string
  }): Promise<ApiResponse<{ user: User; csrfToken: string }>> {
    const response = await api.post('/api/register', userData)
    if (response.data.success) {
      const { csrfToken } = response.data.data
      Cookies.set('csrfToken', csrfToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: 7
      })
      localStorage.setItem('csrfToken', csrfToken)
    }
    return response.data
  },

  async login(credentials: {
    username: string
    password: string
  }): Promise<ApiResponse<{ user: User; csrfToken: string }>> {
    const response = await api.post('/api/login', credentials)
    if (response.data.success) {
      const { csrfToken } = response.data.data
      Cookies.set('csrfToken', csrfToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: 7
      })
      localStorage.setItem('csrfToken', csrfToken)
    }
    return response.data
  },

  async refreshToken(): Promise<ApiResponse<{ csrfToken: string }>> {
    const response = await api.post('/api/refresh-token')
    if (response.data.success) {
      const { csrfToken } = response.data.data
      Cookies.set('csrfToken', csrfToken, {
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        expires: 7
      })
      localStorage.setItem('csrfToken', csrfToken)
    }
    return response.data
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get('/api/profile')
    return response.data
  },

  async updateProfile(userData: {
    email?: string
    phone?: string
    address?: string
    city?: string
    state?: string
    pincode?: string
  }): Promise<ApiResponse<User>> {
    const response = await api.post('/api/user-details', userData)
    return response.data
  },

  logout() {
    Cookies.remove('token')
    Cookies.remove('csrfToken')
    localStorage.removeItem('csrfToken')
    api.post('/api/logout').finally(() => {
      window.location.href = '/login'
    })
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('token')
  },

  getCSRFToken(): string | null {
    return Cookies.get('csrfToken') || localStorage.getItem('csrfToken')
  }
}