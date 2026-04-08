import ChatRoom from '../models/ChatRoom.js';
import Message from '../models/Message.js';

const formatRoom = (r) => ({
  id: r._id,
  customerName: r.user_id?.name || 'Khách',
  staffName: r.staff_id?.name || 'Nhân viên',
  subject: r.topic,
  status: r.status === 'pending' ? 'waiting' : (r.status === 'open' ? 'active' : r.status),
  createdAt: r.createdAt,
  updatedAt: r.updatedAt
});

const formatMessage = (m) => ({
  id: m._id,
  roomId: m.room_id,
  senderId: m.sender_id?._id || m.sender_id,
  senderName: m.sender_id?.name || 'Khách',
  senderRole: m.sender_type,
  content: m.content,
  imageUrl: m.image_url,
  createdAt: m.createdAt
});

// @desc    Lấy danh sách các phòng chat (User thấy của User, Staff/Admin thấy của họ hoặc tất cả)
// @route   GET /api/chat/rooms
export const getChatRooms = async (req, res) => {
  let rooms;
  
  if (req.user.role === 'customer') {
    rooms = await ChatRoom.find({ user_id: req.user._id })
      .populate('staff_id', 'name avatar_url')
      .sort('-updatedAt');
  } else {
    // Staff/Admin lấy các phòng do họ quản lý hoặc các phòng có status phù hợp
    rooms = await ChatRoom.find({ staff_id: req.user._id })
      .populate('user_id', 'name avatar_url')
      .sort('-updatedAt');
  }

  res.json({ success: true, data: rooms.map(formatRoom) });
};

// @desc    Lấy các phòng chat đang chờ phân công cho nhân viên
// @route   GET /api/staff/chat/pending
export const getPendingRooms = async (req, res) => {
  const rooms = await ChatRoom.find({ status: 'pending' })
    .populate('user_id', 'name avatar_url')
    .sort('createdAt');
    
  res.json({ success: true, data: rooms.map(formatRoom) });
};

// @desc    Lấy tất cả các phòng chat (Admin/Staff)
// @route   GET /api/staff/chat/all
export const getAllRooms = async (req, res) => {
  const rooms = await ChatRoom.find()
    .populate('user_id', 'name avatar_url')
    .populate('staff_id', 'name avatar_url')
    .sort('-updatedAt');

  res.json({ success: true, data: rooms.map(formatRoom) });
};

// @desc    Tạo mới hoặc lấy phòng chat hiện có (status open)
// @route   POST /api/chat/rooms
export const createChatRoom = async (req, res) => {
  const topic = req.body.topic || req.body.subject || 'Hỗ trợ chung';
  
  // Checking if there's an existing open room for user
  let room = await ChatRoom.findOne({ user_id: req.user._id, status: { $in: ['open', 'pending'] } });
  
  if (!room) {
    room = await ChatRoom.create({
      user_id: req.user._id,
      topic: topic || 'Hỗ trợ chung',
      status: 'pending'
    });
  }
  
  const formattedRoom = formatRoom(room);
  
  const io = req.app.get('io');
  if (io && room.status === 'pending') {
    io.to('staff:notifications').emit('new_staff_room', formattedRoom);
  }
  
  res.status(201).json({ success: true, data: formattedRoom });
};

// @desc    Nhân viên nhận phòng chat
// @route   PUT /api/chat/rooms/:id/assign
export const assignRoom = async (req, res) => {
  const room = await ChatRoom.findById(req.params.id);
  
  if (!room) {
    res.status(404);
    throw new Error('Phòng chat không tồn tại');
  }
  
  room.staff_id = req.user._id;
  room.status = 'open';
  await room.save();
  await room.populate('user_id', 'name avatar_url');
  await room.populate('staff_id', 'name avatar_url');
  
  res.json({ success: true, data: formatRoom(room) });
};

// @desc    Đóng phòng chat
// @route   PUT /api/chat/rooms/:id/close
export const closeRoom = async (req, res) => {
  const room = await ChatRoom.findById(req.params.id);
  
  if (!room) {
    res.status(404);
    throw new Error('Phòng chat không tồn tại');
  }
  
  // Can add check staff/admin or room owner here
  
  room.status = 'closed';
  await room.save();
  await room.populate('user_id', 'name avatar_url');
  
  res.json({ success: true, data: formatRoom(room) });
};

// @desc    Lấy tin nhắn trong phòng
// @route   GET /api/chat/rooms/:id/messages
export const getRoomMessages = async (req, res) => {
  const messages = await Message.find({ room_id: req.params.id })
    .populate('sender_id', 'name avatar_url')
    .sort('createdAt');
    
  res.json({ success: true, data: messages.map(formatMessage) });
};

// @desc    Gửi tin nhắn qua REST (Fallback nếu WebSockets không gửi trực tiếp tới DB, hoặc dùng chung)
// @route   POST /api/chat/rooms/:id/messages
export const sendMessage = async (req, res) => {
  const { content } = req.body;
  const image_url = req.body.image_url || req.body.imageUrl;
  const room_id = req.params.id;
  
  if (!room_id || !room_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error('Mã phòng chat không hợp lệ');
  }
  
  const room = await ChatRoom.findById(room_id);
  if (!room) {
    res.status(404);
    throw new Error('Phòng chat không tồn tại');
  }
  
  const message = await Message.create({
    room_id,
    sender_id: req.user._id,
    sender_type: req.user.role === 'customer' ? 'user' : 'staff',
    content,
    image_url
  });
  
  await message.populate('sender_id', 'name avatar_url');
  
  const formattedMessage = formatMessage(message);
  
  const io = req.app.get('io');
  if (io) {
    io.to(`chat:${room_id}`).emit('new_message', {
      roomId: room_id,
      message: formattedMessage
    });
    
    // Also send a notification to staff if they are not in the room yet
    io.to('staff:notifications').emit('chat_notification', {
        roomId: room_id,
        content: formattedMessage.content
    });
  }
  
  res.status(201).json({ success: true, data: formattedMessage });
};

// @desc    Đánh dấu đã đọc trong phòng
// @route   PUT /api/chat/rooms/:id/read
export const markAsRead = async (req, res) => {
  const room_id = req.params.id;
  
  if (!room_id || !room_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error('Mã phòng chat không hợp lệ');
  }

  await Message.updateMany(
    { room_id, sender_id: { $ne: req.user._id }, is_read: false },
    { $set: { is_read: true } }
  );
  
  res.json({ success: true });
};
