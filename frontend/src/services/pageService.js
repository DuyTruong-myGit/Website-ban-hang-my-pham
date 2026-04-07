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

export const pageService = {
  getPublicPages: async () => {
    const res = await fetch(`${API_BASE}/pages`);
    return handleResponse(res);
  },

  getAll: async () => {
    const res = await fetch(`${API_BASE}/admin/pages`, {
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  },

  getBySlug: async (slug) => {
    const res = await fetch(`${API_BASE}/pages/${slug}`);
    return handleResponse(res);
  },

  create: async (data) => {
    const res = await fetch(`${API_BASE}/admin/pages`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  update: async (id, data) => {
    const res = await fetch(`${API_BASE}/admin/pages/${id}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  delete: async (id) => {
    const res = await fetch(`${API_BASE}/admin/pages/${id}`, {
      method: "DELETE",
      headers: getAuthHeaders(),
    });
    return handleResponse(res);
  }
};

