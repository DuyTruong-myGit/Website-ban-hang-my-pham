import express from 'express';
import { uploadImage, upload } from '../controllers/uploadController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Chỉ người dùng đã đăng nhập mới được upload ảnh
router.post('/image', protect, upload.single('file'), uploadImage);

export default router;
