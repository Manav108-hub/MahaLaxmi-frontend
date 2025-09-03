'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { User, UserWithDetails } from '@/lib/types'
import { authService } from '@/services/authService'
import { useLocalStorage } from './useLocalStorage'

const transformUser = (user: User): UserWithDetails => ({
  ...user,
  isAdmin: user.role === 'ADMIN',
  userDetails: {
    email: user.email,
    phone: user.phone,
    address: user.address,
    city: user.city,
    state: user.state,
    pincode: user.pincode
  }
})

export function useAuth() {
  const [user, setUser, isStorageLoaded] = useLocalStorage<User | null>('user', null)
  const [loading, setLoading] = useState(true)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const initialized = useRef(false)

  const clearAuth = useCallback(() => {
    setUser(null)
    setIsAuthenticated(false)
  }, [setUser])

  const updateAuth = useCallback((userData: User) => {
    setUser(userData)
    setIsAuthenticated(true)
  }, [setUser])

  useEffect(() => {
    if (!isStorageLoaded || initialized.current) return
    initialized.current = true

    const initAuth = async () => {
      try {
        const response = await authService.getCurrentUser()
        
        if (response.success && response.data) {
          updateAuth(response.data)
        } else if (user) {
          setIsAuthenticated(true)
          
          authService.getCurrentUser()
            .then(res => res.success && res.data ? updateAuth(res.data) : clearAuth())
            .catch(() => clearAuth())
        } else {
          clearAuth()
        }
      } catch {
        clearAuth()
      } finally {
        setLoading(false)
      }
    }

    initAuth()
  }, [isStorageLoaded, user, updateAuth, clearAuth])

  const logout = useCallback(async () => {
    try {
      await authService.logout()
    } finally {
      clearAuth()
    }
  }, [clearAuth])

  return {
    user,
    loading,
    login: updateAuth,
    logout,
    updateUser: updateAuth,
    isAuthenticated,
    getUserWithDetails: () => user ? transformUser(user) : null
  } as const
}