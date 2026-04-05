import axios from 'axios';

const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: { 'Content-Type': 'application/json' },
});

// Interceptor thêm JWT token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// === REVIEW API ===
export const reviewApi = {
    // Lấy reviews sản phẩm (public)
    getProductReviews: async (productId, rating = null) => {
        const params = rating ? { rating } : {};
        const res = await apiClient.get(`/reviews/product/${productId}`, { params });
        return res.data;
    },

    // Tạo review
    createReview: async (data) => {
        const res = await apiClient.post('/reviews', data);
        return res.data;
    },

    // Bấm hữu ích
    markHelpful: async (reviewId) => {
        const res = await apiClient.put(`/reviews/${reviewId}/helpful`);
        return res.data;
    },

    // Admin: Trả lời
    adminReply: async (reviewId, content) => {
        const res = await apiClient.put(`/admin/reviews/${reviewId}/reply`, { content });
        return res.data;
    },

    // Admin: Ẩn/hiện
    toggleHide: async (reviewId) => {
        const res = await apiClient.put(`/admin/reviews/${reviewId}/toggle-hide`);
        return res.data;
    },

    // Admin: Lấy tất cả
    getAll: async () => {
        const res = await apiClient.get('/admin/reviews');
        return res.data;
    },
};

// === QUESTION API ===
export const questionApi = {
    // Lấy Q&A sản phẩm (public)
    getProductQuestions: async (productId) => {
        const res = await apiClient.get(`/questions/product/${productId}`);
        return res.data;
    },

    // Đặt câu hỏi
    createQuestion: async (data) => {
        const res = await apiClient.post('/questions', data);
        return res.data;
    },

    // Staff: Trả lời
    answerQuestion: async (questionId, answer) => {
        const res = await apiClient.put(`/staff/questions/${questionId}/answer`, { answer });
        return res.data;
    },

    // Staff: Chưa trả lời
    getPending: async () => {
        const res = await apiClient.get('/staff/questions/pending');
        return res.data;
    },

    // Staff: Tất cả
    getAll: async () => {
        const res = await apiClient.get('/staff/questions');
        return res.data;
    },
};
