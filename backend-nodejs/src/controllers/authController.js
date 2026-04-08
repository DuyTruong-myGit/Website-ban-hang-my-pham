import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

// Sinh Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRATION || '24h',
  });
};

// @desc    Đăng ký tài khoản
// @route   POST /api/auth/register
export const register = async (req, res) => {
  const { name, email, password, phone } = req.body;

  const userExists = await User.findOne({ email });

  if (userExists) {
    res.status(400);
    throw new Error('Email đã được sử dụng.');
  }

  // Mã hóa mật khẩu
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password_hash,
    phone,
  });

  if (user) {
    res.status(201).json({
      success: true,
      message: 'Đăng ký tài khoản thành công.',
      data: {
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatar_url,
        },
      },
    });
  } else {
    res.status(400);
    throw new Error('Dữ liệu người dùng không hợp lệ.');
  }
};

// @desc    Đăng nhập
// @route   POST /api/auth/login
export const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (user && (await bcrypt.compare(password, user.password_hash))) {
    // Cập nhật last_login
    user.last_login = Date.now();
    await user.save();

    res.json({
      success: true,
      message: 'Đăng nhập thành công.',
      data: {
        token: generateToken(user._id),
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          avatarUrl: user.avatar_url,
        },
      },
    });
  } else {
    res.status(401);
    throw new Error('Email hoặc mật khẩu không chính xác.');
  }
};

// @desc    Lấy thông tin cá nhân hiện tại
// @route   GET /api/auth/me
export const getMe = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    res.json({
      success: true,
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        avatarUrl: user.avatar_url,
        isActive: user.is_active,
        createdAt: user.created_at,
        lastLogin: user.last_login,
      },
    });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy người dùng.');
  }
};

// @desc    Cập nhật thông tin profile
// @route   PUT /api/auth/update-profile
export const updateProfile = async (req, res) => {
  const user = await User.findById(req.user._id);

  if (user) {
    user.name = req.body.name || user.name;
    user.phone = req.body.phone || user.phone;

    const updatedUser = await user.save();

    res.json({
      success: true,
      message: 'Cập nhật thông tin thành công.',
      data: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        phone: updatedUser.phone,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatar_url,
      },
    });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy người dùng.');
  }
};

// @desc    Đổi mật khẩu
// @route   POST /api/auth/change-password
export const changePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user._id);

  if (user) {
    // Check old password
    const isMatch = await bcrypt.compare(oldPassword, user.password_hash);
    if (!isMatch) {
      res.status(400);
      throw new Error('Mật khẩu hiện tại không chính xác.');
    }

    // Set new password
    const salt = await bcrypt.genSalt(10);
    user.password_hash = await bcrypt.hash(newPassword, salt);
    await user.save();

    res.json({
      success: true,
      message: 'Mật khẩu đã được thay đổi thành công!',
    });
  } else {
    res.status(404);
    throw new Error('Không tìm thấy người dùng.');
  }
};
