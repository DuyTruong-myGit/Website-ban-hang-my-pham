// NotificationsPage.jsx — TV4: Trang thông báo khách hàng
import React, { useState, useEffect } from 'react';
import { Container, Breadcrumb, Button, Badge, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { notificationApi } from '../services/notificationService';
import { useAuth } from '../context/AuthContext';

const NotificationsPage = () => {
    const { token } = useAuth();
    const navigate = useNavigate();
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        loadNotifications();
    }, [token]);

    const loadNotifications = async () => {
        try {
            const res = await notificationApi.getNotifications();
            if (res.success) {
                setNotifications(res.data.notifications || []);
                setUnreadCount(res.data.unreadCount || 0);
            }
        } catch (err) {
            console.error('Lỗi load notifications:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkRead = async (id) => {
        try {
            await notificationApi.markAsRead(id);
            setNotifications(prev => prev.map(n =>
                n.id === id ? { ...n, isRead: true } : n
            ));
            setUnreadCount(prev => Math.max(0, prev - 1));
        } catch (err) {
            console.error('Lỗi:', err);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await notificationApi.markAllAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
            setUnreadCount(0);
        } catch (err) {
            console.error('Lỗi:', err);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '';
        try {
            let d;
            if (Array.isArray(dateStr)) {
                const [y, m, day, h = 0, min = 0] = dateStr;
                d = new Date(y, m - 1, day, h, min);
            } else {
                d = new Date(dateStr);
            }
            const now = new Date();
            const diff = now - d;
            if (diff < 60000) return 'Vừa xong';
            if (diff < 3600000) return `${Math.floor(diff / 60000)} phút trước`;
            if (diff < 86400000) return `${Math.floor(diff / 3600000)} giờ trước`;
            return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return ''; }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'order_status': return { icon: 'bi-bag-check', color: '#3b82f6' };
            case 'review_reply': return { icon: 'bi-star', color: '#f59e0b' };
            case 'question_answered': return { icon: 'bi-question-circle', color: '#8b5cf6' };
            case 'chat': return { icon: 'bi-chat-dots', color: '#10b981' };
            case 'promotion': return { icon: 'bi-tag', color: '#ef4444' };
            default: return { icon: 'bi-bell', color: '#6b7280' };
        }
    };

    return (
        <main className="bg-hasaki-bg-gray pb-5 pt-3" style={{ minHeight: '80vh' }}>
            <Container>
                <Breadcrumb className="bg-white px-3 py-2 rounded shadow-sm mb-3 small">
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Trang chủ</Breadcrumb.Item>
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/account/profile' }}>Tài khoản</Breadcrumb.Item>
                    <Breadcrumb.Item active>Thông báo</Breadcrumb.Item>
                </Breadcrumb>

                <div className="bg-white p-4 rounded shadow-sm">
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <h4 className="fw-bold mb-0">
                            <i className="bi bi-bell me-2 text-primary"></i>
                            Thông báo
                            {unreadCount > 0 && (
                                <Badge bg="danger" className="ms-2" style={{ fontSize: '0.7rem' }}>
                                    {unreadCount} mới
                                </Badge>
                            )}
                        </h4>
                        {unreadCount > 0 && (
                            <Button variant="outline-primary" size="sm" onClick={handleMarkAllRead}>
                                <i className="bi bi-check2-all me-1"></i>Đọc tất cả
                            </Button>
                        )}
                    </div>

                    {loading ? (
                        <div className="text-center py-5 text-muted">Đang tải...</div>
                    ) : notifications.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-bell-slash fs-1 d-block mb-3 text-muted opacity-25"></i>
                            <p className="text-muted">Bạn chưa có thông báo nào.</p>
                        </div>
                    ) : (
                        <div>
                            {notifications.map((notif) => {
                                const { icon, color } = getIcon(notif.type);
                                return (
                                    <div
                                        key={notif.id}
                                        className={`d-flex gap-3 p-3 border-bottom ${!notif.isRead ? 'bg-light' : ''}`}
                                        style={{
                                            cursor: 'pointer',
                                            transition: 'background 0.2s',
                                            borderLeft: !notif.isRead ? `3px solid ${color}` : '3px solid transparent',
                                        }}
                                        onClick={() => {
                                            if (!notif.isRead) handleMarkRead(notif.id);
                                            if (notif.link) navigate(notif.link);
                                        }}
                                        onMouseEnter={(e) => e.currentTarget.style.background = '#f8f9fa'}
                                        onMouseLeave={(e) => e.currentTarget.style.background = !notif.isRead ? '#f0f7f4' : ''}
                                    >
                                        <div
                                            className="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0"
                                            style={{
                                                width: 40, height: 40,
                                                background: `${color}15`,
                                                color: color,
                                            }}>
                                            <i className={`bi ${icon}`}></i>
                                        </div>
                                        <div className="flex-grow-1">
                                            <div className="d-flex justify-content-between">
                                                <div className="fw-bold" style={{ fontSize: '0.9rem' }}>
                                                    {notif.title}
                                                    {!notif.isRead && (
                                                        <span className="ms-2">
                                                            <i className="bi bi-circle-fill text-primary" style={{ fontSize: '0.5rem' }}></i>
                                                        </span>
                                                    )}
                                                </div>
                                                <small className="text-muted flex-shrink-0">{formatDate(notif.createdAt)}</small>
                                            </div>
                                            <div className="text-muted" style={{ fontSize: '0.85rem' }}>
                                                {notif.message}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </Container>
        </main>
    );
};

export default NotificationsPage;
