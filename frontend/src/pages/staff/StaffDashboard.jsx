import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import Loading from '../../components/common/Loading';
import { reportApi } from '../../services/adminService';

const StaffDashboard = () => {
    const [overview, setOverview] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await reportApi.getOverview();
                if (res.success) setOverview(res.data);
            } catch (err) {
                console.error('Lỗi tải dữ liệu:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    if (loading) {
        return (
            <AdminLayout>
                <Loading message="Đang tải dashboard nhân viên..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="mb-4">
                <h4 className="fw-bold mb-1">Staff Dashboard</h4>
                <p className="text-muted">Tổng quan công việc nhân viên</p>
            </div>

            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <StatsCard
                        icon="bi-bag-plus"
                        label="Đơn hàng mới"
                        value={overview?.newOrders || 0}
                        color="primary"
                    />
                </div>
                <div className="col-md-3">
                    <StatsCard
                        icon="bi-exclamation-triangle"
                        label="SP sắp hết hàng"
                        value={overview?.lowStockProducts || 0}
                        color="danger"
                    />
                </div>
                <div className="col-md-3">
                    <StatsCard
                        icon="bi-people"
                        label="KH mới (7 ngày)"
                        value={overview?.newCustomers || 0}
                        color="info"
                    />
                </div>
                <div className="col-md-3">
                    <StatsCard
                        icon="bi-chat-dots"
                        label="Chat chờ xử lý"
                        value={0}
                        color="warning"
                    />
                </div>
            </div>

            <div className="admin-card text-center py-5 mb-4 shadow-sm">
                <div className="card-body">
                    <i className="bi bi-clipboard-check fs-1 text-success d-block mb-3" style={{opacity: 0.8}}></i>
                    <h5 className="fw-bold mb-2 text-dark">Lưu ý quản trị nhân viên</h5>
                    <p className="text-muted mb-0">Sử dụng menu bên trái để quản lý đơn hàng và tư vấn khách hàng.</p>
                </div>
            </div>
        </AdminLayout>
    );
};

export default StaffDashboard;
