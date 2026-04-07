import express from 'express';
import { getLogs } from '../controllers/adminLogController.js';
import { protect, adminOrStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

// Yêu cầu đăng nhập + quyền admin hoặc staff
router.get('/', protect, adminOrStaff, getLogs);

export default router;
