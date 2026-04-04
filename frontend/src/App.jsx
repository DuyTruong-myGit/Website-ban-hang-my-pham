import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import "./index.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { CartProvider } from "./context/CartContext";
import Header from "./components/Layout/Header";
import Footer from "./components/Layout/Footer";

// Pages — TV3
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import AdminOrders from './pages/admin/AdminOrders';
import AdminCoupons from './pages/admin/AdminCoupons';

// Pages — TV1
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
// Pages — TV2
import Category from "./pages/Category";
import ProductDetail from "./pages/ProductDetail";
import AdminCategories from "./pages/admin/AdminCategories";
import AdminBrands from "./pages/admin/AdminBrands";
import AdminBanners from "./pages/admin/AdminBanners";
import AdminProducts from "./pages/admin/AdminProducts";
import Search from "./pages/Search";
// Pages — TV5
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminInventory from "./pages/admin/AdminInventory";
import AdminLogs from "./pages/admin/AdminLogs";
import StaffDashboard from "./pages/staff/StaffDashboard";
import StaffOrders from "./pages/staff/StaffOrders";

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  return token ? children : <Navigate to="/login" />;
};

// Admin Route Wrapper — chỉ cho admin
const AdminRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== "admin") return <Navigate to="/" />;
  return children;
};

// Staff Route Wrapper — cho admin + staff
const StaffRoute = ({ children }) => {
  const { user, token, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  if (!token) return <Navigate to="/login" />;
  if (user?.role !== "admin" && user?.role !== "staff")
    return <Navigate to="/" />;
  return children;
};

const UserProfile = () => {
  const { user, logout } = useAuth();
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Hồ sơ cá nhân</h2>
      {user && (
        <div className="card p-4 shadow-sm border-0">
          <p>
            <strong>Họ tên:</strong> {user.name}
          </p>
          <p>
            <strong>Email:</strong> {user.email}
          </p>
          <p>
            <strong>Số điện thoại:</strong> {user.phone || "Chưa cung cấp"}
          </p>
          <p>
            <strong>Vai trò:</strong>{" "}
            <span className="badge bg-success">{user.role}</span>
          </p>
          <button onClick={logout} className="btn btn-danger mt-3">
            Đăng xuất
          </button>
        </div>
      )}
    </div>
  );
};

const AppLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="flex-grow-1">{children}</div>
      <Footer />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <Routes>
        {/* === Customer Pages (có Header + Footer) === */}
        <Route
          path="/"
          element={
            <AppLayout>
              <Home />
            </AppLayout>
          }
        />
        <Route
          path="/category/:slug"
          element={
            <AppLayout>
              <Category />
            </AppLayout>
          }
        />
        <Route
          path="/product/:slug"
          element={
            <AppLayout>
              <ProductDetail />
            </AppLayout>
          }
        />
        <Route
          path="/search"
          element={
            <AppLayout>
              <Search />
            </AppLayout>
          }
        />
        <Route
          path="/login"
          element={
            <AppLayout>
              <Login />
            </AppLayout>
          }
        />
        <Route
          path="/register"
          element={
            <AppLayout>
              <Register />
            </AppLayout>
          }
        />
        <Route
          path="/profile"
          element={
            <AppLayout>
              <PrivateRoute>
                <UserProfile />
              </PrivateRoute>
            </AppLayout>
          }
        />
        <Route
          path="/cart"
          element={
            <AppLayout>
              <Cart />
            </AppLayout>
          }
        />
        <Route
          path="/checkout"
          element={
            <AppLayout>
              <PrivateRoute>
                <Checkout />
              </PrivateRoute>
            </AppLayout>
          }
        />
        <Route
          path="/account/orders"
          element={
            <AppLayout>
              <PrivateRoute>
                <Orders />
              </PrivateRoute>
            </AppLayout>
          }
        />
        <Route
          path="/account/orders/:id"
          element={
            <AppLayout>
              <PrivateRoute>
                <OrderDetail />
              </PrivateRoute>
            </AppLayout>
          }
        />

        {/* === Admin Pages — TV5 (dùng AdminLayout riêng, không Header/Footer) === */}
        <Route
          path="/admin/dashboard"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/categories"
          element={
            <AdminRoute>
              <AdminCategories />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/brands"
          element={
            <AdminRoute>
              <AdminBrands />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/banners"
          element={
            <AdminRoute>
              <AdminBanners />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/products"
          element={
            <AdminRoute>
              <AdminProducts />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/orders"
          element={
            <AdminRoute>
              <AdminOrders />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/coupons"
          element={
            <AdminRoute>
              <AdminCoupons />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <AdminRoute>
              <AdminUsers />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/inventory"
          element={
            <AdminRoute>
              <AdminInventory />
            </AdminRoute>
          }
        />
        <Route
          path="/admin/logs"
          element={
            <AdminRoute>
              <AdminLogs />
            </AdminRoute>
          }
        />

        {/* === Staff Pages — TV5 (dùng AdminLayout riêng) === */}
        <Route
          path="/staff/dashboard"
          element={
            <StaffRoute>
              <StaffDashboard />
            </StaffRoute>
          }
        />
        <Route
          path="/staff/orders"
          element={
            <StaffRoute>
              <StaffOrders />
            </StaffRoute>
          }
        />
      </Routes>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AppRoutes />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
