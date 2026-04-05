import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import Modal from '../../components/common/Modal';
import { userApi } from '../../services/adminService';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

    const [showModal, setShowModal] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: ''
    });

    const fetchUsers = async (currentPage = 0) => {
        setLoading(true);
        try {
            const res = await userApi.getAll(currentPage, 20);
            if (res.success) {
                setUsers(res.data);
                if (res.pagination) {
                    setTotalPages(res.pagination.totalPages);
                }
            }
        } catch (err) {
            console.error('Lỗi tải danh sách user:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers(page);
    }, [page]);

    const handleStatusToggle = async (row) => {
        const currentStatus = row.isActive !== false;
        const newStatus = !currentStatus;
        const actionName = newStatus ? 'mở khóa' : 'khóa';
        
        if (!window.confirm(`Bạn có chắc chắn muốn ${actionName} tài khoản "${row.name}"?`)) return;
        
        try {
            const userId = row.id || row._id;
            const res = await userApi.updateStatus(userId, newStatus);
            if (res.success) {
                fetchUsers(page);
            }
        } catch (error) {
            alert('Lỗi cập nhật trạng thái: ' + error.message);
        }
    };

    const handleCreateStaff = async () => {
        if (!formData.name || !formData.email || !formData.password) {
            alert('Vui lòng điền đầy đủ Tên, Email và Mật khẩu.');
            return;
        }

        try {
            const res = await userApi.createStaff(formData);
            if (res.success) {
                setShowModal(false);
                setFormData({ name: '', email: '', phone: '', password: '' });
                fetchUsers(page);
            }
        } catch (error) {
            alert('Lỗi tạo nhân viên: ' + error.message);
        }
    };

    const columns = [
        {
            header: 'Người dùng',
            render: (row) => (
                <div className="d-flex align-items-center">
                    <div className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2"
                        style={{ width: '36px', height: '36px' }}>
                        <span className="text-white fw-bold" style={{ fontSize: '14px' }}>
                            {(row.name || 'U').charAt(0).toUpperCase()}
                        </span>
                    </div>
                    <div>
                        <div className="fw-medium">{row.name}</div>
                        <small className="text-muted">{row.email}</small>
                    </div>
                </div>
            )
        },
        {
            header: 'SĐT',
            render: (row) => row.phone || <span className="text-muted">—</span>
        },
        {
            header: 'Vai trò',
            render: (row) => {
                const roleMap = {
                    admin: { label: 'Admin', color: 'danger' },
                    staff: { label: 'Staff', color: 'warning' },
                    customer: { label: 'Khách hàng', color: 'primary' }
                };
                const role = roleMap[row.role] || roleMap.customer;
                return <span className={`admin-badge admin-badge-${role.color}`}>{role.label}</span>;
            }
        },
        {
            header: 'Trạng thái',
            render: (row) => (
                <span className={`admin-badge admin-badge-${row.isActive !== false ? 'success' : 'secondary'}`}>
                    {row.isActive !== false ? 'Hoạt động' : 'Vô hiệu'}
                </span>
            )
        },
        {
            header: 'Hành động',
            render: (row) => (
                <div className="d-flex gap-2">
                    {row.role !== 'admin' && (
                        <button
                            className={`btn btn-sm ${row.isActive !== false ? 'btn-outline-danger' : 'btn-outline-success'}`}
                            title={row.isActive !== false ? "Khóa tài khoản" : "Mở khóa tài khoản"}
                            onClick={() => handleStatusToggle(row)}
                        >
                            <i className={`bi ${row.isActive !== false ? 'bi-lock-fill' : 'bi-unlock-fill'}`}></i>
                            <span className="ms-1 d-none d-md-inline">{row.isActive !== false ? 'Khóa' : 'Mở khóa'}</span>
                        </button>
                    )}
                </div>
            )
        }
    ];

    return (
        <AdminLayout>
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="fw-bold mb-1">Quản lý Users</h4>
                    <p className="text-muted mb-0">Danh sách khách hàng và nhân viên</p>
                </div>
                <button
                    className="btn text-white fw-medium px-4 py-2"
                    style={{ background: "var(--admin-gradient-success)" }}
                    onClick={() => setShowModal(true)}
                >
                    <i className="bi bi-person-plus-fill me-2"></i>Thêm Nhân Viên
                </button>
            </div>

            {loading && users.length === 0 ? (
                <Loading message="Đang tải danh sách người dùng..." />
            ) : (
                <>
                    <DataTable
                        columns={columns}
                        data={users}
                        emptyMessage="Chưa có người dùng nào."
                    />

                    <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
                </>
            )}

            <Modal
                show={showModal}
                title="Thêm Nhân Viên Mới"
                onClose={() => setShowModal(false)}
                onConfirm={handleCreateStaff}
                confirmText="Tạo tài khoản"
            >
                <div className="row g-3">
                    <div className="col-12">
                        <label className="form-label small fw-medium">Tên hiển thị <span className="text-danger">*</span></label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label small fw-medium">Email <span className="text-danger">*</span></label>
                        <input
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label small fw-medium">Mật khẩu <span className="text-danger">*</span></label>
                        <input
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                        />
                    </div>
                    <div className="col-12">
                        <label className="form-label small fw-medium">Số điện thoại</label>
                        <input
                            type="text"
                            className="form-control"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
};

export default AdminUsers;
