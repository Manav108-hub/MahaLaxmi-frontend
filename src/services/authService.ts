import api from '@/lib/api'
import { ApiResponse, User } from '@/lib/types'
import Cookies from 'js-cookie'

export const authService = {
  async register(userData: {
    name: string
    username: string
    password: string
    adminToken?: string
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await api.post('/register', userData)
    return response.data
  },

  async login(credentials: {
    username: string
    password: string
  }): Promise<ApiResponse<{ user: User; token: string }>> {
    const response = await api.post('/login', credentials)
    if (response.data.success && response.data.data.token) {
      Cookies.set('token', response.data.data.token, { expires: 7 })
    }
    return response.data
  },

  async getProfile(): Promise<ApiResponse<User>> {
    const response = await api.get('/profile')
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
    const response = await api.post('/user-details', userData)
    return response.data
  },

  logout() {
    Cookies.remove('token')
    window.location.href = '/'
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('token')
  }
}