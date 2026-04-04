import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Breadcrumb,
  Button,
  Badge,
  Tabs,
  Tab,
  Form,
  InputGroup,
} from "react-bootstrap";
import { useParams, Link, useNavigate } from "react-router-dom";
import Loading from "../components/common/Loading";
import VariantSelector from "../components/common/VariantSelector";
import ProductGrid from "../components/common/ProductGrid";
import ReviewList from "../components/review/ReviewList";
import ReviewForm from "../components/review/ReviewForm";
import QuestionList from "../components/review/QuestionList";
import QuestionForm from "../components/review/QuestionForm";
import { productApi, brandApi } from "../services/customerService";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import { wishlistApi } from "../services/wishlistService";

const ProductDetail = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { user } = useAuth();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isLiked, setIsLiked] = useState(false);

  const [mainImage, setMainImage] = useState("");
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [brandName, setBrandName] = useState("Đang cập nhật");

  //  State cho Số lượng và Sản phẩm liên quan
  const [quantity, setQuantity] = useState(1);
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [addingToCart, setAddingToCart] = useState(false);
  const [reviewKey, setReviewKey] = useState(0); // Force reload reviews
  const [cartMessage, setCartMessage] = useState(null);

  useEffect(() => {
    const fetchProductDetail = async () => {
      setLoading(true);
      try {
        const res = await productApi.getBySlug(slug);
        if (res?.success) {
          const prodData = res.data;
          setProduct(prodData);

          // Check wishlist
          if (user) {
            wishlistApi.checkWishlist(prodData.id || prodData._id)
              .then(wRes => {
                if (wRes.success) setIsLiked(wRes.data.inWishlist);
              })
              .catch(() => {});
          } else {
            setIsLiked(false);
          }

          if (prodData.images && prodData.images.length > 0) {
            setMainImage(prodData.images[0]);
          }

          if (prodData.variants && prodData.variants.length > 0) {
            setSelectedVariant(prodData.variants[0]);
          }

          // Lấy Tên thương hiệu
          if (prodData.brandId) {
            const brandRes = await brandApi.getAll();
            if (brandRes?.success) {
              const brandInfo = brandRes.data.find(
                (b) => (b.id || b._id) === prodData.brandId,
              );
              if (brandInfo) setBrandName(brandInfo.name);
            }
          }

          //  Lấy Sản phẩm liên quan (cùng danh mục)
          if (prodData.categoryId) {
            const relatedRes = await productApi.getProducts({
              categoryId: prodData.categoryId,
              limit: 6,
            });
            if (relatedRes?.success) {
              // Lọc bỏ chính sản phẩm hiện tại ra khỏi danh sách
              const filtered = relatedRes.data.filter(
                (p) => (p.id || p._id) !== (prodData.id || prodData._id),
              );
              setRelatedProducts(filtered.slice(0, 5));
            }
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

  // Reset số lượng về 1 mỗi khi đổi sản phẩm khác
  useEffect(() => {
    setQuantity(1);
  }, [slug]);

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

  const handleDecrease = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));
  const handleIncrease = () => setQuantity((prev) => prev + 1);

  const handleAddToCart = async () => {
    const productId = product?.id || product?._id;
    if (!productId) return;
    setAddingToCart(true);
    setCartMessage(null);
    const variantSku = selectedVariant?.sku || '';
    const result = await addToCart(productId, quantity, variantSku);
    setAddingToCart(false);
    if (result.success) {
      setCartMessage({ type: 'success', text: 'Đã thêm vào giỏ hàng!' });
    } else if (result.message === 'Vui lòng đăng nhập để thêm vào giỏ hàng.') {
      navigate('/login');
    } else {
      setCartMessage({ type: 'danger', text: result.message || 'Có lỗi xảy ra!' });
    }
    setTimeout(() => setCartMessage(null), 3000);
  };

  const handleBuyNow = async () => {
    const productId = product?.id || product?._id;
    if (!productId) return;
    setAddingToCart(true);
    const variantSku = selectedVariant?.sku || '';
    const result = await addToCart(productId, quantity, variantSku);
    setAddingToCart(false);
    if (result.success) {
      navigate('/checkout');
    } else if (result.message === 'Vui lòng đăng nhập để thêm vào giỏ hàng.') {
      navigate('/login');
    } else {
      setCartMessage({ type: 'danger', text: result.message || 'Có lỗi xảy ra!' });
      setTimeout(() => setCartMessage(null), 3000);
    }
  };

  const handleToggleWishlist = async () => {
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
           setCartMessage({ type: 'secondary', text: 'Đã bỏ yêu thích!' });
           window.dispatchEvent(new CustomEvent('wishlistChanged', { detail: { productId, liked: false } }));
        }
      } else {
        const res = await wishlistApi.addToWishlist(productId);
        if (res.success) {
           setIsLiked(true);
           setCartMessage({ type: 'success', text: 'Đã thêm vào yêu thích!' });
           window.dispatchEvent(new CustomEvent('wishlistChanged', { detail: { productId, liked: true } }));
        }
      }
      setTimeout(() => setCartMessage(null), 3000);
    } catch(err) {
      setCartMessage({ type: 'danger', text: 'Có lỗi xảy ra' });
      setTimeout(() => setCartMessage(null), 3000);
    }
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

        {/* --- KHỐI THÔNG TIN CHÍNH --- */}
        <div className="bg-white p-4 rounded shadow-sm mb-4">
          <Row>
            {/* Ảnh sản phẩm */}
            <Col md={5}>
              <div
                className="border rounded mb-3 p-2 text-center position-relative overflow-hidden"
                style={{ cursor: "zoom-in" }}
              >
                {displaySalePrice && (
                  <Badge
                    bg="danger"
                    className="position-absolute top-0 start-0 m-2 px-2 py-1 fs-6 z-1"
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
                  style={{
                    maxHeight: "400px",
                    objectFit: "contain",
                    transition: "transform 0.3s",
                  }}
                  onMouseEnter={(e) =>
                    (e.currentTarget.style.transform = "scale(1.1)")
                  }
                  onMouseLeave={(e) =>
                    (e.currentTarget.style.transform = "scale(1)")
                  }
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

            {/* Thông tin chi tiết */}
            <Col md={7}>
              <h4 className="fw-bold lh-base">{product.name}</h4>

              <div className="d-flex align-items-center flex-wrap gap-3 mb-3 text-muted small">
                <span className="text-warning">
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-fill"></i>
                  <i className="bi bi-star-half"></i>
                  <span className="ms-1 text-dark fw-medium">
                    {product.avgRating || 0}
                  </span>
                  <span className="ms-1">
                    ({product.reviewCount || 0} đánh giá)
                  </span>
                </span>
                <span className="border-start ps-3">
                  Đã bán:{" "}
                  <strong className="text-dark">
                    {product.soldCount || 0}
                  </strong>
                </span>
                <span className="border-start ps-3">
                  Mã SP:{" "}
                  <strong className="text-dark">
                    {selectedVariant?.sku || product.sku || "Đang cập nhật"}
                  </strong>
                </span>
                <span className="border-start ps-3">
                  Thương hiệu:{" "}
                  <strong className="text-hasaki">{brandName}</strong>
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

              <VariantSelector
                variants={product.variants}
                selectedVariant={selectedVariant}
                onSelectVariant={(v) => {
                  setSelectedVariant(v);
                  if (v.imageUrl) setMainImage(v.imageUrl);
                }}
              />

              {/*  Trạng thái Tồn kho & Bộ chọn số lượng */}
              <div className="d-flex align-items-center gap-4 mb-4">
                <div>
                  <h6 className="fw-bold mb-2">Tình trạng:</h6>
                  <span
                    className={`badge ${product.inStock ? "bg-success" : "bg-danger"} fs-6 py-2 px-3`}
                  >
                    {product.inStock ? "Còn hàng" : "Hết hàng"}
                  </span>
                </div>
                <div>
                  <h6 className="fw-bold mb-2">Số lượng:</h6>
                  <InputGroup style={{ width: "130px" }}>
                    <Button
                      variant="outline-secondary"
                      onClick={handleDecrease}
                      disabled={!product.inStock}
                    >
                      -
                    </Button>
                    <Form.Control
                      className="text-center fw-bold"
                      value={quantity}
                      readOnly
                    />
                    <Button
                      variant="outline-secondary"
                      onClick={handleIncrease}
                      disabled={!product.inStock}
                    >
                      +
                    </Button>
                  </InputGroup>
                </div>
              </div>

              {cartMessage && (
                <div className={`alert alert-${cartMessage.type} py-2 px-3 mb-2 small`} role="alert">
                  {cartMessage.text}
                </div>
              )}
              <div className="d-flex gap-3 mt-2">
                <Button
                  variant="outline-success"
                  size="lg"
                  className="flex-grow-1 border-2 fw-bold text-hasaki bg-white"
                  disabled={!product.inStock || addingToCart}
                  onClick={handleAddToCart}
                >
                  {addingToCart ? (
                    <><span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>Đang thêm...</>
                  ) : (
                    <><i className="bi bi-cart-plus me-2"></i>THÊM VÀO GIỎ</>
                  )}
                </Button>
                <Button
                  variant="success"
                  size="lg"
                  className="flex-grow-1 fw-bold bg-hasaki border-0"
                  disabled={!product.inStock || addingToCart}
                  onClick={handleBuyNow}
                >
                  MUA NGAY
                </Button>
                <Button
                  variant="light"
                  size="lg"
                  className="border"
                  title={isLiked ? "Bỏ yêu thích" : "Thêm vào yêu thích"}
                  onClick={handleToggleWishlist}
                  style={{ width: '60px', padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  <i className={`bi ${isLiked ? 'bi-heart-fill' : 'bi-heart'} text-danger fs-5`}></i>
                </Button>
              </div>

              {product.shortDescription && (
                <div className="mt-4 pt-4 border-top">
                  <h6 className="fw-bold">Tóm tắt sản phẩm:</h6>
                  <p className="text-muted small lh-lg mb-0">
                    {product.shortDescription}
                  </p>
                </div>
              )}
            </Col>
          </Row>
        </div>

        {/* ---  CẤU TRÚC TABS CHO MÔ TẢ & THUỘC TÍNH & ĐÁNH GIÁ & HỎI ĐÁP --- */}
        <div className="bg-white p-4 rounded shadow-sm mb-4">
          <Tabs defaultActiveKey="description" className="mb-4 custom-tabs">
            <Tab
              eventKey="description"
              title={<span className="fw-bold fs-6">Mô tả sản phẩm</span>}
            >
              {product.description ? (
                <div
                  className="text-muted lh-lg mt-3"
                  style={{ whiteSpace: "pre-wrap" }}
                  dangerouslySetInnerHTML={{ __html: product.description }}
                />
              ) : (
                <p className="text-muted mt-3">
                  Đang cập nhật mô tả chi tiết...
                </p>
              )}
            </Tab>

            <Tab
              eventKey="attributes"
              title={
                <span className="fw-bold fs-6">Thành phần & Cách dùng</span>
              }
            >
              <div className="mt-3">
                {product.attributes && product.attributes.length > 0 ? (
                  <table className="table table-bordered table-striped">
                    <tbody>
                      {product.attributes.map((attr, idx) => (
                        <tr key={idx}>
                          <th
                            className="bg-light text-nowrap"
                            style={{ width: "20%", verticalAlign: "middle" }}
                          >
                            {attr.key}
                          </th>
                          <td
                            style={{
                              verticalAlign: "middle",
                              whiteSpace: "pre-wrap",
                            }}
                          >
                            {attr.value}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p className="text-muted">Chưa có thông tin chi tiết.</p>
                )}
              </div>
            </Tab>

            {/* Tab Đánh giá — TV4 */}
            <Tab
              eventKey="reviews"
              title={
                <span className="fw-bold fs-6">
                  Đánh giá ({product.reviewCount || 0})
                </span>
              }
            >
              <div className="mt-3">
                <ReviewList key={reviewKey} productId={product.id || product._id} />
                <hr />
                <ReviewForm
                  productId={product.id || product._id}
                  onReviewCreated={() => setReviewKey(prev => prev + 1)}
                />
              </div>
            </Tab>

            {/* Tab Hỏi đáp — TV4 */}
            <Tab
              eventKey="questions"
              title={<span className="fw-bold fs-6">Hỏi đáp</span>}
            >
              <div className="mt-3">
                <QuestionList productId={product.id || product._id} />
                <QuestionForm
                  productId={product.id || product._id}
                  onQuestionCreated={() => {}}
                />
              </div>
            </Tab>
          </Tabs>
        </div>

        {/* ---  SẢN PHẨM LIÊN QUAN --- */}
        {relatedProducts.length > 0 && (
          <div className="bg-white p-4 rounded shadow-sm mb-4">
            <h5 className="fw-bold mb-4 text-uppercase border-bottom pb-2">
              Sản phẩm cùng danh mục
            </h5>
            <ProductGrid products={relatedProducts} />
          </div>
        )}
      </Container>
    </main>
  );
};

export default ProductDetail;
