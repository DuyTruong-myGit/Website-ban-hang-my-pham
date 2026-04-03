import React, { useState } from "react";
import { Link } from "react-router-dom";

const MegaMenu = ({ categories }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [activeCategory, setActiveCategory] = useState(null); // Track danh mục đang được trỏ chuột

  return (
    <div
      className="bg-hasaki text-white p-2 px-3 fw-bold cursor-pointer d-flex align-items-center gap-2 position-relative"
      onMouseEnter={() => setShowMenu(true)}
      onMouseLeave={() => {
        setShowMenu(false);
        setActiveCategory(null); // Reset lại khi đưa chuột ra khỏi toàn bộ menu
      }}
    >
      <i className="bi bi-list"></i> DANH MỤC
      {showMenu && (
        <div
          className="position-absolute bg-white text-dark shadow rounded-bottom d-flex"
          style={{ top: "100%", left: "0", zIndex: 1000, minHeight: "350px" }}
        >
          {/* CỘT TRÁI: Danh sách Danh mục cha */}
          <ul
            className="list-unstyled mb-0 py-2 border-end bg-white position-relative"
            style={{ width: "250px", zIndex: 1001 }}
          >
            {categories.length > 0 ? (
              categories.map((cat) => (
                <li
                  key={cat.id || cat._id}
                  onMouseEnter={() => setActiveCategory(cat)}
                >
                  <Link
                    to={`/category/${cat.slug}`}
                    className={`d-flex justify-content-between align-items-center px-3 py-2 text-decoration-none text-dark hover-bg-light ${activeCategory === cat ? "bg-light" : ""}`}
                  >
                    <span>{cat.name}</span>
                    {/* Nếu có danh mục con thì hiện mũi tên nhỏ bên phải */}
                    {cat.children && cat.children.length > 0 && (
                      <i
                        className="bi bi-chevron-right text-muted"
                        style={{ fontSize: "12px" }}
                      ></i>
                    )}
                  </Link>
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-muted small">Chưa có danh mục</li>
            )}
          </ul>

          {/* CỘT PHẢI: Bảng danh mục con (Mega Panel) - Chỉ hiện khi danh mục đang trỏ chuột có children */}
          {activeCategory &&
            activeCategory.children &&
            activeCategory.children.length > 0 && (
              <div
                className="bg-white p-4 shadow"
                style={{
                  width: "600px",
                  minHeight: "350px",
                  position: "absolute",
                  left: "250px",
                  top: 0,
                  zIndex: 1000,
                }}
              >
                <h6 className="fw-bold border-bottom pb-2 mb-4 text-uppercase text-hasaki">
                  {activeCategory.name}
                </h6>

                <div className="row g-4">
                  {activeCategory.children.map((child) => (
                    <div className="col-md-4" key={child.id || child._id}>
                      <Link
                        to={`/category/${child.slug}`}
                        className="text-decoration-none text-dark d-flex align-items-center gap-2 hover-bg-light p-1 rounded"
                      >
                        {/* Nếu danh mục con có ảnh thì hiện ảnh, không thì hiện icon */}
                        {child.imageUrl ? (
                          <img
                            src={child.imageUrl}
                            alt={child.name}
                            style={{
                              width: "35px",
                              height: "35px",
                              objectFit: "cover",
                              borderRadius: "50%",
                            }}
                          />
                        ) : (
                          <div
                            className="bg-light rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: "35px", height: "35px" }}
                          >
                            <i
                              className="bi bi-tag text-muted"
                              style={{ fontSize: "14px" }}
                            ></i>
                          </div>
                        )}
                        <span className="fw-medium small">{child.name}</span>
                      </Link>
                    </div>
                  ))}
                </div>
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default MegaMenu;
