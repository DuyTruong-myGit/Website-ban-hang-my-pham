import jwt from 'jsonwebtoken';
import User from '../models/User.js';

// Bảo vệ các route yêu cầu đăng nhập
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Giải mã token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Lấy thông tin user từ DB (không lấy password_hash)
      req.user = await User.findById(decoded.id).select('-password_hash');

      if (!req.user) {
        res.status(401);
        throw new Error('Người dùng không tồn tại.');
      }

      if (!req.user.is_active) {
        res.status(403);
        throw new Error('Tài khoản đã bị khóa.');
      }

      next();
    } catch (error) {
      console.error(`[Auth] JWT Error: ${error.message}`);
      res.status(401);
      throw new Error('Không có quyền truy cập, token không hợp lệ.');
    }
  }

  if (!token) {
    res.status(401);
    throw new Error('Không có quyền truy cập, thiếu token.');
  }
};

// Kiểm tra quyền Admin
export const admin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403);
    throw new Error('Yêu cầu quyền Quản trị viên.');
  }
};

// Kiểm tra quyền Admin hoặc Staff
export const adminOrStaff = (req, res, next) => {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    next();
  } else {
    res.status(403);
    throw new Error('Yêu cầu quyền Quản trị viên hoặc Nhân viên.');
  }
};

// Kiểm tra quyền Staff
export const staff = (req, res, next) => {
  if (req.user && req.user.role === 'staff') {
    next();
  } else {
    res.status(403);
    throw new Error('Yêu cầu quyền Nhân viên.');
  }
};
