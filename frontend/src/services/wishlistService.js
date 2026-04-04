import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' },
});

apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const wishlistApi = {
    // Lấy DS yêu thích
    getWishlist: async () => {
        const res = await apiClient.get('/wishlist');
        return res.data;
    },

    // Thêm yêu thích
    addToWishlist: async (productId) => {
        const res = await apiClient.post(`/wishlist/${productId}`);
        return res.data;
    },

    // Xóa yêu thích
    removeFromWishlist: async (productId) => {
        const res = await apiClient.delete(`/wishlist/${productId}`);
        return res.data;
    },

    // Kiểm tra yêu thích
    checkWishlist: async (productId) => {
        const res = await apiClient.get(`/wishlist/check/${productId}`);
        return res.data;
    },
};
