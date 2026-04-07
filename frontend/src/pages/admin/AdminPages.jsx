import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/admin/AdminLayout';
import DataTable from '../../components/admin/DataTable';
import Loading from '../../components/common/Loading';
import { pageService } from '../../services/pageService';

const AdminPages = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Form Modal State
    const [showModal, setShowModal] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        content: '',
        is_active: true
    });
    const [editId, setEditId] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchPages = async () => {
        setLoading(true);
        try {
            const res = await pageService.getAll();
            if (res.success) {
                setPages(res.data);
            }
        } catch (err) {
            console.error('Lỗi tải danh sách trang:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPages();
    }, []);

    const handleOpenModal = (page = null) => {
        if (page) {
            setIsEditing(true);
            setEditId(page._id);
            setFormData({
                title: page.title || '',
                slug: page.slug || '',
                content: page.content || '',
                is_active: page.is_active !== false
            });
        } else {
            setIsEditing(false);
            setEditId(null);
            setFormData({
                title: '',
                slug: '',
                content: '',
                isActive: true
            });
        }
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setFormData({ title: '', slug: '', content: '', is_active: true });
        setIsEditing(false);
        setEditId(null);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    // Tự động tạo slug nếu rảnh
    const handleTitleChange = (e) => {
        const title = e.target.value;
        const autoSlug = title.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
        setFormData({
            ...formData,
            title: title,
            slug: isEditing ? formData.slug : autoSlug
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            if (isEditing) {
                const res = await pageService.update(editId, formData);
                if(res.success) {
                    alert('Cập nhật trang thành công!');
                    handleCloseModal();
                    fetchPages();
                } else alert('Cập nhật thất bại');
            } else {
                const res = await pageService.create(formData);
                if(res.success) {
                    alert('Tạo trang thành công!');
                    handleCloseModal();
                    fetchPages();
                } else alert('Tạo trang thất bại');
            }
        } catch (error) {
            alert('Có lỗi xảy ra: ' + error.message);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDelete = async (id, title) => {
        if(window.confirm(`Bạn có chắc muốn xóa trang "${title}" không? Hành động này không thể hoàn tác!`)) {
            try {
                const res = await pageService.delete(id);
                if(res.success) {
                    fetchPages();
                } else {
                    alert(res.message || 'Xóa thất bại');
                }
            } catch (err) {
                alert('Có lỗi xảy ra khi xóa trang');
            }
        }
    };

    const columns = [
        {
            header: 'CMS Trạng thái',
            render: (row) => (
                row.is_active 
                ? <span className="badge bg-success bg-opacity-10 text-success border border-success border-opacity-25 py-1 px-2"><i className="bi bi-check-circle me-1"></i>Đang xuất bản</span>
                : <span className="badge bg-secondary bg-opacity-10 text-secondary border py-1 px-2"><i className="bi bi-eye-slash me-1"></i>Bản nháp</span>
            )
        },
        {
            header: 'Tiêu đề trang',
            render: (row) => (
                <div>
                    <h6 className="fw-bold mb-1 text-dark">{row.title}</h6>
                    <a href={`/pages/${row.slug}`} target="_blank" rel="noreferrer" className="small text-primary text-decoration-none bg-light px-2 py-1 rounded">
                        /{row.slug} <i className="bi bi-box-arrow-up-right ms-1" style={{fontSize: '0.75rem'}}></i>
                    </a>
                </div>
            )
        },
        {
            header: 'Ngày cập nhật',
            render: (row) => <span className="text-muted small">{new Date(row.updated_at || row.created_at || row.updatedAt || row.createdAt).toLocaleString('vi-VN')}</span>
        },
        {
            header: 'Thao tác',
            render: (row) => (
                <div className="d-flex gap-2">
                    <button 
                        className="btn btn-sm btn-light border shadow-sm text-primary" 
                        onClick={() => handleOpenModal(row)}
                        title="Chỉnh sửa nội dung"
                    >
                        <i className="bi bi-pencil-square"></i>
                    </button>
                    <button 
                        className="btn btn-sm btn-light border shadow-sm text-danger" 
                        onClick={() => handleDelete(row._id, row.title)}
                        title="Xóa trang"
                    >
                        <i className="bi bi-trash"></i>
                    </button>
                </div>
            )
        }
    ];

    if (loading && pages.length === 0) {
        return (
            <AdminLayout>
                <Loading message="Đang tải dữ liệu CMS..." />
            </AdminLayout>
        );
    }

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="fw-bold mb-1 text-dark" style={{letterSpacing: '-0.5px'}}>Nội dung trang (CMS)</h4>
                    <p className="text-muted mb-0">Quản lý các trang thông tin, chính sách & điều khoản</p>
                </div>
                <button 
                    className="btn btn-primary px-4 shadow-sm fw-medium d-flex align-items-center gap-2"
                    style={{background: 'var(--admin-gradient-primary)', border: 'none'}}
                    onClick={() => handleOpenModal()}
                >
                    <i className="bi bi-plus-circle"></i> Thêm Trang Mới
                </button>
            </div>

            <div className="admin-card border-top border-4 border-primary">
                <div className="card-body p-0">
                    <DataTable
                        columns={columns}
                        data={pages}
                        emptyMessage="Hệ thống chưa có trang nội dung nào."
                    />
                </div>
            </div>

            {/* Modal Form Thêm/Sửa */}
            {showModal && (
                <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(3px)' }}>
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content border-0 shadow">
                            <form onSubmit={handleSubmit}>
                                <div className="modal-header border-bottom bg-light px-4">
                                    <h5 className="modal-title fw-bold text-dark">{isEditing ? 'Sửa thông tin trang' : 'Tạo trang mới'}</h5>
                                    <button type="button" className="btn-close" onClick={handleCloseModal}></button>
                                </div>
                                <div className="modal-body p-4 p-md-5">
                                    <div className="row g-4">
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-dark">Tiêu đề (Title) <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className="form-control form-control-lg bg-light"
                                                name="title"
                                                value={formData.title}
                                                onChange={handleTitleChange}
                                                required
                                                placeholder="VD: Chính sách bảo mật"
                                            />
                                        </div>
                                        <div className="col-md-6">
                                            <label className="form-label fw-semibold text-dark">Đường dẫn (Slug) <span className="text-danger">*</span></label>
                                            <input 
                                                type="text" 
                                                className="form-control form-control-lg bg-light"
                                                name="slug"
                                                value={formData.slug}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="VD: chinh-sach-bao-mat"
                                            />
                                            <div className="form-text">Website URL: <code>/pages/{formData.slug || '...' }</code></div>
                                        </div>
                                        
                                        <div className="col-12">
                                            <div className="d-flex justify-content-between align-items-center mb-2">
                                                <label className="form-label fw-semibold text-dark mb-0">Nội dung HTML <span className="text-danger">*</span></label>
                                            </div>
                                            <textarea 
                                                className="form-control font-monospace bg-light"
                                                name="content"
                                                rows="10"
                                                value={formData.content}
                                                onChange={handleInputChange}
                                                required
                                                placeholder="<h1>Tiêu đề...</h1>&#10;<p>Nội dung đoạn văn</p>"
                                                style={{ fontSize: '14px' }}
                                            ></textarea>
                                        </div>

                                        <div className="col-12">
                                            <div className="form-check form-switch form-check-inline mt-2">
                                                <input 
                                                    className="form-check-input" 
                                                    type="checkbox" 
                                                    role="switch" 
                                                    id="isActiveSwitch"
                                                    name="is_active"
                                                    checked={formData.is_active}
                                                    onChange={handleInputChange}
                                                />
                                                <label className="form-check-label fw-medium text-dark ms-2" htmlFor="isActiveSwitch">
                                                    Hiển thị trang ra ngoài Công chúng (Public)
                                                </label>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-top bg-light px-4 py-3">
                                    <button type="button" className="btn btn-light fw-medium border px-4" onClick={handleCloseModal}>Đóng</button>
                                    <button 
                                        type="submit" 
                                        className="btn btn-primary fw-medium px-5 shadow-sm"
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? 'Đang lưu...' : 'Lưu Trang'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
};

export default AdminPages;
