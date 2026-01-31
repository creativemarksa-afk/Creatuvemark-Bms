import api from './api';

export const paymentService = {
  // Get all payments for client
  getClientPayments: async () => {
    console.log("PaymentService - Making API call to /payments/client");
    try {
      const response = await api.get('/payments/client');
      console.log("PaymentService - API response:", response);
      return response.data;
    } catch (error) {
      console.error("PaymentService - API error:", error);
      console.error("PaymentService - Error response:", error.response?.data);
      throw error;
    }
  },

  // Get payment details
  getPaymentDetails: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}`);
    return response.data;
  },

  // Submit payment with receipt upload
  submitPayment: async (paymentId, formData) => {
    const response = await api.post(`/payments/${paymentId}/submit`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Upload receipt for specific installment
  uploadInstallmentReceipt: async (paymentId, installmentIndex, formData) => {
    const response = await api.post(`/payments/${paymentId}/installments/${installmentIndex}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  // Admin: Get all payments for revenue statistics
  getAllPayments: async () => {
    const response = await api.get('/payments/admin/all');
    return response.data;
  },

  // Admin: Get all pending payments for review
  getPendingPayments: async () => {
    const response = await api.get('/payments/admin/pending');
    return response.data;
  },

  // Admin: Verify payment (approve/reject)
  verifyPayment: async (paymentId, data) => {
    const response = await api.patch(`/payments/${paymentId}/verify`, data);
    return response.data;
  },

  // Admin: Verify installment payment
  verifyInstallmentPayment: async (paymentId, installmentIndex, data) => {
    const response = await api.patch(`/payments/${paymentId}/installments/${installmentIndex}/verify`, data);
    return response.data;
  },

  // Download receipt
  downloadReceipt: async (paymentId) => {
    const response = await api.get(`/payments/${paymentId}/receipt`, {
      responseType: 'blob',
    });
    return response.data;
  },
};