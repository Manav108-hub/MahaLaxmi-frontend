import api from '@/lib/api'
import {
  ApiResponse,
  InitiatePaymentRequest,
  PaymentSession,
  VerifyPaymentRequest
} from '@/lib/types'

export const paymentService = {
  async initiatePayment(paymentData: InitiatePaymentRequest): Promise<ApiResponse<PaymentSession>> {
    const response = await api.post<ApiResponse<PaymentSession>>('/payment/initiate', paymentData)
    return response.data
  },

  async checkPaymentStatus(transactionId: string): Promise<ApiResponse<PaymentSession>> {
    const response = await api.get<ApiResponse<PaymentSession>>(`/payment/status/${transactionId}`)
    return response.data
  },

  async completePayment(data: VerifyPaymentRequest & { success: boolean }): Promise<ApiResponse> {
    const response = await api.post<ApiResponse>(`/payment/complete/${data.transactionId}`, { success: data.success })
    return response.data
  }
}
