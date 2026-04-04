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

export const notificationApi = {
    // Lấy DS thông báo
    getNotifications: async () => {
        const res = await apiClient.get('/notifications');
        return res.data;
    },

    // Đánh dấu đã đọc
    markAsRead: async (notificationId) => {
        const res = await apiClient.put(`/notifications/${notificationId}/read`);
        return res.data;
    },

    // Đánh dấu tất cả đã đọc
    markAllAsRead: async () => {
        const res = await apiClient.put('/notifications/read-all');
        return res.data;
    },

    // Đếm chưa đọc
    getUnreadCount: async () => {
        const res = await apiClient.get('/notifications/unread-count');
        return res.data;
    },
};
