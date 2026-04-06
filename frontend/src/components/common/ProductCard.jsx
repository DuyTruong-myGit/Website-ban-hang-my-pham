import React, { useState, useEffect } from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { wishlistApi } from "../../services/wishlistService";
import { useAuth } from "../../context/AuthContext";

const ProductCard = ({ product }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLiked, setIsLiked] = useState(false);

  useEffect(() => {
    if (user && product) {
        wishlistApi.checkWishlist(product.id || product._id)
            .then(res => {
                if (res.success) setIsLiked(res.data.inWishlist);
            })
            .catch(() => {});
    } else {
        setIsLiked(false);
    }
  }, [user, product]);

  useEffect(() => {
    const handleWishlistChange = (e) => {
        const { productId, liked } = e.detail;
        if (product && (product.id || product._id) === productId) {
            setIsLiked(liked);
        }
    };
    window.addEventListener('wishlistChanged', handleWishlistChange);
    return () => window.removeEventListener('wishlistChanged', handleWishlistChange);
  }, [product]);

  const handleToggleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      alert("Vui lòng đăng nhập để thêm vào yêu thích");
      navigate("/login");
      return;
    }
    try {
      const productId = product.id || product._id;
      if (isLiked) {
        const res = await wishlistApi.removeFromWishlist(productId);
        if (res.success) {
            setIsLiked(false);
            window.dispatchEvent(new CustomEvent('wishlistChanged', { detail: { productId, liked: false } }));
        }
      } else {
        const res = await wishlistApi.addToWishlist(productId);
        if (res.success) {
            setIsLiked(true);
            window.dispatchEvent(new CustomEvent('wishlistChanged', { detail: { productId, liked: true } }));
        }
      }
    } catch(err) {
      alert("Có lỗi xảy ra");
    }
  };

  // Format giá tiền
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  // Tính phần trăm giảm giá
  const discountPercent =
    product.salePrice &&
    product.basePrice &&
    product.basePrice > product.salePrice
      ? Math.round(
          ((product.basePrice - product.salePrice) / product.basePrice) * 100,
        )
      : 0;

  // Lấy ảnh đầu tiên (nếu có)
  const displayImage =
    product.images && product.images.length > 0
      ? product.images[0]
      : "https://via.placeholder.com/300x300?text=No+Image";

  return (
    <Card
      className="h-100 shadow-sm border-0 product-card position-relative"
      style={{ transition: "transform 0.2s", cursor: "pointer" }}
    >
      {/* Badge Giảm Giá */}
      {discountPercent > 0 && (
        <Badge
          bg="danger"
          className="position-absolute top-0 start-0 m-2 px-2 py-1 z-1"
        >
          -{discountPercent}%
        </Badge>
      )}

      {/* Button Yêu Thích */}
      <div 
        className="position-absolute top-0 end-0 m-2 z-1"
        style={{ cursor: 'pointer', background: 'rgba(255,255,255,0.9)', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
        onClick={handleToggleWishlist}
        title={isLiked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
      >
        <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} text-danger fs-6 hover-hasaki`}></i>
      </div>

      <Link
        to={`/product/${product.slug}`}
        className="text-decoration-none text-dark"
      >
        <Card.Img
          variant="top"
          src={displayImage}
          style={{ height: "200px", objectFit: "contain", padding: "10px" }}
        />
        <Card.Body className="d-flex flex-column">
          <Card.Title
            className="fs-6 mb-3"
            style={{
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
              height: "40px",
            }}
          >
            {product.name}
          </Card.Title>

          <div className="mt-auto">
            <div className="fw-bold text-danger fs-5 mb-0">
              {formatPrice(
                product.salePrice > 0 ? product.salePrice : product.basePrice,
              )}
            </div>
            <div
              className="text-muted text-decoration-line-through small"
              style={{ minHeight: "20px" }}
            >
              {product.salePrice > 0 ? formatPrice(product.basePrice) : ""}
            </div>
            <Button
              variant="outline-success"
              size="sm"
              className="w-100 mt-3 border-hasaki text-hasaki fw-medium"
            >
              Chọn mua
            </Button>
          </div>
        </Card.Body>
      </Link>
    </Card>
  );
};

export default ProductCard;
