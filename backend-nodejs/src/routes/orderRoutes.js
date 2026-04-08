import express from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  cancelOrder,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
} from '../controllers/orderController.js';
import { protect, adminOrStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── CUSTOMER ROUTES ──────────────────────────────────────────────
router.use(protect); // Tất cả API đều cần JWT

router.post('/', createOrder);
router.get('/', getMyOrders);
router.get('/:id', getOrderById);
router.put('/:id/cancel', cancelOrder);

export default router;

// ── ADMIN / STAFF ROUTES ─────────────────────────────────────────
const adminRouter = express.Router();

adminRouter.use(protect, adminOrStaff); // Yêu cầu role là admin hoặc staff

adminRouter.get('/', getAllOrdersAdmin);
adminRouter.put('/:id/status', updateOrderStatusAdmin);

export { adminRouter as orderAdminRoutes };
