import React from "react";
import { Card, Button, Badge } from "react-bootstrap";
import { Link } from "react-router-dom";

const ProductCard = ({ product }) => {
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
