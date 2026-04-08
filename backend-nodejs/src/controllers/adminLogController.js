import AdminLog from '../models/AdminLog.js';

// @desc    Lấy danh sách admin logs (filter: user, action, from, to + phân trang)
// @route   GET /api/admin/logs
export const getLogs = async (req, res) => {
  const {
    user,
    action,
    from,
    to,
    page: pageParam,
    limit: limitParam,
  } = req.query;

  const page = parseInt(pageParam) || 0;
  const limit = parseInt(limitParam) || 20;
  const skip = page * limit;

  // Xây dựng filter động
  const filter = {};

  if (user) {
    filter.user_id = user;
  }
  if (action) {
    filter.action = action;
  }
  if (from && to) {
    filter.created_at = {
      $gte: new Date(from),
      $lte: new Date(to),
    };
  } else if (from) {
    filter.created_at = { $gte: new Date(from) };
  } else if (to) {
    filter.created_at = { $lte: new Date(to) };
  }

  const [logs, total] = await Promise.all([
    AdminLog.find(filter)
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit)
      .populate('user_id', 'name email role'),
    AdminLog.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};
