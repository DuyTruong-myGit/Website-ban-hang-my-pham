import express from 'express';
import {
  getChatRooms,
  getPendingRooms,
  getAllRooms,
  createChatRoom,
  assignRoom,
  closeRoom,
  getRoomMessages,
  sendMessage,
  markAsRead
} from '../controllers/chatController.js';
import { protect, adminOrStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

// Routes for Staff
router.get('/pending', adminOrStaff, getPendingRooms);
router.get('/rooms', adminOrStaff, getChatRooms);
router.get('/all', adminOrStaff, getAllRooms);
router.put('/:id/assign', adminOrStaff, assignRoom);

// General Chat Room Routes
router.route('/')
  .get(getChatRooms)
  .post(createChatRoom);

router.put('/:id/close', closeRoom);
router.put('/:id/read', markAsRead);

router.route('/:id/messages')
  .get(getRoomMessages)
  .post(sendMessage);

export default router;
