import React, { useState, useEffect } from "react";
import { Container, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { categoryApi } from "../../services/customerService";
import MegaMenu from "./MegaMenu";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getTree();
        if (res?.success) {
          setCategories(res.data);
        }
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <header>
      <div className="topbar">
        <Container>
          <div className="d-flex justify-content-between">
            <span>NowFree - Giao nhanh miễn phí 2H | 100% Hàng chính hãng</span>
            <div className="d-flex gap-3">
              <span className="cursor-pointer">Chi nhánh</span>
              <span className="cursor-pointer">Tải ứng dụng</span>
            </div>
          </div>
        </Container>
      </div>

      <div className="main-header py-2 d-flex align-items-center">
        <Container>
          <Row className="align-items-center">
            <Col xs={2}>
              <Link
                to="/"
                className="text-white text-decoration-none fw-bold fs-3"
              >
                HASAKI
              </Link>
            </Col>
            <Col xs={6}>
              <InputGroup className="search-container">
                <Form.Control
                  placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                  aria-label="Search"
                />
                <Button
                  variant="light"
                  className="bg-white border-0 text-hasaki"
                >
                  <i className="bi bi-search"></i>
                </Button>
              </InputGroup>
            </Col>
            <Col xs={4}>
              <div className="d-flex justify-content-end align-items-center gap-4 text-white">
                {user ? (
                  <div
                    className="d-flex align-items-center gap-2 cursor-pointer"
                    onClick={() => navigate("/profile")}
                  >
                    <i className="bi bi-person-circle fs-4"></i>
                    <div className="d-flex flex-column lh-1">
                      <span style={{ fontSize: "11px" }}>Chào,</span>
                      <span className="fw-medium" style={{ fontSize: "13px" }}>
                        {user.name}
                      </span>
                    </div>
                  </div>
                ) : (
                  <Link
                    to="/login"
                    className="text-white text-decoration-none d-flex align-items-center gap-2"
                  >
                    <i className="bi bi-person fs-4"></i>
                    <div className="d-flex flex-column lh-1">
                      <span style={{ fontSize: "11px" }}>Đăng nhập /</span>
                      <span className="fw-medium" style={{ fontSize: "13px" }}>
                        Đăng ký
                      </span>
                    </div>
                  </Link>
                )}

                <div className="d-flex flex-column align-items-center cursor-pointer text-center position-relative">
                  <i className="bi bi-cart2 fs-4"></i>
                  <span
                    className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-hasaki-secondary"
                    style={{ fontSize: "9px", marginTop: "5px" }}
                  >
                    0
                  </span>
                  <span style={{ fontSize: "11px" }}>Giỏ hàng</span>
                </div>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      <div className="nav-menu position-relative">
        <Container>
          <div className="d-flex">
            {/* COMPONENT ĐƯỢC TÁI SỬ DỤNG Ở ĐÂY */}
            <MegaMenu categories={categories} />

            <nav className="d-flex align-items-center">
              <Link to="/" className="nav-link-item">
                Flash Deals
              </Link>
              <Link to="/" className="nav-link-item">
                Hot Deals
              </Link>
              <Link to="/" className="nav-link-item">
                Thương hiệu
              </Link>
              <Link to="/" className="nav-link-item">
                Skin & Spa
              </Link>
              <Link to="/" className="nav-link-item">
                Cẩm nang
              </Link>
            </nav>
          </div>
        </Container>
      </div>
    </header>
  );
};

export default Header;
