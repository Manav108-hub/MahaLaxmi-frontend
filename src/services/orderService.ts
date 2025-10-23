// services/orderService.ts
import api from '@/lib/api'
import { ApiResponse, Order, PaymentMethod, ShippingAddress } from '@/lib/types'

const handleApiCall = async <T>(apiCall: () => Promise<any>): Promise<ApiResponse<T>> => {
  try {
    const response = await apiCall()
    return response.data
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.error || error.response?.data?.message || 'Request failed',
      message: error.response?.data?.error || error.response?.data?.message || 'Request failed'
    }
  }
}

export const orderService = {
  // NEW: Create payment session (replaces direct order creation)
  async createPaymentSession(sessionData: {
    shippingAddress: ShippingAddress
    cartItemIds: string[]
  }): Promise<ApiResponse<unknown>> {
    return handleApiCall(() => api.post('/api/payment/create-session', sessionData))
  },

  
  async createOrder(orderData: {
    paymentMethod: PaymentMethod
    shippingAddress: ShippingAddress
    cartItemIds: string[]
  }): Promise<ApiResponse<Order>> {
    return handleApiCall(() => api.post('/api/order', orderData))
  },

  // NEW: Verify payment status
  async verifyPaymentStatus(transactionId: string): Promise<ApiResponse<{
    paymentSession: unknown
    paymentStatus: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED'
  }>> {
    return handleApiCall(() => api.get(`/api/payment/status/${transactionId}`))
  },

  

  // Get user orders (updated endpoint)
  async getUserOrders(page = 1, limit = 10): Promise<ApiResponse<{ 
    orders: Order[]
    pagination: {
      page: number
      limit: number
      total: number
      pages: number
    }
  }>> {
    return handleApiCall(() => api.get('/api/orders', { params: { page, limit } }))
  },

  // Get order by ID
  async getOrderById(id: string): Promise<ApiResponse<{ order: Order }>> {
    return handleApiCall(() => api.get(`/api/order/${id}`))
  },

  // Admin functions
  async getAllOrders(): Promise<ApiResponse<{
    orders: Order[]
    pagination: unknown
  }>> {
    return handleApiCall(() => api.get('/api/admin/orders'))
  },

  async updateOrderStatus(orderId: string, statusData: {
    deliveryStatus?: string
    paymentStatus?: string
  }): Promise<ApiResponse<{ order: Order }>> {
    return handleApiCall(() => api.put(`/api/admin/order/${orderId}/status`, statusData))
  },

  // Utility function to poll payment status
  async pollPaymentStatus(
    transactionId: string, 
    maxAttempts: number = 30, 
    interval: number = 2000
  ): Promise<ApiResponse<{ paymentSession: unknown; paymentStatus: string }>> {
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      const result = await this.verifyPaymentStatus(transactionId)
      
      if (!result.success) {
        return result
      }

      if (result.data?.paymentStatus === 'SUCCESS' || result.data?.paymentStatus === 'FAILED') {
        return result
      }

      // Wait before next attempt
      await new Promise(resolve => setTimeout(resolve, interval))
    }

    return {
      success: false,
      error: 'Payment verification timeout',
      message: 'Payment status could not be verified within the expected time'
    }
  }
}