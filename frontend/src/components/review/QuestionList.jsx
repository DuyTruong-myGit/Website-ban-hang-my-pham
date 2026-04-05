import React, { useState, useEffect } from 'react';
import { Badge } from 'react-bootstrap';
import { questionApi } from '../../services/reviewService';

/**
 * QuestionList — Danh sách hỏi đáp sản phẩm
 * Props: productId
 */
const QuestionList = ({ productId }) => {
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await questionApi.getProductQuestions(productId);
                if (res.success) setQuestions(res.data || []);
            } catch (err) {
                console.error('Lỗi load Q&A:', err);
            } finally {
                setLoading(false);
            }
        };
        if (productId) load();
    }, [productId]);

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

    if (loading) return <div className="text-center py-3 text-muted">Đang tải câu hỏi...</div>;

    return (
        <div>
            {questions.length === 0 ? (
                <div className="text-center text-muted py-4">
                    <i className="bi bi-question-circle fs-1 d-block mb-2 opacity-25"></i>
                    Chưa có câu hỏi nào. Hãy là người đầu tiên hỏi!
                </div>
            ) : (
                questions.map((q) => (
                    <div key={q.id} className="border-bottom py-3">
                        {/* Câu hỏi */}
                        <div className="d-flex gap-2">
                            <div className="fw-bold text-primary" style={{ fontSize: '1rem', minWidth: 20 }}>H:</div>
                            <div className="flex-grow-1">
                                <div style={{ fontSize: '0.9rem' }}>{q.question}</div>
                                <div className="d-flex gap-2 mt-1" style={{ fontSize: '0.75rem', color: '#999' }}>
                                    <span><i className="bi bi-person me-1"></i>{q.userName}</span>
                                    <span>· {formatTime(q.createdAt)}</span>
                                </div>
                            </div>
                        </div>

                        {/* Câu trả lời */}
                        {q.answer ? (
                            <div className="d-flex gap-2 mt-2 ms-3 p-2 bg-light rounded">
                                <div className="fw-bold text-success" style={{ fontSize: '1rem', minWidth: 20 }}>Đ:</div>
                                <div className="flex-grow-1">
                                    <div style={{ fontSize: '0.9rem' }}>{q.answer}</div>
                                    <div className="d-flex gap-2 mt-1" style={{ fontSize: '0.75rem', color: '#999' }}>
                                        <span>
                                            <i className="bi bi-shield-check me-1"></i>
                                            {q.answeredByName || 'Nhân viên'}
                                        </span>
                                        <span>· {formatTime(q.answeredAt)}</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="ms-4 mt-1">
                                <Badge bg="warning" text="dark" style={{ fontSize: '0.7rem' }}>
                                    <i className="bi bi-clock me-1"></i>Đang chờ trả lời
                                </Badge>
                            </div>
                        )}
                    </div>
                ))
            )}
        </div>
    );
};

export default QuestionList;
