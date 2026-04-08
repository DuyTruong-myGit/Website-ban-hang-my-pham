import app from './app.js';
import connectDB from './config/db.js';
import dotenv from 'dotenv';
import { Server } from 'socket.io';
import Message from './models/Message.js';
import User from './models/User.js';
dotenv.config();

// Kết nối Database
connectDB();

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`[Server] Running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

const io = new Server(server, {
  cors: {
    origin: '*', // Allow frontend to connect
  }
});

app.set('io', io);

io.on('connection', (socket) => {
  console.log(`[Socket] User connected: ${socket.id}`);

  // Khi client xin tham gia phòng chat cụ thể (subscribeToRoom)
  socket.on('join_room', (roomId) => {
    socket.join(`chat:${roomId}`);
    console.log(`[Socket] User ${socket.id} joined room chat:${roomId}`);
  });

  socket.on('leave_room', (roomId) => {
    socket.leave(`chat:${roomId}`);
  });

  // Tham gia phòng thông báo cá nhân
  socket.on('subscribe_user', (userId) => {
    socket.join(`user:${userId}`);
  });

  // Staff tham gia phòng thông báo để nhận New Room
  socket.on('subscribe_staff_notifications', () => {
    socket.join('staff:notifications');
  });

  // Client emits 'new_message' qua Socket
  socket.on('chat_send', async (data) => {
    console.log(`[Socket] Nhận chat_send từ ${socket.id}`, data);
    try {
      const { roomId, senderId, content, imageUrl } = data;
      
      const user = await User.findById(senderId);
      const senderName = user ? user.name : 'Khách';
      const senderType = user && (user.role === 'staff' || user.role === 'admin') ? 'staff' : 'customer';
      
      console.log(`[Socket] Đang lưu message cho room ${roomId}`);
      const message = await Message.create({
        room_id: roomId,
        sender_id: senderId,
        content: content,
        image_url: imageUrl,
        sender_type: senderType
      });
      
      await message.populate('sender_id', 'name avatar_url');
      
      const formattedMessage = {
        id: message._id,
        roomId: message.room_id,
        senderId: message.sender_id?._id || message.sender_id,
        senderName: message.sender_id?.name || senderName,
        senderRole: message.sender_type,
        content: message.content,
        imageUrl: message.image_url,
        createdAt: message.createdAt
      };

      console.log(`[Socket] Phát tin nhắn cho room chat:${roomId}`);
      io.to(`chat:${roomId}`).emit('new_message', { message: formattedMessage, roomId });
      
      // Gửi notif cho staff 
      io.to('staff:notifications').emit('chat_notification', {
        roomId,
        content
      });
      console.log(`[Socket] Thành công xử lý chat_send`);
    } catch (err) {
      console.error('[Socket] Lỗi lưu tin nhắn:', err);
    }
  });

  socket.on('chat_typing', (data) => {
    socket.to(`chat:${data.roomId}`).emit('typing', data);
  });

  socket.on('chat_read', (data) => {
    socket.to(`chat:${data.roomId}`).emit('room_read', data);
  });

  socket.on('chat_presence', (data) => {
    socket.to(`chat:${data.roomId}`).emit('room_presence', data);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket] User disconnected: ${socket.id}`);
  });
});

// Xử lý lỗi Unhandled Rejections
process.on('unhandledRejection', (err) => {
  console.log(`[Error] Unhandled Rejection: ${err.message}`);
  // Đóng server & thoát
  server.close(() => process.exit(1));
});
