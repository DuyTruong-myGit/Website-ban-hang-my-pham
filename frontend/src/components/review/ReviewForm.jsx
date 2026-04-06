import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import RatingStars from './RatingStars';
import { reviewApi } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';

/**
 * ReviewForm — Form viết đánh giá sản phẩm
 * Props: productId, onReviewCreated (callback)
 */
const ReviewForm = ({ productId, onReviewCreated }) => {
    const { user, token } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    if (!token) {
        return (
            <div className="text-center py-3 text-muted" style={{ fontSize: '0.9rem' }}>
                <i className="bi bi-lock me-1"></i>
                Vui lòng <a href="/login" className="text-success fw-bold">đăng nhập</a> để viết đánh giá.
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (rating === 0) {
            setMessage({ type: 'warning', text: 'Vui lòng chọn số sao đánh giá.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            const res = await reviewApi.createReview({
                productId,
                rating,
                comment,
            });
            if (res.success) {
                setMessage({ type: 'success', text: 'Đánh giá thành công! Cảm ơn bạn.' });
                setRating(0);
                setComment('');
                if (onReviewCreated) onReviewCreated();
            } else {
                setMessage({ type: 'danger', text: res.message || 'Có lỗi xảy ra.' });
            }
        } catch (err) {
            setMessage({
                type: 'danger',
                text: err.response?.data?.message || 'Có lỗi xảy ra khi gửi đánh giá.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border rounded p-3 bg-light">
            <h6 className="fw-bold mb-3">
                <i className="bi bi-pencil-square me-1"></i>Viết đánh giá
            </h6>

            {message && (
                <Alert variant={message.type} dismissible onClose={() => setMessage(null)}
                    className="py-2" style={{ fontSize: '0.85rem' }}>
                    {message.text}
                </Alert>
            )}

            <Form onSubmit={handleSubmit}>
                {/* Chọn sao */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>
                        Đánh giá của bạn <span className="text-danger">*</span>
                    </Form.Label>
                    <div>
                        <RatingStars rating={rating} interactive onRate={setRating} size="lg" />
                        {rating > 0 && (
                            <span className="ms-2 text-muted" style={{ fontSize: '0.8rem' }}>
                                {['', 'Rất tệ', 'Tệ', 'Bình thường', 'Tốt', 'Tuyệt vời'][rating]}
                            </span>
                        )}
                    </div>
                </Form.Group>

                {/* Nội dung */}
                <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold" style={{ fontSize: '0.9rem' }}>Nhận xét</Form.Label>
                    <Form.Control
                        as="textarea"
                        rows={3}
                        placeholder="Chia sẻ trải nghiệm của bạn về sản phẩm..."
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        style={{ fontSize: '0.9rem' }}
                    />
                </Form.Group>

                <Button type="submit" variant="success" disabled={loading} className="fw-bold">
                    {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Đang gửi...</>
                    ) : (
                        <><i className="bi bi-send me-1"></i>Gửi đánh giá</>
                    )}
                </Button>
            </Form>
        </div>
    );
};

export default ReviewForm;
