import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pageService } from '../services/pageService';
import Loading from '../components/common/Loading';

const PageDetail = () => {
    const { slug } = useParams();
    const [pageDetail, setPageDetail] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchPageContent = async () => {
            setLoading(true);
            try {
                // Sử dụng API lấy trang công khai (public endpoint) dựa theo slug
                const res = await pageService.getBySlug(slug);
                if (res.success) {
                    setPageDetail(res.data);
                } else {
                    setError('Không tìm thấy nội dung trang yêu cầu.');
                }
            } catch (err) {
                // Bắt lỗi HTTP Error hoặc 404
                setError('Trang này không tồn tại hoặc đã bị gỡ xuống.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchPageContent();
        }
    }, [slug]);

    if (loading) {
        return <div className="py-5 my-5"><Loading message="Đang tải nội dung trang..." /></div>;
    }

    if (error || !pageDetail) {
        return (
            <div className="container py-5 my-5 text-center">
                <i className="bi bi-file-earmark-x display-1 text-muted mb-4 d-block"></i>
                <h2 className="fw-bold mb-3">Úi, không tìm thấy trang!</h2>
                <p className="text-secondary mb-4">{error}</p>
                <Link to="/" className="btn btn-primary px-4">Quay về Trang chủ</Link>
            </div>
        );
    }

    return (
        <div className="page-content bg-white">
            {/* Page Banner (Tùy chọn) */}
            <div className="bg-light py-5 border-bottom">
                <div className="container">
                    <h1 className="fw-bold text-dark mb-2">{pageDetail.title}</h1>
                    <nav aria-label="breadcrumb">
                        <ol className="breadcrumb mb-0">
                            <li className="breadcrumb-item"><Link to="/" className="text-decoration-none text-secondary">Trang chủ</Link></li>
                            <li className="breadcrumb-item active" aria-current="page">{pageDetail.title}</li>
                        </ol>
                    </nav>
                </div>
            </div>

            {/* Bài viết chính */}
            <div className="container py-5 my-3">
                <div className="row justify-content-center">
                    <div className="col-lg-10">
                        {/* 
                            Sử dụng dangerouslySetInnerHTML do nội dung tạo từ CMS là mã HTML.
                            Trong các dự án thực tế nên bọc thêm DOMPurify để bảo mật XSS.
                        */}
                        <div 
                            className="cms-content fs-5 text-dark"
                            style={{ lineHeight: '1.8' }}
                            dangerouslySetInnerHTML={{ __html: pageDetail.content }}
                        ></div>

                        <div className="mt-5 pt-4 border-top text-end text-muted small">
                            Cập nhật lần cuối: {new Date(pageDetail.updated_at || pageDetail.created_at).toLocaleDateString('vi-VN')}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PageDetail;
