import { API_BASE_URL } from '../config/apiConfig';

// API calls cho TV5 — Admin Dashboard & Quản lý
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



// === REPORTS ===
export const reportApi = {
    getOverview: async () => {
        const res = await fetch(`${API_BASE}/admin/reports/overview`, {
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    },

    getRevenue: async (from, to) => {
        const res = await fetch(`${API_BASE}/admin/reports/revenue?from=${from}&to=${to}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    },

    getTopProducts: async () => {
        const res = await fetch(`${API_BASE}/admin/reports/top-products`, {
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    },

    getRecentOrders: async () => {
        const res = await fetch(`${API_BASE}/admin/reports/recent-orders`, {
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    },

    getLowStockList: async () => {
        const res = await fetch(`${API_BASE}/admin/reports/low-stock`, {
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    }
};

// === ADMIN LOGS ===
export const adminLogApi = {
    getAll: async (params = {}) => {
        const query = new URLSearchParams();
        if (params.user) query.append('user', params.user);
        if (params.action) query.append('action', params.action);
        if (params.from) query.append('from', params.from);
        if (params.to) query.append('to', params.to);
        query.append('page', params.page || 0);
        query.append('limit', params.limit || 20);

        const res = await fetch(`${API_BASE}/admin/logs?${query.toString()}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    }
};

// === PAGE CONTENT ===
export const pageContentApi = {
    getBySlug: async (slug) => {
        const res = await fetch(`${API_BASE}/pages/${slug}`);
        return handleResponse(res);
    },

    getAll: async (page = 0, limit = 20) => {
        const res = await fetch(`${API_BASE}/admin/pages?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    },

    create: async (data) => {
        const res = await fetch(`${API_BASE}/admin/pages`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    update: async (id, data) => {
        const res = await fetch(`${API_BASE}/admin/pages/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    delete: async (id) => {
        const res = await fetch(`${API_BASE}/admin/pages/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    }
};

// === USERS (Admin xem danh sách user - dùng chung endpoint TV1) ===
export const userApi = {
    getAll: async (page = 0, limit = 20) => {
        const res = await fetch(`${API_BASE}/users?page=${page}&limit=${limit}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    },

    getById: async (id) => {
        const res = await fetch(`${API_BASE}/users/${id}`, {
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    },

    updateStatus: async (id, isActive) => {
        const res = await fetch(`${API_BASE}/users/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ isActive })
        });
        return handleResponse(res);
    },

    createStaff: async (data) => {
        const res = await fetch(`${API_BASE}/users/staff`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    }
};
