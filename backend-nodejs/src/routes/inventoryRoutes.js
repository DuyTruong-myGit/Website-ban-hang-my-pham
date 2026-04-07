import express from 'express';
import {
  getInventory,
  updateInventory,
  getLowStock,
} from '../controllers/inventoryController.js';
import { protect, admin, adminOrStaff } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET — admin hoặc staff đều xem được
router.get('/', protect, adminOrStaff, getInventory);
router.get('/low-stock', protect, adminOrStaff, getLowStock);

// PUT — chỉ admin mới được cập nhật số lượng
router.put('/:id', protect, admin, updateInventory);

export default router;
