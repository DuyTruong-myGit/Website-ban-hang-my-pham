import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { inventoryApi } from '../../services/adminService';

const AdminInventory = () => {
    const [inventory, setInventory] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState(null);
    const [editQuantity, setEditQuantity] = useState(0);
    const [tab, setTab] = useState('all'); // 'all' | 'low-stock'

    const fetchInventory = async (currentPage = 0) => {
        setLoading(true);
        try {
            const res = await inventoryApi.getAll(currentPage, 20);
            if (res.success) {
                setInventory(res.data);
                if (res.pagination) {
                    setTotalPages(res.pagination.totalPages);
                }
            }
        } catch (err) {
            console.error('Lỗi tải tồn kho:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchLowStock = async () => {
        try {
            const res = await inventoryApi.getLowStock();
            if (res.success) setLowStock(res.data);
        } catch (err) {
            console.error('Lỗi tải SP sắp hết:', err);
        }
    };

    useEffect(() => {
        fetchInventory(page);
        fetchLowStock();
    }, [page]);

    const handleEdit = (item) => {
        setEditItem(item);
        setEditQuantity(item.quantity || 0);
        setShowModal(true);
    };

    const handleUpdate = async () => {
        if (!editItem) return;
        try {
            const res = await inventoryApi.update(editItem.id, { quantity: editQuantity });
            if (res.success) {
                setShowModal(false);
                fetchInventory(page);
                fetchLowStock();
            }
        } catch (err) {
            alert('Lỗi cập nhật: ' + err.message);
        }
    };

    const displayData = tab === 'low-stock' ? lowStock : inventory;

    const columns = [
        {
            header: 'Product ID',
            render: (row) => (
                <code className="small">{row.productId || row.product_id}</code>
            )
        },
        {
            header: 'Variant SKU',
            render: (row) => row.variantSku || row.variant_sku || <span className="text-muted">—</span>
        },
        {
            header: 'Số lượng',
            render: (row) => {
                const qty = row.quantity || 0;
                const threshold = row.lowStockThreshold || row.low_stock_threshold || 5;
                const isLow = qty <= threshold;
                return (
                    <span className={`admin-badge admin-badge-${isLow ? 'danger' : 'success'} fs-6`}>
                        {qty}
                    </span>
                );
            }
        },
        {
            header: 'Đã đặt trước',
            render: (row) => <span className="fw-bold text-secondary">{row.reserved || 0}</span>
        },
        {
            header: 'Kho',
            render: (row) => row.warehouse || 'main'
        },
        {
            header: 'Ngưỡng cảnh báo',
            render: (row) => row.lowStockThreshold || row.low_stock_threshold || 5
        },
        {
            header: 'Thao tác',
            render: (row) => (
                <button className="btn btn-sm btn-outline-primary" onClick={() => handleEdit(row)}>
                    <i className="bi bi-pencil me-1"></i>Sửa SL
                </button>
            )
        }
    ];

    if (loading && inventory.length === 0) {
        return (
            <AdminLayout>
                <Loading message="Đang tải tồn kho..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-4">
                <h4 className="fw-bold mb-1">Quản lý Tồn kho</h4>
                <p className="text-muted mb-0">Theo dõi và cập nhật số lượng sản phẩm</p>
            </div>

            {/* Tabs */}
            <ul className="nav nav-tabs mb-3">
                <li className="nav-item">
                    <button
                        className={`nav-link ${tab === 'all' ? 'active' : ''}`}
                        onClick={() => setTab('all')}
                    >
                        Tất cả <span className="badge bg-secondary ms-1">{inventory.length}</span>
                    </button>
                </li>
                <li className="nav-item">
                    <button
                        className={`nav-link ${tab === 'low-stock' ? 'active' : ''}`}
                        onClick={() => setTab('low-stock')}
                    >
                        <i className="bi bi-exclamation-triangle text-danger me-1"></i>
                        Sắp hết hàng <span className="badge bg-danger ms-1">{lowStock.length}</span>
                    </button>
                </li>
            </ul>

            <DataTable
                columns={columns}
                data={displayData}
                emptyMessage={tab === 'low-stock' ? 'Không có sản phẩm sắp hết hàng.' : 'Chưa có dữ liệu tồn kho.'}
            />

            {tab === 'all' && <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />}

            {/* Edit Modal */}
            <Modal
                show={showModal}
                title="Cập nhật số lượng tồn kho"
                onClose={() => setShowModal(false)}
                onConfirm={handleUpdate}
                confirmText="Cập nhật"
            >
                {editItem && (
                    <div>
                        <p className="text-muted mb-3">
                            <strong>Product ID:</strong> {editItem.productId || editItem.product_id}<br />
                            <strong>Variant:</strong> {editItem.variantSku || editItem.variant_sku || '—'}
                        </p>
                        <div className="mb-3">
                            <label className="form-label fw-medium">Số lượng mới</label>
                            <input
                                type="number"
                                className="form-control"
                                value={editQuantity}
                                onChange={(e) => setEditQuantity(parseInt(e.target.value) || 0)}
                                min="0"
                            />
                        </div>
                    </div>
                )}
            </Modal>
        </AdminLayout>
    );
};

export default AdminInventory;
