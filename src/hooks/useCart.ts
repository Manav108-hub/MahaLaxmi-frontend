import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { CartItem } from '@/lib/types'
import { cartService } from '@/services/cartService'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

type CartState = {
  items: CartItem[]
  loading: boolean
  error: string | null
}

const initialState: CartState = { items: [], loading: false, error: null }

export function useCart() {
  const [state, setState] = useState<CartState>(initialState)
  const { isAuthenticated, isLoading: authLoading } = useAuth()
  const mounted = useRef(true)
  const fetching = useRef(false)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const prevAuth = useRef(isAuthenticated)

  useEffect(() => () => { mounted.current = false }, [])

  const safeSetState = useCallback((updater: (prev: CartState) => CartState) => {
    if (mounted.current) setState(updater)
  }, [])

  const fetchCart = useCallback(async () => {
    if (fetching.current || !mounted.current || authLoading) return
    
    if (!isAuthenticated) {
      safeSetState(() => initialState)
      return
    }

    fetching.current = true
    safeSetState(prev => ({ ...prev, loading: true, error: null }))

    try {
      const res = await cartService.getCart()
      if (!mounted.current) return

      if (!res.success) throw new Error(res.error ?? 'Failed to fetch cart')
      
      // Handle different response formats: res.data may be an array or an object { items, ... }
      const items: CartItem[] = Array.isArray(res.data) ? res.data : res.data?.items ?? []
      safeSetState(prev => ({ ...prev, items, error: null }))
    } catch (err) {
      if (!mounted.current) return
      
      const error = err instanceof Error ? err.message : 'Failed to fetch cart'
      if (!error.includes('401')) {
        safeSetState(prev => ({ ...prev, error }))
        toast.error(error)
      }
    } finally {
      if (mounted.current) {
        safeSetState(prev => ({ ...prev, loading: false }))
      }
      fetching.current = false
    }
  }, [isAuthenticated, authLoading, safeSetState])

  // Initial load when authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchCart()
    }
  }, [authLoading, isAuthenticated, fetchCart])

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return { success: false, message: 'User not authenticated' }
    }

    try {
      const res = await cartService.addToCart(productId, quantity)
      
      if (!res.success) {
        toast.error(res.message ?? 'Failed to add item to cart')
        return res
      }

      // ✅ FIX: Immediately refresh cart after successful add
      toast.success('Item added to cart')
      await fetchCart() // This will update the UI immediately
      
      return res
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to add item to cart'
      toast.error(error)
      throw err
    }
  }, [isAuthenticated, fetchCart])

  const updateQuantity = useCallback(async (itemId: string, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to modify cart')
      return { success: false, message: 'User not authenticated' }
    }

    if (quantity < 1) {
      return { success: false, message: 'Quantity must be at least 1' }
    }

    try {
      // ✅ FIX: Optimistic update for better UX
      safeSetState(prev => ({
        ...prev,
        items: prev.items.map(item => 
          item.id === itemId ? { ...item, quantity } : item
        )
      }))

      const res = await cartService.updateCartItem(itemId, quantity)
      
      if (!res.success) {
        toast.error(res.message ?? 'Failed to update cart')
        // Revert optimistic update by refetching
        await fetchCart()
        return res
      }

      toast.success('Cart updated')
      // Refresh to ensure consistency
      await fetchCart()
      
      return res
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to update cart'
      toast.error(error)
      // Revert on error
      await fetchCart()
      throw err
    }
  }, [isAuthenticated, fetchCart, safeSetState])

  const removeItem = useCallback(async (itemId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to modify cart')
      return { success: false, message: 'User not authenticated' }
    }

    try {
      // ✅ FIX: Optimistic update
      safeSetState(prev => ({
        ...prev,
        items: prev.items.filter(item => item.id !== itemId)
      }))

      const res = await cartService.removeFromCart(itemId)
      
      if (!res.success) {
        toast.error(res.message ?? 'Failed to remove item')
        await fetchCart()
        return res
      }

      toast.success('Item removed')
      await fetchCart()
      
      return res
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to remove item'
      toast.error(error)
      await fetchCart()
      throw err
    }
  }, [isAuthenticated, fetchCart, safeSetState])

  const derived = useMemo(() => {
    const totalAmount = state.items.reduce((sum, item) => sum + (item.product?.price || 0) * item.quantity, 0)
    const totalItems = state.items.reduce((sum, item) => sum + item.quantity, 0)
    const getItemQuantity = (productId: string) => state.items.find(i => i.productId === productId)?.quantity ?? 0
    
    return { totalAmount, totalItems, getItemQuantity }
  }, [state.items])

  return {
    cartItems: state.items,
    loading: state.loading,
    error: state.error,
    isEmpty: state.items.length === 0,
    addToCart,
    updateQuantity,
    removeItem,
    fetchCart,
    forceRefresh: fetchCart,
    getTotalItems: () => derived.totalItems,
    ...derived
  } as const
}