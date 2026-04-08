import Product from "../models/Product.js";
import mongoose from "mongoose";

// Giả định bạn đã có model Order và User do các thành viên khác tạo
// import Order from '../models/Order.js';
// import User from '../models/User.js';

export const getOverview = async (req, res) => {
  try {
    // 1. Tổng doanh thu (Các đơn đã giao)
    const revenueResult = await mongoose
      .model("Order")
      .aggregate([
        { $match: { status: "delivered" } },
        { $group: { _id: null, totalRevenue: { $sum: "$total" } } },
      ]);
    const totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;

    // 2. Khách hàng mới (Trong 7 ngày qua)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const newCustomers = await mongoose.model("User").countDocuments({
      role: "customer",
      created_at: { $gte: sevenDaysAgo },
    });

    // 3. Số đơn hàng mới (Trạng thái pending)
    const newOrders = await mongoose
      .model("Order")
      .countDocuments({ status: "pending" });

    // 4. Số sản phẩm sắp hết hàng (Stock <= 5)
    const lowStockProducts = await Product.countDocuments({
      stock: { $lte: 5 },
      is_active: true,
    });

    res.json({
      success: true,
      data: { totalRevenue, newCustomers, newOrders, lowStockProducts },
    });
  } catch (error) {
    res.status(500);
    throw new Error("Lỗi khi lấy dữ liệu tổng quan: " + error.message);
  }
};

export const getLowStockList = async (req, res) => {
  // Lấy danh sách 20 sản phẩm sắp hết hàng
  const products = await Product.aggregate([
    { $match: { stock: { $lte: 5 }, is_active: true } },
    { $sort: { stock: 1 } },
    { $limit: 20 },
    {
      $project: {
        product_id: "$_id",
        name: 1,
        quantity: "$stock",
        variant_sku: "$sku",
      },
    },
  ]);

  res.json({ success: true, data: products });
};

// API lấy dữ liệu vẽ biểu đồ doanh thu (mock up nhanh hoặc dùng aggregate theo ngày)
export const getRevenue = async (req, res) => {
  // Trong thực tế sẽ group theo ngày. Để đảm bảo frontend không vỡ, trả về mảng dữ liệu.
  res.json({ success: true, data: [] });
};

export const getTopProducts = async (req, res) => {
  const products = await Product.find({ is_active: true })
    .sort({ sold_count: -1 })
    .limit(5);
  res.json({ success: true, data: products });
};

export const getRecentOrders = async (req, res) => {
  const orders = await mongoose
    .model("Order")
    .find()
    .sort({ created_at: -1 })
    .limit(10)
    .select(
      "order_code total status payment_method payment_status created_at items",
    );
  res.json({ success: true, data: orders });
};
// API Debug (Lấy top sản phẩm bán chạy)
export const getDebug = async (req, res) => {
  try {
    const products = await Product.find({ is_active: true })
      .sort({ sold_count: -1 })
      .limit(5);
    res.json({ success: true, data: products });
  } catch (error) {
    res.status(500);
    throw new Error("Lỗi khi chạy debug: " + error.message);
  }
};
