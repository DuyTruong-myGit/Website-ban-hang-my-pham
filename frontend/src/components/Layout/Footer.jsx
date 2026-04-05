import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const Footer = () => {
    return (
        <footer className="bg-white border-top mt-5 py-5">
            <Container>
                <Row>
                    <Col md={3}>
                        <h6 className="fw-bold mb-3">Về HASAKI.VN</h6>
                        <ul className="list-unstyled text-muted" style={{fontSize: '14px'}}>
                            <li className="mb-2">Giới thiệu Hasaki</li>
                            <li className="mb-2">Hệ thống cửa hàng</li>
                            <li className="mb-2">Điều khoản sử dụng</li>
                            <li className="mb-2">Chính sách bảo mật</li>
                        </ul>
                    </Col>
                    <Col md={3}>
                        <h6 className="fw-bold mb-3">HỖ TRỢ KHÁCH HÀNG</h6>
                        <ul className="list-unstyled text-muted" style={{fontSize: '14px'}}>
                            <li className="mb-2">Tra cứu đơn hàng</li>
                            <li className="mb-2">Chính sách đổi trả</li>
                            <li className="mb-2">Câu hỏi thường gặp</li>
                            <li>Liên hệ: 1800 6324</li>
                        </ul>
                    </Col>
                    <Col md={3}>
                        <h6 className="fw-bold mb-3">DANH MỤC NỔI BẬT</h6>
                        <ul className="list-unstyled text-muted" style={{fontSize: '14px'}}>
                            <li className="mb-2">Tẩy trang</li>
                            <li className="mb-2">Sữa rửa mặt</li>
                            <li className="mb-2">Kem chống nắng</li>
                        </ul>
                    </Col>
                    <Col md={3}>
                        <h6 className="fw-bold mb-3">KẾT NỐI VỚI CHÚNG TÔI</h6>
                        <div className="d-flex gap-3">
                            <i className="bi bi-facebook fs-4 text-primary"></i>
                            <i className="bi bi-instagram fs-4 text-danger"></i>
                            <i className="bi bi-youtube fs-4 text-danger"></i>
                        </div>
                    </Col>
                </Row>
                <hr className="my-4" />
                <div className="text-center text-muted small">
                    © 2026 HASAKI CLONE Project - Designed with "We are family company"
                </div>
            </Container>
        </footer>
    );
};

export default Footer;
