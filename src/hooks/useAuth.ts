'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { authService } from '@/services/authService'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUser = async () => {
      if (authService.isAuthenticated()) {
        try {
          const response = await authService.getProfile()
          if (response.success && response.data) {
            setUser(response.data)
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error)
        }
      }
      setLoading(false)
    }

    fetchUser()
  }, [])

  const login = async (credentials: { username: string; password: string }) => {
    const response = await authService.login(credentials)
    if (response.success && response.data) {
      setUser(response.data.user)
    }
    return response
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }
}