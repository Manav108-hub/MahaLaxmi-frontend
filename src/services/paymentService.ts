// @/services/paymentService.ts
import api from '@/lib/api'
import { ApiResponse, PaymentSession } from '@/lib/types'

export const paymentService = {
  async initiatePayment(paymentData: {
    orderId: string
    amount: number
    callbackUrl: string
    mobileNumber?: string
  }): Promise<ApiResponse<PaymentSession>> {
    const response = await api.post('/api/payment/initiate', paymentData)
    return response.data
  },

  async checkPaymentStatus(transactionId: string): Promise<ApiResponse<PaymentSession>> {
    const response = await api.get(`/api/payment/status/${transactionId}`)
    return response.data
  },

  async completePayment(transactionId: string, success: boolean): Promise<ApiResponse> {
    const response = await api.post(`/api/payment/complete/${transactionId}`, { success })
    return response.data
  },

  async getPaymentSessions(): Promise<ApiResponse<PaymentSession[]>> {
    const response = await api.get('/api/admin/payments')
    return response.data
  }
}