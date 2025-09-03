import api from '@/lib/api'
import { ApiResponse, CartItem } from '@/lib/types'

const handleApiCall = async <T>(apiCall: () => Promise<any>): Promise<ApiResponse<T>> => {
  try {
    const response = await apiCall()
    return response.data
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Request failed',
      message: error.response?.data?.message || 'Request failed'
    }
  }
}

export const cartService = {
  async addToCart(productId: string, quantity: number = 1): Promise<ApiResponse<CartItem>> {
    return handleApiCall(() => api.post('/api/cart', { productId, quantity }))
  },

  async getCart(): Promise<ApiResponse<{
    items: CartItem[]
    total: number
    totalItems: number
  }>> {
    return handleApiCall(() => api.get('/api/cart'))
  },

  async updateCartItem(itemId: string, quantity: number): Promise<ApiResponse<CartItem>> {
    return handleApiCall(() => api.put(`/api/cart/${itemId}`, { quantity }))
  },

  async removeFromCart(itemId: string): Promise<ApiResponse> {
    return handleApiCall(() => api.delete(`/api/cart/${itemId}`))
  },

  async getSelectedCartItems(cartItemIds: string[]): Promise<ApiResponse<CartItem[]>> {
    return handleApiCall(() => api.post('/api/cart/selected', { cartItemIds }))
  }
}