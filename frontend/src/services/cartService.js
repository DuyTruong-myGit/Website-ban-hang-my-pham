// cartService.js — TV3: API calls cho module Giỏ hàng
// Sử dụng authAxios từ AuthContext để tự động gắn JWT token

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
    };
};

const handleResponse = async (response) => {
    const data = await response.json().catch(() => ({ message: 'Lỗi không xác định' }));
    if (!response.ok) {
        throw new Error(data.message || 'Lỗi kết nối server');
    }
    return data;
};

export const cartApi = {
    /**
     * Lấy giỏ hàng hiện tại của user đang đăng nhập
     * GET /api/cart
     */
    getCart: async () => {
        const res = await fetch(`${API_BASE}/cart`, {
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    },

    /**
     * Thêm sản phẩm vào giỏ hàng
     * POST /api/cart/items
     * @param {string} productId
     * @param {number} quantity
     * @param {string} [variantSku] - SKU variant nếu có
     */
    addItem: async (productId, quantity = 1, variantSku = '') => {
        const res = await fetch(`${API_BASE}/cart/items`, {
            method: 'POST',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId, quantity, variantSku })
        });
        return handleResponse(res);
    },

    /**
     * Cập nhật số lượng của 1 item trong giỏ
     * PUT /api/cart/items/{productId}
     * @param {string} productId
     * @param {number} quantity - Số lượng mới
     * @param {string} [variantSku]
     */
    updateItem: async (productId, quantity, variantSku = '') => {
        const res = await fetch(`${API_BASE}/cart/items/${productId}`, {
            method: 'PUT',
            headers: getAuthHeaders(),
            body: JSON.stringify({ productId, quantity, variantSku })
        });
        return handleResponse(res);
    },

    /**
     * Xóa 1 sản phẩm khỏi giỏ hàng
     * DELETE /api/cart/items/{productId}?variantSku=...
     * @param {string} productId
     * @param {string} [variantSku]
     */
    removeItem: async (productId, variantSku = '') => {
        const url = variantSku
            ? `${API_BASE}/cart/items/${productId}?variantSku=${encodeURIComponent(variantSku)}`
            : `${API_BASE}/cart/items/${productId}`;
        const res = await fetch(url, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    },

    /**
     * Xóa toàn bộ giỏ hàng
     * DELETE /api/cart
     */
    clearCart: async () => {
        const res = await fetch(`${API_BASE}/cart`, {
            method: 'DELETE',
            headers: getAuthHeaders()
        });
        return handleResponse(res);
    }
};
