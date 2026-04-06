// Orders.jsx — TV3: Trang lịch sử đơn hàng /account/orders
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { orderApi } from '../services/orderService';
import usePageTitle from '../hooks/usePageTitle';
import './Orders.css';

const formatVND = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const STATUS_MAP = {
    pending:   { label: 'Chờ xác nhận', color: '#f59e0b', bg: '#fffbeb' },
    confirmed: { label: 'Đã xác nhận',  color: '#3b82f6', bg: '#eff6ff' },
    shipping:  { label: 'Đang giao',    color: '#8b5cf6', bg: '#f5f3ff' },
    delivered: { label: 'Đã giao',      color: '#10b981', bg: '#f0fdf4' },
    cancelled: { label: 'Đã hủy',       color: '#ef4444', bg: '#fef2f2' },
};

const TABS = [
    { key: '', label: 'Tất cả' },
    { key: 'pending',   label: 'Chờ xác nhận' },
    { key: 'confirmed', label: 'Đã xác nhận' },
    { key: 'shipping',  label: 'Đang giao' },
    { key: 'delivered', label: 'Đã giao' },
    { key: 'cancelled', label: 'Đã hủy' },
];

const StatusBadge = ({ status }) => {
    const s = STATUS_MAP[status] || { label: status, color: '#6c757d', bg: '#f8f9fa' };
    return (
        <span className="order-status-badge" style={{ color: s.color, background: s.bg }}>
            {s.label}
        </span>
    );
};

export default function Orders() {
    usePageTitle('Đơn Hàng Của Tôi');
    const { token } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('');
    const [cancellingId, setCancellingId] = useState(null);

    useEffect(() => {
        if (!token) return;
        fetchOrders();
    }, [token]);

    const fetchOrders = async () => {
        setLoading(true);
        try {
            const res = await orderApi.getMyOrders();
            if (res.success) setOrders(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async (orderId) => {
        if (!window.confirm('Bạn có chắc muốn hủy đơn hàng này?')) return;
        setCancellingId(orderId);
        try {
            const res = await orderApi.cancelOrder(orderId);
            if (res.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
            } else {
                alert(res.message);
            }
        } catch (err) {
            alert(err.message);
        } finally {
            setCancellingId(null);
        }
    };

    if (!token) {
        return (
            <div className="orders-page">
                <div className="container text-center py-5">
                    <i className="bi bi-lock fs-1 text-muted"></i>
                    <h3 className="mt-3">Vui lòng đăng nhập</h3>
                    <Link to="/login" className="orders-btn-primary mt-3 d-inline-block">Đăng nhập</Link>
                </div>
            </div>
        );
    }

    const filteredOrders = activeTab
        ? orders.filter(o => o.status === activeTab)
        : orders;

    return (
        <div className="orders-page">
            <div className="container">
                <h1 className="orders-title">
                    <i className="bi bi-bag-check me-2"></i>Đơn hàng của tôi
                </h1>

                {/* Tabs */}
                <div className="orders-tabs">
                    {TABS.map(tab => (
                        <button
                            key={tab.key}
                            className={`orders-tab ${activeTab === tab.key ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            {tab.label}
                            {tab.key === '' && orders.length > 0 && (
                                <span className="orders-tab__count">{orders.length}</span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Loading */}
                {loading ? (
                    <div className="orders-loading">
                        <div className="spinner-border text-primary"></div>
                        <p>Đang tải đơn hàng...</p>
                    </div>
                ) : filteredOrders.length === 0 ? (
                    <div className="orders-empty">
                        <i className="bi bi-bag-x"></i>
                        <h3>Chưa có đơn hàng nào</h3>
                        <p>{activeTab ? 'Không có đơn hàng ở trạng thái này.' : 'Bạn chưa đặt hàng lần nào.'}</p>
                        <Link to="/" className="orders-btn-primary">Mua sắm ngay</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {filteredOrders.map(order => (
                            <div key={order.id} className="order-card">
                                {/* Header */}
                                <div className="order-card__header">
                                    <div className="order-card__code">
                                        <i className="bi bi-receipt me-1"></i>
                                        {order.orderCode}
                                    </div>
                                    <StatusBadge status={order.status} />
                                </div>

                                {/* Items preview */}
                                <div className="order-card__items">
                                    {order.items?.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="order-card__item">
                                            {item.imageUrl
                                                ? <img src={item.imageUrl} alt={item.name} />
                                                : <div className="order-card__item-placeholder"><i className="bi bi-image"></i></div>
                                            }
                                            <div className="order-card__item-info">
                                                <span className="order-card__item-name">{item.name}</span>
                                                {item.variantName && <span className="order-card__item-variant">{item.variantName}</span>}
                                                <span className="order-card__item-qty">x{item.quantity}</span>
                                            </div>
                                            <span className="order-card__item-price">{formatVND(item.lineTotal)}</span>
                                        </div>
                                    ))}
                                    {order.items?.length > 3 && (
                                        <p className="order-card__more">+{order.items.length - 3} sản phẩm khác</p>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="order-card__footer">
                                    <div className="order-card__meta">
                                        <span className="order-card__date">
                                            <i className="bi bi-calendar3 me-1"></i>
                                            {new Date(order.createdAt).toLocaleDateString('vi-VN')}
                                        </span>
                                        <span className="order-card__total">
                                            Tổng: <strong>{formatVND(order.total)}</strong>
                                        </span>
                                    </div>
                                    <div className="order-card__actions">
                                        {order.status === 'pending' && (
                                            <button
                                                className="order-card__btn order-card__btn--cancel"
                                                onClick={() => handleCancel(order.id)}
                                                disabled={cancellingId === order.id}
                                            >
                                                {cancellingId === order.id ? 'Đang hủy...' : 'Hủy đơn'}
                                            </button>
                                        )}
                                        <Link
                                            to={`/account/orders/${order.id}`}
                                            className="order-card__btn order-card__btn--detail"
                                        >
                                            Xem chi tiết
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
