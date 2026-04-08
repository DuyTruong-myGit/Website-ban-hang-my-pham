import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useChat } from "../../context/ChatContext";

const AdminLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const chatContext = useChat();
  const navigate = useNavigate();

  const handleLogout = () => {
    // Gửi offline presence trước khi logout để customer thấy offline ngay
    if (chatContext?.sendOfflineBeforeLogout) {
      chatContext.sendOfflineBeforeLogout();
    }
    logout();
    navigate("/login");
  };

  const adminMenuItems = [
    { path: "/admin/dashboard", icon: "bi-speedometer2", label: "Dashboard" },
    { path: "/admin/categories", icon: "bi-tags", label: "Quản lý Danh mục" },
    { path: "/admin/products", icon: "bi-box", label: "Sản phẩm" },
    { path: "/admin/brands", icon: "bi-award", label: "Thương hiệu" },
    { path: "/admin/banners", icon: "bi-images", label: "Quản lý Banner" },
    { path: "/admin/orders", icon: "bi-bag-check", label: "Đơn hàng" },
    { path: "/admin/coupons", icon: "bi-tag", label: "Mã giảm giá" },
    { path: "/admin/users", icon: "bi-people", label: "Quản lý Users" },
    { path: "/admin/logs", icon: "bi-journal-text", label: "Admin Logs" },
    { path: "/admin/inventory", icon: "bi-boxes", label: "Quản lý Tồn kho" },
    { path: "/admin/pages", icon: "bi-file-earmark-text", label: "Nội dung trang" },
    { path: "/admin/chats", icon: "bi-chat-dots", label: "Quản lý Chat" },
    { path: "/admin/reviews", icon: "bi-star", label: "Quản lý Đánh giá" }, // TV4
  ];

  const staffMenuItems = [
    {
      path: "/staff/dashboard",
      icon: "bi-speedometer",
      label: "Staff Dashboard",
    },
    { path: "/staff/orders", icon: "bi-bag-check", label: "Xử lý Đơn hàng" },
    { path: "/staff/chats", icon: "bi-chat-dots", label: "Hỗ trợ Khách (Chat)" }, // TV4 - Chat
    { path: "/staff/questions", icon: "bi-question-circle", label: "Hỏi đáp" }, // TV4 - Q&A
    { path: "/staff/reviews", icon: "bi-star", label: "Quản lý Đánh giá" }, // TV4 - Đánh giá
  ];

  const isAdmin = user?.role === "admin";
  const isStaff = user?.role === "staff";

  return (
    <div className="d-flex admin-wrapper" style={{ minHeight: "100vh" }}>
      {/* Premium Sidebar */}
      <div
        className="admin-sidebar d-flex flex-column text-white"
        style={{ width: "280px", minHeight: "100vh" }}
      >
        {/* Brand */}
        <div className="p-4">
          <h4 className="mb-1 text-white fw-bold d-flex align-items-center">
            <i className="bi bi-gem me-2" style={{ color: "#fbbf24" }}></i>
            AuraBeauty
          </h4>
          <span
            className="badge rounded-pill"
            style={{
              backgroundColor: "rgba(255,255,255,0.1)",
              fontSize: "0.75rem",
            }}
          >
            {isAdmin ? "Quản trị hệ thống" : "Bảng điều khiển nhân viên"}
          </span>
        </div>

        {/* Menu */}
        <nav
          className="flex-grow-1 px-3 py-2 overflow-auto"
          style={{
            scrollbarWidth: "none" /* Firefox */,
          }}
        >
          {isAdmin && (
            <div className="mb-4">
              <p
                className="text-uppercase small mb-2 fw-semibold"
                style={{
                  color: "#94a3b8",
                  letterSpacing: "1px",
                  fontSize: "11px",
                  paddingLeft: "15px",
                }}
              >
                Quản trị
              </p>
              <ul className="nav flex-column">
                {adminMenuItems.map((item) => (
                  <li className="nav-item mb-1" key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `nav-link d-flex align-items-center py-3 px-3 ${isActive ? "active" : ""}`
                      }
                    >
                      <i
                        className={`bi ${item.icon} fs-5 me-3`}
                        style={{ opacity: 0.85 }}
                      ></i>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {(isAdmin || isStaff) && (
            <div className="mb-4">
              <p
                className="text-uppercase small mb-2 fw-semibold"
                style={{
                  color: "#94a3b8",
                  letterSpacing: "1px",
                  fontSize: "11px",
                  paddingLeft: "15px",
                }}
              >
                Nhân viên
              </p>
              <ul className="nav flex-column">
                {staffMenuItems.map((item) => (
                  <li className="nav-item mb-1" key={item.path}>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        `nav-link d-flex align-items-center py-3 px-3 ${isActive ? "active" : ""}`
                      }
                    >
                      <i
                        className={`bi ${item.icon} fs-5 me-3`}
                        style={{ opacity: 0.85 }}
                      ></i>
                      <span>{item.label}</span>
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </nav>

        {/* Return Home Footer */}
        <div className="p-3">
          <NavLink
            to="/"
            className="nav-link d-flex align-items-center px-3 py-3"
            style={{
              color: "#94a3b8",
              background: "rgba(0,0,0,0.2)",
              borderRadius: "12px",
            }}
          >
            <i className="bi bi-arrow-left-circle fs-5 me-3"></i>
            <span>Trang chủ khách</span>
          </NavLink>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-grow-1 d-flex flex-column h-100 overflow-hidden">
        {/* Premium Topbar (Glassmorphism) */}
        <div className="admin-topbar p-3 d-flex justify-content-between align-items-center px-4 sticky-top">
          <div>
            <h5 className="mb-0 text-dark fw-bold" style={{ opacity: 0.8 }}>
              {isAdmin ? "Admin Dashboard" : "Staff Dashboard"}
            </h5>
          </div>
          <div className="d-flex align-items-center gap-4">
            <div className="d-flex align-items-center">
              <div className="text-end me-3">
                <strong
                  className="d-block text-dark"
                  style={{ fontSize: "14px", lineHeight: "1.2" }}
                >
                  {user?.name || "Admin"}
                </strong>
                <span
                  className="badge rounded-pill mt-1"
                  style={{
                    backgroundColor: "#e2e8f0",
                    color: "#475569",
                    fontSize: "10px",
                  }}
                >
                  {user?.role}
                </span>
              </div>
              <div
                className="rounded-circle d-flex align-items-center justify-content-center fw-bold"
                style={{
                  width: "40px",
                  height: "40px",
                  background: "var(--admin-gradient-primary)",
                  color: "white",
                  border: "2px solid white",
                  boxShadow: "0 4px 6px rgba(0,0,0,0.05)",
                }}
              >
                {user?.name ? user.name.charAt(0).toUpperCase() : "A"}
              </div>
            </div>

            <div
              style={{
                height: "30px",
                width: "1px",
                backgroundColor: "#e2e8f0",
              }}
            ></div>

            <button
              onClick={handleLogout}
              className="btn btn-light rounded-circle shadow-sm d-flex align-items-center justify-content-center"
              style={{ width: "40px", height: "40px", color: "#ef4444" }}
              title="Đăng xuất"
            >
              <i className="bi bi-power fs-5"></i>
            </button>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 p-md-5 flex-grow-1 overflow-auto">{children}</div>
      </div>
    </div>
  );
};

export default AdminLayout;
