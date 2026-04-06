// AdminOrders.jsx — TV3: Trang quản lý đơn hàng cho Admin /admin/orders
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';
import usePageTitle from '../../hooks/usePageTitle';

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
    const { authAxios } = useAuth();
    const [orders,      setOrders]      = useState([]);
    const [loading,     setLoading]     = useState(true);
    const [error,       setError]       = useState('');
    const [page,        setPage]        = useState(0);
    const [totalPages,  setTotalPages]  = useState(0);
    const [statusFilter,setStatusFilter]= useState('');
    const [updating,    setUpdating]    = useState(null);
    const [notification,setNotification]= useState(null);

    // Tracking code modal state
    const [trackingModal, setTrackingModal] = useState(null); // { orderId, nextStatus }
    const [trackingInput, setTrackingInput] = useState('');

    useEffect(() => { fetchOrders(0); }, [statusFilter]);

    const fetchOrders = async (p = 0) => {
        setLoading(true);
        setError('');
        try {
            let url = `/admin/orders?page=${p}&limit=20`;
            if (statusFilter) url += `&status=${statusFilter}`;
            const res = await authAxios.get(url);
            if (res.data.success) {
                setOrders(res.data.data || []);
                setPage(p);
                if (res.data.pagination) setTotalPages(res.data.pagination.totalPages);
            } else {
                setError(res.data.message || 'Không tải được dữ liệu.');
            }
        } catch (err) {
            console.error('AdminOrders fetch error:', err);
            setError(err.response?.data?.message || err.message || 'Lỗi kết nối server.');
        } finally {
            setLoading(false);
        }
    };

    const showNotification = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const handleUpdateStatus = async (orderId, newStatus) => {
        // Nếu chuyển sang 'shipping' → mở modal nhập mã vận đơn
        if (newStatus === 'shipping') {
            setTrackingModal({ orderId, nextStatus: newStatus });
            setTrackingInput('');
            return;
        }
        if (!window.confirm(`Xác nhận chuyển sang trạng thái: ${STATUS_MAP[newStatus]?.label || newStatus}?`)) return;
        await submitStatusUpdate(orderId, newStatus, '');
    };

    const handleTrackingSubmit = async () => {
        if (!trackingModal) return;
        await submitStatusUpdate(trackingModal.orderId, trackingModal.nextStatus, trackingInput);
        setTrackingModal(null);
        setTrackingInput('');
    };

    const submitStatusUpdate = async (orderId, newStatus, trackingCode) => {
        setUpdating(orderId);
        try {
            const res = await authAxios.put(`/admin/orders/${orderId}/status`, {
                status: newStatus,
                trackingCode: trackingCode || undefined
            });
            if (res.data.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? res.data.data : o));
                showNotification('Cập nhật trạng thái thành công.');
            } else {
                showNotification(res.data.message, 'error');
            }
        } catch (err) {
            showNotification(err.response?.data?.message || err.message, 'error');
        } finally {
            setUpdating(null);
        }
    };

    const handleCancel = async (orderId) => {
        if (!window.confirm('Xác nhận HỦY đơn hàng này?')) return;
        setUpdating(orderId);
        try {
            const res = await authAxios.put(`/admin/orders/${orderId}/status`, { status: 'cancelled', note: 'Admin hủy đơn' });
            if (res.data.success) {
                setOrders(prev => prev.map(o => o.id === orderId ? res.data.data : o));
                showNotification('Đã hủy đơn hàng.');
            } else {
                showNotification(res.data.message, 'error');
            }
        } catch (err) {
            showNotification(err.response?.data?.message || err.message, 'error');
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
            header: 'Mã vận đơn',
            render: (row) => row.trackingCode
                ? <code className="small text-success bg-light px-1 rounded">{row.trackingCode}</code>
                : <span className="text-muted small">—</span>
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

            {/* Error */}
            {error && (
                <div className="alert alert-danger d-flex align-items-center gap-2 small">
                    <i className="bi bi-exclamation-triangle-fill"></i>
                    <span>{error}</span>
                    <button className="btn btn-sm btn-outline-danger ms-auto" onClick={() => fetchOrders(page)}>
                        Thử lại
                    </button>
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

            {/* ── Modal nhập mã vận đơn ── */}
            {trackingModal && (
                <div
                    className="modal d-block"
                    style={{ background: 'rgba(0,0,0,0.5)' }}
                    onClick={() => setTrackingModal(null)}
                >
                    <div
                        className="modal-dialog modal-dialog-centered"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0">
                                <h5 className="modal-title fw-bold">
                                    <i className="bi bi-truck me-2 text-primary"></i>
                                    Xác nhận giao hàng
                                </h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={() => setTrackingModal(null)}
                                ></button>
                            </div>
                            <div className="modal-body">
                                <p className="text-muted small mb-3">
                                    Nhập mã vận đơn trước khi chuyển trạng thái sang <strong>Đang giao hàng</strong>.
                                    Bạn có thể bỏ trống nếu chưa có mã.
                                </p>
                                <label className="form-label fw-medium">Mã vận đơn</label>
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="VD: GHN123456789, GHTK987654..."
                                    value={trackingInput}
                                    onChange={e => setTrackingInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && handleTrackingSubmit()}
                                    autoFocus
                                />
                            </div>
                            <div className="modal-footer border-0">
                                <button
                                    type="button"
                                    className="btn btn-outline-secondary"
                                    onClick={() => setTrackingModal(null)}
                                >
                                    Hủy
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-primary"
                                    onClick={handleTrackingSubmit}
                                    disabled={updating === trackingModal.orderId}
                                >
                                    {updating === trackingModal.orderId
                                        ? <><span className="spinner-border spinner-border-sm me-1"></span>Đang lưu...</>
                                        : <><i className="bi bi-truck me-1"></i>Xác nhận giao hàng</>
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
