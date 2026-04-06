// AI hỗ trợ: Cấu hình API tập trung - tự động chuyển đổi giữa Localhost và Production (Vercel/Render)
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

// Các cấu hình phụ khác (nếu có)
export const WS_URL = API_BASE_URL.replace('/api', '').replace('http', 'ws') + '/ws';
