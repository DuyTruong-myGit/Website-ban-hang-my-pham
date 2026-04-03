import React from 'react';
import { Container, Row, Col, Form, InputGroup, Button } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';

const Header = () => {
    const { user, logout } = useAuth();
    const { totalItems } = useCart();
    const navigate = useNavigate();

    return (
        <header>
            <div className="topbar">
                <Container>
                    <div className="d-flex justify-content-between">
                        <span>NowFree - Giao nhanh miễn phí 2H | 100% Hàng chính hãng</span>
                        <div className="d-flex gap-3">
                            <span className="cursor-pointer">Chi nhánh</span>
                            <span className="cursor-pointer">Tải ứng dụng</span>
                        </div>
                    </div>
                </Container>
            </div>
            
            <div className="main-header py-2 d-flex align-items-center">
                <Container>
                    <Row className="align-items-center">
                        <Col xs={2}>
                            <Link to="/" className="text-white text-decoration-none fw-bold fs-3">
                                HASAKI
                            </Link>
                        </Col>
                        <Col xs={6}>
                            <InputGroup className="search-container">
                                <Form.Control
                                    placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                                    aria-label="Search"
                                />
                                <Button variant="light" className="bg-white border-0 text-hasaki">
                                    <i className="bi bi-search"></i>
                                </Button>
                            </InputGroup>
                        </Col>
                        <Col xs={4}>
                            <div className="d-flex justify-content-end align-items-center gap-4 text-white">
                                <div className="d-flex flex-column align-items-center cursor-pointer">
                                    <i className="bi bi-geo-alt fs-4"></i>
                                    <span style={{fontSize: '11px'}}>Cửa hàng</span>
                                </div>
                                <div className="d-flex flex-column align-items-center cursor-pointer">
                                    <i className="bi bi-headset fs-4"></i>
                                    <span style={{fontSize: '11px'}}>Hỗ trợ</span>
                                </div>
                                
                                {/* Icon Admin/Staff Panel theo role */}
                                {user && (user.role === 'admin' || user.role === 'staff') && (
                                    <div
                                        className="d-flex flex-column align-items-center cursor-pointer position-relative"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate(user.role === 'admin' ? '/admin/dashboard' : '/staff/dashboard')}
                                    >
                                        <i className="bi bi-speedometer2 fs-4"></i>
                                        <span style={{ fontSize: '11px' }}>
                                            {user.role === 'admin' ? 'Admin' : 'Staff'}
                                        </span>
                                    </div>
                                )}

                                {/* Icon tài khoản */}
                                {user ? (
                                    <div
                                        className="d-flex flex-column align-items-center cursor-pointer"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => navigate('/profile')}
                                    >
                                        <i className="bi bi-person fs-4"></i>
                                        <span style={{ fontSize: '11px' }}>Chào, {user.name.split(' ').pop()}</span>
                                    </div>
                                ) : (
                                    <Link to="/login" className="text-white text-decoration-none d-flex flex-column align-items-center">
                                        <i className="bi bi-person fs-4"></i>
                                        <span style={{ fontSize: '11px' }}>Tài khoản</span>
                                    </Link>
                                )}

                                {/* Icon giỏ hàng — hiển thị số lượng từ CartContext */}
                                <Link to="/cart" className="text-white text-decoration-none d-flex flex-column align-items-center cursor-pointer position-relative">
                                    <i className="bi bi-cart3 fs-4"></i>
                                    {totalItems > 0 && (
                                        <span
                                            className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-hasaki-secondary"
                                            style={{ fontSize: '9px', marginTop: '5px' }}
                                        >
                                            {totalItems > 99 ? '99+' : totalItems}
                                        </span>
                                    )}
                                    <span style={{ fontSize: '11px' }}>Giỏ hàng</span>
                                </Link>
                            </div>
                        </Col>
                    </Row>
                </Container>
            </div>

            <div className="nav-menu">
                <Container>
                    <div className="d-flex">
                        <div className="bg-hasaki text-white p-2 px-3 fw-bold cursor-pointer d-flex align-items-center gap-2">
                             <i className="bi bi-list"></i> DANH MỤC
                        </div>
                        <nav className="d-flex align-items-center">
                            <Link to="/" className="nav-link-item">Flash Deals</Link>
                            <Link to="/" className="nav-link-item">Hot Deals</Link>
                            <Link to="/" className="nav-link-item">Thương hiệu</Link>
                            <Link to="/" className="nav-link-item">Skin & Spa</Link>
                            <Link to="/" className="nav-link-item">Cẩm nang</Link>
                        </nav>
                    </div>
                </Container>
            </div>
        </header>
    );
};

export default Header;
