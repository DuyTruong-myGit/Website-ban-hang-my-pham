import express from 'express';
import {
  getCart,
  addItemToCart,
  updateCartItem,
  removeCartItem,
  clearCart,
} from '../controllers/cartController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Bắt buộc đăng nhập để mua hàng và xem giỏ hàng
router.use(protect);

router.get('/', getCart);
router.post('/items', addItemToCart);
router.put('/items/:productId', updateCartItem);
router.delete('/items/:productId', removeCartItem);
router.delete('/', clearCart);

export default router;
