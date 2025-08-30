// @/services/authService.ts
import api from '@/lib/api'
import { ApiResponse, User } from '@/lib/types'
import Cookies from 'js-cookie'

export const authService = {
  async register(userData: {
    name: string
    username: string
    email: string,
    phone: string,
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
    const response = await api.post('/api/login', credentials)
    return response.data
  },

  async refreshToken(): Promise<ApiResponse<{ user: User }>> {
    const response = await api.post('/api/refresh-token')
    return response.data
  },

  async getProfile(): Promise<{ user: User }> {
    const response = await api.get('/api/profile');
    return response.data;
  },

  async updateProfile(userData: {
    email?: string;
    phone?: string;
    address?: string;
    city?: string;
    state?: string;
    pincode?: string;
  }): Promise<ApiResponse<{ user: User }>> {
    const response = await api.post('/api/user-details', userData);
    return response.data;
  },

  logout() {
    // Remove CSRF-related code since backend doesn't use it anymore
    Cookies.remove('accessToken') // Change from 'token' to 'accessToken' to match backend
    api.post('/api/logout').finally(() => {
      window.location.href = '/login'
    })
  },

  isAuthenticated(): boolean {
    return !!Cookies.get('accessToken') // Change from 'token' to 'accessToken'
  },

  // Remove CSRF token methods since they're not used anymore
}