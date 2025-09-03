import api from '@/lib/api'
import { ApiResponse, Order, ShippingAddress, PaymentMethod } from '@/lib/types'

const handleApiCall = async <T>(apiCall: () => Promise<any>): Promise<ApiResponse<T>> => {
  try {
    const response = await apiCall()
    return response.data
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Order request failed',
      message: error.response?.data?.message || 'Order request failed'
    }
  }
}

export const orderService = {
  async createOrder(orderData: {
    paymentMethod: PaymentMethod
    shippingAddress: ShippingAddress
    cartItemIds: string[]
  }): Promise<ApiResponse<Order>> {
    return handleApiCall(() => api.post('/api/order', orderData))
  },

  async getUserOrders(page = 1, limit = 10): Promise<ApiResponse<{ orders: Order[]; total: number }>> {
    return handleApiCall(() => api.get('/api/orders', { params: { page, limit } }))
  },

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    return handleApiCall(() => api.get(`/api/order/${id}`))
  },

  async initiatePayment(orderId: string): Promise<ApiResponse<{ paymentUrl: string }>> {
    return handleApiCall(() => api.post('/api/order/payment/initiate', { orderId }))
  },

  async verifyPayment(transactionId: string): Promise<ApiResponse<Order>> {
    return handleApiCall(() => api.post('/api/order/payment/verify', { transactionId }))
  },

  async getPaymentDetails(orderId: string): Promise<ApiResponse> {
    return handleApiCall(() => api.get(`/api/order/${orderId}/payments`))
  },

  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    return handleApiCall(() => api.get('/api/admin/orders'))
  },

  async updateOrderStatus(orderId: string, statusData: {
    deliveryStatus?: string
    paymentStatus?: string
  }): Promise<ApiResponse<Order>> {
    return handleApiCall(() => api.put(`/api/admin/order/${orderId}/status`, statusData))
  }
}