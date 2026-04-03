import React, { useState, useEffect } from "react";
import { Container, Row, Col, Carousel } from "react-bootstrap";
import { Link } from "react-router-dom";
import ProductGrid from "../components/common/ProductGrid";
import Loading from "../components/common/Loading";
import {
  productApi,
  categoryApi,
  bannerApi,
} from "../services/customerService";

const Home = () => {
  const [bestSellers, setBestSellers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [heroBanners, setHeroBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHomeData = async () => {
      try {
        setLoading(true);
        const [productRes, categoryRes, bannerRes] = await Promise.all([
          productApi.getBestSellers(),
          categoryApi.getTree(),
          bannerApi.getByPosition("hero"),
        ]);

        if (productRes?.success) setBestSellers(productRes.data);
        if (categoryRes?.success) setCategories(categoryRes.data.slice(0, 6));
        if (bannerRes?.success) setHeroBanners(bannerRes.data);
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
      {/* Hero Banner Section */}
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
                      alt={banner.title || "Hero Banner"}
                      style={{ maxHeight: "400px", objectFit: "cover" }}
                    />
                  </Link>
                ) : (
                  <img
                    className="d-block w-100 rounded hero-banner shadow-sm"
                    src={banner.imageUrl}
                    alt={banner.title || "Hero Banner"}
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

      {/* Danh mục nổi bật */}
      <Container className="mt-4">
        <div className="bg-white p-3 rounded shadow-sm">
          <h5 className="fw-bold mb-3 text-uppercase">Danh Mục Nổi Bật</h5>
          <Row className="g-3">
            {categories.map((cat) => (
              <Col xs={4} md={2} key={cat.id || cat._id}>
                <Link
                  to={`/category/${cat.slug}`}
                  className="text-decoration-none text-dark"
                >
                  <div className="text-center">
                    <img
                      src={cat.imageUrl || "https://via.placeholder.com/150"}
                      alt={cat.name}
                      className="img-fluid rounded-circle mb-2 border"
                      style={{
                        width: "80px",
                        height: "80px",
                        objectFit: "cover",
                      }}
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

      {/* Sản Phẩm Bán Chạy */}
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

        {/* COMPONENT ĐƯỢC TÁI SỬ DỤNG Ở ĐÂY */}
        <ProductGrid products={bestSellers} />
      </Container>
    </main>
  );
};

export default Home;
