import { useState, useEffect, useCallback, useRef } from 'react'
import { authService } from '@/services/authService'
import { User } from '@/lib/types'

// Simple cache for auth data
const authCache = new Map<string, { data: unknown; timestamp: number }>()
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

const getCachedData = (key: string) => {
  const cached = authCache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  return null
}

const setCachedData = (key: string, data: unknown) => {
  authCache.set(key, { data, timestamp: Date.now() })
}

const clearCache = () => {
  authCache.clear()
}

// Auth state management
interface AuthState {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
}

const initialState: AuthState = {
  user: null,
  isLoading: false,
  isAuthenticated: false
}

export function useCurrentUser() {
  const [state, setState] = useState(initialState)
  const mounted = useRef(true)

  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])

  const fetchUser = useCallback(async () => {
    if (!mounted.current) return

    // Check cache first
    const cached = getCachedData('currentUser')
    if (cached) {
      setState({
        user: cached as User,
        isLoading: false,
        isAuthenticated: !!cached
      })
      return
    }

    setState(prev => ({ ...prev, isLoading: true }))

    try {
      const response = await authService.getCurrentUser()
      if (response.success && response.data && mounted.current) {
        setCachedData('currentUser', response.data)
        setState({
          user: response.data,
          isLoading: false,
          isAuthenticated: true
        })
      } else if (mounted.current) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    } catch {
      if (mounted.current) {
        setState({
          user: null,
          isLoading: false,
          isAuthenticated: false
        })
      }
    }
  }, [])

  useEffect(() => {
    fetchUser()
  }, [fetchUser])

  return {
    data: state.user,
    isLoading: state.isLoading,
    isAuthenticated: state.isAuthenticated,
    refetch: fetchUser,
    isStale: false
  }
}

export function useProfile() {
  const [state, setState] = useState<{
    data: User | null
    isLoading: boolean
    error: string | null
  }>({
    data: null,
    isLoading: false,
    error: null
  })
  const mounted = useRef(true)

  useEffect(() => {
    return () => {
      mounted.current = false
    }
  }, [])

  const fetchProfile = useCallback(async () => {
    if (!mounted.current) return

    // Check cache first
    const cached = getCachedData('profile')
    if (cached) {
      setState({
        data: cached as User,
        isLoading: false,
        error: null
      })
      return
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }))

    try {
      const response = await authService.getProfile()
      if (response.success && response.data && mounted.current) {
        const userData = response.data.user || response.data
        setCachedData('profile', userData)
        setState({
          data: userData,
          isLoading: false,
          error: null
        })
      } else if (mounted.current) {
        setState({
          data: null,
          isLoading: false,
          error: response.error || 'Failed to get profile'
        })
      }
    } catch (error: unknown) {
      if (mounted.current) {
        setState({
          data: null,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to get profile'
        })
      }
    }
  }, [])

  useEffect(() => {
    fetchProfile()
  }, [fetchProfile])

  return {
    data: state.data,
    isLoading: state.isLoading,
    error: state.error
  }
}

export function useLogin() {
  const [state, setState] = useState({
    isPending: false,
    isError: false,
    error: null as string | null
  })

  const mutateAsync = useCallback(async (credentials: { username: string; password: string }) => {
    setState({ isPending: true, isError: false, error: null })

    try {
      const response = await authService.login(credentials)
      if (response.success && response.data) {
        // Update cache
        setCachedData('currentUser', response.data)
        setCachedData('profile', response.data)
        setState({ isPending: false, isError: false, error: null })
        return response
      } else {
        throw new Error(response.message || 'Login failed')
      }
    } catch (error: unknown) {
      clearCache()
      const errorMessage = error instanceof Error ? error.message : 'Login failed'
      setState({ 
        isPending: false, 
        isError: true, 
        error: errorMessage 
      })
      throw error
    }
  }, [])

  return {
    mutateAsync,
    isPending: state.isPending,
    isError: state.isError,
    error: state.error
  }
}

export function useUpdateProfile() {
  const [state, setState] = useState({
    isPending: false,
    isError: false,
    error: null as string | null
  })

  const mutateAsync = useCallback(async (userData: Record<string, unknown>) => {
    setState({ isPending: true, isError: false, error: null })

    try {
      const response = await authService.updateProfile(userData)
      if (response.success) {
        // Clear cache to force refresh
        clearCache()
        setState({ isPending: false, isError: false, error: null })
        return response
      } else {
        throw new Error(response.message || 'Update failed')
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Update failed'
      setState({ 
        isPending: false, 
        isError: true, 
        error: errorMessage 
      })
      throw error
    }
  }, [])

  return {
    mutateAsync,
    isPending: state.isPending,
    isError: state.isError,
    error: state.error
  }
}

export function useAuth() {
  const currentUser = useCurrentUser()
  const loginMutation = useLogin()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const logout = useCallback(async () => {
    setIsLoggingOut(true)
    try {
      await authService.logout()
      clearCache()
      // Force a page reload to clear all state after logout
      window.location.href = '/login'
    } catch (error: unknown) {
      console.error('Logout error:', error)
    } finally {
      setIsLoggingOut(false)
    }
  }, [])

  return {
    user: currentUser.data,
    isLoading: currentUser.isLoading,
    isAuthenticated: currentUser.isAuthenticated,
    login: loginMutation.mutateAsync,
    logout,
    isLoggingIn: loginMutation.isPending,
    isLoggingOut,
    refetchUser: currentUser.refetch,
    isUserStale: currentUser.isStale,
  }
}