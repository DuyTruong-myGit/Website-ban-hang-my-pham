import express from 'express';
import {
  validateCoupon,
  getAvailableCoupons,
  adminGetAllCoupons,
  adminCreateCoupon,
  adminUpdateCoupon,
  adminDeleteCoupon,
} from '../controllers/couponController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// ── PUBLIC (không cần JWT) ──────────────────────────────────────────────
router.post('/validate', validateCoupon);
router.get('/available', getAvailableCoupons);

export default router;

// ── ADMIN (cần JWT + quyền Admin) ───────────────────────────────────────
const adminRouter = express.Router();

adminRouter.get('/', protect, admin, adminGetAllCoupons);
adminRouter.post('/', protect, admin, adminCreateCoupon);
adminRouter.put('/:id', protect, admin, adminUpdateCoupon);
adminRouter.delete('/:id', protect, admin, adminDeleteCoupon);

export { adminRouter as couponAdminRoutes };
