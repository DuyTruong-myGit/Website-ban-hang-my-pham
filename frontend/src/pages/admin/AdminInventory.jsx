import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { inventoryService } from '../../services/inventoryService';

const AdminInventory = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filterCategory, setFilterCategory] = useState('');
    const [viewLowStock, setViewLowStock] = useState(false);
    
    // Modal state for updating stock
    const [showModal, setShowModal] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [stockAmount, setStockAmount] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchInventory = async (currentPage = 0) => {
        setLoading(true);
        try {
            const params = { page: currentPage, limit: 10 };
            if (filterCategory) params.category = filterCategory;

            let res;
            if (viewLowStock) {
                res = await inventoryService.getLowStock(params);
            } else {
                res = await inventoryService.getInventory(params);
            }

            if (res.success) {
                setProducts(res.data);
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

    useEffect(() => {
        fetchInventory(page);
    }, [page, viewLowStock]);

    const handleFilter = () => {
        setPage(0);
        fetchInventory(0);
    };

    const handleReset = () => {
        setFilterCategory('');
        setViewLowStock(false);
        setPage(0);
        fetchInventory(0);
    };

    const handleOpenEdit = (product) => {
        setSelectedProduct(product);
        setStockAmount(product.stock || 0);
        setShowModal(true);
    };

    const handleCloseEdit = () => {
        setShowModal(false);
        setSelectedProduct(null);
        setStockAmount(0);
    };

    const handleSaveStock = async () => {
        if (!selectedProduct) return;
        setIsSubmitting(true);
        try {
            const res = await inventoryService.updateStock(selectedProduct._id, { stock: Number(stockAmount) });
            if (res.success) {
                handleCloseEdit();
                fetchInventory(page); // Reload list
            } else {
                alert(res.message || 'Cập nhật thất bại');
            }
        } catch (err) {
            alert('Có lỗi xảy ra khi cập nhật tồn kho');
        } finally {
            setIsSubmitting(false);
        }
    };

    const columns = [
        {
            header: 'Mã SP',
            render: (row) => <code className="small bg-light px-2 py-1 rounded text-secondary">{row._id.slice(-6)}</code>
        },
        {
            header: 'Sản phẩm',
            render: (row) => (
                <div className="d-flex align-items-center gap-3">
                    <div style={{ width: '40px', height: '40px' }} className="rounded-3 overflow-hidden bg-light shadow-sm">
                        <img 
                            src={row.images && row.images[0]?.url ? row.images[0].url : 'https://placehold.co/100x100?text=No+Image'} 
                            alt={row.name}
                            className="w-100 h-100 object-fit-cover"
                        />
                    </div>
                    <div>
                        <div className="fw-medium text-dark text-truncate" style={{ maxWidth: '250px' }} title={row.name}>{row.name}</div>
                        <small className="text-muted">{row.category ? row.category.name : 'Chưa phân loại'}</small>
                    </div>
                </div>
            )
        },
        {
            header: 'Phân loại',
            render: (row) => <span className="badge bg-light text-dark border px-2 py-1">{row.category ? row.category.name : '—'}</span>
        },
        {
            header: 'Tồn kho',
            render: (row) => {
                const stock = row.stock || 0;
                let colorClass = "text-success";
                if (stock === 0) colorClass = "text-danger fw-bold";
                else if (stock < 10) colorClass = "text-warning fw-bold";

                return <span className={`fs-6 ${colorClass}`}>{stock} SP</span>;
            }
        },
        {
            header: 'Thao tác',
            render: (row) => (
                <button 
                    className="btn btn-sm btn-outline-primary"
                    onClick={() => handleOpenEdit(row)}
                >
                    <i className="bi bi-pencil-square me-1"></i> Cập nhật
                </button>
            )
        }
    ];

    if (loading && products.length === 0) {
        return (
            <AdminLayout>
                <Loading message="Đang tải dữ liệu kho..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-4">
                <h4 className="fw-bold mb-1 text-dark" style={{letterSpacing: '-0.5px'}}>Quản lý Tồn kho</h4>
                <p className="text-muted mb-0">Theo dõi số lượng hàng hóa và cảnh báo hết hàng</p>
            </div>

            {/* Filters */}
            <div className="admin-card mb-4">
                <div className="card-body p-4">
                    <div className="row g-3 align-items-center">
                        <div className="col-md-4">
                            <label className="form-label small text-muted text-uppercase fw-semibold mb-2">Tìm ID Danh Mục</label>
                            <input
                                type="text"
                                className="form-control border-0 bg-light"
                                placeholder="Nhập mã Category..."
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value)}
                            />
                        </div>
                        <div className="col-md-3 pt-4">
                            <div className="form-check form-switch pt-1">
                                <input 
                                    className="form-check-input mt-1" 
                                    type="checkbox" 
                                    role="switch" 
                                    id="lowStockSwitch"
                                    checked={viewLowStock}
                                    onChange={(e) => setViewLowStock(e.target.checked)}
                                />
                                <label className="form-check-label fw-medium text-danger" htmlFor="lowStockSwitch">
                                    Chỉ xem sắp hết hàng
                                </label>
                            </div>
                        </div>
                        <div className="col-md-5 d-flex gap-2 justify-content-end align-items-end pt-3">
                            <button className="btn btn-primary px-4 fw-medium" onClick={handleFilter} style={{background: 'var(--admin-gradient-primary)', border: 'none'}}>
                                <i className="bi bi-search me-2"></i>Tìm Kiếm
                            </button>
                            <button className="btn btn-light px-4 fw-medium text-dark border" onClick={handleReset}>
                                <i className="bi bi-arrow-counterclockwise me-2"></i>Làm Mới
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={products}
                emptyMessage="Không có sản phẩm nào trong danh sách."
            />

            <div className="mt-4">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>

            {/* Modal Cập nhật tồn kho */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content border-0 shadow-lg">
                            <div className="modal-header border-bottom px-4">
                                <h5 className="modal-title fw-bold text-dark">Cập nhật Kho</h5>
                                <button type="button" className="btn-close" onClick={handleCloseEdit}></button>
                            </div>
                            <div className="modal-body p-4">
                                {selectedProduct && (
                                    <>
                                        <div className="mb-3 d-flex align-items-center gap-3 p-3 bg-light rounded">
                                            <img 
                                                src={selectedProduct.images && selectedProduct.images[0]?.url ? selectedProduct.images[0].url : 'https://placehold.co/100x100?text=No+Image'} 
                                                alt={selectedProduct.name}
                                                className="rounded object-fit-cover"
                                                style={{ width: '50px', height: '50px' }}
                                            />
                                            <div>
                                                <div className="fw-semibold text-dark">{selectedProduct.name}</div>
                                                <small className="text-secondary">Mã: {selectedProduct._id}</small>
                                            </div>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label fw-medium text-dark">Số lượng tồn kho (Stock)</label>
                                            <input 
                                                type="number" 
                                                className="form-control form-control-lg"
                                                value={stockAmount}
                                                onChange={(e) => setStockAmount(e.target.value)}
                                                min="0"
                                            />
                                            <div className="form-text text-muted">Hệ thống sẽ ghi đè số lượng tồn kho thành số mới này.</div>
                                        </div>
                                    </>
                                )}
                            </div>
                            <div className="modal-footer border-top px-4">
                                <button type="button" className="btn btn-light border px-4" onClick={handleCloseEdit}>Hủy</button>
                                <button 
                                    type="button" 
                                    className="btn btn-primary px-4 shadow-sm" 
                                    onClick={handleSaveStock}
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? 'Đang lưu...' : 'Lưu Thay Đổi'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminInventory;
