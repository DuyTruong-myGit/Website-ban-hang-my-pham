import React, { useState, useEffect, useRef } from "react";
import { Container, Row, Col, Form, InputGroup, Button } from "react-bootstrap";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useCart } from "../../context/CartContext";
import { categoryApi } from "../../services/customerService";
import MegaMenu from "./MegaMenu";

/* ─── Inline styles cho dropdown ──────────────────────────────────────────── */
const dropdownStyles = {
  wrapper: {
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
  },
  menu: {
    position: "absolute",
    top: "calc(100% + 10px)",
    right: 0,
    minWidth: "200px",
    background: "#fff",
    borderRadius: "12px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.15)",
    padding: "8px 0",
    zIndex: 9999,
    animation: "fadeSlideDown 0.18s ease",
  },
  arrow: {
    position: "absolute",
    top: "-7px",
    right: "18px",
    width: 0,
    height: 0,
    borderLeft: "7px solid transparent",
    borderRight: "7px solid transparent",
    borderBottom: "7px solid #fff",
    filter: "drop-shadow(0 -2px 2px rgba(0,0,0,0.06))",
  },
  item: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 18px",
    color: "#374151",
    textDecoration: "none",
    fontSize: "14px",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background 0.15s",
    border: "none",
    background: "none",
    width: "100%",
    textAlign: "left",
  },
  divider: {
    height: "1px",
    background: "#f3f4f6",
    margin: "4px 0",
  },
  badge: {
    fontSize: "10px",
    padding: "2px 7px",
    borderRadius: "20px",
    fontWeight: 600,
    marginLeft: "auto",
  },
};

