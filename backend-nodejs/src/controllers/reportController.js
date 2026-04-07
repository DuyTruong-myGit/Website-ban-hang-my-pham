import mongoose from 'mongoose';

// @desc    Lấy tổng quan: doanh thu, đơn mới, KH mới, SP hết hàng
// @route   GET /api/admin/reports/overview
export const getOverview = async (req, res) => {
  const overview = {};

  // 1. Tổng doanh thu (từ orders đã delivered)
  try {
    const revenueResult = await mongoose.connection.db
      .collection('orders')
      .aggregate([
        { $match: { status: 'delivered' } },
        { $group: { _id: null, totalRevenue: { $sum: '$total' } } },
      ])
      .toArray();
    overview.totalRevenue =
      revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0;
  } catch {
    overview.totalRevenue = 0;
  }

  // 2. Đơn hàng mới (pending) trong 7 ngày gần đây
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newOrdersResult = await mongoose.connection.db
      .collection('orders')
      .aggregate([
        {
          $match: {
            status: 'pending',
            created_at: { $gte: sevenDaysAgo },
          },
        },
        { $count: 'count' },
      ])
      .toArray();
    overview.newOrders =
      newOrdersResult.length > 0 ? newOrdersResult[0].count : 0;
  } catch {
    overview.newOrders = 0;
  }

  // 3. KH mới trong 7 ngày
  try {
    const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const newCustomersResult = await mongoose.connection.db
      .collection('users')
      .aggregate([
        {
          $match: {
            role: 'customer',
            created_at: { $gte: sevenDaysAgo },
          },
        },
        { $count: 'count' },
      ])
      .toArray();
    overview.newCustomers =
      newCustomersResult.length > 0 ? newCustomersResult[0].count : 0;
  } catch {
    overview.newCustomers = 0;
  }

  // 4. SP hết hàng (stock <= 5)
  try {
    const lowStockResult = await mongoose.connection.db
      .collection('products')
      .aggregate([
        { $match: { stock: { $lte: 5 }, is_active: true } },
        { $count: 'count' },
      ])
      .toArray();
    overview.lowStockProducts =
      lowStockResult.length > 0 ? lowStockResult[0].count : 0;
  } catch {
    overview.lowStockProducts = 0;
  }

  res.json({
    success: true,
    data: overview,
  });
};

// @desc    Báo cáo doanh thu theo khoảng thời gian
// @route   GET /api/admin/reports/revenue?from=&to=
export const getRevenue = async (req, res) => {
  const { from, to } = req.query;

  if (!from || !to) {
    res.status(400);
    throw new Error('Vui lòng cung cấp tham số from và to.');
  }

  const fromDate = new Date(from);
  const toDate = new Date(to);

  const revenue = await mongoose.connection.db
    .collection('orders')
    .aggregate([
      {
        $match: {
          status: 'delivered',
          created_at: { $gte: fromDate, $lte: toDate },
        },
      },
      {
        $project: {
          year: { $year: '$created_at' },
          month: { $month: '$created_at' },
          day: { $dayOfMonth: '$created_at' },
          total: 1,
        },
      },
      {
        $group: {
          _id: { year: '$year', month: '$month', day: '$day' },
          revenue: { $sum: '$total' },
          orderCount: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          year: '$_id.year',
          month: '$_id.month',
          day: '$_id.day',
          revenue: 1,
          orderCount: 1,
        },
      },
      { $sort: { year: 1, month: 1, day: 1 } },
    ])
    .toArray();

  res.json({
    success: true,
    data: revenue,
  });
};

// @desc    Top sản phẩm bán chạy
// @route   GET /api/admin/reports/top-products
export const getTopProducts = async (req, res) => {
  const topProducts = await mongoose.connection.db
    .collection('products')
    .aggregate([
      { $match: { is_active: true } },
      { $sort: { sold_count: -1 } },
      { $limit: 10 },
      {
        $project: {
          name: 1,
          slug: 1,
          sold_count: 1,
          base_price: 1,
          sale_price: 1,
          images: 1,
          avg_rating: 1,
        },
      },
    ])
    .toArray();

  res.json({
    success: true,
    data: topProducts,
  });
};

// @desc    Đơn hàng gần đây (10 đơn mới nhất)
// @route   GET /api/admin/reports/recent-orders
export const getRecentOrders = async (req, res) => {
  const recentOrders = await mongoose.connection.db
    .collection('orders')
    .aggregate([
      { $sort: { created_at: -1 } },
      { $limit: 10 },
      {
        $project: {
          order_code: 1,
          total: 1,
          status: 1,
          payment_method: 1,
          payment_status: 1,
          created_at: 1,
          item_count: { $size: { $ifNull: ['$items', []] } },
        },
      },
    ])
    .toArray();

  res.json({
    success: true,
    data: recentOrders,
  });
};

// @desc    Danh sách SP sắp hết hàng (stock <= 5)
// @route   GET /api/admin/reports/low-stock
export const getLowStock = async (req, res) => {
  const lowStockItems = await mongoose.connection.db
    .collection('products')
    .aggregate([
      { $match: { stock: { $lte: 5 }, is_active: true } },
      { $sort: { stock: 1 } },
      { $limit: 20 },
      {
        $project: {
          product_id: '$_id',
          name: 1,
          variant_sku: '$sku',
          quantity: '$stock',
          low_stock_threshold: { $literal: 5 },
        },
      },
    ])
    .toArray();

  res.json({
    success: true,
    data: lowStockItems,
  });
};
