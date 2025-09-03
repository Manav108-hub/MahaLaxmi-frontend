import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { authService } from '@/services/authService'
import { User } from '@/lib/types'

export const authKeys = {
  all: ['auth'] as const,
  user: () => [...authKeys.all, 'user'] as const,
  profile: () => [...authKeys.all, 'profile'] as const,
}

export function useCurrentUser() {
  return useQuery({
    queryKey: authKeys.user(),
    queryFn: async () => {
      const response = await authService.getCurrentUser()
      if (response.success) {
        return response.data
      }
      throw new Error(response.error || 'Failed to get user')
    },
    retry: (failureCount, error: any) => {
      // Don't retry on auth errors
      if (error?.message?.includes('Not authenticated') || 
          error?.response?.status === 401) {
        return false
      }
      return failureCount < 2
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
  })
}

export function useProfile() {
  return useQuery({
    queryKey: authKeys.profile(),
    queryFn: async () => {
      const response = await authService.getProfile()
      if (response.success) {
        return response.data?.user
      }
      throw new Error(response.error || 'Failed to get profile')
    },
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  })
}

export function useLogin() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.login,
    onSuccess: (data) => {
      if (data.success) {
        // Update user cache with new data
        queryClient.setQueryData(authKeys.user(), data.data?.user)
        queryClient.invalidateQueries({ queryKey: authKeys.profile() })
      }
    },
    onError: (error) => {
      // Clear any stale auth data on login error
      queryClient.removeQueries({ queryKey: authKeys.user() })
    },
  })
}

export function useRegister() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      if (data.success) {
        queryClient.setQueryData(authKeys.user(), data.data?.user)
      }
    },
  })
}

export function useUpdateProfile() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: (data) => {
      if (data.success) {
        // Update both user and profile caches
        queryClient.setQueryData(authKeys.user(), data.data?.user)
        queryClient.setQueryData(authKeys.profile(), data.data?.user)
        queryClient.invalidateQueries({ queryKey: authKeys.all })
      }
    },
  })
}

export function useLogout() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: authService.logout,
    onSuccess: () => {
      // Clear all cached data on logout
      queryClient.clear()
    },
    onSettled: () => {
      // Always clear auth data, even on error
      queryClient.removeQueries({ queryKey: authKeys.all })
    },
  })
}

// Add this export to your existing useAuth.ts file
export function useAuth() {
  const currentUser = useCurrentUser()
  const loginMutation = useLogin()
  const logoutMutation = useLogout()
  const queryClient = useQueryClient()

  return {
    user: currentUser.data,
    isLoading: currentUser.isLoading,
    isAuthenticated: !!currentUser.data,
    login: loginMutation.mutateAsync,
    logout: async () => {
      await logoutMutation.mutateAsync()
      if (typeof window !== 'undefined') {
        localStorage.removeItem('user')
      }
    },
    isLoggingIn: loginMutation.isPending,
    isLoggingOut: logoutMutation.isPending,
  }
}