import axios from 'axios';

// API Client riêng cho Chat — TV4
const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Interceptor: Tự động gắn JWT token
apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// === CHAT ROOMS ===
export const chatApi = {
    // Tạo phòng chat mới
    createRoom: async (subject) => {
        const res = await apiClient.post('/chat/rooms', { subject });
        return res.data;
    },

    // Lấy DS phòng chat của user hiện tại
    getMyRooms: async () => {
        const res = await apiClient.get('/chat/rooms');
        return res.data;
    },

    // Lấy tin nhắn trong phòng
    getMessages: async (roomId) => {
        const res = await apiClient.get(`/chat/rooms/${roomId}/messages`);
        return res.data;
    },

    // Gửi tin nhắn (REST fallback)
    sendMessage: async (roomId, content, imageUrl = null) => {
        const res = await apiClient.post(`/chat/rooms/${roomId}/messages`, { content, imageUrl });
        return res.data;
    },

    // Đóng phòng chat
    closeRoom: async (roomId) => {
        const res = await apiClient.put(`/chat/rooms/${roomId}/close`);
        return res.data;
    },

    // Tiếp nhận phòng chat (staff)
    assignRoom: async (roomId) => {
        const res = await apiClient.put(`/chat/rooms/${roomId}/assign`);
        return res.data;
    },

    // Đánh dấu đã đọc
    markAsRead: async (roomId) => {
        const res = await apiClient.put(`/chat/rooms/${roomId}/read`);
        return res.data;
    },
};

// === STAFF CHAT ===
export const staffChatApi = {
    // DS phòng đang chờ
    getPending: async () => {
        const res = await apiClient.get('/staff/chat/pending');
        return res.data;
    },

    // DS phòng của staff
    getMyRooms: async () => {
        const res = await apiClient.get('/staff/chat/rooms');
        return res.data;
    },

    // Tất cả phòng
    getAllRooms: async () => {
        const res = await apiClient.get('/staff/chat/all');
        return res.data;
    },
};
