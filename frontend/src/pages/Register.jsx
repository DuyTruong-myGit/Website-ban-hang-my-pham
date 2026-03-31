import React, { useState } from 'react';
import { Container, Row, Col, Form, Button, Card, Alert } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await register(formData);
        if (result.success) {
            navigate('/');
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
                            <h3 className="fw-bold mb-4 text-hasaki">ĐĂNG KÝ</h3>
                            {error && <Alert variant="danger">{error}</Alert>}
                            <Form onSubmit={handleSubmit} className="text-start">
                                <Form.Group className="mb-3" controlId="name">
                                    <Form.Label className="small fw-medium">Họ và Tên</Form.Label>
                                    <Form.Control 
                                        type="text" 
                                        placeholder="Nhập họ tên đầy đủ" 
                                        onChange={handleChange}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="email">
                                    <Form.Label className="small fw-medium">Email</Form.Label>
                                    <Form.Control 
                                        type="email" 
                                        placeholder="Nhập email của bạn" 
                                        onChange={handleChange}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3" controlId="phone">
                                    <Form.Label className="small fw-medium">Số điện thoại</Form.Label>
                                    <Form.Control 
                                        type="tel" 
                                        placeholder="Nhập số điện thoại" 
                                        onChange={handleChange}
                                        required
                                        className="py-2"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-4" controlId="password">
                                    <Form.Label className="small fw-medium">Mật khẩu</Form.Label>
                                    <Form.Control 
                                        type="password" 
                                        placeholder="Nhập mật khẩu" 
                                        onChange={handleChange}
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
                                    {loading ? 'Đang tạo tài khoản...' : 'ĐĂNG KÝ'}
                                </Button>
                            </Form>
                            <p className="small text-muted mt-4">
                                Bạn đã có tài khoản? <Link to="/login" className="text-hasaki fw-bold text-decoration-none">Đăng nhập</Link>
                            </p>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Register;
