import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { pageService } from '../services/pageService';
import Loading from '../components/common/Loading';

const PageList = () => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPages = async () => {
            setLoading(true);
            try {
                // API Backend trả về các trang đã active (public)
                const res = await pageService.getPublicPages();
                if (res.success) {
                    setPages(res.data);
                }
            } catch (err) {
                console.error("Lỗi lấy danh sách cẩm nang:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPages();
    }, []);

    return (
        <div className="bg-light py-5 min-vh-100">
            {/* Header Banner */}
            <div className="container mb-5 text-center">
                <h1 className="fw-bold text-dark mb-3">Cẩm Nang & Hỗ Trợ</h1>
                <p className="text-secondary" style={{ maxWidth: '600px', margin: '0 auto' }}>
                    Tất cả những thông tin bạn cần biết về chính sách, hướng dẫn mua sắm và các mẹo chăm sóc sắc đẹp từ chuyên gia AuraBeauty.
                </p>
            </div>

            <div className="container">
                {loading ? (
                    <div className="py-5 bg-white rounded shadow-sm">
                        <Loading message="Đang tải danh sách bài viết..." />
                    </div>
                ) : pages.length === 0 ? (
                    <div className="text-center py-5 bg-white rounded shadow-sm">
                        <i className="bi bi-journal-x display-4 text-muted mb-3 d-block"></i>
                        <h4 className="fw-medium text-dark">Chưa có bài viết nào</h4>
                        <p className="text-secondary">Hãy quay lại sau nhé!</p>
                    </div>
                ) : (
                    <div className="row g-4">
                        {pages.map((page) => (
                            <div className="col-md-6 col-lg-4" key={page._id}>
                                <div className="card h-100 border-0 shadow-sm custom-card-hover transition-all">
                                    <div className="card-body p-4 d-flex flex-column">
                                        <div className="mb-3 d-flex justify-content-between align-items-center">
                                            <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill fw-medium">
                                                Cẩm nang
                                            </span>
                                            <small className="text-muted text-uppercase" style={{ fontSize: '0.75rem', letterSpacing: '0.5px' }}>
                                                {new Date(page.created_at || page.createdAt).toLocaleDateString('vi-VN')}
                                            </small>
                                        </div>
                                        <h5 className="card-title fw-bold text-dark mb-3 line-clamp-2">
                                            {page.title}
                                        </h5>
                                        {/* Trích xuất 1 đoạn ngắn text từ content html */}
                                        <p className="card-text text-secondary mb-4 line-clamp-3" style={{ fontSize: '0.9rem' }}>
                                            {page.content.replace(/<[^>]+>/g, '').substring(0, 150)}...
                                        </p>
                                        
                                        <div className="mt-auto pt-3 border-top">
                                            <Link 
                                                to={`/pages/${page.slug}`} 
                                                className="btn btn-link text-primary text-decoration-none fw-medium p-0 d-flex align-items-center gap-2"
                                            >
                                                Đọc tiếp <i className="bi bi-arrow-right"></i>
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <style jsx="true">{`
                .custom-card-hover {
                    transition: all 0.3s ease;
                }
                .custom-card-hover:hover {
                    transform: translateY(-5px);
                    box-shadow: 0 10px 20px rgba(0,0,0,0.08) !important;
                }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .line-clamp-3 {
                    display: -webkit-box;
                    -webkit-line-clamp: 3;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
            `}</style>
        </div>
    );
};

export default PageList;
