import express from 'express';
import {
  getOverview,
  getRevenue,
  getTopProducts,
  getRecentOrders,
  getLowStock,
} from '../controllers/reportController.js';
import { protect, adminOrStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

// Tất cả routes đều yêu cầu đăng nhập + quyền admin hoặc staff
router.use(protect, adminOrStaff);

router.get('/overview', getOverview);
router.get('/revenue', getRevenue);
router.get('/top-products', getTopProducts);
router.get('/recent-orders', getRecentOrders);
router.get('/low-stock', getLowStock);

export default router;
