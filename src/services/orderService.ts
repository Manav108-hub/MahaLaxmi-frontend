import api from '@/lib/api'
import { ApiResponse, Order, ShippingAddress } from '@/lib/types'

export const orderService = {
  async createOrder(orderData: {
    paymentMethod: 'COD' | 'ONLINE'
    shippingAddress: ShippingAddress
    cartItemIds: string[]
  }): Promise<ApiResponse<Order>> {
    const response = await api.post('/order', orderData)
    return response.data
  },

  async getUserOrders(): Promise<ApiResponse<Order[]>> {
    const response = await api.get('/orders')
    return response.data
  },

  async getOrderById(id: string): Promise<ApiResponse<Order>> {
    const response = await api.get(`/order/${id}`)
    return response.data
  },

  async initiatePayment(orderId: string): Promise<ApiResponse<{ paymentUrl: string; transactionId: string }>> {
    const response = await api.post('/order/payment/initiate', { orderId })
    return response.data
  },

  async verifyPayment(transactionId: string): Promise<ApiResponse> {
    const response = await api.post('/order/payment/verify', { transactionId })
    return response.data
  },

  async getPaymentDetails(orderId: string): Promise<ApiResponse> {
    const response = await api.get(`/order/${orderId}/payments`)
    return response.data
  }
}