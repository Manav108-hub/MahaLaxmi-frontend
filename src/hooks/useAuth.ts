'use client'

import { useState, useEffect } from 'react'
import { User, UserWithDetails } from '@/lib/types'
import { authService } from '@/services/authService'

// Helper function to transform UserWithDetails to User for compatibility
// const transformUserWithDetailsToUser = (userWithDetails: UserWithDetails): User => {
//   return {
//     id: userWithDetails.id,
//     name: userWithDetails.name,
//     username: userWithDetails.username,
//     email: userWithDetails.userDetails?.email,
//     phone: userWithDetails.userDetails?.phone,
//     address: userWithDetails.userDetails?.address,
//     city: userWithDetails.userDetails?.city,
//     state: userWithDetails.userDetails?.state,
//     pincode: userWithDetails.userDetails?.pincode,
//     role: userWithDetails.isAdmin ? 'ADMIN' : 'USER',
//     createdAt: userWithDetails.createdAt,
//     updatedAt: userWithDetails.createdAt // Assuming same as createdAt if not available
//   }
// }

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
            // Updated to handle the new API response structure: { user: User }
            if (response.user) {
              setUser(response.user)
              localStorage.setItem('user', JSON.stringify(response.user))
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
          // Updated to handle the new API response structure: { user: User }
          if (response.user) {
            setUser(response.user)
            localStorage.setItem('user', JSON.stringify(response.user))
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

  // Add a method to get UserWithDetails format for components that need it
  const getUserWithDetails = (): UserWithDetails | null => {
    if (!user) return null
    return transformUserToUserWithDetails(user)
  }

  // Add a method to update user data (useful after profile updates)
  const updateUser = (updatedUser: User) => {
    setUser(updatedUser)
    localStorage.setItem('user', JSON.stringify(updatedUser))
  }

  return {
    user,
    loading,
    login,
    logout,
    updateUser, // Export this for profile update scenarios
    isAuthenticated: !!user,
    getUserWithDetails // Export this for components that need UserWithDetails format
  }
}