// orderService.js — TV3: API calls cho module Đơn hàng
const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const handleResponse = async (res) => {
    const data = await res.json().catch(() => ({ message: 'Lỗi không xác định' }));
    if (!res.ok) throw new Error(data.message || 'Lỗi kết nối server');
    return data;
};

export const orderApi = {
    /** POST /api/orders — Tạo đơn hàng từ giỏ hàng */
    createOrder: async (orderData) => {
        const res = await fetch(`${API_BASE}/orders`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(orderData)
        });
        return handleResponse(res);
    },

    /** GET /api/orders — Lịch sử đơn hàng của tôi */
    getMyOrders: async () => {
        const res = await fetch(`${API_BASE}/orders`, { headers: getAuthHeaders() });
        return handleResponse(res);
    },

    /** GET /api/orders/:id — Chi tiết 1 đơn hàng */
    getOrderById: async (id) => {
        const res = await fetch(`${API_BASE}/orders/${id}`, { headers: getAuthHeaders() });
        return handleResponse(res);
    },

    /** PUT /api/orders/:id/cancel — Hủy đơn */
    cancelOrder: async (id) => {
        const res = await fetch(`${API_BASE}/orders/${id}/cancel`, {
            method: 'PUT',
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    },

    /** GET /api/admin/orders — [Admin/Staff] Tất cả đơn hàng */
    getAllOrders: async (status = '', page = 0, limit = 20) => {
        const params = new URLSearchParams({ page, limit });
        if (status) params.append('status', status);
        const res = await fetch(`${API_BASE}/admin/orders?${params}`, { headers: getAuthHeaders() });
        return handleResponse(res);
    },

    /** PUT /api/admin/orders/:id/status — [Admin/Staff] Cập nhật trạng thái */
    updateOrderStatus: async (id, status, note = '', trackingCode = '') => {
        const res = await fetch(`${API_BASE}/admin/orders/${id}/status`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ status, note, trackingCode })
        });
        return handleResponse(res);
    }
};
