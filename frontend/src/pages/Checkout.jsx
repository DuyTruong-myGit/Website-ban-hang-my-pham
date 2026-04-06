// Checkout.jsx — TV3: Trang thanh toán /checkout
import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/orderService';
import usePageTitle from '../hooks/usePageTitle';
import './Checkout.css';

const formatVND = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const SHIPPING_THRESHOLD = 500000;
const SHIPPING_FEE = 30000;

export default function Checkout() {
    usePageTitle('Thanh Toán');
    const navigate = useNavigate();
    const location = useLocation();
    const { token, user } = useAuth();
    const { items, totalPrice, clearCart } = useCart();

    // Coupon được truyền từ trang giỏ hàng
    const couponFromCart = location.state?.couponCode || '';
    const discountFromCart = location.state?.discount || 0;

    const shippingFee = totalPrice >= SHIPPING_THRESHOLD ? 0 : SHIPPING_FEE;
    const grandTotal = Math.max(0, totalPrice + shippingFee - discountFromCart);

    const [form, setForm] = useState({
        fullName: user?.name || '',
        phone: user?.phone || '',
        province: '',
        district: '',
        ward: '',
        street: '',
        paymentMethod: 'cod',
        note: '',
        couponCode: couponFromCart,
    });
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    if (!token) {
        return (
            <div className="checkout-page">
                <div className="container text-center py-5">
                    <i className="bi bi-lock fs-1 text-muted"></i>
                    <h3 className="mt-3">Vui lòng đăng nhập</h3>
                    <Link to="/login" className="btn-checkout-primary mt-3 d-inline-block">Đăng nhập</Link>
                </div>
            </div>
        );
    }

    if (items.length === 0) {
        return (
            <div className="checkout-page">
                <div className="container text-center py-5">
                    <i className="bi bi-cart-x fs-1 text-muted"></i>
                    <h3 className="mt-3">Giỏ hàng trống</h3>
                    <Link to="/" className="btn-checkout-primary mt-3 d-inline-block">Mua sắm ngay</Link>
                </div>
            </div>
        );
    }

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSubmitting(true);
        try {
            const res = await orderApi.createOrder(form);
            if (res.success) {
                await clearCart();
                navigate(`/account/orders/${res.data.id}`, {
                    state: { orderCode: res.data.orderCode, success: true }
                });
            } else {
                setError(res.message || 'Đặt hàng thất bại.');
            }
        } catch (err) {
            setError(err.message || 'Đặt hàng thất bại, vui lòng thử lại.');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="checkout-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="checkout-breadcrumb">
                    <Link to="/cart">Giỏ hàng</Link>
                    <i className="bi bi-chevron-right"></i>
                    <span className="active">Thanh toán</span>
                </nav>

                <h1 className="checkout-title">
                    <i className="bi bi-credit-card me-2"></i>Thanh toán
                </h1>

                {error && (
                    <div className="checkout-error">
                        <i className="bi bi-exclamation-circle me-2"></i>{error}
                    </div>
                )}

                <form onSubmit={handleSubmit} id="form-checkout">
                    <div className="checkout-layout">
                        {/* ── Thông tin giao hàng ── */}
                        <div className="checkout-main">
                            <div className="checkout-section">
                                <h2 className="checkout-section__title">
                                    <i className="bi bi-geo-alt me-2"></i>Thông tin giao hàng
                                </h2>

                                <div className="form-row-2">
                                    <div className="form-group">
                                        <label htmlFor="fullName">Họ tên người nhận *</label>
                                        <input id="fullName" name="fullName" type="text"
                                            value={form.fullName} onChange={handleChange}
                                            placeholder="Nguyễn Văn A" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="phone">Số điện thoại *</label>
                                        <input id="phone" name="phone" type="tel"
                                            value={form.phone} onChange={handleChange}
                                            placeholder="0909xxxxxx" required />
                                    </div>
                                </div>

                                <div className="form-row-3">
                                    <div className="form-group">
                                        <label htmlFor="province">Tỉnh/Thành phố *</label>
                                        <input id="province" name="province" type="text"
                                            value={form.province} onChange={handleChange}
                                            placeholder="TP. Hồ Chí Minh" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="district">Quận/Huyện *</label>
                                        <input id="district" name="district" type="text"
                                            value={form.district} onChange={handleChange}
                                            placeholder="Quận 1" required />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="ward">Phường/Xã *</label>
                                        <input id="ward" name="ward" type="text"
                                            value={form.ward} onChange={handleChange}
                                            placeholder="Phường Bến Nghé" required />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="street">Địa chỉ cụ thể *</label>
                                    <input id="street" name="street" type="text"
                                        value={form.street} onChange={handleChange}
                                        placeholder="123 Đường ABC" required />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="note">Ghi chú đơn hàng (tùy chọn)</label>
                                    <textarea id="note" name="note" rows={3}
                                        value={form.note} onChange={handleChange}
                                        placeholder="Giao giờ hành chính, gọi trước khi giao..." />
                                </div>
                            </div>

                            {/* ── Phương thức thanh toán ── */}
                            <div className="checkout-section">
                                <h2 className="checkout-section__title">
                                    <i className="bi bi-wallet2 me-2"></i>Phương thức thanh toán
                                </h2>

                                <label className={`payment-option ${form.paymentMethod === 'cod' ? 'active' : ''}`}>
                                    <input type="radio" name="paymentMethod" value="cod"
                                        checked={form.paymentMethod === 'cod'}
                                        onChange={handleChange} />
                                    <div className="payment-option__icon">
                                        <i className="bi bi-cash-stack"></i>
                                    </div>
                                    <div>
                                        <div className="payment-option__name">Thanh toán khi nhận hàng (COD)</div>
                                        <div className="payment-option__desc">Kiểm tra hàng rồi mới trả tiền</div>
                                    </div>
                                </label>
                            </div>
                        </div>

                        {/* ── Tóm tắt đơn hàng ── */}
                        <div className="checkout-sidebar">
                            <div className="checkout-summary">
                                <h3 className="checkout-summary__title">Tóm tắt đơn hàng</h3>

                                <div className="checkout-items-list">
                                    {items.map(item => (
                                        <div key={`${item.productId}-${item.variantSku}`} className="checkout-item">
                                            <div className="checkout-item__img-wrap">
                                                {item.imageUrl
                                                    ? <img src={item.imageUrl} alt={item.name} />
                                                    : <div className="checkout-item__img-placeholder"><i className="bi bi-image"></i></div>
                                                }
                                                <span className="checkout-item__qty-badge">{item.quantity}</span>
                                            </div>
                                            <div className="checkout-item__info">
                                                <div className="checkout-item__name">{item.name}</div>
                                                {item.variantName && <div className="checkout-item__variant">{item.variantName}</div>}
                                            </div>
                                            <div className="checkout-item__price">
                                                {formatVND(item.price * item.quantity)}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="checkout-summary__row">
                                    <span>Tạm tính</span>
                                    <span>{formatVND(totalPrice)}</span>
                                </div>
                                <div className="checkout-summary__row">
                                    <span>Phí vận chuyển</span>
                                    {shippingFee === 0
                                        ? <span className="text-success fw-bold">Miễn phí</span>
                                        : <span>{formatVND(shippingFee)}</span>
                                    }
                                </div>
                                {discountFromCart > 0 && (
                                    <div className="checkout-summary__row">
                                        <span>
                                            <i className="bi bi-tag-fill me-1 text-success"></i>
                                            {couponFromCart}
                                        </span>
                                        <span className="text-success fw-bold">-{formatVND(discountFromCart)}</span>
                                    </div>
                                )}
                                <div className="checkout-summary__divider"></div>
                                <div className="checkout-summary__row checkout-summary__row--total">
                                    <span>Tổng cộng</span>
                                    <span className="checkout-summary__grand">{formatVND(grandTotal)}</span>
                                </div>

                                <button id="btn-place-order" type="submit" form="form-checkout"
                                    className="btn-place-order" disabled={submitting}>
                                    {submitting
                                        ? <><span className="spinner-border spinner-border-sm me-2"></span>Đang xử lý...</>
                                        : <><i className="bi bi-check-circle me-2"></i>Đặt hàng ngay</>
                                    }
                                </button>

                                <Link to="/cart" className="btn-back-to-cart">
                                    <i className="bi bi-arrow-left me-2"></i>Quay lại giỏ hàng
                                </Link>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
}
