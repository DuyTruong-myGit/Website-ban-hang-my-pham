import express from "express";
import {
  getProducts,
  getProductBySlug,
  getFeaturedProducts,
  getBestSellers,
  getNewArrivals,
  getFlashSale,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controllers/productController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// 1. Các Public API tĩnh (Phải đặt lên trước)
router.get("/featured", getFeaturedProducts);
router.get("/best-sellers", getBestSellers);
router.get("/new-arrivals", getNewArrivals);
router.get("/flash-sale", getFlashSale);

// 2. Các Public API động
router.get("/", getProducts);
router.get("/:slug", getProductBySlug);

// 3. Các Admin API
router.post("/", protect, admin, createProduct);
router.put("/:id", protect, admin, updateProduct);
router.delete("/:id", protect, admin, deleteProduct);

export default router;
