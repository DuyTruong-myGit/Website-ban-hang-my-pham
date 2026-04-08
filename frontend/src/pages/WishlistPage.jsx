// WishlistPage.jsx — TV4: Trang yêu thích khách hàng
import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Button, Alert, Breadcrumb } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import { wishlistApi } from '../services/wishlistService';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import usePageTitle from '../hooks/usePageTitle';

const WishlistPage = () => {
    usePageTitle('Sản Phẩm Yêu Thích');
    const { token } = useAuth();
    const { addToCart } = useCart();
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        loadWishlist();
    }, [token]);

    const loadWishlist = async () => {
        try {
            const res = await wishlistApi.getWishlist();
            if (res.success) setItems(res.data || []);
        } catch (err) {
            console.error('Lỗi load wishlist:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (productId) => {
        try {
            await wishlistApi.removeFromWishlist(productId);
            setItems(prev => prev.filter(item => item.id !== productId));
            setMessage({ type: 'success', text: 'Đã xóa khỏi yêu thích.' });
        } catch (err) {
            setMessage({ type: 'danger', text: 'Lỗi xóa sản phẩm.' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const handleAddToCart = async (productId) => {
        const result = await addToCart(productId, 1, '');
        if (result.success) {
            setMessage({ type: 'success', text: 'Đã thêm vào giỏ hàng!' });
        } else {
            setMessage({ type: 'danger', text: result.message || 'Lỗi thêm giỏ hàng.' });
        }
        setTimeout(() => setMessage(null), 3000);
    };

    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price || 0);
    };

    return (
        <main className="bg-hasaki-bg-gray pb-5 pt-3" style={{ minHeight: '80vh' }}>
            <Container>
                <Breadcrumb className="bg-white px-3 py-2 rounded shadow-sm mb-3 small">
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/' }}>Trang chủ</Breadcrumb.Item>
                    <Breadcrumb.Item linkAs={Link} linkProps={{ to: '/account/profile' }}>Tài khoản</Breadcrumb.Item>
                    <Breadcrumb.Item active>Yêu thích</Breadcrumb.Item>
                </Breadcrumb>

                <div className="bg-white p-4 rounded shadow-sm">
                    <h4 className="fw-bold mb-4">
                        <i className="bi bi-heart me-2 text-danger"></i>
                        Sản phẩm yêu thích ({items.length})
                    </h4>

                    {message && (
                        <Alert variant={message.type} dismissible onClose={() => setMessage(null)}
                            className="py-2">
                            {message.text}
                        </Alert>
                    )}

                    {loading ? (
                        <div className="text-center py-5 text-muted">Đang tải...</div>
                    ) : items.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="bi bi-heart fs-1 d-block mb-3 text-muted opacity-25"></i>
                            <p className="text-muted">Bạn chưa có sản phẩm yêu thích nào.</p>
                            <Button variant="success" as={Link} to="/" className="fw-bold">
                                <i className="bi bi-arrow-left me-1"></i>Khám phá sản phẩm
                            </Button>
                        </div>
                    ) : (
                        <Row>
                            {items.map((item) => {
                                const product = item;
                                if (!product) return null;
                                const displayPrice = product.salePrice > 0 ? product.salePrice : product.basePrice;
                                const hasDiscount = product.salePrice > 0 && product.salePrice < product.basePrice;

                                return (
                                    <Col md={4} lg={3} key={item.id} className="mb-4">
                                        <div className="border rounded overflow-hidden h-100 bg-white position-relative"
                                            style={{ transition: 'box-shadow 0.2s' }}
                                            onMouseEnter={(e) => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.1)'}
                                            onMouseLeave={(e) => e.currentTarget.style.boxShadow = 'none'}>

                                            {/* Xóa button */}
                                            <button
                                                className="btn btn-sm position-absolute top-0 end-0 m-2 z-1"
                                                style={{ background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: 32, height: 32 }}
                                                onClick={() => handleRemove(item.id)}
                                                title="Xóa khỏi yêu thích">
                                                <i className="bi bi-x text-danger"></i>
                                            </button>

                                            {/* Badge giảm giá */}
                                            {hasDiscount && (
                                                <span className="badge bg-danger position-absolute top-0 start-0 m-2 z-1">
                                                    -{Math.round(((product.basePrice - product.salePrice) / product.basePrice) * 100)}%
                                                </span>
                                            )}

                                            {/* Ảnh */}
                                            <Link to={`/product/${product.slug}`}>
                                                <img
                                                    src={product.images?.[0] || 'https://via.placeholder.com/200x200?text=No+Image'}
                                                    alt={product.name}
                                                    style={{ width: '100%', height: '180px', objectFit: 'cover' }}
                                                />
                                            </Link>

                                            {/* Info */}
                                            <div className="p-3">
                                                <Link to={`/product/${product.slug}`}
                                                    className="text-decoration-none text-dark">
                                                    <div className="fw-bold mb-1" style={{
                                                        fontSize: '0.85rem', display: '-webkit-box',
                                                        WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden'
                                                    }}>
                                                        {product.name}
                                                    </div>
                                                </Link>

                                                <div className="mb-2">
                                                    <span className="fw-bold text-danger">{formatPrice(displayPrice)}</span>
                                                    {hasDiscount && (
                                                        <span className="text-muted text-decoration-line-through ms-2" style={{ fontSize: '0.8rem' }}>
                                                            {formatPrice(product.basePrice)}
                                                        </span>
                                                    )}
                                                </div>

                                                <Button variant="outline-success" size="sm" className="w-100 fw-bold"
                                                    disabled={!product.inStock}
                                                    onClick={() => handleAddToCart(product.id)}>
                                                    {product.inStock ? (
                                                        <><i className="bi bi-cart-plus me-1"></i>Thêm giỏ</>
                                                    ) : (
                                                        'Hết hàng'
                                                    )}
                                                </Button>
                                            </div>
                                        </div>
                                    </Col>
                                );
                            })}
                        </Row>
                    )}
                </div>
            </Container>
        </main>
    );
};

export default WishlistPage;
