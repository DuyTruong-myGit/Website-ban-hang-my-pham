import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Breadcrumb } from "react-bootstrap";
import { useParams, Link } from "react-router-dom";
import ProductGrid from "../components/common/ProductGrid";
import Loading from "../components/common/Loading";
import Pagination from "../components/common/Pagination";
import { productApi, categoryApi } from "../services/customerService";

const Category = () => {
  const { slug } = useParams();

  const [category, setCategory] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [sort, setSort] = useState("newest");
  const [priceRange, setPriceRange] = useState({ min: null, max: null });

  useEffect(() => {
    const fetchCategory = async () => {
      try {
        const res = await categoryApi.getBySlug(slug);
        if (res?.success) {
          setCategory(res.data);
          setPage(0);
          setPriceRange({ min: null, max: null });
        }
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };
    fetchCategory();
  }, [slug]);

  useEffect(() => {
    if (!category) return;

    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          categoryId: category.id || category._id,
          page: page,
          limit: 12,
          sort: sort,
        };
        if (priceRange.min !== null) params.minPrice = priceRange.min;
        if (priceRange.max !== null) params.maxPrice = priceRange.max;

        const res = await productApi.getProducts(params);
        if (res?.success) {
          setProducts(res.data || []);
          if (res.pagination) {
            setTotalPages(res.pagination.totalPages);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy sản phẩm:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [category, page, sort, priceRange]);

  const handlePriceChange = (min, max) => {
    setPriceRange({ min, max });
    setPage(0);
  };

  if (!category && !loading)
    return (
      <Container className="py-5 text-center">
        <h5>Không tìm thấy danh mục!</h5>
      </Container>
    );

  return (
    <main className="bg-hasaki-bg-gray pb-5 pt-3">
      <Container>
        <Breadcrumb className="bg-white px-3 py-2 rounded shadow-sm mb-3">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>
            Trang chủ
          </Breadcrumb.Item>
          <Breadcrumb.Item active>
            {category?.name || "Đang tải..."}
          </Breadcrumb.Item>
        </Breadcrumb>

        <Row className="g-3">
          <Col lg={3}>
            <div className="bg-white p-3 rounded shadow-sm mb-3">
              <h6 className="fw-bold mb-3 border-bottom pb-2">KHOẢNG GIÁ</h6>
              <Form>
                <Form.Check
                  type="radio"
                  id="price-all"
                  label="Tất cả mức giá"
                  name="price"
                  checked={priceRange.min === null && priceRange.max === null}
                  onChange={() => handlePriceChange(null, null)}
                  className="mb-2 text-muted"
                />
                <Form.Check
                  type="radio"
                  id="price-1"
                  label="Dưới 100.000đ"
                  name="price"
                  checked={priceRange.min === 0 && priceRange.max === 100000}
                  onChange={() => handlePriceChange(0, 100000)}
                  className="mb-2 text-muted"
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
                  className="mb-2 text-muted"
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
                  className="mb-2 text-muted"
                />
              </Form>
            </div>
          </Col>

          <Col lg={9}>
            <div className="bg-white p-3 rounded shadow-sm mb-3 d-flex justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">{category?.name}</h5>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small text-nowrap">Sắp xếp:</span>
                <Form.Select
                  size="sm"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value);
                    setPage(0);
                  }}
                  style={{ width: "180px" }}
                >
                  <option value="newest">Hàng mới nhất</option>
                  <option value="best_seller">Bán chạy nhất</option>
                  <option value="price_asc">Giá: Thấp đến Cao</option>
                  <option value="price_desc">Giá: Cao đến Thấp</option>
                </Form.Select>
              </div>
            </div>

            {loading ? (
              <Loading message="Đang tải sản phẩm..." />
            ) : (
              <>
                {/* COMPONENT ĐƯỢC TÁI SỬ DỤNG Ở ĐÂY */}
                <ProductGrid
                  products={products}
                  emptyMessage="Không có sản phẩm nào phù hợp với bộ lọc."
                />

                {products.length > 0 && (
                  <div className="mt-4">
                    <Pagination
                      page={page}
                      totalPages={totalPages}
                      onPageChange={setPage}
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

export default Category;
