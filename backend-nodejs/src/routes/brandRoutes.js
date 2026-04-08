import express from "express";
import {
  getAllBrands,
  getBrandBySlug,
  createBrand,
  updateBrand,
  deleteBrand,
} from "../controllers/brandController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public API
router.get("/", getAllBrands);
router.get("/:slug", getBrandBySlug);

// Admin API
router.post("/", protect, admin, createBrand);
router.put("/:id", protect, admin, updateBrand);
router.delete("/:id", protect, admin, deleteBrand);

export default router;
