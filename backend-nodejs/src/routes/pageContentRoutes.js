import express from 'express';
import {
  getPublicPages,
  getPageBySlug,
  getAllPages,
  createPage,
  updatePage,
  deletePage,
} from '../controllers/pageContentController.js';
import { protect, admin } from '../middleware/authMiddleware.js';

const router = express.Router();

// === PUBLIC — ai cũng truy cập được ===
router.get('/', getPublicPages);
router.get('/:slug', getPageBySlug);

export default router;

// === ADMIN ROUTES (export riêng để mount lên /api/admin/pages) ===
const adminRouter = express.Router();

// Tất cả routes admin yêu cầu đăng nhập + quyền admin
adminRouter.use(protect, admin);

adminRouter.get('/', getAllPages);
adminRouter.post('/', createPage);
adminRouter.put('/:id', updatePage);
adminRouter.delete('/:id', deletePage);

export { adminRouter as pageAdminRoutes };
