import express from 'express';
import { getPaymentByOrderId } from '../controllers/paymentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/payments/:orderId — Check trạng thái thanh toán (cần JWT)
router.get('/:orderId', protect, getPaymentByOrderId);

export default router;
