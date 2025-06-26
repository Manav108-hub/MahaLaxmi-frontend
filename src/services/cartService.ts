import api from '@/lib/api'
import { ApiResponse, CartItem } from '@/lib/types'

export const cartService = {
  async addToCart(productId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    const response = await api.post('/cart', { productId, quantity })
    return response.data
  },

  async getCart(): Promise<ApiResponse<CartItem[]>> {
    const response = await api.get('/cart')
    return response.data
  },

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    const response = await api.put(`/cart/${itemId}`, { quantity })
    return response.data
  },

  async removeFromCart(itemId: string): Promise<ApiResponse> {
    const response = await api.delete(`/cart/${itemId}`)
    return response.data
  },

  async getSelectedCartItems(cartItemIds: string[]): Promise<ApiResponse<CartItem[]>> {
    const response = await api.post('/cart/selected', { cartItemIds })
    return response.data
  }
}