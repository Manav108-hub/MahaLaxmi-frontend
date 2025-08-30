'use client'

import { useState, useEffect, useRef } from 'react'
import { User, UserWithDetails } from '@/lib/types'
import { authService } from '@/services/authService'

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

  // Function to check and load user from localStorage (remove token dependency)
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
      // Clean up corrupted data
      localStorage.removeItem('user')
    }
    return null
  }

  useEffect(() => {
    // Prevent multiple initializations
    if (initializationRef.current) return
    initializationRef.current = true

    const initializeAuth = async () => {
      console.log('🔐 Initializing auth...')
      
      // First check localStorage for immediate user data
      const storedUser = loadUserFromStorage()
      
      if (storedUser) {
        console.log('👤 Found stored user:', storedUser.username)
        setLoading(false)
        
        // Verify with server in background
        try {
          console.log('🔍 Verifying stored user with server...')
          const response = await authService.getCurrentUser()
          
          if (response.success && response.user) {
            console.log('✅ User verified, updating data')
            setUser(response.user)
            localStorage.setItem('user', JSON.stringify(response.user))
          }
        } catch (error) {
          console.error('❌ Server verification failed:', error)
          // If server verification fails, clear stored data
          localStorage.removeItem('user')
          setUser(null)
        }
      } else {
        // No stored user, try to get from server
        try {
          console.log('🔍 No stored user, checking server...')
          const response = await authService.getCurrentUser()
          
          if (response.success && response.user) {
            console.log('✅ Got user from server:', response.user.username)
            setUser(response.user)
            localStorage.setItem('user', JSON.stringify(response.user))
          } else {
            console.log('ℹ️ No authenticated user found')
          }
        } catch (error) {
          console.log('ℹ️ Not authenticated or server error')
          // This is expected when not logged in
        }
      }
      
      setLoading(false)
      console.log('🔐 Auth initialization complete')
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
          }
        } else {
          setUser(null)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, []) // Empty dependency array - only run once

  const login = (userData: User) => {
    console.log('🔐 Logging in user:', userData.username)
    setUser(userData)
    localStorage.setItem('user', JSON.stringify(userData))
  }

  const logout = () => {
    console.log('🔐 Logging out user')
    authService.logout()
    setUser(null)
    localStorage.removeItem('user')
    // Note: Don't remove 'token' as we use httpOnly cookies
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
    isAuthenticated: !!user,
    getUserWithDetails
  }
}