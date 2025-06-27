// @/services/orderService.ts
import api from '@/lib/api'
import { ApiResponse, Order, ShippingAddress, PaymentMethod  } from '@/lib/types'

export const orderService = {
  async createOrder(orderData: {
    paymentMethod: PaymentMethod
    shippingAddress: ShippingAddress
    cartItemIds: string[]
  }): Promise<ApiResponse<Order>> {
    const response = await api.post('/api/order', orderData)
    return response.data
  },

  async getUserOrders(page = 1, limit = 10): Promise<ApiResponse<{ orders: Order[]; total: number }>> {
    const response = await api.get('/api/orders', { params: { page, limit } })
    return response.data
  },

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    const response = await api.get(`/api/order/${id}`)
    return response.data
  },

  async initiatePayment(orderId: string): Promise<ApiResponse<{ paymentUrl: string }>> {
    const response = await api.post('/api/order/payment/initiate', { orderId })
    return response.data
  },

  async verifyPayment(transactionId: string): Promise<ApiResponse<Order>> {
    const response = await api.post('/api/order/payment/verify', { transactionId })
    return response.data
  },

  async getPaymentDetails(orderId: string): Promise<ApiResponse> {
    const response = await api.get(`/api/order/${orderId}/payments`)
    return response.data
  },

  // Admin functions
  async getAllOrders(): Promise<ApiResponse<Order[]>> {
    const response = await api.get('/api/admin/orders')
    return response.data
  },

  async updateOrderStatus(orderId: string, statusData: {
    deliveryStatus?: string
    paymentStatus?: string
  }): Promise<ApiResponse<Order>> {
    const response = await api.put(`/api/admin/order/${orderId}/status`, statusData)
    return response.data
  }
}