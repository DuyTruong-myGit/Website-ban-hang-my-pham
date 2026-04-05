import React, { useState, useEffect } from "react";
import { Container, Row, Col, Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import ProductGrid from "../components/common/ProductGrid";
import Loading from "../components/common/Loading";
import {
  productApi,
  categoryApi,
  bannerApi,
  brandApi,
} from "../services/customerService";

const Home = () => {
  // States
  const [heroBanners, setHeroBanners] = useState([]);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [flashSales, setFlashSales] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);

  // AI hỗ trợ: Đồng hồ đếm ngược Flash Sale dynamic, mặc định 2 tiếng
  const [flashTimer, setFlashTimer] = useState({ hours: 2, minutes: 0, seconds: 0 });

  const [loading, setLoading] = useState(true);

  // Flash Sale countdown - lưu endTime vào sessionStorage để không reset khi chuyển trang
  useEffect(() => {
    const FLASH_DURATION_MS = 2 * 60 * 60 * 1000; // 2 tiếng
    let endTime;

    const saved = sessionStorage.getItem('flashSaleEnd');
    if (saved && Number(saved) > Date.now()) {
      endTime = Number(saved);
    } else {
      endTime = Date.now() + FLASH_DURATION_MS;
      sessionStorage.setItem('flashSaleEnd', String(endTime));
    }

    const tick = () => {
      const remaining = Math.max(0, endTime - Date.now());
      const h = Math.floor(remaining / 3600000);
      const m = Math.floor((remaining % 3600000) / 60000);
      const s = Math.floor((remaining % 60000) / 1000);
      setFlashTimer({ hours: h, minutes: m, seconds: s });

      if (remaining <= 0) {
        // Reset lại vòng mới khi hết giờ
        const newEnd = Date.now() + FLASH_DURATION_MS;
        sessionStorage.setItem('flashSaleEnd', String(newEnd));
        endTime = newEnd;
      }
    };

    tick(); // chạy ngay lập tức
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        // Gọi 7 API song song để tối ưu tốc độ tải trang
        const [
          bannerRes,
          catRes,
          brandRes,
          flashRes,
          newRes,
          bestRes,
          featRes,
        ] = await Promise.all([
          bannerApi.getByPosition("hero"),
          categoryApi.getTree(),
          brandApi.getAll(),
          productApi.getFlashSale(),
          productApi.getNewArrivals(),
          productApi.getBestSellers(),
          productApi.getFeatured(),
        ]);

        if (bannerRes?.success) setHeroBanners(bannerRes.data);
        if (catRes?.success) setCategories(catRes.data.slice(0, 6)); // Lấy 6 danh mục đầu
        if (brandRes?.success) setBrands(brandRes.data);
        if (flashRes?.success) setFlashSales(flashRes.data);
        if (newRes?.success) setNewArrivals(newRes.data);
        if (bestRes?.success) setBestSellers(bestRes.data);
        if (featRes?.success) setFeaturedProducts(featRes.data);
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu trang chủ:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHomeData();
  }, []);

  if (loading) {
    return <Loading message="Đang tải dữ liệu trang chủ..." />;
  }

  return (
    <main className="bg-hasaki-bg-gray pb-5">
      {/* 1. HERO BANNER */}
      <Container className="mt-3">
        {heroBanners.length > 0 ? (
          <Carousel interval={3000} pause="hover" indicators={true}>
            {heroBanners.map((banner) => (
              <Carousel.Item key={banner.id || banner._id}>
                {banner.linkUrl ? (
                  <Link to={banner.linkUrl}>
                    <img
                      className="d-block w-100 rounded hero-banner shadow-sm"
                      src={banner.imageUrl}
                      alt={banner.title}
                      style={{ maxHeight: "400px", objectFit: "cover" }}
                    />
                  </Link>
                ) : (
                  <img
                    className="d-block w-100 rounded hero-banner shadow-sm"
                    src={banner.imageUrl}
                    alt={banner.title}
                    style={{ maxHeight: "400px", objectFit: "cover" }}
                  />
                )}
              </Carousel.Item>
            ))}
          </Carousel>
        ) : (
          <div
            className="bg-white rounded d-flex align-items-center justify-content-center shadow-sm"
            style={{ height: "350px" }}
          >
            <h4 className="text-muted">Chưa có Hero Banner</h4>
          </div>
        )}
      </Container>

      {/* 2. DANH MỤC NỔI BẬT */}
      <Container className="mt-4">
        <div className="bg-white p-3 rounded shadow-sm">
          <h5 className="fw-bold mb-3 text-uppercase">Danh Mục Nổi Bật</h5>
          <Row className="g-3">
            {categories.map((cat) => (
              <Col xs={4} md={2} key={cat.id || cat._id}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="text-decoration-none text-dark category-item"
                >
                  <div className="text-center">
                    <img
                      src={cat.imageUrl || "https://via.placeholder.com/150"}
                      alt={cat.name}
                      className="img-fluid rounded-circle mb-2 border"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/150?text=No+Image";
                      }}
                    />
                    <div className="small fw-medium">{cat.name}</div>
                  </div>
                </Link>
              </Col>
            ))}
          </Row>
        </div>
      </Container>

      {/* 3. FLASH SALE (MỚI BỔ SUNG) */}
      {flashSales.length > 0 && (
        <Container className="mt-4">
          <div
            className="p-3 rounded shadow-sm"
            style={{
              background: "linear-gradient(to right, #ff4b2b, #ff416c)",
            }}
          >
            <div className="d-flex justify-content-between align-items-center mb-3">
              <div className="d-flex align-items-center gap-3">
                <h4 className="fw-bold text-white mb-0 fst-italic">
                  <i className="bi bi-lightning-charge-fill text-warning"></i>{" "}
                  FLASH SALE
                </h4>
                {/* Đồng hồ đếm ngược dynamic */}
                <div className="d-flex gap-1 text-white fw-bold">
                  <span className="bg-dark px-2 py-1 rounded small">{String(flashTimer.hours).padStart(2, '0')}</span>:
                  <span className="bg-dark px-2 py-1 rounded small">{String(flashTimer.minutes).padStart(2, '0')}</span>:
                  <span className="bg-dark px-2 py-1 rounded small">{String(flashTimer.seconds).padStart(2, '0')}</span>
                </div>
              </div>
              <Link
                to="/search?sort=price_asc"
                className="text-decoration-none text-white fw-medium"
              >
                Xem tất cả <i className="bi bi-chevron-right"></i>
              </Link>
            </div>
            <ProductGrid products={flashSales} />
          </div>
        </Container>
      )}

      {/* 4. THƯƠNG HIỆU NỔI BẬT  */}
      {brands.length > 0 && (
        <Container className="mt-4">
          <div className="bg-white p-3 rounded shadow-sm">
            <h5 className="fw-bold mb-3 text-uppercase border-start border-4 border-info ps-2">
              Thương Hiệu Nổi Bật
            </h5>
            <div
              className="d-flex gap-3 overflow-auto pb-2 px-1"
              style={{ scrollbarWidth: "none" }}
            >
              {brands.map((brand) => (
                <a
                  href={brand.website || "#"} // Nếu không có web thì không chạy đi đâu cả
                  key={brand.id || brand._id}
                  target="_blank" // Mở web hãng ở tab mới để khách không bị thoát khỏi web mình
                  rel="noopener noreferrer" // Bảo mật khi mở link ngoài
                  className="text-decoration-none border rounded p-2 text-center flex-shrink-0"
                  style={{ width: "150px", transition: "all 0.3s" }}
                  onMouseEnter={(e) => e.currentTarget.classList.add("shadow")}
                  onMouseLeave={(e) =>
                    e.currentTarget.classList.remove("shadow")
                  }
                >
                  <img
                    src={
                      brand.logoUrl ||
                      "https://via.placeholder.com/100x50?text=Brand"
                    }
                    alt={brand.name}
                    style={{
                      width: "100%",
                      height: "60px",
                      objectFit: "contain",
                    }}
                    onError={(e) => {
                      e.target.src =
                        "https://via.placeholder.com/100x50?text=Brand";
                    }}
                  />
                  <div className="small fw-medium text-dark mt-2 text-truncate">
                    {brand.name}
                  </div>
                </a>
              ))}
            </div>
          </div>
        </Container>
      )}

      {/* 5. SẢN PHẨM MỚI VỀ  */}
      {newArrivals.length > 0 && (
        <Container className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold text-uppercase mb-0 border-start border-4 border-primary ps-2">
              Sản Phẩm Mới
            </h4>
            <Link
              to="/search?sort=newest"
              className="text-decoration-none text-hasaki fw-medium"
            >
              Xem tất cả <i className="bi bi-chevron-right"></i>
            </Link>
          </div>
          <ProductGrid products={newArrivals} />
        </Container>
      )}

      {/* 6. SẢN PHẨM BÁN CHẠY */}
      {bestSellers.length > 0 && (
        <Container className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold text-uppercase mb-0 border-start border-4 border-success ps-2">
              Sản Phẩm Bán Chạy
            </h4>
            <Link
              to="/search?sort=best_seller"
              className="text-decoration-none text-hasaki fw-medium"
            >
              Xem tất cả <i className="bi bi-chevron-right"></i>
            </Link>
          </div>
          <ProductGrid products={bestSellers} />
        </Container>
      )}

      {/* 7. SẢN PHẨM NỔI BẬT (MỚI BỔ SUNG) */}
      {featuredProducts.length > 0 && (
        <Container className="mt-4">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h4 className="fw-bold text-uppercase mb-0 border-start border-4 border-warning ps-2">
              Gợi Ý Cho Bạn
            </h4>
          </div>
          <ProductGrid products={featuredProducts} />
        </Container>
      )}
    </main>
  );
};

export default Home;
