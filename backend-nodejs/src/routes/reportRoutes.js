import express from "express";
import {
  getOverview,
  getDebug,
  getRevenue,
  getTopProducts,
  getRecentOrders,
  getLowStockList,
} from "../controllers/reportController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Áp dụng xác thực và phân quyền cho TẤT CẢ route bên dưới
router.use(protect, admin);

router.get("/overview", getOverview);
router.get("/debug", getDebug);
router.get("/revenue", getRevenue);
router.get("/top-products", getTopProducts);
router.get("/recent-orders", getRecentOrders);
router.get("/low-stock", getLowStockList);

export default router;
