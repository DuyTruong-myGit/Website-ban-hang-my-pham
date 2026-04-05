import React, { useState } from 'react';
import { Form, Button, Alert } from 'react-bootstrap';
import { questionApi } from '../../services/reviewService';
import { useAuth } from '../../context/AuthContext';

/**
 * QuestionForm — Form đặt câu hỏi về sản phẩm
 * Props: productId, onQuestionCreated (callback)
 */
const QuestionForm = ({ productId, onQuestionCreated }) => {
    const { token } = useAuth();
    const [question, setQuestion] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);

    if (!token) {
        return (
            <div className="text-center py-3 text-muted" style={{ fontSize: '0.9rem' }}>
                <i className="bi bi-lock me-1"></i>
                Vui lòng <a href="/login" className="text-success fw-bold">đăng nhập</a> để đặt câu hỏi.
            </div>
        );
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!question.trim()) {
            setMessage({ type: 'warning', text: 'Vui lòng nhập câu hỏi.' });
            return;
        }

        setLoading(true);
        setMessage(null);
        try {
            const res = await questionApi.createQuestion({
                productId,
                question: question.trim(),
            });
            if (res.success) {
                setMessage({ type: 'success', text: 'Đã gửi câu hỏi! Nhân viên sẽ trả lời sớm.' });
                setQuestion('');
                if (onQuestionCreated) onQuestionCreated();
            } else {
                setMessage({ type: 'danger', text: res.message || 'Có lỗi xảy ra.' });
            }
        } catch (err) {
            setMessage({
                type: 'danger',
                text: err.response?.data?.message || 'Có lỗi xảy ra.',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="border rounded p-3 bg-light mt-3">
            <h6 className="fw-bold mb-3">
                <i className="bi bi-question-circle me-1"></i>Đặt câu hỏi
            </h6>

            {message && (
                <Alert variant={message.type} dismissible onClose={() => setMessage(null)}
                    className="py-2" style={{ fontSize: '0.85rem' }}>
                    {message.text}
                </Alert>
            )}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3">
                    <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Nhập câu hỏi của bạn về sản phẩm..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        style={{ fontSize: '0.9rem' }}
                    />
                </Form.Group>

                <Button type="submit" variant="outline-success" size="sm" disabled={loading} className="fw-bold">
                    {loading ? (
                        <><span className="spinner-border spinner-border-sm me-1"></span>Đang gửi...</>
                    ) : (
                        <><i className="bi bi-send me-1"></i>Gửi câu hỏi</>
                    )}
                </Button>
            </Form>
        </div>
    );
};

export default QuestionForm;
