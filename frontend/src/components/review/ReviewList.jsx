import React, { useState, useEffect } from 'react';
import { ProgressBar, Badge, Button } from 'react-bootstrap';
import RatingStars from './RatingStars';
import { reviewApi } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';

/**
 * ReviewList — Danh sách đánh giá sản phẩm
 * Props: productId
 */
const ReviewList = ({ productId }) => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState([]);
    const [stats, setStats] = useState({ avgRating: 0, totalReviews: 0, distribution: {} });
    const [filterRating, setFilterRating] = useState(null);
    const [loading, setLoading] = useState(true);

    const loadReviews = async (rating = null) => {
        try {
            const res = await reviewApi.getProductReviews(productId, rating);
            if (res.success) {
                setReviews(res.data.reviews || []);
                setStats(res.data.stats || { avgRating: 0, totalReviews: 0, distribution: {} });
            }
        } catch (err) {
            console.error('Lỗi load reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (productId) loadReviews();
    }, [productId]);

    const handleFilterRating = (rating) => {
        const newFilter = filterRating === rating ? null : rating;
        setFilterRating(newFilter);
        loadReviews(newFilter);
    };

    const handleHelpful = async (reviewId) => {
        try {
            await reviewApi.markHelpful(reviewId);
            setReviews(prev => prev.map(r =>
                r.id === reviewId ? { ...r, helpfulCount: (r.helpfulCount || 0) + 1 } : r
            ));
        } catch (err) {
            console.error('Lỗi:', err);
        }
    };

    const formatTime = (dateStr) => {
        if (!dateStr) return '';
        try {
            let d;
            if (Array.isArray(dateStr)) {
                const [y, m, day, h = 0, min = 0] = dateStr;
                d = new Date(y, m - 1, day, h, min);
            } else {
                d = new Date(dateStr);
            }
            return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return ''; }
    };

    if (loading) return <div className="text-center py-4 text-muted">Đang tải đánh giá...</div>;

    return (
        <div>
            {/* ── Stats & Distribution ── */}
            <div className="d-flex gap-4 mb-4 p-3 bg-light rounded">
                {/* Rating trung bình */}
                <div className="text-center" style={{ minWidth: '120px' }}>
                    <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#317B22', lineHeight: 1 }}>
                        {stats.avgRating || 0}
                    </div>
                    <RatingStars rating={stats.avgRating || 0} size="md" />
                    <div className="text-muted mt-1" style={{ fontSize: '0.8rem' }}>
                        {stats.totalReviews || 0} đánh giá
                    </div>
                </div>

                {/* Biểu đồ phân bố */}
                <div className="flex-grow-1">
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = stats.distribution?.[star] || 0;
                        const percent = stats.totalReviews > 0
                            ? Math.round((count / stats.totalReviews) * 100) : 0;
                        return (
                            <div key={star} className="d-flex align-items-center gap-2 mb-1"
                                style={{ cursor: 'pointer' }}
                                onClick={() => handleFilterRating(star)}>
                                <span style={{ width: '55px', fontSize: '0.8rem', fontWeight: filterRating === star ? 700 : 400 }}>
                                    {star} <i className="bi bi-star-fill" style={{ color: '#fbbf24', fontSize: '0.7rem' }}></i>
                                </span>
                                <ProgressBar
                                    now={percent}
                                    className="flex-grow-1"
                                    style={{ height: '8px', backgroundColor: '#e5e7eb' }}
                                    variant={filterRating === star ? 'success' : undefined}
                                />
                                <span style={{ width: '35px', fontSize: '0.75rem', color: '#666', textAlign: 'right' }}>
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Filter badge */}
            {filterRating && (
                <div className="mb-3">
                    <Badge bg="success" className="me-2">
                        Lọc: {filterRating} sao
                        <i className="bi bi-x ms-1" style={{ cursor: 'pointer' }}
                            onClick={() => { setFilterRating(null); loadReviews(); }}></i>
                    </Badge>
                </div>
            )}

            {/* ── Danh sách reviews ── */}
            {reviews.length === 0 ? (
                <div className="text-center text-muted py-4">
                    <i className="bi bi-chat-square-text fs-1 d-block mb-2 opacity-25"></i>
                    {filterRating ? 'Không có đánh giá nào cho mức sao này.' : 'Chưa có đánh giá nào. Hãy là người đầu tiên!'}
                </div>
            ) : (
                reviews.map((review) => (
                    <div key={review.id} className="border-bottom py-3">
                        <div className="d-flex justify-content-between align-items-start">
                            <div className="d-flex gap-2 align-items-center">
                                <div
                                    className="rounded-circle d-flex align-items-center justify-content-center fw-bold text-white"
                                    style={{
                                        width: 36, height: 36,
                                        background: '#317B22',
                                        fontSize: '0.85rem',
                                    }}>
                                    {review.userName?.charAt(0)?.toUpperCase() || 'U'}
                                </div>
                                <div>
                                    <div className="fw-bold" style={{ fontSize: '0.9rem' }}>{review.userName}</div>
                                    <div className="d-flex align-items-center gap-2">
                                        <RatingStars rating={review.rating} size="sm" />
                                    </div>
                                </div>
                            </div>
                            <small className="text-muted">{formatTime(review.createdAt)}</small>
                        </div>

                        {review.comment && (
                            <p className="mt-2 mb-2" style={{ fontSize: '0.9rem', lineHeight: 1.6 }}>
                                {review.comment}
                            </p>
                        )}

                        {review.images?.length > 0 && (
                            <div className="d-flex gap-2 mb-2">
                                {review.images.map((img, idx) => (
                                    <img key={idx} src={img} alt={`Review ${idx + 1}`}
                                        style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 8, border: '1px solid #eee' }} />
                                ))}
                            </div>
                        )}

                        <div className="d-flex align-items-center gap-3 mt-1">
                            <Button variant="link" size="sm" className="text-muted p-0"
                                style={{ fontSize: '0.8rem', textDecoration: 'none' }}
                                onClick={() => handleHelpful(review.id)}>
                                <i className="bi bi-hand-thumbs-up me-1"></i>
                                Hữu ích ({review.helpfulCount || 0})
                            </Button>
                        </div>

                        {/* Admin reply */}
                        {review.adminReply && (
                            <div className="mt-2 ms-4 p-2 bg-light rounded border-start border-3 border-success"
                                style={{ fontSize: '0.85rem' }}>
                                <div className="fw-bold text-success mb-1">
                                    <i className="bi bi-reply me-1"></i>
                                    {review.adminReply.repliedByName || 'Admin'} đã trả lời:
                                </div>
                                <div>{review.adminReply.content}</div>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default ReviewList;
