// StaffQuestions.jsx — TV4: Trang quản lý Hỏi đáp cho Staff
import React, { useState, useEffect } from 'react';
import { Table, Badge, Button, Modal, Form, Alert } from 'react-bootstrap';
import AdminLayout from '../../components/admin/AdminLayout';
import { questionApi } from '../../services/reviewService';

const StaffQuestions = () => {
    const [questions, setQuestions] = useState([]);
    const [activeTab, setActiveTab] = useState('pending'); // pending, all
    const [loading, setLoading] = useState(true);
    const [showAnswerModal, setShowAnswerModal] = useState(false);
    const [selectedQuestion, setSelectedQuestion] = useState(null);
    const [answerText, setAnswerText] = useState('');
    const [message, setMessage] = useState(null);

    useEffect(() => {
        loadQuestions();
    }, [activeTab]);

    const loadQuestions = async () => {
        setLoading(true);
        try {
            const res = activeTab === 'pending'
                ? await questionApi.getPending()
                : await questionApi.getAll();
            if (res.success) setQuestions(res.data || []);
        } catch (err) {
            console.error('Lỗi load Q&A:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (question) => {
        setSelectedQuestion(question);
        setAnswerText(question.answer || '');
        setShowAnswerModal(true);
    };

    const submitAnswer = async () => {
        if (!answerText.trim()) return;
        try {
            const res = await questionApi.answerQuestion(selectedQuestion.id, answerText.trim());
            if (res.success) {
                setMessage({ type: 'success', text: 'Đã trả lời câu hỏi!' });
                setShowAnswerModal(false);
                loadQuestions();
            }
        } catch (err) {
            setMessage({ type: 'danger', text: 'Lỗi gửi câu trả lời.' });
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
                    <i className="bi bi-question-circle me-2 text-primary"></i>Quản lý Hỏi đáp
                </h4>
                <div className="d-flex gap-2">
                    <Button variant={activeTab === 'pending' ? 'primary' : 'outline-primary'} size="sm"
                        onClick={() => setActiveTab('pending')}>
                        Chưa trả lời
                        {activeTab !== 'pending' && questions.filter(q => !q.answer).length > 0 && (
                            <Badge bg="danger" className="ms-1">{questions.filter(q => !q.answer).length}</Badge>
                        )}
                    </Button>
                    <Button variant={activeTab === 'all' ? 'primary' : 'outline-primary'} size="sm"
                        onClick={() => setActiveTab('all')}>
                        Tất cả
                    </Button>
                </div>
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
                            <th style={{ width: '15%' }}>Khách hàng</th>
                            <th style={{ width: '30%' }}>Câu hỏi</th>
                            <th style={{ width: '30%' }}>Câu trả lời</th>
                            <th style={{ width: '10%' }}>Ngày hỏi</th>
                            <th style={{ width: '15%' }}>Hành động</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan="5" className="text-center py-4">Đang tải...</td></tr>
                        ) : questions.length === 0 ? (
                            <tr><td colSpan="5" className="text-center py-4 text-muted">
                                {activeTab === 'pending' ? 'Không có câu hỏi chưa trả lời.' : 'Chưa có câu hỏi nào.'}
                            </td></tr>
                        ) : questions.map(q => (
                            <tr key={q.id}>
                                <td>
                                    <div className="fw-bold" style={{ fontSize: '0.85rem' }}>{q.userName}</div>
                                    <small className="text-muted">SP: {q.productId?.slice(-6)}</small>
                                </td>
                                <td style={{ fontSize: '0.85rem' }}>{q.question}</td>
                                <td style={{ fontSize: '0.85rem' }}>
                                    {q.answer ? (
                                        <div>
                                            <div>{q.answer}</div>
                                            <small className="text-muted">
                                                — {q.answeredByName} · {formatDate(q.answeredAt)}
                                            </small>
                                        </div>
                                    ) : (
                                        <Badge bg="warning" text="dark">
                                            <i className="bi bi-clock me-1"></i>Chưa trả lời
                                        </Badge>
                                    )}
                                </td>
                                <td><small>{formatDate(q.createdAt)}</small></td>
                                <td>
                                    <Button variant={q.answer ? 'outline-primary' : 'success'} size="sm"
                                        onClick={() => handleAnswer(q)}>
                                        <i className={`bi ${q.answer ? 'bi-pencil' : 'bi-reply'} me-1`}></i>
                                        {q.answer ? 'Sửa' : 'Trả lời'}
                                    </Button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </Table>
            </div>

            {/* Answer Modal */}
            <Modal show={showAnswerModal} onHide={() => setShowAnswerModal(false)} centered>
                <Modal.Header closeButton>
                    <Modal.Title style={{ fontSize: '1rem' }}>
                        <i className="bi bi-reply me-2"></i>Trả lời câu hỏi
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedQuestion && (
                        <div className="mb-3 p-2 bg-light rounded" style={{ fontSize: '0.85rem' }}>
                            <strong>{selectedQuestion.userName}</strong> hỏi:
                            <div className="mt-1">{selectedQuestion.question}</div>
                        </div>
                    )}
                    <Form.Group>
                        <Form.Label className="fw-semibold">Câu trả lời</Form.Label>
                        <Form.Control
                            as="textarea"
                            rows={3}
                            value={answerText}
                            onChange={(e) => setAnswerText(e.target.value)}
                            placeholder="Nhập câu trả lời..."
                        />
                    </Form.Group>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowAnswerModal(false)}>Hủy</Button>
                    <Button variant="success" onClick={submitAnswer} disabled={!answerText.trim()}>
                        <i className="bi bi-send me-1"></i>Gửi
                    </Button>
                </Modal.Footer>
            </Modal>
        </AdminLayout>
    );
};

export default StaffQuestions;
