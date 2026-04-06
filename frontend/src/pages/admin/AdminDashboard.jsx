import React, { useState, useEffect } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line } from 'react-chartjs-2';
import AdminLayout from '../../components/admin/AdminLayout';
import StatsCard from '../../components/admin/StatsCard';
import Loading from '../../components/common/Loading';
import { reportApi } from '../../services/adminService';
import usePageTitle from '../../hooks/usePageTitle';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const AdminDashboard = () => {
    usePageTitle('Dashboard Admin');
    const [overview, setOverview] = useState(null);
    const [topProducts, setTopProducts] = useState([]);
    const [revenueData, setRevenueData] = useState([]);
    const [recentOrders, setRecentOrders] = useState([]);
    const [lowStock, setLowStock] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                // Tính toán từ ngày, đến ngày cho doanh thu (30 ngày qua)
                const endDate = new Date();
                const startDate = new Date();
                startDate.setDate(endDate.getDate() - 30);
                
                const [overviewRes, topRes, revenueRes, ordersRes, stockRes] = await Promise.all([
                    reportApi.getOverview(),
                    reportApi.getTopProducts(),
                    reportApi.getRevenue(startDate.toISOString(), endDate.toISOString()),
                    reportApi.getRecentOrders(),
                    reportApi.getLowStockList()
                ]);

                if (overviewRes.success) setOverview(overviewRes.data);
                if (topRes.success) setTopProducts(topRes.data);
                if (revenueRes.success) {
                    const filledData = [];
                    for (let i = 29; i >= 0; i--) {
                        const d = new Date();
                        d.setDate(d.getDate() - i);
                        const day = d.getDate();
                        const month = d.getMonth() + 1;
                        const year = d.getFullYear();
                        
                        const existing = revenueRes.data.find(r => r.day === day && r.month === month && r.year === year);
                        if (existing) {
                            filledData.push(existing);
                        } else {
                            filledData.push({ day, month, year, revenue: 0, orderCount: 0 });
                        }
                    }
                    setRevenueData(filledData);
                }
                if (ordersRes.success) setRecentOrders(ordersRes.data);
                if (stockRes.success) setLowStock(stockRes.data);
            } catch (err) {
                console.error('Lỗi tải dữ liệu dashboard:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    const getStatusBadge = (status) => {
        switch (status) {
            case 'pending': return <span className="admin-badge admin-badge-warning">Chờ xác nhận</span>;
            case 'confirmed': return <span className="admin-badge admin-badge-info">Đã xác nhận</span>;
            case 'processing': return <span className="admin-badge admin-badge-primary">Đang xử lý</span>;
            case 'shipping': return <span className="admin-badge admin-badge-primary">Đang giao</span>;
            case 'delivered': return <span className="admin-badge admin-badge-success">Đã giao</span>;
            case 'cancelled': return <span className="admin-badge admin-badge-danger">Đã hủy</span>;
            case 'refunded': return <span className="admin-badge admin-badge-secondary">Hoàn tiền</span>;
            case 'returned': return <span className="admin-badge admin-badge-secondary bg-dark">Trả hàng</span>;
            default: return <span className="admin-badge admin-badge-secondary">{status}</span>;
        }
    };

    if (loading) {
        return (
            <AdminLayout>
                <Loading message="Đang tải dashboard..." />
            </AdminLayout>
        );
    }

    const chartData = {
        labels: revenueData.map(item => `${item.day}/${item.month}`),
        datasets: [
            {
                label: 'Doanh thu (VNĐ)',
                data: revenueData.map(item => item.revenue),
                borderColor: 'rgba(75, 192, 192, 1)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                fill: true,
                tension: 0.4
            }
        ]
    };

    const chartOptions = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            title: { display: false }
        },
        scales: {
            y: {
                beginAtZero: true,
                ticks: {
                    callback: function(value) {
                        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);
                    }
                }
            }
        }
    };

    return (
        <AdminLayout>
            <div className="mb-4">
                <h4 className="fw-bold mb-1">Dashboard</h4>
                <p className="text-muted">Tổng quan hệ thống</p>
            </div>

            {/* Stats Cards */}
            <div className="row g-3 mb-4">
                <div className="col-md-3">
                    <StatsCard
                        icon="bi-cash-stack"
                        label="Tổng doanh thu"
                        value={formatPrice(overview?.totalRevenue)}
                        color="success"
                    />
                </div>
                <div className="col-md-3">
                    <StatsCard
                        icon="bi-bag-plus"
                        label="Đơn hàng mới (7 ngày)"
                        value={overview?.newOrders || 0}
                        color="primary"
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
                        icon="bi-exclamation-triangle"
                        label="SP sắp hết hàng"
                        value={overview?.lowStockProducts || 0}
                        color="danger"
                    />
                </div>
            </div>

            {/* Row 1: Chart & Top Products */}
            <div className="row g-4 mb-4">
                <div className="col-lg-8">
                    <div className="admin-card h-100">
                        <div className="admin-card-header">
                            <h5 className="mb-0 fw-bold text-dark w-100 d-flex align-items-center">
                                <i className="bi bi-graph-up text-primary me-2 fs-5"></i>
                                Doanh thu 30 ngày qua
                            </h5>
                        </div>
                        <div className="card-body p-4">
                            {revenueData.length > 0 ? (
                                <Line data={chartData} options={chartOptions} />
                            ) : (
                                <div className="text-center text-muted py-5">
                                    Không có dữ liệu doanh thu trong khoảng thời gian này.
                                </div>
                            )}
                        </div>
                    </div>
                </div>
                
                <div className="col-lg-4">
                    <div className="admin-card h-100">
                        <div className="admin-card-header">
                            <h5 className="mb-0 fw-bold text-dark w-100 d-flex align-items-center">
                                <i className="bi bi-trophy text-warning me-2 fs-5"></i>
                                Top Bán Chạy
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="admin-table-wrapper" style={{boxShadow: 'none', borderRadius: '0 0 16px 16px'}}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Sản phẩm</th>
                                            <th>Đã bán</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {topProducts.length > 0 ? topProducts.map((product, index) => (
                                            <tr key={product._id || index}>
                                                <td>
                                                    <div className="d-flex align-items-center">
                                                        {product.images?.[0] ? (
                                                            <img
                                                                src={product.images[0]}
                                                                alt={product.name}
                                                                className="rounded me-2"
                                                                style={{ width: '32px', height: '32px', objectFit: 'cover' }}
                                                            />
                                                        ) : (
                                                            <div className="bg-secondary rounded me-2 d-flex align-items-center justify-content-center"
                                                                style={{ width: '32px', height: '32px' }}>
                                                                <i className="bi bi-image text-white small"></i>
                                                            </div>
                                                        )}
                                                        <span className="small text-truncate" style={{maxWidth: '150px'}} title={product.name}>
                                                            {product.name}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td>
                                                    <span className="admin-badge admin-badge-success">{product.sold_count || 0}</span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="2" className="text-center text-muted py-4">Chưa có dữ liệu</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Row 2: Recent Orders & Low Stock */}
            <div className="row g-4">
                <div className="col-lg-8">
                    <div className="admin-card h-100">
                        <div className="admin-card-header">
                            <h5 className="mb-0 fw-bold text-dark w-100 d-flex align-items-center">
                                <i className="bi bi-cart-check text-success me-2 fs-5"></i>
                                10 Đơn Hàng Gần Đây
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="admin-table-wrapper" style={{boxShadow: 'none', borderRadius: '0 0 16px 16px'}}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>Mã đơn</th>
                                            <th>Ngày tạo</th>
                                            <th>Sản phẩm</th>
                                            <th>Tổng tiền</th>
                                            <th>Trạng thái</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {recentOrders.length > 0 ? recentOrders.map((order, index) => (
                                            <tr key={order._id || index}>
                                                <td><span className="text-primary fw-medium">#{order.order_code}</span></td>
                                                <td>{new Date(order.created_at).toLocaleDateString('vi-VN')}</td>
                                                <td>{order.item_count} SP</td>
                                                <td className="fw-bold">{formatPrice(order.total)}</td>
                                                <td>{getStatusBadge(order.status)}</td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="5" className="text-center text-muted py-4">Chưa có đơn hàng nào</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-lg-4">
                    <div className="admin-card h-100">
                        <div className="admin-card-header">
                            <h5 className="mb-0 fw-bold text-danger w-100 d-flex align-items-center">
                                <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                                Sắp Hết Hàng
                            </h5>
                        </div>
                        <div className="card-body p-0">
                            <div className="admin-table-wrapper" style={{boxShadow: 'none', borderRadius: '0 0 16px 16px'}}>
                                <table className="admin-table">
                                    <thead>
                                        <tr>
                                            <th>SKU / ID</th>
                                            <th>Số lượng</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lowStock.length > 0 ? lowStock.map((item, index) => (
                                            <tr key={item._id || index}>
                                                <td><code className="small text-danger bg-light px-2 py-1 rounded">{item.variant_sku || item.product_id}</code></td>
                                                <td>
                                                    <span className="admin-badge admin-badge-danger fs-6">{item.quantity}</span>
                                                </td>
                                            </tr>
                                        )) : (
                                            <tr>
                                                <td colSpan="3" className="text-center text-muted py-4">Tất cả sản phẩm đều đủ hàng</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AdminDashboard;
