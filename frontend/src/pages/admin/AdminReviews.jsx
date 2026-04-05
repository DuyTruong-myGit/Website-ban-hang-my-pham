// AdminReviews.jsx — TV4: Trang quản lý đánh giá cho Admin
import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import AdminLayout from '../../components/admin/AdminLayout';
import RatingStars from '../../components/review/RatingStars';
import { reviewApi } from '../../services/reviewService';

const AdminReviews = () => {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showReplyModal, setShowReplyModal] = useState(false);
    const [selectedReview, setSelectedReview] = useState(null);
    const [replyContent, setReplyContent] = useState('');
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadReviews();
    }, []);

    const loadReviews = async () => {
        try {
            const res = await reviewApi.getAll();
            if (res.success) setReviews(res.data || []);
        } catch (err) {
            console.error('Lỗi load reviews:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleReply = (review) => {
        setSelectedReview(review);
        setReplyContent(review.adminReply?.content || '');
        setShowReplyModal(true);
    };

    const submitReply = async () => {
        if (!replyContent.trim()) return;
        try {
            const res = await reviewApi.adminReply(selectedReview.id, replyContent.trim());
            if (res.success) {
                setMessage({ type: 'success', text: 'Đã trả lời đánh giá!' });
                setShowReplyModal(false);
                loadReviews();
            }
        } catch (err) {
            setMessage({ type: 'danger', text: 'Lỗi gửi trả lời.' });
        }
    };

    const handleToggleHide = async (reviewId) => {
        try {
            const res = await reviewApi.toggleHide(reviewId);
            if (res.success) {
                setReviews(prev => prev.map(r =>
                    r.id === reviewId ? { ...r, isHidden: res.data.isHidden } : r
                ));
            }
        } catch (err) {
            console.error('Lỗi:', err);
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '—';
        try {
            let d;
            if (Array.isArray(dateStr)) {
                const [y, m, day, h = 0, min = 0] = dateStr;
                d = new Date(y, m - 1, day, h, min);
            } else {
                d = new Date(dateStr);
            }
            return d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' });
        } catch { return '—'; }
    };

    return (
        <AdminLayout>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h4 className="fw-bold mb-0">
                    <i className="bi bi-star me-2 text-warning"></i>Quản lý Đánh giá
                </h4>
                <Badge bg="secondary">{reviews.length} đánh giá</Badge>
            </div>

            {message && (
                <Alert variant={message.type} dismissible onClose={() => setMessage(null)}>
                    {message.text}
                </Alert>
            )}

            <div className="bg-white rounded shadow-sm">
                <Table responsive hover className="mb-0">
                    <thead className="table-light">
                        <tr>
                            <th style={{ width: '20%' }}>Khách hàng</th>
                            <th style={{ width: '10%' }}>Đánh giá</th>
                            <th style={{ width: '30%' }}>Nội dung</th>
                            <th style={{ width: '10%' }}>Loại da</th>
                            <th style={{ width: '10%' }}>Ngày</th>
                            <th style={{ width: '10%' }}>Trạng thái</th>
                            <th style={{ width: '10%' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="7" className="text-center py-4">Đang tải...</td></tr>
                        ) : reviews.length === 0 ? (
                            <tr><td colSpan="7" className="text-center py-4 text-muted">Chưa có đánh giá nào.</td></tr>
                        ) : reviews.map(review => (
                            <tr key={review.id} style={{ opacity: review.isHidden ? 0.5 : 1 }}>
                                <td>
                                    <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{review.userName}</div>
                                    <small className="text-muted">ID: {review.productId?.slice(-6)}</small>
                                </td>
                                <td><RatingStars rating={review.rating} size="sm" /></td>
                                <td>
                                    <div style={{ fontSize: '0.85rem', maxHeight: '60px', overflow: 'hidden' }}>
                                        {review.comment || <em className="text-muted">Không có nhận xét</em>}
                                    </div>
                                    {review.adminReply && (
                                        <Badge bg="success" className="mt-1" style={{ fontSize: '0.65rem' }}>
                                            <i className="bi bi-check2 me-1"></i>Đã trả lời
                                        </Badge>
                                    )}
                                </td>
                                <td><small>{review.skinType || '—'}</small></td>
                                <td><small>{formatDate(review.createdAt)}</small></td>
                                <td>
                                    {review.isHidden ? (
                                        <Badge bg="danger">Đã ẩn</Badge>
                                    ) : (
                                        <Badge bg="success">Hiển thị</Badge>
                                    )}
                                </td>
                                <td>
                                    <div className="d-flex gap-1">
                                        <Button variant="outline-primary" size="sm" title="Trả lời"
                                            onClick={() => handleReply(review)}>
                                            <i className="bi bi-reply"></i>
                                        </Button>
                                        <Button
                                            variant={review.isHidden ? 'outline-success' : 'outline-warning'}
                                            size="sm"
                                            title={review.isHidden ? 'Hiện' : 'Ẩn'}
                                            onClick={() => handleToggleHide(review.id)}>
                                            <i className={`bi ${review.isHidden ? 'bi-eye' : 'bi-eye-slash'}`}></i>
                                        </Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Reply Modal */}
            <Modal show={showReplyModal} onHide={() => setShowReplyModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: '1rem' }}>
                        <i className="bi bi-reply me-2"></i>Trả lời đánh giá
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReview && (
                        <div className="mb-3 p-2 bg-light rounded" style={{ fontSize: '0.85rem' }}>
                            <div className="d-flex gap-2 align-items-center mb-1">
                                <strong>{selectedReview.userName}</strong>
                                <RatingStars rating={selectedReview.rating} size="sm" />
                            </div>
                            <div>{selectedReview.comment}</div>
                        </div>
                    )}
                    <Form.Group>
                        <Form.Label className="fw-semibold">Nội dung trả lời</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            placeholder="Nhập phản hồi..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowReplyModal(false)}>Hủy</Button>
                    <Button variant="success" onClick={submitReply} disabled={!replyContent.trim()}>
                        <i className="bi bi-send me-1"></i>Gửi trả lời
                    </Button>
                </Modal.Footer>
            </Modal>
        </AdminLayout>
    );
};

export default AdminReviews;
