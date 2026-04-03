import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  Button,
  Badge,
} from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import Loading from "../components/common/Loading";
import VariantSelector from "../components/common/VariantSelector";
import { productApi } from "../services/customerService";

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);

  const [mainImage, setMainImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const res = await productApi.getBySlug(slug);
        if (res?.success) {
          const prodData = res.data;
          setProduct(prodData);

          if (prodData.images && prodData.images.length > 0) {
            setMainImage(prodData.images[0]);
          }

          if (prodData.variants && prodData.variants.length > 0) {
            setSelectedVariant(prodData.variants[0]);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy chi tiết sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProductDetail();
  }, [slug]);

  if (loading) return <Loading message="Đang tải thông tin sản phẩm..." />;
  if (!product)
    return (
      <Container className="py-5 text-center">
        <h5>Không tìm thấy sản phẩm!</h5>
      </Container>
    );

  const displaySalePrice =
    selectedVariant?.salePrice > 0
      ? selectedVariant.salePrice
      : product.salePrice > 0
        ? product.salePrice
        : null;
  const displayBasePrice = selectedVariant?.price || product.basePrice;

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price || 0);
  };

  return (
    <main className="bg-hasaki-bg-gray pb-5 pt-3">
      <Container>
        <Breadcrumb className="bg-white px-3 py-2 rounded shadow-sm mb-3 small">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item active>{product.name}</Breadcrumb.Item>
        </Breadcrumb>

        <div className="bg-white p-4 rounded shadow-sm mb-4">
          <Row>
            <Col md={5}>
              <div className="border rounded mb-3 p-2 text-center position-relative">
                {displaySalePrice && (
                  <Badge
                    bg="danger"
                    className="position-absolute top-0 start-0 m-2 px-2 py-1 fs-6"
                  >
                    -
                    {Math.round(
                      ((displayBasePrice - displaySalePrice) /
                        displayBasePrice) *
                        100,
                    )}
                    %
                  </Badge>
                )}
                <img
                  src={
                    mainImage ||
                    "https://via.placeholder.com/500x500?text=No+Image"
                  }
                  alt={product.name}
                  className="img-fluid"
                  style={{ maxHeight: "400px", objectFit: "contain" }}
                />
              </div>
              <div className="d-flex gap-2 overflow-auto pb-2">
                {product.images?.map((img, idx) => (
                  <img
                    key={idx}
                    src={img}
                    alt={`thumb-${idx}`}
                    className={`border rounded cursor-pointer ${mainImage === img ? "border-success border-2" : ""}`}
                    style={{
                      width: "60px",
                      height: "60px",
                      objectFit: "cover",
                    }}
                    onClick={() => setMainImage(img)}
                  />
                ))}
              </div>
            </Col>

            <Col md={7}>
              <h4 className="fw-bold lh-base">{product.name}</h4>
              <div className="d-flex align-items-center gap-3 mb-3 text-muted small">
                <span>
                  Mã SP:{" "}
                  <strong className="text-dark">
                    {product.sku || "Đang cập nhật"}
                  </strong>
                </span>
                <span>
                  Thương hiệu:{" "}
                  <strong className="text-hasaki">
                    {product.brandId || "Đang cập nhật"}
                  </strong>
                </span>
              </div>

              <div className="bg-light p-3 rounded mb-4">
                <div className="d-flex align-items-baseline gap-3">
                  <span className="fs-2 fw-bold text-danger">
                    {formatPrice(displaySalePrice || displayBasePrice)}
                  </span>
                  {displaySalePrice && (
                    <span className="text-muted text-decoration-line-through fs-5">
                      {formatPrice(displayBasePrice)}
                    </span>
                  )}
                </div>
              </div>

              {/* COMPONENT ĐƯỢC TÁI SỬ DỤNG Ở ĐÂY */}
              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelectVariant={(v) => {
                  setSelectedVariant(v);
                  if (v.imageUrl) setMainImage(v.imageUrl);
                }}
              />

              <div className="d-flex gap-3 mt-4">
                <Button
                  variant="outline-success"
                  size="lg"
                  className="w-50 border-2 fw-bold text-hasaki bg-white"
                >
                  <i className="bi bi-cart-plus me-2"></i>THÊM VÀO GIỎ
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  className="w-50 fw-bold bg-hasaki border-0"
                >
                  MUA NGAY
                </Button>
              </div>

              {product.shortDescription && (
                <div className="mt-4 pt-4 border-top">
                  <h6 className="fw-bold">Tóm tắt sản phẩm:</h6>
                  <p className="text-muted small lh-lg">
                    {product.shortDescription}
                  </p>
                </div>
              )}
            </Col>
          </Row>
        </div>

        <div className="bg-white p-4 rounded shadow-sm">
          <h5 className="fw-bold mb-4 border-bottom pb-2">
            THÔNG TIN SẢN PHẨM
          </h5>
          {product.description ? (
            <div
              className="text-muted lh-lg"
              dangerouslySetInnerHTML={{ __html: product.description }}
            />
          ) : (
            <p className="text-muted">Đang cập nhật mô tả chi tiết...</p>
          )}
        </div>
      </Container>
    </main>
  );
};

export default ProductDetail;
