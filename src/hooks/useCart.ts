'use client'

import { useState, useEffect } from 'react'
import { CartItem } from '@/lib/types'
import { cartService } from '@/services/cartService'
import { useAuth } from './useAuth'

export function useCart() {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(false)
  const { isAuthenticated } = useAuth()

  const fetchCart = async () => {
    if (!isAuthenticated) return
    
    setLoading(true)
    try {
      const response = await cartService.getCart()
      if (response.success && response.data) {
        setCartItems(response.data)
      }
    } catch (error) {
      console.error('Failed to fetch cart:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCart()
  }, [isAuthenticated])

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      const response = await cartService.addToCart(productId, quantity)
      if (response.success) {
        await fetchCart()
      }
      return response
    } catch (error) {
      console.error('Failed to add to cart:', error)
      throw error
    }
  }

  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      const response = await cartService.updateCartItem(itemId, quantity)
      if (response.success) {
        await fetchCart()
      }
      return response
    } catch (error) {
      console.error('Failed to update cart item:', error)
      throw error
    }
  }

  const removeItem = async (itemId: string) => {
    try {
      const response = await cartService.removeFromCart(itemId)
      if (response.success) {
        await fetchCart()
      }
      return response
    } catch (error) {
      console.error('Failed to remove cart item:', error)
      throw error
    }
  }

  const getTotalAmount = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0)
  }

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return {
    cartItems,
    loading,
    addToCart,
    updateQuantity,
    removeItem,
    getTotalAmount,
    getTotalItems,
    fetchCart
  }
}