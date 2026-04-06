import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Breadcrumb, Button } from "react-bootstrap";
import { useSearchParams, Link } from "react-router-dom";
import ProductGrid from "../components/common/ProductGrid";
import Loading from "../components/common/Loading";
import Pagination from "../components/common/Pagination";
import { productApi, brandApi } from "../services/customerService";

const Search = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Bộ lọc
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [priceRange, setPriceRange] = useState({ min: null, max: null });
  const [selectedBrand, setSelectedBrand] = useState("");
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        const res = await brandApi.getAll();
        if (res?.success) setBrands(res.data);
      } catch (error) {
        console.error("Lỗi lấy thương hiệu:", error);
      }
    };
    fetchBrands();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          search: keyword, // Truyền từ khóa tìm kiếm xuống Backend
          page: page,
          limit: 12,
          sort: sort,
        };
        if (priceRange.min !== null) params.minPrice = priceRange.min;
        if (priceRange.max !== null) params.maxPrice = priceRange.max;
        if (selectedBrand) params.brandId = selectedBrand;
        if (minRating > 0) params.minRating = minRating;
        if (inStockOnly) params.inStock = true;

        const res = await productApi.getProducts(params);
        if (res?.success) {
          setProducts(res.data || []);
          if (res.pagination) setTotalPages(res.pagination.totalPages);
        }
      } catch (error) {
        console.error("Lỗi tìm kiếm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [keyword, page, sort, priceRange, selectedBrand, minRating, inStockOnly]);

  // Reset page khi từ khóa thay đổi
  useEffect(() => {
    setPage(1);
  }, [keyword]);

  const handlePriceChange = (min, max) => {
    setPriceRange({ min, max });
    setPage(1);
  };
  const handleBrandChange = (brandId) => {
    setSelectedBrand(brandId);
    setPage(1);
  };
  const handleRatingChange = (rating) => {
    setMinRating(rating);
    setPage(1);
  };
  const clearFilters = () => {
    setPriceRange({ min: null, max: null });
    setSelectedBrand("");
    setMinRating(0);
    setInStockOnly(false);
    setSort("newest");
    setPage(1);
  };

  return (
    <main className="bg-hasaki-bg-gray pb-5 pt-3">
      <Container>
        <Breadcrumb className="bg-white px-3 py-2 rounded shadow-sm mb-3 small">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item active>Tìm kiếm: "{keyword}"</Breadcrumb.Item>
        </Breadcrumb>

        <Row className="g-3">
          {/* BỘ LỌC TƯƠNG TỰ TRANG DANH MỤC */}
          <Col lg={3}>
            <div className="bg-white p-3 rounded shadow-sm mb-3">
              <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3">
                <h6 className="fw-bold mb-0">
                  <i className="bi bi-funnel me-2"></i>BỘ LỌC
                </h6>
                <Button
                  variant="link"
                  className="text-danger p-0 text-decoration-none small"
                  onClick={clearFilters}
                >
                  Xóa lọc
                </Button>
              </div>

              <h6 className="fw-bold mb-2 small text-muted">KHOẢNG GIÁ</h6>
              <Form className="mb-4">
                <Form.Check
                  type="radio"
                  id="price-all"
                  label="Tất cả mức giá"
                  name="price"
                  checked={priceRange.min === null && priceRange.max === null}
                  onChange={() => handlePriceChange(null, null)}
                  className="mb-2 text-dark small"
                />
                <Form.Check
                  type="radio"
                  id="price-1"
                  label="Dưới 100.000đ"
                  name="price"
                  checked={priceRange.min === 0 && priceRange.max === 100000}
                  onChange={() => handlePriceChange(0, 100000)}
                  className="mb-2 text-dark small"
                />
                <Form.Check
                  type="radio"
                  id="price-2"
                  label="100.000đ - 300.000đ"
                  name="price"
                  checked={
                    priceRange.min === 100000 && priceRange.max === 300000
                  }
                  onChange={() => handlePriceChange(100000, 300000)}
                  className="mb-2 text-dark small"
                />
                <Form.Check
                  type="radio"
                  id="price-3"
                  label="Trên 300.000đ"
                  name="price"
                  checked={
                    priceRange.min === 300000 && priceRange.max === 99999999
                  }
                  onChange={() => handlePriceChange(300000, 99999999)}
                  className="mb-2 text-dark small"
                />
              </Form>

              <h6 className="fw-bold mb-2 small text-muted border-top pt-3">
                THƯƠNG HIỆU
              </h6>
              <Form
                className="mb-4"
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  scrollbarWidth: "thin",
                }}
              >
                <Form.Check
                  type="radio"
                  label="Tất cả thương hiệu"
                  name="brand"
                  checked={selectedBrand === ""}
                  onChange={() => handleBrandChange("")}
                  className="mb-2 text-dark small"
                />
                {brands.map((b) => (
                  <Form.Check
                    key={b.id || b._id}
                    type="radio"
                    label={b.name}
                    name="brand"
                    checked={selectedBrand === (b.id || b._id)}
                    onChange={() => handleBrandChange(b.id || b._id)}
                    className="mb-2 text-dark small"
                  />
                ))}
              </Form>

              <h6 className="fw-bold mb-2 small text-muted border-top pt-3">
                ĐÁNH GIÁ TỪ KHÁCH HÀNG
              </h6>
              <Form className="mb-4">
                <Form.Check
                  type="radio"
                  label="Tất cả đánh giá"
                  name="rating"
                  checked={minRating === 0}
                  onChange={() => handleRatingChange(0)}
                  className="mb-2 text-dark small"
                />
                <Form.Check
                  type="radio"
                  label={
                    <>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star text-warning"></i> từ 4 sao
                    </>
                  }
                  name="rating"
                  checked={minRating === 4}
                  onChange={() => handleRatingChange(4)}
                  className="mb-2 text-dark small"
                />
                <Form.Check
                  type="radio"
                  label={
                    <>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star-fill text-warning"></i>
                      <i className="bi bi-star text-warning"></i>
                      <i className="bi bi-star text-warning"></i> từ 3 sao
                    </>
                  }
                  name="rating"
                  checked={minRating === 3}
                  onChange={() => handleRatingChange(3)}
                  className="mb-2 text-dark small"
                />
              </Form>

              <h6 className="fw-bold mb-2 small text-muted border-top pt-3">
                TÌNH TRẠNG HÀNG
              </h6>
              <Form>
                <Form.Check
                  type="checkbox"
                  label="Chỉ hiện sản phẩm Còn hàng"
                  checked={inStockOnly}
                  onChange={(e) => {
                    setInStockOnly(e.target.checked);
                    setPage(1);
                  }}
                  className="text-dark small"
                />
              </Form>
            </div>
          </Col>

          {/* KẾT QUẢ TÌM KIẾM */}
          <Col lg={9}>
            <div className="bg-white p-3 rounded shadow-sm mb-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">
                Kết quả tìm kiếm cho:{" "}
                <span className="text-hasaki">"{keyword}"</span>
              </h5>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small text-nowrap">Sắp xếp:</span>
                <Form.Select
                  size="sm"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(1);
                  }}
                  style={{ width: "180px" }}
                >
                  <option value="newest">Hàng mới nhất</option>
                  <option value="best_seller">Bán chạy nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                  <option value="rating">Đánh giá cao</option>
                </Form.Select>
              </div>
            </div>

            {loading ? (
              <Loading message="Đang tìm kiếm..." />
            ) : (
              <>
                <ProductGrid
                  products={products}
                  emptyMessage={`Rất tiếc, không tìm thấy sản phẩm nào khớp với từ khóa "${keyword}".`}
                />
                {products.length > 0 && (
                  <div className="mt-4">
                    <Pagination
                      page={page - 1}
                      totalPages={totalPages}
                      onPageChange={(p) => setPage(p + 1)}
                    />
                  </div>
                )}
              </>
            )}
          </Col>
        </Row>
      </Container>
    </main>
  );
};

export default Search;
