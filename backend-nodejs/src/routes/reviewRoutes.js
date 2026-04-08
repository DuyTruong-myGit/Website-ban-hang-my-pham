import express from 'express';
import {
  getProductReviews,
  createReview,
  markHelpful,
  replyReview,
  toggleHideReview,
  getAllReviews
} from '../controllers/reviewController.js';
import { protect, adminOrStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

// Lấy đánh giá của sản phẩm (Cho phép không đăng nhập)
router.get('/product/:productId', getProductReviews);

// Đăng nhập mới được review / like
router.post('/', protect, createReview);
router.put('/:id/helpful', protect, markHelpful);

// Admin Routes for reviews
const adminRouter = express.Router();
adminRouter.get('/', protect, adminOrStaff, getAllReviews);
adminRouter.put('/:id/reply', protect, adminOrStaff, replyReview);
adminRouter.put('/:id/toggle-hide', protect, adminOrStaff, toggleHideReview);

export { router as default, adminRouter };
