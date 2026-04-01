import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
import './index.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import Header from './components/Layout/Header';
import Footer from './components/Layout/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';

// Private Route Wrapper
const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="text-center mt-5">Đang tải...</div>;
  return token ? children : <Navigate to="/login" />;
};

const UserProfile = () => {
  const { user, logout } = useAuth();
  return (
    <div className="container mt-5">
      <h2 className="mb-4">Hồ sơ cá nhân</h2>
      {user && (
        <div className="card p-4 shadow-sm border-0">
          <p><strong>Họ tên:</strong> {user.name}</p>
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Số điện thoại:</strong> {user.phone || 'Chưa cung cấp'}</p>
          <p><strong>Vai trò:</strong> <span className="badge bg-success">{user.role}</span></p>
          <button onClick={logout} className="btn btn-danger mt-3">Đăng xuất</button>
        </div>
      )}
    </div>
  );
};

const AppLayout = ({ children }) => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <Header />
      <div className="flex-grow-1">
        {children}
      </div>
      <Footer />
    </div>
  );
};

const AppRoutes = () => {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/profile" element={
            <PrivateRoute>
              <UserProfile />
            </PrivateRoute>
          } />
        </Routes>
      </AppLayout>
    </Router>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}

export default App;
