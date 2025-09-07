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
      
      const items = Array.isArray(res.data) ? res.data : res.data?.items ?? []
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

  // Fixed: Added fetchCart to dependency array and improved initial load logic
  useEffect(() => {
    const authChanged = prevAuth.current !== isAuthenticated
    prevAuth.current = isAuthenticated

    if (!authLoading) {
      if (authChanged || (isAuthenticated && state.items.length === 0)) {
        fetchCart()
      }
    }
  }, [isAuthenticated, authLoading, fetchCart, state.items.length])

  // Fixed: Force initial cart fetch when component mounts and user is authenticated
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchCart()
    }
  }, [authLoading, isAuthenticated, fetchCart])

  const createCartAction = useCallback(
    <T extends any[]>(
      action: (...args: T) => Promise<any>,
      successMsg: string,
      errorMsg: string,
      optimisticUpdate?: (prev: CartState, ...args: T) => CartState
    ) => async (...args: T) => {
      if (!isAuthenticated) {
        toast.error('Please login to modify cart')
        return { success: false, message: 'User not authenticated' }
      }

      try {
        if (optimisticUpdate) safeSetState(prev => optimisticUpdate(prev, ...args))
        
        const res = await action(...args)
        
        if (!res.success) {
          toast.error(res.message ?? errorMsg)
          // Always refresh after failed optimistic update
          await fetchCart()
          return res
        }

        // Update local state immediately and fetch in background
        if (optimisticUpdate) {
          safeSetState(prev => optimisticUpdate(prev, ...args))
        }
        toast.success(successMsg)
        fetchCart()
        return res
      } catch (err) {
        const error = err instanceof Error ? err.message : errorMsg
        if (!error.includes('401')) {
          toast.error(errorMsg)
          safeSetState(prev => ({ ...prev, error: errorMsg }))
        }
        // Refresh cart on error to sync state
        setTimeout(() => fetchCart(), 100)
        throw err
      }
    },
    [isAuthenticated, fetchCart, safeSetState]
  )

  const updateQuantity = createCartAction(
    (itemId: string, quantity: number) => 
      quantity < 1 
        ? Promise.resolve({ success: false, message: 'Quantity must be at least 1' })
        : cartService.updateCartItem(itemId, quantity),
    'Cart updated',
    'Failed to update cart',
    (prev, itemId: string, quantity: number) => ({
      ...prev,
      items: prev.items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      )
    })
  )

  const addToCart = useCallback(async (productId: string, quantity = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return { success: false, message: 'User not authenticated' }
    }

    try {
      // Check if item already exists in cart
      const existingItem = state.items.find(item => item.productId === productId)
      
      if (existingItem) {
        // If item exists, update its quantity instead
        const newQuantity = existingItem.quantity + quantity
        return await updateQuantity(existingItem.id, newQuantity)
      }

      const res = await cartService.addToCart(productId, quantity)
      
      if (!res.success || !res.data) {
        toast.error(res.message ?? 'Failed to add item to cart')
        return res
      }

      // Optimistically update local state
      const newItem: CartItem = {
        id: res.data.id,
        productId,
        quantity,
        product: res.data.product,
        userId: res.data.userId,
        createdAt: res.data.createdAt,
        updatedAt: res.data.updatedAt
      }

      safeSetState(prev => ({
        ...prev,
        items: [...prev.items, newItem]
      }))
      
      toast.success('Item added to cart')
      return res
    } catch (err) {
      const error = err instanceof Error ? err.message : 'Failed to add item to cart'
      toast.error(error)
      throw err
    }
  }, [isAuthenticated, state.items, updateQuantity])

  const removeItem = createCartAction(
    (itemId: string) => cartService.removeFromCart(itemId),
    'Item removed',
    'Failed to remove item',
    (prev, itemId: string) => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    })
  )

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