const Header = () => {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const hideTimer = useRef(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await categoryApi.getTree();
        if (res?.success) setCategories(res.data);
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };
    fetchCategories();
  }, []);

  /* Đóng dropdown khi click ra ngoài */
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMouseEnter = () => {
    clearTimeout(hideTimer.current);
    setShowDropdown(true);
  };

  const handleMouseLeave = () => {
    hideTimer.current = setTimeout(() => setShowDropdown(false), 200);
  };

  /* Xác định dashboard link theo role */
  const getDashboardLink = () => {
    if (user?.role === "admin") return { to: "/admin/dashboard", label: "Quản trị Admin", icon: "bi-speedometer2", color: "#dc2626" };
    if (user?.role === "staff") return { to: "/staff/dashboard", label: "Trang Staff", icon: "bi-kanban", color: "#7c3aed" };
    return null;
  };
  const dashboardLink = user ? getDashboardLink() : null;

  return (
    <>
      {/* Keyframe animation */}
      <style>{`
        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .user-dropdown-item:hover {
          background: #f9fafb !important;
          color: #111827 !important;
        }
        .user-dropdown-item.danger:hover {
          background: #fef2f2 !important;
          color: #dc2626 !important;
        }
      `}</style>

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
                <Link to="/" className="text-white text-decoration-none fw-bold fs-3">
                  HASAKI
                </Link>
              </Col>
              <Col xs={6}>
                <InputGroup className="search-container">
                  <Form.Control
                    placeholder="Tìm kiếm sản phẩm, thương hiệu..."
                    aria-label="Search"
                  />
                  <Button variant="light" className="bg-white border-0 text-hasaki">
                    <i className="bi bi-search"></i>
                  </Button>
                </InputGroup>
              </Col>
              <Col xs={4}>
                <div className="d-flex justify-content-end align-items-center gap-4 text-white">

                  {/* ── Account section ── */}
                  {user ? (
                    /* Logged in: hover dropdown */
                    <div
                      ref={dropdownRef}
                      style={dropdownStyles.wrapper}
                      onMouseEnter={handleMouseEnter}
                      onMouseLeave={handleMouseLeave}
                    >
                      {/* Trigger */}
                      <div className="d-flex align-items-center gap-2 cursor-pointer" style={{ userSelect: "none" }}>
                        <i className="bi bi-person-circle fs-4"></i>
                        <div className="d-flex flex-column lh-1">
                          <span style={{ fontSize: "11px" }}>Chào,</span>
                          <span className="fw-medium" style={{ fontSize: "13px" }}>
                            {user.name}
                            {dashboardLink && (
                              <span
                                style={{
                                  ...dropdownStyles.badge,
                                  background: dashboardLink.color + "20",
                                  color: dashboardLink.color,
                                  marginLeft: "6px",
                                }}
                              >
                                {user.role}
                              </span>
                            )}
                          </span>
                        </div>
                        <i className="bi bi-chevron-down" style={{ fontSize: "10px", opacity: 0.7 }}></i>
                      </div>

                      {/* Dropdown menu */}
                      {showDropdown && (
                        <div style={dropdownStyles.menu}>
                          <div style={dropdownStyles.arrow} />

                          {/* Dashboard link (chỉ show nếu admin/staff) */}
                          {dashboardLink && (
                            <>
                              <Link
                                to={dashboardLink.to}
                                className="user-dropdown-item"
                                style={{ ...dropdownStyles.item, color: dashboardLink.color }}
                                onClick={() => setShowDropdown(false)}
                              >
                                <i className={`bi ${dashboardLink.icon}`} style={{ fontSize: "16px" }}></i>
                                {dashboardLink.label}
                              </Link>
                              <div style={dropdownStyles.divider} />
                            </>
                          )}

                          {/* Hồ sơ */}
                          <Link
                            to="/profile"
                            className="user-dropdown-item"
                            style={dropdownStyles.item}
                            onClick={() => setShowDropdown(false)}
                          >
                            <i className="bi bi-person" style={{ fontSize: "16px" }}></i>
                            Hồ sơ cá nhân
                          </Link>

                          {/* Đơn hàng (user thường + admin vẫn xem được) */}
                          <Link
                            to="/account/orders"
                            className="user-dropdown-item"
                            style={dropdownStyles.item}
                            onClick={() => setShowDropdown(false)}
                          >
                            <i className="bi bi-bag-check" style={{ fontSize: "16px" }}></i>
                            Đơn hàng của tôi
                          </Link>

                          <div style={dropdownStyles.divider} />

                          {/* Đăng xuất */}
                          <button
                            className="user-dropdown-item danger"
                            style={{ ...dropdownStyles.item, color: "#ef4444" }}
                            onClick={() => { logout(); setShowDropdown(false); }}
                          >
                            <i className="bi bi-box-arrow-right" style={{ fontSize: "16px" }}></i>
                            Đăng xuất
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    /* Not logged in */
                    <Link
                      to="/login"
                      className="text-white text-decoration-none d-flex align-items-center gap-2"
                    >
                      <i className="bi bi-person fs-4"></i>
                      <div className="d-flex flex-column lh-1">
                        <span style={{ fontSize: "11px" }}>Đăng nhập /</span>
                        <span className="fw-medium" style={{ fontSize: "13px" }}>Đăng ký</span>
                      </div>
                    </Link>
                  )}

                  {/* ── Cart icon ── */}
                  <Link
                    to="/cart"
                    className="text-white text-decoration-none d-flex flex-column align-items-center text-center position-relative"
                  >
                    <i className="bi bi-cart2 fs-4"></i>
                    {totalItems > 0 && (
                      <span
                        className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-hasaki-secondary"
                        style={{ fontSize: "9px", marginTop: "5px" }}
                      >
                        {totalItems > 99 ? "99+" : totalItems}
                      </span>
                    )}
                    <span style={{ fontSize: "11px" }}>Giỏ hàng</span>
                  </Link>

                </div>
              </Col>
            </Row>
          </Container>
        </div>

        <div className="nav-menu position-relative">
          <Container>
            <div className="d-flex">
              <MegaMenu categories={categories} />
              <nav className="d-flex align-items-center">
                <Link to="/" className="nav-link-item">Flash Deals</Link>
                <Link to="/" className="nav-link-item">Hot Deals</Link>
                <Link to="/" className="nav-link-item">Thương hiệu</Link>
                <Link to="/" className="nav-link-item">Skin &amp; Spa</Link>
                <Link to="/" className="nav-link-item">Cẩm nang</Link>
              </nav>
            </div>
          </Container>
        </div>
      </header>
    </>
  );
};

export default Header;
