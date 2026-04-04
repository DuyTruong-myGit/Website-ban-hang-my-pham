// Cart.jsx — TV3: Trang Giỏ hàng /cart
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { couponApi } from '../services/couponService';
import './Cart.css';

// ─── Helper format tiền ──────────────────────────────────────────────────────
const formatVND = (amount) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);

const SHIPPING_THRESHOLD = 500000; // Miễn phí ship cho đơn >= 500k
const SHIPPING_FEE = 30000;

// ─── CartItem Row Component ──────────────────────────────────────────────────
const CartItemRow = ({ item, onQuantityChange, onRemove, updating }) => {
    const isUpdating = updating === `${item.productId}-${item.variantSku}`;
    const lineTotal = item.price * item.quantity;

    const handleQtyChange = (delta) => {
        const newQty = item.quantity + delta;
        if (newQty < 1) return;
        onQuantityChange(item.productId, newQty, item.variantSku);
    };

    return (
        <div className={`cart-item-row ${isUpdating ? 'cart-item--updating' : ''}`}>
            {/* Ảnh sản phẩm */}
            <div className="cart-item__image">
                {item.imageUrl ? (
                    <img src={item.imageUrl} alt={item.name} />
                ) : (
                    <div className="cart-item__image-placeholder">
                        <i className="bi bi-image"></i>
                    </div>
                )}
            </div>

            {/* Thông tin sản phẩm */}
            <div className="cart-item__info">
                <h4 className="cart-item__name">{item.name}</h4>
                {item.variantName && (
                    <span className="cart-item__variant">{item.variantName}</span>
                )}
                <span className="cart-item__price-unit">{formatVND(item.price)}</span>
            </div>

            {/* Điều chỉnh số lượng */}
            <div className="cart-item__qty">
                <button
                    className="qty-btn"
                    onClick={() => handleQtyChange(-1)}
                    disabled={isUpdating || item.quantity <= 1}
                    aria-label="Giảm số lượng"
                >
                    <i className="bi bi-dash"></i>
                </button>
                <span className="qty-value">{item.quantity}</span>
                <button
                    className="qty-btn"
                    onClick={() => handleQtyChange(1)}
                    disabled={isUpdating}
                    aria-label="Tăng số lượng"
                >
                    <i className="bi bi-plus"></i>
                </button>
            </div>

            {/* Thành tiền */}
            <div className="cart-item__total">
                {formatVND(lineTotal)}
            </div>

            {/* Nút xóa */}
            <button
                className="cart-item__remove"
                onClick={() => onRemove(item.productId, item.variantSku)}
                disabled={isUpdating}
                aria-label="Xóa sản phẩm"
            >
                <i className="bi bi-trash3"></i>
            </button>
        </div>
    );
};

// ─── Empty Cart Component ────────────────────────────────────────────────────
const EmptyCart = () => (
    <div className="cart-empty">
        <div className="cart-empty__icon">
            <i className="bi bi-cart-x"></i>
        </div>
        <h3 className="cart-empty__title">Giỏ hàng của bạn đang trống</h3>
        <p className="cart-empty__desc">
            Hãy khám phá các sản phẩm tuyệt vời và thêm vào giỏ hàng nhé!
        </p>
        <Link to="/" className="btn-primary-custom">
            <i className="bi bi-arrow-left me-2"></i>
            Tiếp tục mua sắm
        </Link>
    </div>
);

