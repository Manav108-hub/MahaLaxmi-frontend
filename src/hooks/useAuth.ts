'use client'

import { useState, useEffect, useRef } from 'react'
import { User, UserWithDetails } from '@/lib/types'
import { authService } from '@/services/authService'

// Helper function to check if we have authentication cookies
const hasAuthCookies = (): boolean => {
  if (typeof document === 'undefined') return false
  return document.cookie.includes('accessToken=')
}

// Helper function to transform User to UserWithDetails
const transformUserToUserWithDetails = (user: User): UserWithDetails => {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    isAdmin: user.role === 'ADMIN',
    createdAt: user.createdAt,
    userDetails: {
      email: user.email,
      phone: user.phone,
      address: user.address,
      city: user.city,
      state: user.state,
      pincode: user.pincode
    }
  }
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const initializationRef = useRef(false)
  const isInitializing = useRef(false)

  // Function to check and load user from localStorage
  const loadUserFromStorage = () => {
    try {
      const storedUser = localStorage.getItem('user')
      
      if (storedUser) {
        const userData = JSON.parse(storedUser)
        setUser(userData)
        return userData
      }
    } catch (error) {
      console.error('Error loading user from storage:', error)
      localStorage.removeItem('user')
    }
    return null
  }

  // Clear auth state completely
  const clearAuthState = () => {
    console.log('🧹 Clearing auth state')
    setUser(null)
    localStorage.removeItem('user')
    // Note: httpOnly cookies are cleared by backend
  }

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current || isInitializing.current) return
    initializationRef.current = true
    isInitializing.current = true

    const initializeAuth = async () => {
      console.log('🔐 Initializing auth...')
      
      try {
        // First check if we have auth cookies
        if (!hasAuthCookies()) {
          console.log('❌ No auth cookies found, user not authenticated')
          clearAuthState()
          setLoading(false)
          return
        }

        // Check localStorage first for immediate user data
        const storedUser = loadUserFromStorage()
        
        if (storedUser) {
          console.log('👤 Found stored user:', storedUser.username)
          // Set loading to false immediately to prevent UI flickering
          setLoading(false)
          
          // Verify with server in background (don't await to avoid blocking UI)
          authService.getCurrentUser()
            .then(response => {
              if (response.success && response.data) {
                console.log('✅ User verified, updating data')
                setUser(response.data)
                localStorage.setItem('user', JSON.stringify(response.data))
              } else {
                console.log('❌ Server verification failed, clearing stored data')
                clearAuthState()
              }
            })
            .catch(error => {
              console.error('❌ Server verification failed:', error)
              // Only clear if it's a real auth error, not network issues
              if (error.response?.status === 401) {
                clearAuthState()
              }
              // For network errors, keep the stored user data
            })
        } else {
          // No stored user but we have cookies, try to get from server
          console.log('🔍 No stored user but cookies exist, checking server...')
          
          try {
            const response = await authService.getCurrentUser()
            
            if (response.success && response.data) {
              console.log('✅ Got user from server:', response.data.username)
              setUser(response.data)
              localStorage.setItem('user', JSON.stringify(response.data))
            } else {
              console.log('ℹ️ Server returned no user data')
              clearAuthState()
            }
          } catch (error) {
            console.log('❌ Server request failed:', error)
            clearAuthState()
          }
        }
      } catch (error) {
        console.error('🚨 Auth initialization error:', error)
        clearAuthState()
      } finally {
        setLoading(false)
        isInitializing.current = false
        console.log('🔐 Auth initialization complete')
      }
    }

    initializeAuth()

    // Listen for storage changes (useful for multiple tabs)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'user') {
        if (e.newValue) {
          try {
            const userData = JSON.parse(e.newValue)
            setUser(userData)
          } catch (error) {
            console.error('Error parsing user data from storage:', error)
            setUser(null)
          }
        } else {
          setUser(null)
        }
      }
    }

    // Listen for cookie changes (when user logs out in another tab)
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Check if cookies still exist when user comes back to tab
        if (!hasAuthCookies() && user) {
          console.log('🔄 Cookies cleared in another tab, clearing auth state')
          clearAuthState()
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    document.addEventListener('visibilitychange', handleVisibilityChange)
    
    return () => {
      window.removeEventListener('storage', handleStorageChange)
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, []) // Empty dependency array - only run once

  const login = (userData: User) => {
    console.log('🔐 Logging in user:', userData.username)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = async () => {
    console.log('🔐 Logging out user')
    try {
      await authService.logout()
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      clearAuthState()
      // Redirect is handled by authService.logout()
    }
  }

  const updateUser = (updatedUser: User) => {
    console.log('🔐 Updating user data')
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  // Add a method to get UserWithDetails format for components that need it
  const getUserWithDetails = (): UserWithDetails | null => {
    if (!user) return null
    return transformUserToUserWithDetails(user)
  }

  return {
    user,
    loading,
    login,
    logout,
    updateUser,
    isAuthenticated: !!user && hasAuthCookies(), // Check both user state and cookies
    getUserWithDetails
  }
}