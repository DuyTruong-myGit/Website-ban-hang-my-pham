import axios from 'axios';
import { API_BASE_URL } from '../config/apiConfig';

const API_BASE = API_BASE_URL;

const getAuthHeaders = () => ({
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${localStorage.getItem('token')}`
});

const publicHeaders = () => ({ 'Content-Type': 'application/json' });

const handleResponse = async (res) => {
    const data = await res.json().catch(() => ({ message: 'Lỗi không xác định' }));
    if (!res.ok) throw new Error(data.message || 'Lỗi kết nối server');
    return data;
};

export const couponApi = {
    /**
     * Kiểm tra mã giảm giá và tính discount
     * POST /api/coupons/validate
     * @param {string} code - Mã giảm giá
     * @param {number} orderAmount - Tổng tiền hàng
     */
    validateCoupon: async (code, orderAmount) => {
        const res = await fetch(`${API_BASE}/coupons/validate`, {
            method: 'POST',
            headers: publicHeaders(),
            body: JSON.stringify({ code: code.trim().toUpperCase(), orderAmount })
        });
        return handleResponse(res);
    },

    /**
     * Lấy danh sách coupon đang khả dụng
     * GET /api/coupons/available
     */
    getAvailableCoupons: async () => {
        const res = await fetch(`${API_BASE}/coupons/available`);
        return handleResponse(res);
    },

    // ── ADMIN ─────────────────────────────────────────────────────────────────

    /** GET /api/admin/coupons — Tất cả coupon */
    adminGetAll: async () => {
        const res = await fetch(`${API_BASE}/admin/coupons`, { headers: getAuthHeaders() });
        return handleResponse(res);
    },

    /** POST /api/admin/coupons — Tạo coupon mới */
    adminCreate: async (data) => {
        const res = await fetch(`${API_BASE}/admin/coupons`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    /** PUT /api/admin/coupons/:id — Cập nhật coupon */
    adminUpdate: async (id, data) => {
        const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify(data)
        });
        return handleResponse(res);
    },

    /** DELETE /api/admin/coupons/:id — Xóa coupon */
    adminDelete: async (id) => {
        const res = await fetch(`${API_BASE}/admin/coupons/${id}`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    }
};
