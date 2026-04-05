import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        if (result.success) {
            // Redirect theo role sau khi đăng nhập
            const role = result.user?.role;
            if (role === 'admin') {
                navigate('/admin/dashboard');
            } else if (role === 'staff') {
                navigate('/staff/dashboard');
            } else {
                navigate('/');
            }
        } else {
            setError(result.message);
        }
        setLoading(false);
    };

    return (
        <Container className="my-5">
            <Row className="justify-content-center">
                <Col md={5}>
                    <Card className="shadow-sm border-0">
                        <Card.Body className="p-5 text-center">
                            <h3 className="fw-bold mb-4 text-hasaki">ĐĂNG NHẬP</h3>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit} className="text-start">
                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label className="small fw-medium">Email / Số điện thoại</Form.Label>
                                    <Form.Control
                                        type="email"
                                        placeholder="Nhập email của bạn"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="password">
                                    <div className="d-flex justify-content-between align-items-center">
                                        <Form.Label className="small fw-medium">Mật khẩu</Form.Label>
                                        <Link to="/forgot-password" className="small text-hasaki text-decoration-none">Quên mật khẩu?</Link>
                                    </div>
                                    <Form.Control
                                        type="password"
                                        placeholder="Nhập mật khẩu"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
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
                                    {loading ? 'Đang xử lý...' : 'ĐĂNG NHẬP'}
                                </Button>
                            </Form>
                            <p className="small text-muted mt-4">
                                Bạn chưa có tài khoản? <Link to="/register" className="text-hasaki fw-bold text-decoration-none">Đăng ký ngay</Link>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
