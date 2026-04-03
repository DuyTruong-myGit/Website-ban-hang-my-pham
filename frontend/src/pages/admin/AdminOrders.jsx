// AdminOrders.jsx — TV3: Trang quản lý đơn hàng cho Admin /admin/orders
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { orderApi } from '../../services/orderService';

const formatVND = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const STATUS_MAP = {
    pending:   { label: 'Chờ xác nhận', color: 'warning' },
    confirmed: { label: 'Đã xác nhận',  color: 'info'    },
    shipping:  { label: 'Đang giao',    color: 'primary'  },
    delivered: { label: 'Đã giao',      color: 'success'  },
    cancelled: { label: 'Đã hủy',       color: 'danger'   },
};

const NEXT_STATUS = {
    pending:   'confirmed',
    confirmed: 'shipping',
    shipping:  'delivered',
};

export default function AdminOrders() {
    const [orders,      setOrders]      = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [page,        setPage]        = useState(0);
    const [totalPages,  setTotalPages]  = useState(0);
    const [statusFilter,setStatusFilter]= useState('');
    const [updating,    setUpdating]    = useState(null);
    const [notification,setNotification]= useState(null);

    useEffect(() => { fetchOrders(0); }, [statusFilter]);

    const fetchOrders = async (p = 0) => {
        setLoading(true);
        try {
            const res = await orderApi.getAllOrders(statusFilter, p, 20);
            if (res.success) {
                setOrders(res.data || []);
                setPage(p);
                if (res.pagination) setTotalPages(res.pagination.totalPages);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        if (!window.confirm(`Xác nhận chuyển sang trạng thái: ${STATUS_MAP[newStatus]?.label || newStatus}?`)) return;
        setUpdating(orderId);
        try {
            const res = await orderApi.updateOrderStatus(orderId, newStatus);
            if (res.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
                showNotification('Cập nhật trạng thái thành công.');
            } else {
                showNotification(res.message, 'error');
            }
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setUpdating(null);
        }
    };

    const handleCancel = async (orderId) => {
        if (!window.confirm('Xác nhận HỦY đơn hàng này?')) return;
        setUpdating(orderId);
        try {
            const res = await orderApi.updateOrderStatus(orderId, 'cancelled', 'Admin hủy đơn');
            if (res.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? res.data : o));
                showNotification('Đã hủy đơn hàng.');
            } else {
                showNotification(res.message, 'error');
            }
        } catch (err) {
            showNotification(err.message, 'error');
        } finally {
            setUpdating(null);
        }
    };

    const columns = [
        {
            header: 'Mã đơn',
            render: (row) => (
                <code className="small text-danger bg-light px-2 py-1 rounded fw-bold">
                    {row.orderCode || '—'}
                </code>
            )
        },
        {
            header: 'Khách hàng',
            render: (row) => {
                const addr = row.shippingAddress;
                return addr ? (
                    <div>
                        <div className="fw-medium text-dark">{addr.fullName}</div>
                        <small className="text-muted">{addr.phone}</small>
                    </div>
                ) : '—';
            }
        },
        {
            header: 'Sản phẩm',
            render: (row) => (
                <span className="text-muted small">{row.items?.length || 0} sản phẩm</span>
            )
        },
        {
            header: 'Tổng tiền',
            render: (row) => <span className="fw-bold text-danger">{formatVND(row.total)}</span>
        },
        {
            header: 'Trạng thái',
            render: (row) => {
                const s = STATUS_MAP[row.status] || { label: row.status, color: 'secondary' };
                return <span className={`admin-badge admin-badge-${s.color}`}>{s.label}</span>;
            }
        },
        {
            header: 'Ngày đặt',
            render: (row) => row.createdAt
                ? new Date(row.createdAt).toLocaleDateString('vi-VN')
                : '—'
        },
        {
            header: 'Thao tác',
            render: (row) => {
                const isUpdating = updating === row.id;
                const nextStatus = NEXT_STATUS[row.status];
                const isDone = row.status === 'delivered' || row.status === 'cancelled';

                if (isDone) {
                    return <span className="text-muted small">Hoàn tất</span>;
                }

                return (
                    <div className="d-flex gap-1 flex-wrap">
                        {nextStatus && (
                            <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleUpdateStatus(row.id, nextStatus)}
                                disabled={isUpdating}
                            >
                                {isUpdating ? '...' : `→ ${STATUS_MAP[nextStatus]?.label}`}
                            </button>
                        )}
                        {row.status !== 'cancelled' && (
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleCancel(row.id)}
                                disabled={isUpdating}
                            >
                                Hủy
                            </button>
                        )}
                    </div>
                );
            }
        }
    ];

    if (loading && orders.length === 0) {
        return <AdminLayout><Loading message="Đang tải đơn hàng..." /></AdminLayout>;
    }

    return (
        <AdminLayout>
            <div className="mb-4">
                <h4 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>Quản lý Đơn hàng</h4>
                <p className="text-muted mb-0">Xem và xử lý tất cả đơn hàng trong hệ thống</p>
            </div>

            {/* Notification */}
            {notification && (
                <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} py-2 small`}>
                    {notification.msg}
                </div>
            )}

            {/* Status Filter */}
            <div className="admin-card mb-4 p-3 bg-white d-flex gap-2 flex-wrap">
                <button className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter('')}>Tất cả</button>
                {Object.entries(STATUS_MAP).map(([key, val]) => (
                    <button key={key}
                        className={`btn btn-sm ${statusFilter === key ? `btn-${val.color}` : `btn-outline-${val.color}`}`}
                        onClick={() => setStatusFilter(key)}>
                        {val.label}
                    </button>
                ))}
            </div>

            <DataTable columns={columns} data={orders} emptyMessage="Không có đơn hàng nào." />
            <Pagination page={page} totalPages={totalPages} onPageChange={(p) => fetchOrders(p)} />
        </AdminLayout>
    );
}
