// AI hỗ trợ: Trang quên mật khẩu - xác thực bằng email + số điện thoại đã đăng ký
import React, { useState } from 'react';
import { Container, Row, Col, Card, Form, Button, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (newPassword.length < 6) {
            setError('Mật khẩu mới phải có ít nhất 6 ký tự.');
            return;
        }
        if (newPassword !== confirmPassword) {
            setError('Mật khẩu mới và xác nhận không khớp.');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${API_BASE}/auth/forgot-password`, {
                email,
                phone,
                newPassword,
            });
            if (res.data.success) {
                setSuccess('Mật khẩu đã được đặt lại thành công! Đang chuyển về trang đăng nhập...');
                setTimeout(() => navigate('/login'), 2000);
            } else {
                setError(res.data.message || 'Đặt lại mật khẩu thất bại.');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Email hoặc số điện thoại không chính xác.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={5}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-5 text-center">
                            <h3 className="fw-bold mb-2 text-hasaki">QUÊN MẬT KHẨU</h3>
                            <p className="text-muted small mb-4">
                                Nhập email và số điện thoại đã đăng ký để đặt lại mật khẩu.
                            </p>
                            {error && <Alert variant="danger">{error}</Alert>}
                            {success && <Alert variant="success">{success}</Alert>}
                            <Form onSubmit={handleSubmit} className="text-start">
                                <Form.Group className="mb-3" controlId="fpEmail">
                                    <Form.Label className="small fw-medium">Email</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Nhập email đã đăng ký"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="fpPhone">
                                    <Form.Label className="small fw-medium">Số điện thoại</Form.Label>
                                    <Form.Control
                                        type="text"
                                        placeholder="Nhập SĐT đã đăng ký"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="fpNewPassword">
                                    <Form.Label className="small fw-medium">Mật khẩu mới</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="fpConfirmPassword">
                                    <Form.Label className="small fw-medium">Xác nhận mật khẩu mới</Form.Label>
                                    <Form.Control
                                        type="password"
                                        placeholder="Nhập lại mật khẩu mới"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Button
                                    variant="success"
                                    type="submit"
                                    className="w-100 py-2 bg-hasaki border-0 mb-3"
                                    disabled={loading}
                                >
                                    {loading ? 'Đang xử lý...' : 'ĐẶT LẠI MẬT KHẨU'}
                                </Button>
                            </Form>
                            <p className="small text-muted mt-3">
                                Đã nhớ mật khẩu? <Link to="/login" className="text-hasaki fw-bold text-decoration-none">Đăng nhập</Link>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default ForgotPassword;
