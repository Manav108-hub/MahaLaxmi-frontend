'use client'

import { useState, useEffect } from 'react'
import { User } from '@/lib/types'
import { authService } from '@/services/authService'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  // Function to check and load user from localStorage
  const loadUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('user')
      const token = localStorage.getItem('token')
      
      if (storedUser && token) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        return userData
      }
    } catch (error) {
      console.error('Error loading user from storage:', error)
    }
    return null
  }

  useEffect(() => {
    const fetchUser = async () => {
      // First check localStorage for immediate user data
      const storedUser = loadUserFromStorage()
      
      if (storedUser) {
        setLoading(false)
        // Optionally verify with server
        if (authService.isAuthenticated()) {
          try {
            const response = await authService.getProfile()
            if (response.success && response.data) {
              setUser(response.data)
            }
          } catch (error) {
            console.error('Failed to fetch user profile:', error)
            // If server verification fails, clear stored data
            localStorage.removeItem('user')
            localStorage.removeItem('token')
            setUser(null)
          }
        }
      } else if (authService.isAuthenticated()) {
        // If no stored user but token exists, fetch from server
        try {
          const response = await authService.getProfile()
          if (response.success && response.data) {
            setUser(response.data)
            localStorage.setItem('user', JSON.stringify(response.data))
          }
        } catch (error) {
          console.error('Failed to fetch user profile:', error)
        }
      }
      
      setLoading(false)
    }

    fetchUser()

    // Listen for storage changes (useful for multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user' || e.key === 'token') {
        if (e.newValue) {
          loadUserFromStorage()
        } else {
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  const login = async (credentials: { username: string; password: string }) => {
    const response = await authService.login(credentials)
    if (response.success && response.data) {
      setUser(response.data.user)
      // Ensure user data is stored in localStorage
      localStorage.setItem('user', JSON.stringify(response.data.user))
    }
    return response
  }

  const logout = () => {
    authService.logout()
    setUser(null)
    // Clear localStorage
    localStorage.removeItem('user')
    localStorage.removeItem('token')
  }

  return {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  }
}