// ─── Order Summary Component ─────────────────────────────────────────────────
const OrderSummary = ({ totalPrice, totalItems, discount, couponCode, onCheckout, onRemoveCoupon, onApplyCoupon }) => {
    const [inputCode, setInputCode] = useState('');
    const [validating, setValidating] = useState(false);
    const [couponError, setCouponError] = useState('');

    const shippingFee = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const grandTotal = Math.max(0, totalPrice + shippingFee - discount);

    const handleApply = async () => {
        if (!inputCode.trim()) return;
        setValidating(true);
        setCouponError('');
        try {
            await onApplyCoupon(inputCode.trim());
            setInputCode('');
        } catch (err) {
            setCouponError(err.message);
        } finally {
            setValidating(false);
        }
    };

    return (
        <div className="cart-summary">
            <h3 className="cart-summary__title">Tóm tắt đơn hàng</h3>

            <div className="cart-summary__row">
                <span>Tạm tính ({totalItems} sản phẩm)</span>
                <span>{formatVND(totalPrice)}</span>
            </div>

            <div className="cart-summary__row">
                <span>Phí vận chuyển</span>
                {shippingFee === 0 ? (
                    <span className="cart-summary__free-ship">Miễn phí</span>
                ) : (
                    <span>{formatVND(shippingFee)}</span>
                )}
            </div>

            {shippingFee > 0 && (
                <div className="cart-summary__ship-notice">
                    <i className="bi bi-truck me-1"></i>
                    Mua thêm&nbsp;
                    <strong>{formatVND(SHIPPING_THRESHOLD - totalPrice)}</strong>
                    &nbsp;để được miễn phí vận chuyển
                </div>
            )}

            {/* ── Coupon Section ── */}
            <div className="cart-summary__coupon">
                {couponCode ? (
                    <div className="cart-summary__coupon-applied">
                        <span>
                            <i className="bi bi-tag-fill me-1 text-success"></i>
                            <strong>{couponCode}</strong>
                        </span>
                        <button className="cart-coupon__remove" onClick={onRemoveCoupon} title="Xóa mã">
                            <i className="bi bi-x"></i>
                        </button>
                    </div>
                ) : (
                    <div className="cart-summary__coupon-input">
                        <input
                            type="text"
                            className="cart-coupon__input"
                            placeholder="Nhập mã giảm giá..."
                            value={inputCode}
                            onChange={e => setInputCode(e.target.value.toUpperCase())}
                            onKeyDown={e => e.key === 'Enter' && handleApply()}
                        />
                        <button
                            className="cart-coupon__btn"
                            onClick={handleApply}
                            disabled={validating || !inputCode.trim()}
                        >
                            Áp dụng
                        </button>
                    </div>
                )}
                {couponError && <p className="cart-coupon__error">{couponError}</p>}
            </div>

            {/* Giảm giá */}
            {discount > 0 && (
                <div className="cart-summary__row cart-summary__row--discount">
                    <span>Giảm giá</span>
                    <span className="text-success fw-bold">-{formatVND(discount)}</span>
                </div>
            )}

            <div className="cart-summary__divider"></div>

            <div className="cart-summary__row cart-summary__row--total">
                <span>Tổng cộng</span>
                <span className="cart-summary__grand-total">{formatVND(grandTotal)}</span>
            </div>

            <button
                id="btn-checkout"
                className="btn-checkout"
                onClick={onCheckout}
            >
                <i className="bi bi-credit-card me-2"></i>
                Tiến hành thanh toán
            </button>

            <Link to="/" className="btn-continue-shopping">
                <i className="bi bi-arrow-left me-2"></i>
                Tiếp tục mua sắm
            </Link>
        </div>
    );
};

