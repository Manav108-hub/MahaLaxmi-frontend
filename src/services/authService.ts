// @/services/authService.ts
import api from '@/lib/api'
import { ApiResponse, User, UserWithDetails } from '@/lib/types'
import Cookies from 'js-cookie'

type ProfileData = {
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
};

export const authService = {
  async register(userData: {
    name: string
    username: string
    email: string,
    phone: string,
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

  // In your authService.ts
  // In your authService.ts
async getProfile(): Promise<{
  data: any; user: User 
}> {
  const response = await api.get('/api/profile');
  return response.data;
},

  // Update the updateProfile method
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