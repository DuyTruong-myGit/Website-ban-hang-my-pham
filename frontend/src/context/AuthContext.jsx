// AI hỗ trợ: Quản lý trạng thái đăng nhập, đăng ký và xác thực JWT cho toàn bộ ứng dụng.
// AI hỗ trợ: Xây dựng Landing Page với các khối text tạm thời thay thế cho hình ảnh để tránh lỗi tải tài nguyên.
import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';

export const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

// Tạo instance axios riêng để dùng xuyên suốt app
const authAxios = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api',
});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [loading, setLoading] = useState(true);

    // Cập nhật Authorization header mỗi khi token thay đổi
    useEffect(() => {
        if (token) {
            authAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete authAxios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    useEffect(() => {
        const fetchUser = async () => {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                // Thêm tham số ngẫu nhiên hoặc kiểm tra để tránh gọi trùng lặp nếu cần
                const res = await authAxios.get('/auth/me');
                if (res.data.success) {
                    setUser(res.data.data);
                }
            } catch (err) {
                // Chỉ log lỗi nếu thực sự có token nhưng không lấy được user (hết hạn/sai)
                if (token) {
                    console.error("Phiên đăng nhập hết hạn hoặc lỗi xác thực.");
                    logout(); // Tự động logout nếu token không hợp lệ
                }
            } finally {
                setLoading(false);
            }
        };

        fetchUser();
    }, [token]);

    const login = async (email, password) => {
        try {
            const res = await authAxios.post('/auth/login', { email, password });
            if (res.data.success) {
                const { token, user } = res.data.data;
                localStorage.setItem('token', token);
                setToken(token);
                setUser(user);
                return { success: true, user };
            }
            return { success: false, message: res.data.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Đăng nhập thất bại" };
        }
    };

    const register = async (userData) => {
        try {
            const res = await authAxios.post('/auth/register', userData);
            if (res.data.success) {
                const { token, user } = res.data.data;
                localStorage.setItem('token', token);
                setToken(token);
                setUser(user);
                return { success: true };
            }
            return { success: false, message: res.data.message };
        } catch (err) {
            return { success: false, message: err.response?.data?.message || "Đăng ký thất bại" };
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        setToken('');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, authAxios }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};
