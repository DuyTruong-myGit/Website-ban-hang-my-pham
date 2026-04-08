import express from "express";
import {
  getCategoryTree,
  getCategoryBySlug,
  createCategory,
  updateCategory,
  deleteCategory,
} from "../controllers/categoryController.js";
import { protect, admin } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", getCategoryTree);
router.get("/:slug", getCategoryBySlug);
router.post("/", protect, admin, createCategory);
router.put("/:id", protect, admin, updateCategory);
router.delete("/:id", protect, admin, deleteCategory);

export default router;
