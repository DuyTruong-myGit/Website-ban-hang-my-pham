import { API_BASE_URL } from '../config/apiConfig';

const API_BASE = API_BASE_URL;

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const handleResponse = async (response) => {
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Lỗi không xác định' }));
        throw new Error(error.message || 'Lỗi kết nối server');
    }
    return response.json();
};

export const inventoryService = {
  getInventory: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/inventory?${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getLowStock: async (params = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const res = await fetch(`${API_BASE}/admin/inventory/low-stock?${queryString}`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  updateStock: async (id, data) => {
    const res = await fetch(`${API_BASE}/admin/inventory/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  }
};

