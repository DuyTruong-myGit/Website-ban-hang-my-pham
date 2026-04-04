// AdminCoupons.jsx — TV3: Trang quản lý mã giảm giá /admin/coupons
import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import { couponApi } from '../../services/couponService';

const formatVND = (n) =>
    new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(n || 0);

const formatDate = (dt) => {
    if (!dt) return '—';
    return new Date(dt).toLocaleDateString('vi-VN');
};

const EMPTY_FORM = {
    code: '',
    description: '',
    discountType: 'percent',
    value: '',
    minOrderAmount: 0,
    maxDiscountAmount: '',
    usageLimit: '',
    expiresAt: '',
    isActive: true,
};

export default function AdminCoupons() {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState(EMPTY_FORM);
    const [submitting, setSubmitting] = useState(false);
    const [notification, setNotification] = useState(null);

    useEffect(() => { fetchCoupons(); }, []);

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await couponApi.adminGetAll();
            if (res.success) setCoupons(res.data || []);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const showNotif = (msg, type = 'success') => {
        setNotification({ msg, type });
        setTimeout(() => setNotification(null), 3000);
    };

    const openCreate = () => {
        setEditingId(null);
        setForm(EMPTY_FORM);
        setShowModal(true);
    };

    const openEdit = (coupon) => {
        setEditingId(coupon.id);
        setForm({
            code: coupon.code || '',
            description: coupon.description || '',
            discountType: coupon.discountType || 'percent',
            value: coupon.value ?? '',
            minOrderAmount: coupon.minOrderAmount ?? 0,
            maxDiscountAmount: coupon.maxDiscountAmount ?? '',
            usageLimit: coupon.usageLimit ?? '',
            expiresAt: coupon.expiresAt ? coupon.expiresAt.substring(0, 16) : '',
            isActive: coupon.isActive ?? true,
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Xác nhận xóa mã giảm giá này?')) return;
        try {
            const res = await couponApi.adminDelete(id);
            if (res.success) {
                setCoupons(prev => prev.filter(c => c.id !== id));
                showNotif('Đã xóa mã giảm giá.');
            }
        } catch (err) {
            showNotif(err.message, 'danger');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const payload = {
                ...form,
                value: parseFloat(form.value) || 0,
                minOrderAmount: parseFloat(form.minOrderAmount) || 0,
                maxDiscountAmount: form.maxDiscountAmount ? parseFloat(form.maxDiscountAmount) : null,
                usageLimit: form.usageLimit ? parseInt(form.usageLimit) : null,
                expiresAt: form.expiresAt || null,
            };

            let res;
            if (editingId) {
                res = await couponApi.adminUpdate(editingId, payload);
            } else {
                res = await couponApi.adminCreate(payload);
            }

            if (res.success) {
                showNotif(editingId ? 'Cập nhật thành công.' : 'Tạo mã giảm giá thành công.');
                setShowModal(false);
                fetchCoupons();
            } else {
                showNotif(res.message, 'danger');
            }
        } catch (err) {
            showNotif(err.message, 'danger');
        } finally {
            setSubmitting(false);
        }
    };

    const isExpired = (c) => c.expiresAt && new Date(c.expiresAt) < new Date();
    const isExhausted = (c) => c.usageLimit != null && c.usedCount >= c.usageLimit;

    const getStatusBadge = (coupon) => {
        if (!coupon.isActive) return <span className="admin-badge admin-badge-secondary">Vô hiệu</span>;
        if (isExpired(coupon)) return <span className="admin-badge admin-badge-warning">Hết hạn</span>;
        if (isExhausted(coupon)) return <span className="admin-badge admin-badge-danger">Hết lượt</span>;
        return <span className="admin-badge admin-badge-success">Đang dùng</span>;
    };

    const columns = [
        {
            header: 'Mã',
            render: (row) => (
                <code className="small text-danger bg-light px-2 py-1 rounded fw-bold">
                    {row.code}
                </code>
            )
        },
        {
            header: 'Mô tả',
            render: (row) => <span className="small text-muted">{row.description || '—'}</span>
        },
        {
            header: 'Giảm',
            render: (row) => (
                <span className="fw-bold text-danger">
                    {row.discountType === 'percent'
                        ? `${row.value}%${row.maxDiscountAmount ? ` (tối đa ${formatVND(row.maxDiscountAmount)})` : ''}`
                        : formatVND(row.value)
                    }
                </span>
            )
        },
        {
            header: 'Đơn tối thiểu',
            render: (row) => row.minOrderAmount > 0 ? formatVND(row.minOrderAmount) : '—'
        },
        {
            header: 'Đã dùng',
            render: (row) => (
                <span>{row.usedCount ?? 0}{row.usageLimit ? `/${row.usageLimit}` : ''}</span>
            )
        },
        {
            header: 'Hết hạn',
            render: (row) => formatDate(row.expiresAt)
        },
        {
            header: 'Trạng thái',
            render: (row) => getStatusBadge(row)
        },
        {
            header: 'Thao tác',
            render: (row) => (
                <div className="d-flex gap-1">
                    <button
                        className="btn btn-sm btn-outline-primary"
                        onClick={() => openEdit(row)}
                    >
                        Sửa
                    </button>
                    <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(row.id)}
                    >
                        Xóa
                    </button>
                </div>
            )
        }
    ];

    return (
        <AdminLayout>
            <div className="mb-4 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                    <h4 className="fw-bold mb-1 text-dark" style={{ letterSpacing: '-0.5px' }}>
                        Quản lý Mã giảm giá
                    </h4>
                    <p className="text-muted mb-0">Tạo và quản lý các mã khuyến mãi</p>
                </div>
                <button className="btn btn-primary" onClick={openCreate}>
                    <i className="bi bi-plus-lg me-1"></i> Thêm mã mới
                </button>
            </div>

            {notification && (
                <div className={`alert alert-${notification.type === 'success' ? 'success' : 'danger'} py-2 small`}>
                    {notification.msg}
                </div>
            )}

            {loading ? (
                <Loading message="Đang tải mã giảm giá..." />
            ) : (
                <DataTable
                    columns={columns}
                    data={coupons}
                    emptyMessage="Chưa có mã giảm giá nào."
                />
            )}

            {/* ── Modal tạo/sửa ── */}
            {showModal && (
                <div className="modal d-block" style={{ background: 'rgba(0,0,0,0.5)' }} onClick={() => setShowModal(false)}>
                    <div className="modal-dialog modal-lg modal-dialog-centered" onClick={e => e.stopPropagation()}>
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-0 pb-0">
                                <h5 className="modal-title fw-bold">
                                    {editingId ? 'Cập nhật mã giảm giá' : 'Tạo mã giảm giá mới'}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body">
                                    <div className="row g-3">
                                        {/* Mã coupon */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Mã giảm giá *</label>
                                            <input
                                                className="form-control"
                                                placeholder="VD: SUMMER20"
                                                value={form.code}
                                                onChange={e => setForm(f => ({ ...f, code: e.target.value.toUpperCase() }))}
                                                required
                                                disabled={!!editingId}
                                            />
                                        </div>

                                        {/* Loại giảm */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Loại giảm giá</label>
                                            <select
                                                className="form-select"
                                                value={form.discountType}
                                                onChange={e => setForm(f => ({ ...f, discountType: e.target.value }))}
                                            >
                                                <option value="percent">Theo % (phần trăm)</option>
                                                <option value="fixed">Số tiền cố định</option>
                                            </select>
                                        </div>

                                        {/* Giá trị */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">
                                                Giá trị giảm * {form.discountType === 'percent' ? '(%)' : '(VND)'}
                                            </label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder={form.discountType === 'percent' ? '20' : '50000'}
                                                value={form.value}
                                                onChange={e => setForm(f => ({ ...f, value: e.target.value }))}
                                                min="0"
                                                max={form.discountType === 'percent' ? 100 : undefined}
                                                required
                                            />
                                        </div>

                                        {/* Giảm tối đa (chỉ cho %) */}
                                        {form.discountType === 'percent' && (
                                            <div className="col-md-6">
                                                <label className="form-label fw-medium">Giảm tối đa (VND)</label>
                                                <input
                                                    type="number"
                                                    className="form-control"
                                                    placeholder="100000 (để trống = không giới hạn)"
                                                    value={form.maxDiscountAmount}
                                                    onChange={e => setForm(f => ({ ...f, maxDiscountAmount: e.target.value }))}
                                                    min="0"
                                                />
                                            </div>
                                        )}

                                        {/* Đơn tối thiểu */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Đơn hàng tối thiểu (VND)</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="0 = không giới hạn"
                                                value={form.minOrderAmount}
                                                onChange={e => setForm(f => ({ ...f, minOrderAmount: e.target.value }))}
                                                min="0"
                                            />
                                        </div>

                                        {/* Giới hạn lượt */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Giới hạn lượt dùng</label>
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Để trống = không giới hạn"
                                                value={form.usageLimit}
                                                onChange={e => setForm(f => ({ ...f, usageLimit: e.target.value }))}
                                                min="1"
                                            />
                                        </div>

                                        {/* Ngày hết hạn */}
                                        <div className="col-md-6">
                                            <label className="form-label fw-medium">Ngày hết hạn</label>
                                            <input
                                                type="datetime-local"
                                                className="form-control"
                                                value={form.expiresAt}
                                                onChange={e => setForm(f => ({ ...f, expiresAt: e.target.value }))}
                                            />
                                        </div>

                                        {/* Mô tả */}
                                        <div className="col-12">
                                            <label className="form-label fw-medium">Mô tả</label>
                                            <input
                                                className="form-control"
                                                placeholder="Giảm 20% cho đơn từ 300k..."
                                                value={form.description}
                                                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                                            />
                                        </div>

                                        {/* Kích hoạt */}
                                        <div className="col-12">
                                            <div className="form-check form-switch">
                                                <input
                                                    type="checkbox"
                                                    className="form-check-input"
                                                    id="coupon-active"
                                                    checked={form.isActive}
                                                    onChange={e => setForm(f => ({ ...f, isActive: e.target.checked }))}
                                                />
                                                <label className="form-check-label fw-medium" htmlFor="coupon-active">
                                                    Kích hoạt mã giảm giá
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0">
                                    <button type="button" className="btn btn-outline-secondary" onClick={() => setShowModal(false)}>
                                        Hủy
                                    </button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting
                                            ? <><span className="spinner-border spinner-border-sm me-1"></span>Đang lưu...</>
                                            : editingId ? 'Cập nhật' : 'Tạo mã'
                                        }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
