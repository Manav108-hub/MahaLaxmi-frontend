'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { useState, useMemo } from 'react'
import { Toaster } from 'sonner'

interface ProvidersProps {
  children: React.ReactNode
}

export function Providers({ children }: ProvidersProps) {
  // Memoize QueryClient creation with optimized settings
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 10 * 60 * 1000,  // Extended to 10 minutes for better caching
        gcTime: 30 * 60 * 1000,     // Extended to 30 minutes (formerly cacheTime)
        retry: (failureCount, error: any) => {
          // Don't retry on auth errors
          if (error?.message?.includes('Not authenticated') || 
              error?.response?.status === 401) {
            return false
          }
          return failureCount < 2
        },
        refetchOnWindowFocus: false,     // Disable refetch on window focus
        refetchOnMount: false,           // Use cached data on mount when available
        refetchOnReconnect: 'always',    // Only refetch on reconnect if needed
        networkMode: 'offlineFirst',     // Better offline experience
      },
      mutations: {
        retry: 1,
        networkMode: 'offlineFirst',
      },
    },
  }))

  // Memoize Toaster configuration to prevent re-renders
  const toasterConfig = useMemo(() => ({
    position: "top-right" as const,
    toastOptions: {
      duration: 3000,
      style: {
        background: '#fff',
        color: '#000',
        border: '1px solid #f3f4f6',
      },
    },
  }), [])

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster {...toasterConfig} />
      {process.env.NODE_ENV === 'development' && (
        <ReactQueryDevtools 
          initialIsOpen={false}
          position="bottom"
        />
      )}
    </QueryClientProvider>
  )
}