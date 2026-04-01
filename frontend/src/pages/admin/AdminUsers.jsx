import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import Pagination from '../../components/common/Pagination';
import { userApi } from '../../services/adminService';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);

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
            header: 'Ngày tạo',
            render: (row) => row.createdAt ?
                new Date(row.createdAt).toLocaleDateString('vi-VN') :
                <span className="text-muted">—</span>
        }
    ];

    if (loading && users.length === 0) {
        return (
            <AdminLayout>
                <Loading message="Đang tải danh sách người dùng..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-4 d-flex justify-content-between align-items-center">
                <div>
                    <h4 className="fw-bold mb-1">Quản lý Users</h4>
                    <p className="text-muted mb-0">Danh sách khách hàng và nhân viên</p>
                </div>
            </div>

            <DataTable
                columns={columns}
                data={users}
                emptyMessage="Chưa có người dùng nào."
            />

            <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
        </AdminLayout>
    );
};

export default AdminUsers;
