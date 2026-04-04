import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { useAuth } from '../../context/AuthContext';

const StaffOrders = () => {
    const { authAxios } = useAuth();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [statusFilter, setStatusFilter] = useState('');

    const fetchOrders = async (currentPage = 0) => {
        setLoading(true);
        try {
            let url = `/admin/orders?page=${currentPage}&limit=20`;
            if (statusFilter) url += `&status=${statusFilter}`;

            const res = await authAxios.get(url);
            if (res.data.success) {
                setOrders(res.data.data);
                if (res.data.pagination) {
                    setTotalPages(res.data.pagination.totalPages);
                }
            }
        } catch (err) {
            console.error('Lỗi tải đơn hàng:', err);
            setOrders([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders(page);
    }, [page, statusFilter]);

    const handleStatusChange = async (orderId, newStatus) => {
        try {
            await authAxios.put(`/admin/orders/${orderId}/status`, { status: newStatus });
            fetchOrders(page);
        } catch (err) {
            alert('Lỗi cập nhật trạng thái: ' + (err.response?.data?.message || err.message));
        }
    };

    const statusMap = {
        pending:   { label: 'Chờ xác nhận', color: 'warning'  },
        confirmed: { label: 'Đã xác nhận',  color: 'info'     },
        shipping:  { label: 'Đang giao',    color: 'primary'  },
        delivered: { label: 'Đã giao',      color: 'success'  },
        cancelled: { label: 'Đã hủy',       color: 'danger'   },
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    const columns = [
        {
            header: 'Mã đơn',
            render: (row) => <code className="small text-danger bg-light px-2 py-1 rounded fw-bold">{row.orderCode || row.order_code || '—'}</code>
        },
        {
            header: 'Khách hàng',
            render: (row) => {
                const addr = row.shippingAddress || row.shipping_address;
                return addr ? (
                    <div>
                        <div className="fw-medium text-dark">{addr.full_name || addr.fullName}</div>
                        <small className="text-muted">{addr.phone}</small>
                    </div>
                ) : '—';
            }
        },
        {
            header: 'Tổng tiền',
            render: (row) => <span className="fw-bold text-danger">{formatPrice(row.total)}</span>
        },
        {
            header: 'Trạng thái',
            render: (row) => {
                const status = statusMap[row.status] || { label: row.status, color: 'secondary' };
                return <span className={`admin-badge admin-badge-${status.color}`}>{status.label}</span>;
            }
        },
        {
            header: 'Ngày đặt',
            render: (row) => {
                const date = row.createdAt || row.created_at;
                return date ? new Date(date).toLocaleDateString('vi-VN') : '—';
            }
        },
        {
            header: 'Đổi trạng thái',
            render: (row) => {
                if (row.status === 'delivered' || row.status === 'cancelled') {
                    return <span className="text-muted small">Hoàn tất</span>;
                }
                const nextStatusMap = {
                    pending:   'confirmed',
                    confirmed: 'shipping',
                    shipping:  'delivered',
                };
                const nextStatus = nextStatusMap[row.status];
                const nextLabel = statusMap[nextStatus]?.label || nextStatus;

                return (
                    <div className="d-flex gap-1 flex-wrap">
                        {nextStatus && (
                            <button
                                className="btn btn-sm btn-outline-success"
                                onClick={() => handleStatusChange(row.id || row._id, nextStatus)}
                            >
                                → {nextLabel}
                            </button>
                        )}
                        {row.status !== 'cancelled' && (
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={() => handleStatusChange(row.id || row._id, 'cancelled')}
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
        return (
            <AdminLayout>
                <Loading message="Đang tải đơn hàng..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-4">
                <h4 className="fw-bold mb-1 text-dark" style={{letterSpacing: '-0.5px'}}>Xử lý Đơn hàng</h4>
                <p className="text-muted mb-0">Xem và cập nhật trạng thái đơn hàng</p>
            </div>

            {/* Status Filter */}
            <div className="admin-card mb-4 p-3 bg-white d-flex gap-2 flex-wrap">
                <button
                    className={`btn btn-sm ${!statusFilter ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setStatusFilter('')}
                >
                    Tất cả
                </button>
                {Object.entries(statusMap).map(([key, val]) => (
                    <button
                        key={key}
                        className={`btn btn-sm ${statusFilter === key ? `btn-${val.color}` : `btn-outline-${val.color}`}`}
                        onClick={() => setStatusFilter(key)}
                    >
                        {val.label}
                    </button>
                ))}
            </div>

            <DataTable
                columns={columns}
                data={orders}
                emptyMessage="Không có đơn hàng nào."
            />

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </AdminLayout>
    );
};

export default StaffOrders;
