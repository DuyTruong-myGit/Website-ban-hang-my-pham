// OrderDetail.jsx — TV3: Trang chi tiết đơn hàng /account/orders/:id
import React, { useState, useEffect } from 'react';
import { Link, useParams, useLocation } from 'react-router-dom';
import { orderApi } from '../services/orderService';
import usePageTitle from '../hooks/usePageTitle';
import './Orders.css';

const formatVND = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const STATUS_MAP = {
    pending:   { label: 'Chờ xác nhận', icon: 'bi-clock',          color: '#f59e0b' },
    confirmed: { label: 'Đã xác nhận',  icon: 'bi-check-circle',    color: '#3b82f6' },
    shipping:  { label: 'Đang giao',    icon: 'bi-truck',            color: '#8b5cf6' },
    delivered: { label: 'Đã giao',      icon: 'bi-bag-check',        color: '#10b981' },
    cancelled: { label: 'Đã hủy',       icon: 'bi-x-circle',        color: '#ef4444' },
};

export default function OrderDetail() {
    const { id } = useParams();
    const location = useLocation();
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(true);
    usePageTitle(order ? `Đơn hàng ${order.orderCode}` : 'Chi tiết đơn hàng');
    const [error, setError] = useState('');

    const justOrdered = location.state?.success;

    useEffect(() => {
        fetchOrder();
    }, [id]);

    const fetchOrder = async () => {
        try {
            const res = await orderApi.getOrderById(id);
            if (res.success) setOrder(res.data);
            else setError(res.message);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="orders-page">
                <div className="orders-loading">
                    <div className="spinner-border text-primary"></div>
                    <p>Đang tải chi tiết đơn hàng...</p>
                </div>
            </div>
        );
    }

    if (error || !order) {
        return (
            <div className="orders-page">
                <div className="container">
                    <div className="orders-empty">
                        <i className="bi bi-exclamation-circle"></i>
                        <h3>{error || 'Không tìm thấy đơn hàng'}</h3>
                        <Link to="/account/orders" className="orders-btn-primary">Về lịch sử đơn hàng</Link>
                    </div>
                </div>
            </div>
        );
    }

    const statusInfo = STATUS_MAP[order.status] || { label: order.status, icon: 'bi-circle', color: '#6c757d' };

    return (
        <div className="orders-page">
            <div className="container">
                {/* Breadcrumb */}
                <nav className="checkout-breadcrumb" style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                    <Link to="/account/orders">Đơn hàng của tôi</Link>
                    <i className="bi bi-chevron-right mx-1"></i>
                    <span>{order.orderCode}</span>
                </nav>

                {/* Success banner */}
                {justOrdered && (
                    <div style={{
                        background: '#d1fae5', color: '#065f46', border: '1px solid #6ee7b7',
                        borderRadius: '12px', padding: '1rem 1.5rem', marginBottom: '1.5rem',
                        display: 'flex', alignItems: 'center', gap: '0.75rem'
                    }}>
                        <i className="bi bi-check-circle-fill fs-4"></i>
                        <div>
                            <strong>Đặt hàng thành công!</strong>
                            <p style={{ margin: 0, fontSize: '0.85rem' }}>
                                Mã đơn hàng: <strong>{order.orderCode}</strong>. Chúng tôi sẽ xác nhận sớm nhất có thể.
                            </p>
                        </div>
                    </div>
                )}

                <div className="od-layout">
                    {/* Left */}
                    <div>
                        {/* Status Timeline */}
                        <div className="od-section">
                            <h2 className="od-section__title">Trạng thái đơn hàng</h2>
                            <div className="od-timeline">
                                {order.statusHistory?.map((h, i) => {
                                    const s = STATUS_MAP[h.status] || { label: h.status, icon: 'bi-circle', color: '#6c757d' };
                                    return (
                                        <div key={i} className="od-timeline-item">
                                            <div className="od-timeline-dot" style={{ background: s.color }}>
                                                <i className={`bi ${s.icon}`}></i>
                                            </div>
                                            <div className="od-timeline-content">
                                                <div className="od-timeline-status">{s.label}</div>
                                                {h.note && <div className="od-timeline-note">{h.note}</div>}
                                                <div className="od-timeline-date">
                                                    {new Date(h.changedAt).toLocaleString('vi-VN')}
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            {order.trackingCode && (
                                <div style={{ marginTop: '1rem', padding: '0.75rem', background: '#f0fdf4', borderRadius: '10px', fontSize: '0.88rem' }}>
                                    <i className="bi bi-truck me-2 text-success"></i>
                                    Mã vận đơn: <strong>{order.trackingCode}</strong>
                                </div>
                            )}
                        </div>

                        {/* Sản phẩm */}
                        <div className="od-section">
                            <h2 className="od-section__title">Sản phẩm đã đặt</h2>
                            {order.items?.map((item, i) => (
                                <div key={i} className="order-card__item">
                                    {item.imageUrl
                                        ? <img src={item.imageUrl} alt={item.name} />
                                        : <div className="order-card__item-placeholder"><i className="bi bi-image"></i></div>
                                    }
                                    <div className="order-card__item-info">
                                        <span className="order-card__item-name">{item.name}</span>
                                        {item.variantName && <span className="order-card__item-variant">{item.variantName}</span>}
                                        <span className="order-card__item-qty">{formatVND(item.price)} × {item.quantity}</span>
                                    </div>
                                    <span className="order-card__item-price">{formatVND(item.lineTotal)}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right */}
                    <div>
                        {/* Thông tin giao hàng */}
                        <div className="od-section">
                            <h2 className="od-section__title">
                                <i className="bi bi-geo-alt me-2"></i>Địa chỉ giao hàng
                            </h2>
                            {order.shippingAddress && (
                                <div className="od-address">
                                    <strong>{order.shippingAddress.fullName}</strong>
                                    <span>{order.shippingAddress.phone}</span>
                                    <span>
                                        {order.shippingAddress.street}, {order.shippingAddress.ward},&nbsp;
                                        {order.shippingAddress.district}, {order.shippingAddress.province}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Thanh toán */}
                        <div className="od-section">
                            <h2 className="od-section__title">
                                <i className="bi bi-receipt me-2"></i>Tóm tắt thanh toán
                            </h2>
                            <div className="od-payment-row"><span>Tạm tính</span><span>{formatVND(order.subtotal)}</span></div>
                            <div className="od-payment-row"><span>Phí vận chuyển</span><span>{formatVND(order.shippingFee)}</span></div>
                            {order.discount > 0 && (
                                <div className="od-payment-row"><span>Giảm giá</span><span className="text-success">-{formatVND(order.discount)}</span></div>
                            )}
                            <div className="od-payment-divider"></div>
                            <div className="od-payment-row od-payment-row--total">
                                <span>Tổng thanh toán</span>
                                <span>{formatVND(order.total)}</span>
                            </div>
                            <div className="od-payment-method">
                                <i className="bi bi-cash-stack me-2"></i>
                                {order.paymentMethod === 'cod' ? 'Thanh toán khi nhận hàng (COD)' : order.paymentMethod}
                            </div>
                        </div>

                        <Link to="/account/orders" className="orders-btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                            <i className="bi bi-arrow-left me-2"></i>Về lịch sử đơn hàng
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
