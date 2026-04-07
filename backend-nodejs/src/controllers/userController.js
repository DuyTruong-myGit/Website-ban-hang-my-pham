import User from '../models/User.js';

// @desc    Lấy danh sách tất cả người dùng (Admin hoặc Staff)
// @route   GET /api/users
export const getUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 20;
  const skip = page * limit;

  const total = await User.countDocuments();
  const users = await User.find({})
    .skip(skip)
    .limit(limit)
    .select('-password_hash');

  const userResponses = users.map((user) => ({
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    avatarUrl: user.avatar_url,
    isActive: user.is_active,
    createdAt: user.created_at,
    lastLogin: user.last_login,
  }));

  res.json({
    success: true,
    message: 'Lấy danh sách người dùng thành công',
    data: userResponses,
    pagination: {
      page: page,
      limit: limit,
      total: total,
      totalPages: Math.ceil(total / limit),
    },
  });
};
