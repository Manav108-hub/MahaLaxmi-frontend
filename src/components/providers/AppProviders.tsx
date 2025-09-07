'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Toaster } from 'sonner'

// Simple Auth Context
interface AuthContextType {
  user: any | null
  isAuthenticated: boolean
  setUser: (user: any | null) => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (!context) {
    return { user: null, isAuthenticated: false, setUser: () => {} }
  }
  return context
}

// Simple Cart Context
interface CartContextType {
  cartCount: number
  updateCartCount: (count: number) => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function useCartContext() {
  const context = useContext(CartContext)
  if (!context) {
    return { cartCount: 0, updateCartCount: () => {} }
  }
  return context
}

// Auth Provider
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<any | null>(null)
  const [isAuthenticated, setIsAuthenticated] = useState(false)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('auth_token')
      if (token) {
        setIsAuthenticated(true)
      }
    }
  }, [])

  useEffect(() => {
    setIsAuthenticated(!!user)
  }, [user])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// Cart Provider
function CartProvider({ children }: { children: ReactNode }) {
  const [cartCount, setCartCount] = useState(0)

  const updateCartCount = (count: number) => {
    setCartCount(count)
    if (typeof window !== 'undefined') {
      localStorage.setItem('cart_count', count.toString())
    }
  }

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedCount = localStorage.getItem('cart_count')
      if (savedCount) {
        setCartCount(parseInt(savedCount, 10) || 0)
      }
    }
  }, [])

  return (
    <CartContext.Provider value={{ cartCount, updateCartCount }}>
      {children}
    </CartContext.Provider>
  )
}

// Main App Providers
interface AppProvidersProps {
  children: ReactNode
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <Toaster 
          position="top-right"
          expand={true}
          richColors={true}
          closeButton={true}
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              fontSize: '14px',
              padding: '12px 16px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
            },
          }}
        />
      </CartProvider>
    </AuthProvider>
  )
}