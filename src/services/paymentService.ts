import api from '@/lib/api'
import { ApiResponse, PaymentSession } from '@/lib/types'

const handleApiCall = async <T>(apiCall: () => Promise<any>): Promise<ApiResponse<T>> => {
  try {
    const response = await apiCall()
    return response.data
  } catch (error: any) {
    return {
      success: false,
      error: error.response?.data?.message || 'Payment request failed',
      message: error.response?.data?.message || 'Payment request failed'
    }
  }
}

export const paymentService = {
  async initiatePayment(paymentData: {
    orderId: string
    amount: number
    callbackUrl: string
    mobileNumber?: string
  }): Promise<ApiResponse<PaymentSession>> {
    return handleApiCall(() => api.post('/api/payment/initiate', paymentData))
  },

  async checkPaymentStatus(transactionId: string): Promise<ApiResponse<PaymentSession>> {
    return handleApiCall(() => api.get(`/api/payment/status/${transactionId}`))
  },

  async completePayment(transactionId: string, success: boolean): Promise<ApiResponse> {
    return handleApiCall(() => api.post(`/api/payment/complete/${transactionId}`, { success }))
  },

  async getPaymentSessions(): Promise<ApiResponse<PaymentSession[]>> {
    return handleApiCall(() => api.get('/api/admin/payments'))
  }
}