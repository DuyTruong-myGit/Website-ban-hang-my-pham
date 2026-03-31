import React from 'react';
import { Container, Row, Col, Card, Button, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import heroBanner from '../assets/hero-banner.png';

const Home = () => {
    const categories = [
        { name: 'Tẩy Trang', img: 'https://hasaki.vn/images/graphics/cate-1.jpg' },
        { name: 'Sữa Rửa Mặt', img: 'https://hasaki.vn/images/graphics/cate-2.jpg' },
        { name: 'Kem Chống Nắng', img: 'https://hasaki.vn/images/graphics/cate-3.jpg' },
        { name: 'Serum', img: 'https://hasaki.vn/images/graphics/cate-4.jpg' },
        { name: 'Son Môi', img: 'https://hasaki.vn/images/graphics/cate-5.jpg' },
        { name: 'Mặt Nạ', img: 'https://hasaki.vn/images/graphics/cate-6.jpg' },
    ];

    const products = [
        { id: 1, name: 'Sữa Rửa Mặt CeraVe Foaming Facial Cleanser', price: '350.000đ', oldPrice: '420.000đ', discount: '17%', img: 'https://media.hasaki.vn/catalog/product/g/o/google-shopping-sua-rua-mat-cerave-giup-lam-sach-sau-cho-da-dau-473ml-1_1.jpg' },
        { id: 2, name: 'Nước Tẩy Trang La Roche-Posay Micellar Water', price: '455.000đ', oldPrice: '525.000đ', discount: '13%', img: 'https://media.hasaki.vn/catalog/product/t/o/top-nuoc-tay-trang-la-roche-posay-danh-cho-da-dau-nhay-cam-400ml_1.jpg' },
        { id: 3, name: 'Kem Chống Nắng Anessa Perfect UV Skincare', price: '585.000đ', oldPrice: '685.000đ', discount: '15%', img: 'https://media.hasaki.vn/catalog/product/p/r/promo-sua-chong-nang-anessa-bao-ve-hoan-hao-60ml-1649231641_1.jpg' },
        { id: 4, name: 'Serum Klairs Rich Moist Soothing', price: '295.000đ', oldPrice: '380.000đ', discount: '22%', img: 'https://media.hasaki.vn/catalog/product/s/e/serum-klairs-duong-am-sau-cho-da-80ml_1.jpg' },
    ];

    return (
        <main className="pb-5">
            {/* Hero Slider Area */}
            <Container>
                <div className="hero-banner shadow-sm">
                    <img src={heroBanner} alt="Hero Banner" className="w-100 img-fluid" style={{ maxHeight: '400px', objectFit: 'cover' }} />
                </div>
            </Container>

            {/* Categories Section */}
            <Container className="mt-5">
                <h4 className="fw-bold mb-4">DANH MỤC NỔI BẬT</h4>
                <div className="d-flex justify-content-between overflow-auto pb-2 gap-3">
                    {categories.map((cat, idx) => (
                        <div key={idx} className="category-item text-center cursor-pointer flex-shrink-0" style={{ width: '120px' }}>
                            <div className="bg-light border rounded-circle d-flex align-items-center justify-content-center mx-auto" style={{ width: '80px', height: '80px' }}>
                                <span className="small text-muted text-center px-1" style={{ fontSize: '10px' }}>{cat.name}</span>
                            </div>
                            <p className="small fw-medium mt-2">{cat.name}</p>
                        </div>
                    ))}
                </div>
            </Container>

            {/* Flash Sale Section */}
            <Container className="mt-5 bg-white p-4 rounded shadow-sm">
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="d-flex align-items-center gap-3">
                        <h4 className="fw-bold text-danger mb-0">FLASH DEALS</h4>
                        <Badge bg="dark" className="p-2">02 : 15 : 45</Badge>
                    </div>
                    <Link to="/" className="text-hasaki text-decoration-none small">Xem tất cả &gt;</Link>
                </div>
                <Row>
                    {products.map(prod => (
                        <Col key={prod.id} xs={6} md={3} className="mb-4">
                            <Card className="product-card h-100 p-2">
                                <div className="position-relative text-center">
                                    <div className="bg-light d-flex align-items-center justify-content-center" style={{ height: '180px' }}>
                                        <span className="small text-muted px-2">Ảnh sản phẩm</span>
                                    </div>
                                    <span className="discount-badge position-absolute top-0 start-0">-{prod.discount}</span>
                                </div>
                                <Card.Body className="d-flex flex-column px-1">
                                    <Card.Title className="fs-6 mb-2 text-truncate-2" style={{ height: '40px', overflow: 'hidden' }}>
                                        {prod.name}
                                    </Card.Title>
                                    <div className="mt-auto">
                                        <div className="text-danger fw-bold fs-5">{prod.price}</div>
                                        <div className="text-muted text-decoration-line-through small">{prod.oldPrice}</div>
                                        <Button variant="outline-success" size="sm" className="w-100 mt-3 border-hasaki text-hasaki">
                                            Chọn mua
                                        </Button>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Container>

            {/* Banner Quảng Cáo Phụ */}
            <Container className="mt-5">
                <Row className="g-3">
                    <Col md={6}>
                        <div className="bg-light border rounded d-flex align-items-center justify-content-center shadow-sm" style={{ height: '150px' }}>
                            <span className="text-muted">Quảng cáo 1</span>
                        </div>
                    </Col>
                    <Col md={6}>
                        <div className="bg-light border rounded d-flex align-items-center justify-content-center shadow-sm" style={{ height: '150px' }}>
                            <span className="text-muted">Quảng cáo 2</span>
                        </div>
                    </Col>
                </Row>
            </Container>
        </main>
    );
};

export default Home;
