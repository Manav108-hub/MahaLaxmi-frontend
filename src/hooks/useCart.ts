'use client'

import { useState, useEffect } from 'react'
import { CartItem } from '@/lib/types'
import { cartService } from '@/services/cartService'
import { useAuth } from './useAuth'
import { toast } from 'sonner'

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAuthenticated } = useAuth()

  const fetchCart = async () => {
    if (!isAuthenticated) {
      setCartItems([])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const response = await cartService.getCart()
      if (response.success && response.data) {
        // Handle both response formats:
        // 1. Direct array of CartItems
        // 2. Object with { items: CartItem[], total: number }
        const items = Array.isArray(response.data) 
          ? response.data 
          : response.data.items || []
        setCartItems(items)
      } else {
        setError(response.message || 'Failed to fetch cart')
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
      setError('Failed to fetch cart. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [isAuthenticated])

  const addToCart = async (productId: string, quantity: number = 1) => {
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart')
      return { success: false, message: 'User not authenticated' }
    }

    setLoading(true)
    setError(null)
    try {
      const response = await cartService.addToCart(productId, quantity)
      if (response.success) {
        await fetchCart()
        toast.success('Item added to cart successfully')
      } else {
        toast.error(response.message || 'Failed to add item to cart')
      }
      return response
    } catch (error) {
      console.error('Failed to add to cart:', error)
      toast.error('Failed to add item to cart')
      setError('Failed to add item to cart')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    if (!isAuthenticated) {
      toast.error('Please login to update cart')
      return { success: false, message: 'User not authenticated' }
    }

    if (quantity < 1) {
      return { success: false, message: 'Quantity must be at least 1' }
    }

    setLoading(true)
    setError(null)
    try {
      const response = await cartService.updateCartItem(itemId, quantity)
      if (response.success) {
        await fetchCart()
        toast.success('Cart updated successfully')
      } else {
        toast.error(response.message || 'Failed to update cart')
      }
      return response
    } catch (error) {
      console.error('Failed to update cart item:', error)
      toast.error('Failed to update cart')
      setError('Failed to update cart')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const removeItem = async (itemId: string) => {
    if (!isAuthenticated) {
      toast.error('Please login to remove items from cart')
      return { success: false, message: 'User not authenticated' }
    }

    setLoading(true)
    setError(null)
    try {
      const response = await cartService.removeFromCart(itemId)
      if (response.success) {
        await fetchCart()
        toast.success('Item removed from cart')
      } else {
        toast.error(response.message || 'Failed to remove item from cart')
      }
      return response
    } catch (error) {
      console.error('Failed to remove cart item:', error)
      toast.error('Failed to remove item from cart')
      setError('Failed to remove item from cart')
      throw error
    } finally {
      setLoading(false)
    }
  }

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => {
      return total + (item.product.price * item.quantity)
    }, 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find(item => item.productId === productId)
    return item ? item.quantity : 0
  }

  return {
    cartItems,
    loading,
    error,
    addToCart,
    updateQuantity,
    removeItem,
    getTotalAmount,
    getTotalItems,
    getItemQuantity,
    fetchCart,
    isEmpty: cartItems.length === 0
  }
}