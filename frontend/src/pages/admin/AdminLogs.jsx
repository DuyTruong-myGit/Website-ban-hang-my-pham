import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { adminLogApi } from '../../services/adminService';

const AdminLogs = () => {
    const [logs, setLogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [filterAction, setFilterAction] = useState('');
    const [filterUser, setFilterUser] = useState('');

    const fetchLogs = async (currentPage = 0) => {
        setLoading(true);
        try {
            const params = { page: currentPage, limit: 20 };
            if (filterAction) params.action = filterAction;
            if (filterUser) params.user = filterUser;

            const res = await adminLogApi.getAll(params);
            if (res.success) {
                setLogs(res.data);
                if (res.pagination) {
                    setTotalPages(res.pagination.totalPages);
                }
            }
        } catch (err) {
            console.error('Lỗi tải logs:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs(page);
    }, [page]);

    const handleFilter = () => {
        setPage(0);
        fetchLogs(0);
    };

    const handleReset = () => {
        setFilterAction('');
        setFilterUser('');
        setPage(0);
        fetchLogs(0);
    };

    const actionColorMap = {
        'UPDATE_INVENTORY': 'info',
        'CREATE_PAGE': 'success',
        'UPDATE_PAGE': 'warning',
        'DELETE_PAGE': 'danger',
    };

    const columns = [
        {
            header: 'Thời gian',
            render: (row) => {
                const date = row.createdAt || row.created_at;
                return date ? (
                    <div>
                        <div className="fw-medium text-dark">{new Date(date).toLocaleDateString('vi-VN')}</div>
                        <small className="text-muted">{new Date(date).toLocaleTimeString('vi-VN')}</small>
                    </div>
                ) : '—';
            }
        },
        {
            header: 'User ID',
            render: (row) => <code className="small text-danger bg-light px-2 py-1 rounded">{row.userId || row.user_id || '—'}</code>
        },
        {
            header: 'Hành động',
            render: (row) => {
                const color = actionColorMap[row.action] || 'secondary';
                return <span className={`admin-badge admin-badge-${color} shadow-sm`} style={{letterSpacing: '0.5px'}}>{row.action}</span>;
            }
        },
        {
            header: 'Đối tượng',
            render: (row) => <span className="fw-medium text-secondary">{row.target || '—'}</span>
        },
        {
            header: 'Chi tiết',
            render: (row) => {
                const meta = row.metadata;
                if (!meta || Object.keys(meta).length === 0) return '—';
                return (
                    <code className="small d-block text-danger bg-light px-2 py-1 rounded" style={{ maxWidth: '250px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {JSON.stringify(meta)}
                    </code>
                );
            }
        }
    ];

    if (loading && logs.length === 0) {
        return (
            <AdminLayout>
                <Loading message="Đang tải admin logs..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-4">
                <h4 className="fw-bold mb-1 text-dark" style={{letterSpacing: '-0.5px'}}>Lịch sử kiểm toán (Audit Logs)</h4>
                <p className="text-muted mb-0">Theo dõi toàn bộ hoạt động của quản trị viên và nhân viên</p>
            </div>

            {/* Filters */}
            <div className="admin-card mb-4">
                <div className="card-body p-4">
                    <div className="row g-3 align-items-end">
                        <div className="col-md-3">
                            <label className="form-label small text-muted text-uppercase fw-semibold mb-2">Hành động</label>
                            <select
                                className="form-select border-0 bg-light"
                                value={filterAction}
                                onChange={(e) => setFilterAction(e.target.value)}
                            >
                                <option value="">Tất cả</option>
                                <option value="UPDATE_INVENTORY">Cập nhật tồn kho</option>
                                <option value="CREATE_PAGE">Tạo trang</option>
                                <option value="UPDATE_PAGE">Sửa trang</option>
                                <option value="DELETE_PAGE">Xóa trang</option>
                            </select>
                        </div>
                        <div className="col-md-4">
                            <label className="form-label small text-muted text-uppercase fw-semibold mb-2">User ID</label>
                            <input
                                type="text"
                                className="form-control border-0 bg-light"
                                placeholder="Nhập ID người dùng để tìm..."
                                value={filterUser}
                                onChange={(e) => setFilterUser(e.target.value)}
                            />
                        </div>
                        <div className="col-md-5 d-flex gap-2">
                            <button className="btn btn-primary px-4 fw-medium" onClick={handleFilter} style={{background: 'var(--admin-gradient-primary)', border: 'none'}}>
                                <i className="bi bi-search me-2"></i>Lọc Dữ Liệu
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
                data={logs}
                emptyMessage="Không có lịch sử hành động nào khớp với bộ lọc."
            />

            <div className="mt-4">
                <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
            </div>
        </AdminLayout>
    );
};

export default AdminLogs;
