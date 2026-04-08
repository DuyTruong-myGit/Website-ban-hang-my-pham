import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import dotenv from "dotenv";
import { notFound, errorHandler } from "./middleware/errorMiddleware.js";

// Import Routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import brandRoutes from "./routes/brandRoutes.js";
import bannerRoutes from "./routes/bannerRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
// Import Routes — TV1 (Auth & User)
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';

// Import Routes — TV5 (Admin Dashboard & Quản lý)
import reportRoutes from './routes/reportRoutes.js';
import adminLogRoutes from './routes/adminLogRoutes.js';
import pageContentRoutes, { pageAdminRoutes } from './routes/pageContentRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Routes
app.get("/", (req, res) => {
  res.json({ message: "API AuraBeauty Node.js is running..." });
});

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/brands", brandRoutes);
app.use("/api/banners", bannerRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/api/admin/reports", reportRoutes);
// --- TV1: Auth & User ---
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/upload', uploadRoutes);

// --- TV5: Admin Dashboard & Quản lý ---
app.use('/api/admin/reports', reportRoutes);
app.use('/api/admin/logs', adminLogRoutes);
app.use('/api/pages', pageContentRoutes);          // Public: GET /api/pages/:slug
app.use('/api/admin/pages', pageAdminRoutes);       // Admin: CRUD /api/admin/pages
app.use('/api/admin/inventory', inventoryRoutes);

// Error Handling
app.use(notFound);
app.use(errorHandler);

export default app;
