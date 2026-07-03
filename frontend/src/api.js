import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
  // Register new customer
  registerCustomer: async (name, phone) => {
    const response = await axios.post(`${API_URL}/customers/register`, { name, phone });
    return response.data;
  },

  // Get customer by QR code
  getCustomerByQR: async (qrCode) => {
    const response = await axios.get(`${API_URL}/customers/qr/${qrCode}`);
    return response.data;
  },

  // Get customer by phone
  getCustomerByPhone: async (phone) => {
    const response = await axios.get(`${API_URL}/customers/phone/${encodeURIComponent(phone)}`);
    return response.data;
  },

  // Add stamp
  addStamp: async (customerId) => {
    const response = await axios.post(`${API_URL}/customers/${customerId}/add-stamp`);
    return response.data;
  },

  // Use voucher
  useVoucher: async (customerId) => {
    const response = await axios.post(`${API_URL}/customers/${customerId}/use-voucher`);
    return response.data;
  },

  // Get history
  getHistory: async (customerId) => {
    const response = await axios.get(`${API_URL}/customers/${customerId}/history`);
    return response.data;
  },

  // (Admin customers/stats handled by getAdminStats/getAdminCustomers below)

  exportCustomers: () => {
    window.open(`${API_URL}/reports/export/customers`, '_blank');
  },

  exportTransactions: () => {
    window.open(`${API_URL}/reports/export/transactions`, '_blank');
  },

  getDailyReport: async (date) => {
    const response = await axios.get(`${API_URL}/reports/daily`, { params: { date } });
    return response.data;
  },

  getSettings: async () => {
    const response = await axios.get(`${API_URL}/settings`);
    return response.data;
  },

  // Admin APIs (modular routes)
  getAdminStats: async () => {
    const response = await axios.get(`${API_URL}/admin/stats`);
    return response.data;
  },

  getAdminCustomers: async (page = 1, limit = 20, search = '') => {
    const response = await axios.get(`${API_URL}/admin/customers`, { params: { page, limit, search } });
    return response.data;
  },

  getCustomerDetail: async (id) => {
    const response = await axios.get(`${API_URL}/admin/customers/${id}`);
    return response.data;
  },

  deleteCustomer: async (id) => {
    const response = await axios.delete(`${API_URL}/admin/customers/${id}`);
    return response.data;
  }
};