// ─── Main Cart Page ──────────────────────────────────────────────────────────
export default function Cart() {
    const navigate = useNavigate();
    const { token } = useAuth();
    const { items, totalItems, totalPrice, loading, cartError, updateQuantity, removeItem, clearCart } = useCart();

    // Track item đang được cập nhật để disable buttons
    const [updating, setUpdating] = useState(null);
    const [clearConfirm, setClearConfirm] = useState(false);
    const [notification, setNotification] = useState(null);
    const [couponCode, setCouponCode] = useState('');
    const [discount, setDiscount] = useState(0);

    // Nếu chưa đăng nhập
    if (!token) {
        return (
            <div className="cart-page">
                <div className="container">
                    <div className="cart-empty">
                        <div className="cart-empty__icon">
                            <i className="bi bi-lock"></i>
                        </div>
                        <h3 className="cart-empty__title">Vui lòng đăng nhập</h3>
                        <p className="cart-empty__desc">Bạn cần đăng nhập để xem giỏ hàng.</p>
                        <Link to="/login" className="btn-primary-custom">
                            Đăng nhập ngay
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleQuantityChange = async (productId, newQty, variantSku) => {
        const key = `${productId}-${variantSku}`;
        setUpdating(key);
        const result = await updateQuantity(productId, newQty, variantSku);
        if (!result.success) showNotification(result.message, 'error');
        setUpdating(null);
    };

    const handleRemove = async (productId, variantSku) => {
        const key = `${productId}-${variantSku}`;
        setUpdating(key);
        const result = await removeItem(productId, variantSku);
        if (result.success) {
            showNotification('Đã xóa sản phẩm khỏi giỏ hàng.');
        } else {
            showNotification(result.message, 'error');
        }
        setUpdating(null);
    };

    const handleClearCart = async () => {
        if (!clearConfirm) { setClearConfirm(true); return; }
        await clearCart();
        setClearConfirm(false);
        showNotification('Đã xóa toàn bộ giỏ hàng.');
    };

    const handleCheckout = () => {
        navigate('/checkout', {
            state: { couponCode: couponCode || null, discount }
        });
    };

    const handleApplyCoupon = async (code) => {
        const res = await couponApi.validateCoupon(code, totalPrice);
        if (res.success) {
            const data = res.data;
            setCouponCode(code.toUpperCase());
            setDiscount(data.discountAmount || 0);
            showNotification(`Áp dụng mã thành công! Giảm ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(data.discountAmount)}.`);
        } else {
            throw new Error(res.message || 'Mã không hợp lệ');
        }
    };

    const handleRemoveCoupon = () => {
        setCouponCode('');
        setDiscount(0);
        showNotification('Đã xóa mã giảm giá.');
    };

    return (
        <div className="cart-page">
            <div className="container">
                {/* ── Header ── */}
                <div className="cart-header">
                    <h1 className="cart-header__title">
                        <i className="bi bi-cart3 me-2"></i>
                        Giỏ hàng của bạn
                        {totalItems > 0 && (
                            <span className="cart-header__count">{totalItems}</span>
                        )}
                    </h1>

                    {items.length > 0 && (
                        <button
                            id="btn-clear-cart"
                            className={`btn-clear-cart ${clearConfirm ? 'btn-clear-cart--confirm' : ''}`}
                            onClick={handleClearCart}
                        >
                            {clearConfirm ? (
                                <><i className="bi bi-exclamation-triangle me-1"></i> Xác nhận xóa tất cả?</>
                            ) : (
                                <><i className="bi bi-trash3 me-1"></i> Xóa tất cả</>
                            )}
                        </button>
                    )}
                </div>

                {/* ── Notification ── */}
                {notification && (
                    <div className={`cart-notification cart-notification--${notification.type}`}>
                        <i className={`bi ${notification.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-circle'} me-2`}></i>
                        {notification.msg}
                    </div>
                )}

                {/* ── Loading ── */}
                {loading ? (
                    <div className="cart-loading">
                        <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Đang tải...</span>
                        </div>
                        <p>Đang tải giỏ hàng...</p>
                    </div>
                ) : cartError ? (
                    <div className="cart-error">
                        <i className="bi bi-wifi-off me-2"></i>
                        {cartError}
                    </div>
                ) : items.length === 0 ? (
                    <EmptyCart />
                ) : (
                    <div className="cart-layout">
                        {/* ── Danh sách sản phẩm ── */}
                        <div className="cart-items-section">
                            {/* Table header (desktop) */}
                            <div className="cart-table-header">
                                <span style={{ flex: '3' }}>Sản phẩm</span>
                                <span style={{ flex: '1', textAlign: 'center' }}>Số lượng</span>
                                <span style={{ flex: '1', textAlign: 'right' }}>Thành tiền</span>
                                <span style={{ width: '40px' }}></span>
                            </div>

                            {items.map((item) => (
                                <CartItemRow
                                    key={`${item.productId}-${item.variantSku}`}
                                    item={item}
                                    onQuantityChange={handleQuantityChange}
                                    onRemove={handleRemove}
                                    updating={updating}
                                />
                            ))}
                        </div>

                        {/* ── Tóm tắt đơn hàng ── */}
                        <OrderSummary
                            totalPrice={totalPrice}
                            totalItems={totalItems}
                            discount={discount}
                            couponCode={couponCode}
                            onCheckout={handleCheckout}
                            onApplyCoupon={handleApplyCoupon}
                            onRemoveCoupon={handleRemoveCoupon}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
