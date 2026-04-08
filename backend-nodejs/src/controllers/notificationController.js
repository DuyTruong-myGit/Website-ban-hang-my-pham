import Notification from '../models/Notification.js';

// @desc    Lấy danh sách thông báo của người dùng
// @route   GET /api/notifications
export const getNotifications = async (req, res) => {
  const notifications = await Notification.find({ user_id: req.user._id })
    .sort('-createdAt'); // Mới nhất lên đầu
    
  res.json({ success: true, data: notifications });
};

// @desc    Đánh dấu 1 thông báo là đã đọc
// @route   PUT /api/notifications/:id/read
export const markNotificationRead = async (req, res) => {
  const notification = await Notification.findOne({ _id: req.params.id, user_id: req.user._id });
  
  if (!notification) {
    res.status(404);
    throw new Error('Thông báo không tồn tại');
  }
  
  notification.is_read = true;
  await notification.save();
  
  res.json({ success: true, data: notification });
};

// @desc    Đánh dấu tất cả thông báo là đã đọc
// @route   PUT /api/notifications/read-all
export const markAllNotificationsRead = async (req, res) => {
  await Notification.updateMany(
    { user_id: req.user._id, is_read: false },
    { $set: { is_read: true } }
  );
  
  res.json({ success: true, message: 'Đã đánh dấu tất cả là đã đọc' });
};
