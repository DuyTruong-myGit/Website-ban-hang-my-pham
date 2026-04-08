import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, Breadcrumb, Button, Accordion, Badge } from "react-bootstrap";
import { useSearchParams, Link } from "react-router-dom";
import ProductGrid from "../components/common/ProductGrid";
import Loading from "../components/common/Loading";
import Pagination from "../components/common/Pagination";
import usePageTitle from "../hooks/usePageTitle";
import { productApi, brandApi, categoryApi } from "../services/customerService";

const Search = () => {
  const [searchParams] = useSearchParams();
  const keyword = searchParams.get("keyword") || "";
  usePageTitle(keyword ? `Tìm kiếm: ${keyword}` : 'Tìm kiếm');

  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);

  // Mảng lọc nhiều cấu hình (Multi-select)
  const [sort, setSort] = useState(searchParams.get("sort") || "newest");
  const [priceRange, setPriceRange] = useState({ min: null, max: null });
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [inStockOnly, setInStockOnly] = useState(false);

  // States tạm thời cho input giá (để bấm nút áp dụng)
  const [inputMinPrice, setInputMinPrice] = useState("");
  const [inputMaxPrice, setInputMaxPrice] = useState("");

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const [brandRes, catRes] = await Promise.all([
           brandApi.getAll(),
           categoryApi.getTree()
        ]);
        if (brandRes?.success) setBrands(brandRes.data);
        if (catRes?.success) {
            // Lấy tất cả category rải phẳng
            let flatCats = [];
            catRes.data.forEach(c => {
                flatCats.push(c);
                if (c.children && c.children.length > 0) {
                    flatCats.push(...c.children);
                }
            });
            setCategories(flatCats);
        }
      } catch (error) {
        console.error("Lỗi lấy siêu dữ liệu lọc:", error);
      }
    };
    fetchMetadata();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const params = {
          search: keyword,
          page: page,
          limit: 12,
          sort: sort,
        };
        if (priceRange.min !== null) params.minPrice = priceRange.min;
        if (priceRange.max !== null) params.maxPrice = priceRange.max;
        if (selectedBrands.length > 0) params.brandId = selectedBrands.join(",");
        if (selectedCategories.length > 0) params.categoryId = selectedCategories.join(",");
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
  }, [keyword, page, sort, priceRange, selectedBrands, selectedCategories, minRating, inStockOnly]);

  // Reset page khi từ khóa thay đổi
  useEffect(() => {
    setPage(1);
  }, [keyword]);

  // === HANDLERS ===
  const handleApplyCustomPrice = () => {
     let min = inputMinPrice ? Number(inputMinPrice) : null;
     let max = inputMaxPrice ? Number(inputMaxPrice) : null;
     if (min !== null && max !== null && min > max) {
         let temp = min; min = max; max = temp;
     }
     setPriceRange({ min, max });
     setPage(1);
  };

  const handleToggleArray = (value, array, setArray) => {
      if (array.includes(value)) {
          setArray(array.filter(v => v !== value));
      } else {
          setArray([...array, value]);
      }
      setPage(1);
  };

  const clearFilters = () => {
    setPriceRange({ min: null, max: null });
    setSelectedBrands([]);
    setSelectedCategories([]);
    setMinRating(0);
    setInStockOnly(false);
    setSort("newest");
    setInputMinPrice("");
    setInputMaxPrice("");
    setPage(1);
  };

  // === RENDER ACTIVE TAGS ===
  const removePriceTag = () => {
      setPriceRange({ min: null, max: null });
      setInputMinPrice("");
      setInputMaxPrice("");
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
          {/* BỘ LỌC ACCORDION HIỆN ĐẠI */}
          <Col lg={3}>
            <div className="bg-white rounded shadow-sm mb-3">
              <div className="d-flex justify-content-between align-items-center p-3 border-bottom">
                <h6 className="fw-bold mb-0">
                  <i className="bi bi-funnel-fill me-2 text-hasaki"></i>BỘ LỌC
                </h6>
                <Button variant="link" className="text-danger p-0 text-decoration-none small" onClick={clearFilters}>Xóa lọc</Button>
              </div>

              {/* ACTIVE FILTER TAGS */}
              {(selectedBrands.length > 0 || selectedCategories.length > 0 || inStockOnly || minRating > 0 || priceRange.min !== null || priceRange.max !== null) && (
                <div className="p-3 border-bottom bg-light">
                   <div className="small fw-bold text-muted mb-2">Đang lọc theo:</div>
                   <div className="d-flex flex-wrap gap-2">
                       {priceRange.min !== null || priceRange.max !== null ? (
                          <Badge bg="secondary" className="d-flex align-items-center gap-1 cursor-pointer" onClick={removePriceTag}>
                              Giá: {priceRange.min || 0}đ - {priceRange.max ? `${priceRange.max}đ` : 'Trở lên'} <i className="bi bi-x"></i>
                          </Badge>
                       ) : null}
                       
                       {selectedBrands.map(bId => {
                           const bObj = brands.find(b => (b.id || b._id) === bId);
                           return bObj ? (
                               <Badge key={`b-${bId}`} bg="secondary" className="d-flex align-items-center gap-1 cursor-pointer" onClick={() => handleToggleArray(bId, selectedBrands, setSelectedBrands)}>
                                   Hãng: {bObj.name} <i className="bi bi-x"></i>
                               </Badge>
                           ) : null;
                       })}

                       {selectedCategories.map(cId => {
                           const cObj = categories.find(c => (c.id || c._id) === cId);
                           return cObj ? (
                               <Badge key={`c-${cId}`} bg="secondary" className="d-flex align-items-center gap-1 cursor-pointer" onClick={() => handleToggleArray(cId, selectedCategories, setSelectedCategories)}>
                                   Loại: {cObj.name} <i className="bi bi-x"></i>
                               </Badge>
                           ) : null;
                       })}

                       {minRating > 0 && (
                          <Badge bg="secondary" className="d-flex align-items-center gap-1 cursor-pointer" onClick={() => { setMinRating(0); setPage(1); }}>
                              Từ {minRating} sao <i className="bi bi-x"></i>
                          </Badge>
                       )}

                       {inStockOnly && (
                           <Badge bg="secondary" className="d-flex align-items-center gap-1 cursor-pointer" onClick={() => { setInStockOnly(false); setPage(1); }}>
                               Còn hàng <i className="bi bi-x"></i>
                           </Badge>
                       )}
                   </div>
                </div>
              )}

              {/* ACCORDIONS */}
              <Accordion alwaysOpen defaultActiveKey={['0', '1', '2', '3']} className="filter-accordion border-0">
                
                <Accordion.Item eventKey="0" className="border-0 border-bottom rounded-0">
                  <Accordion.Header className="py-0 fw-bold small text-muted">DANH MỤC</Accordion.Header>
                  <Accordion.Body className="pt-0 pb-3" style={{ maxHeight: "200px", overflowY: "auto", scrollbarWidth: "thin" }}>
                    <Form>
                       {categories.map((c) => (
                          <Form.Check
                            key={c.id || c._id}
                            type="checkbox"
                            label={c.name}
                            checked={selectedCategories.includes(c.id || c._id)}
                            onChange={() => handleToggleArray(c.id || c._id, selectedCategories, setSelectedCategories)}
                            className="mb-2 text-dark small"
                          />
                        ))}
                    </Form>
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="1" className="border-0 border-bottom rounded-0">
                  <Accordion.Header>THƯƠNG HIỆU</Accordion.Header>
                  <Accordion.Body className="pt-0 pb-3" style={{ maxHeight: "200px", overflowY: "auto", scrollbarWidth: "thin" }}>
                     <Form>
                        {brands.map((b) => (
                           <Form.Check
                             key={b.id || b._id}
                             type="checkbox"
                             label={b.name}
                             checked={selectedBrands.includes(b.id || b._id)}
                             onChange={() => handleToggleArray(b.id || b._id, selectedBrands, setSelectedBrands)}
                             className="mb-2 text-dark small"
                           />
                         ))}
                     </Form>
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="2" className="border-0 border-bottom rounded-0">
                  <Accordion.Header>KHOẢNG GIÁ</Accordion.Header>
                  <Accordion.Body className="pt-0 pb-3">
                     <div className="d-flex gap-2 align-items-center mb-3">
                        <Form.Control 
                            type="number" 
                            size="sm" 
                            placeholder="Từ (đ)" 
                            value={inputMinPrice}
                            onChange={(e) => setInputMinPrice(e.target.value)}
                        />
                        <span className="text-muted">-</span>
                        <Form.Control 
                            type="number" 
                            size="sm" 
                            placeholder="Đến (đ)" 
                            value={inputMaxPrice}
                            onChange={(e) => setInputMaxPrice(e.target.value)}
                        />
                     </div>
                     <Button variant="outline-success" size="sm" className="w-100 mb-3 fw-bold" onClick={handleApplyCustomPrice}>
                        ÁP DỤNG
                     </Button>
                     <Form>
                        <Form.Check
                            type="radio" name="price" label="Dưới 100.000đ"
                            checked={priceRange.min === 0 && priceRange.max === 100000}
                            onChange={() => { setInputMinPrice(""); setInputMaxPrice(""); setPriceRange({ min: 0, max: 100000 }); setPage(1); }}
                            className="mb-2 text-dark small"
                        />
                        <Form.Check
                            type="radio" name="price" label="100.000đ - 300.000đ"
                            checked={priceRange.min === 100000 && priceRange.max === 300000}
                            onChange={() => { setInputMinPrice(""); setInputMaxPrice(""); setPriceRange({ min: 100000, max: 300000 }); setPage(1); }}
                            className="mb-2 text-dark small"
                        />
                        <Form.Check
                            type="radio" name="price" label="Trên 300.000đ"
                            checked={priceRange.min === 300000 && priceRange.max === null}
                            onChange={() => { setInputMinPrice(""); setInputMaxPrice(""); setPriceRange({ min: 300000, max: null }); setPage(1); }}
                            className="mb-2 text-dark small"
                        />
                     </Form>
                  </Accordion.Body>
                </Accordion.Item>

                <Accordion.Item eventKey="3" className="border-0 rounded-0">
                  <Accordion.Header>TÌNH TRẠNG & ĐÁNH GIÁ</Accordion.Header>
                  <Accordion.Body className="pt-0 pb-3">
                    <Form>
                      <Form.Check
                        type="checkbox"
                        label="Chỉ hiện sản phẩm Còn hàng"
                        checked={inStockOnly}
                        onChange={(e) => { setInStockOnly(e.target.checked); setPage(1); }}
                        className="mb-3 text-dark fw-bold small text-success"
                      />
                      <hr className="my-2"/>
                      <div className="small text-muted mb-2 mt-2">Sao tối thiểu:</div>
                      <Form.Check
                        type="radio" name="rating"
                        label={<><i className="bi bi-star-fill text-warning"></i> từ 4 sao</>}
                        checked={minRating === 4}
                        onChange={() => { setMinRating(4); setPage(1); }}
                        className="mb-2 text-dark small"
                      />
                      <Form.Check
                        type="radio" name="rating"
                        label={<><i className="bi bi-star-fill text-warning"></i> từ 3 sao</>}
                        checked={minRating === 3}
                        onChange={() => { setMinRating(3); setPage(1); }}
                        className="mb-2 text-dark small"
                      />
                    </Form>
                  </Accordion.Body>
                </Accordion.Item>

              </Accordion>
            </div>
            
            {/* Thêm chút border adjustment style */}
            <style>{`.filter-accordion .accordion-button { font-size: 0.85rem; font-weight: 700; color: #555; background: #fff; padding: 1rem 1.25rem; box-shadow: none; border: none; }
                     .filter-accordion .accordion-button:not(.collapsed) { background: #fdfdfd; color: #326e51; box-shadow: none; border: none; }
                     .filter-accordion .accordion-button:focus { box-shadow: none; border: none; }
            `}</style>
          </Col>

          {/* KẾT QUẢ TÌM KIẾM */}
          <Col lg={9}>
            <div className="bg-white p-3 rounded shadow-sm mb-3 d-flex flex-wrap gap-2 justify-content-between align-items-center">
              <h5 className="mb-0 fw-bold">
                Tìm kiếm: <span className="text-hasaki">"{keyword}"</span> 
                <span className="text-muted small ms-2 fw-normal">({totalPages > 0 ? 'Có sản phẩm' : 'Đang tìm'})</span>
              </h5>
              <div className="d-flex align-items-center gap-2">
                <span className="text-muted small text-nowrap">Sắp xếp:</span>
                <Form.Select
                  size="sm"
                  value={sort}
                  onChange={(e) => { setSort(e.target.value); setPage(1); }}
                  style={{ width: "180px", cursor: 'pointer' }}
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
              <Loading message="Đang lọc sản phẩm..." />
            ) : (
              <>
                <ProductGrid
                  products={products}
                  emptyMessage={`Rất tiếc, không tìm thấy sản phẩm nào khớp với điều kiện lọc hiện tại.`}
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
