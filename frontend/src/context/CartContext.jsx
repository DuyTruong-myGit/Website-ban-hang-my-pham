// CartContext.jsx — TV3: Global state management cho giỏ hàng
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { cartApi } from '../services/cartService';
import { useAuth } from './AuthContext';

export const CartContext = createContext();

/**
 * Hook tiện lợi để dùng CartContext ở bất kỳ component nào
 * Usage: const { cart, totalItems, addToCart, ... } = useCart();
 */
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
    const { token } = useAuth();

    const [cart, setCart]           = useState(null);   // raw Cart document từ backend
    const [loading, setLoading]     = useState(false);
    const [cartError, setCartError] = useState(null);

    // ─── Tính toán tổng ───────────────────────────────────────────────────
    const items = cart?.items || [];

    /** Tổng số lượng sản phẩm trong giỏ (hiển thị trên icon giỏ hàng) */
    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    /** Tổng tiền tạm tính */
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // ─── Fetch giỏ hàng khi user đăng nhập ───────────────────────────────
    const fetchCart = useCallback(async () => {
        if (!token) {
            setCart(null);
            return;
        }
        setLoading(true);
        setCartError(null);
        try {
            const res = await cartApi.getCart();
            if (res.success) setCart(res.data);
        } catch (err) {
            setCartError(err.message);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchCart();
    }, [fetchCart]);

    // ─── Thêm sản phẩm ───────────────────────────────────────────────────
    /**
     * @param {string} productId
     * @param {number} quantity
     * @param {string} [variantSku]
     * @returns {{ success: boolean, message?: string }}
     */
    const addToCart = async (productId, quantity = 1, variantSku = '') => {
        if (!token) return { success: false, message: 'Vui lòng đăng nhập để thêm vào giỏ hàng.' };
        try {
            const res = await cartApi.addItem(productId, quantity, variantSku);
            if (res.success) {
                setCart(res.data);
                return { success: true };
            }
            return { success: false, message: res.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // ─── Cập nhật số lượng ───────────────────────────────────────────────
    /**
     * @param {string} productId
     * @param {number} quantity - Số lượng mới
     * @param {string} [variantSku]
     */
    const updateQuantity = async (productId, quantity, variantSku = '') => {
        try {
            const res = await cartApi.updateItem(productId, quantity, variantSku);
            if (res.success) setCart(res.data);
            return { success: res.success, message: res.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // ─── Xóa 1 item ──────────────────────────────────────────────────────
    /**
     * @param {string} productId
     * @param {string} [variantSku]
     */
    const removeItem = async (productId, variantSku = '') => {
        try {
            const res = await cartApi.removeItem(productId, variantSku);
            if (res.success) setCart(res.data);
            return { success: res.success, message: res.message };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    // ─── Xóa toàn bộ ─────────────────────────────────────────────────────
    const clearCart = async () => {
        try {
            const res = await cartApi.clearCart();
            if (res.success) setCart(null);
            return { success: res.success };
        } catch (err) {
            return { success: false, message: err.message };
        }
    };

    return (
        <CartContext.Provider value={{
            cart,
            items,
            totalItems,
            totalPrice,
            loading,
            cartError,
            fetchCart,
            addToCart,
            updateQuantity,
            removeItem,
            clearCart,
        }}>
            {children}
        </CartContext.Provider>
    );
};
