import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// ── Import Routes — TV1 (Auth & User) ───────────────────────────────────
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import wishlistRoutes from "./routes/wishlistRoutes.js";

// ── Import Routes — TV2 (Sản phẩm & Danh mục) ─────────────────────────
import brandRoutes from "./routes/brandRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";

// ── Import Routes — TV3 (Cửa Hàng & Giỏ Hàng/Đơn Hàng & Thanh toán) ──
import couponRoutes, { couponAdminRoutes } from "./routes/couponRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes, { orderAdminRoutes } from "./routes/orderRoutes.js";

// ── Import Routes — TV4 (Chat & Đánh giá) ─────────────────────────────
import chatRoutes from "./routes/chatRoutes.js";
import reviewRoutes, { adminRouter as reviewAdminRoutes } from "./routes/reviewRoutes.js";
import questionRoutes, { staffRouter as questionStaffRoutes } from "./routes/questionRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";

// ── Import Routes — TV5 (Admin Dashboard & Quản lý) ────────────────────
import reportRoutes from "./routes/reportRoutes.js";
import adminLogRoutes from "./routes/adminLogRoutes.js";
import pageContentRoutes, { pageAdminRoutes } from "./routes/pageContentRoutes.js";
import inventoryRoutes from "./routes/inventoryRoutes.js";

dotenv.config();

const app = express();

// ── Middleware ───────────────────────────────────────────────────────────
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// ── Routes ──────────────────────────────────────────────────────────────

app.get("/", (req, res) => {
  res.json({ message: "API AuraBeauty Node.js is running..." });
});

// --- TV1: Auth & User ---
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/wishlist", wishlistRoutes);

// --- TV2: Sản phẩm & Danh mục ---
app.use("/api/brands", brandRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// --- TV3: Cửa Hàng & Giỏ Hàng/Đơn Hàng & Thanh toán ---
app.use("/api/coupons", couponRoutes);             // POST /validate, GET /available
app.use("/api/admin/coupons", couponAdminRoutes);   // Admin CRUD
app.use("/api/payments", paymentRoutes);             // GET /:orderId
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/admin/orders", orderAdminRoutes);

// --- TV4: Chat, Đánh giá, Hỏi đáp, Thông báo ---
app.use("/api/chat/rooms", chatRoutes);
app.use("/api/staff/chat", chatRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/admin/reviews", reviewAdminRoutes);
app.use("/api/questions", questionRoutes);
app.use("/api/staff/questions", questionStaffRoutes);
app.use("/api/notifications", notificationRoutes);


// --- TV5: Admin Dashboard & Quản lý ---
app.use("/api/admin/reports", reportRoutes);
app.use("/api/admin/logs", adminLogRoutes);
app.use("/api/pages", pageContentRoutes);
app.use("/api/admin/pages", pageAdminRoutes);
app.use("/api/admin/inventory", inventoryRoutes);

// ── Error Handling ──────────────────────────────────────────────────────
app.use(notFound);
app.use(errorHandler);

export default app;
