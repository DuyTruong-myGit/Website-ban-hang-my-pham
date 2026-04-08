import Order from '../models/Order.js';
import Cart from '../models/Cart.js';
import { applyCoupon } from './couponController.js';
import { createPaymentRecord, syncPaymentStatus } from './paymentController.js';

/**
 * OrderController — TV3
 *
 * TẤT CẢ API CẦN JWT
 *
 * User APIs:
 *   POST /api/orders              → Tạo đơn hàng từ giỏ (COD)
 *   GET  /api/orders              → Lịch sử đơn hàng của tôi
 *   GET  /api/orders/:id          → Chi tiết 1 đơn hàng của tôi
 *   PUT  /api/orders/:id/cancel   → Hủy đơn hàng (khi đang pending/confirmed)
 *
 * Admin/Staff APIs:
 *   GET  /api/admin/orders              → Lấy tất cả đơn hàng (có phân trang, filter)
 *   PUT  /api/admin/orders/:id/status   → Đổi trạng thái đơn + thêm tracking code
 */

import Coupon from '../models/Coupon.js';

/**
 * ── USER: TẠO ĐƠN HÀNG MỚI ──────────────────────────────────────────────
 * POST /api/orders
 * Body frontend gửi: { fullName, phone, province, district, ward, street, paymentMethod, note, couponCode }
 */
export const createOrder = async (req, res) => {
  const {
    fullName,
    phone,
    province,
    district,
    ward,
    street,
    paymentMethod,
    note,
    couponCode,
  } = req.body;

  if (!fullName || !phone) {
    res.status(400);
    throw new Error('Vui lòng cung cấp đầy đủ họ tên và số điện thoại giao hàng.');
  }

  // 1. Lấy giỏ hàng
  const cart = await Cart.findOne({ user_id: req.user._id });
  if (!cart || !cart.items || cart.items.length === 0) {
    res.status(400);
    throw new Error('Giỏ hàng trống, không thể đặt hàng.');
  }

  // 2. Tính toán tiền nong chuẩn xác
  const subtotal = cart.items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const shippingFee = subtotal >= 500000 ? 0 : 30000;
  
  let discount = 0;
  if (couponCode) {
    const coupon = await Coupon.findOne({
      code: couponCode.toUpperCase(),
      is_active: true,
      expires_at: { $gt: new Date() },
    });
    
    if (coupon && subtotal >= coupon.min_order_amount) {
      if (coupon.discount_type === 'percent') {
        discount = (subtotal * coupon.discount_value) / 100;
        if (coupon.max_discount_amount) {
          discount = Math.min(discount, coupon.max_discount_amount);
        }
      } else {
        discount = coupon.discount_value;
      }
      discount = Math.min(discount, subtotal);
    }
  }

  const total = subtotal + shippingFee - discount;

  // 3. Sinh mã đơn hàng
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const rando = Math.floor(1000 + Math.random() * 9000);
  const orderCode = `ORD-${dateStr}-${rando}`;

  // 4. Format danh sách mua
  const orderItems = cart.items.map((item) => ({
    product_id: item.product_id,
    variant_sku: item.variant_sku || '',
    name: item.name,
    variant_name: item.variant_name || '',
    image_url: item.image_url || '',
    price: item.price,
    quantity: item.quantity,
    line_total: item.price * item.quantity,
  }));

  // 5. Build address & history
  const address = {
    full_name: fullName,
    phone,
    province: province || '',
    district: district || '',
    ward: ward || '',
    street: street || '',
  };

  const initialHistory = [{
    status: 'pending',
    note: 'Đơn hàng mới được tạo',
    changed_by: req.user._id.toString(),
    changed_at: new Date(),
  }];

  // 6. Lưu đơn hàng
  const order = await Order.create({
    order_code: orderCode,
    user_id: req.user._id,
    items: orderItems,
    shipping_address: address,
    subtotal,
    shipping_fee: shippingFee,
    total,
    discount,
    coupon_code: couponCode ? couponCode.toUpperCase() : '',
    payment_method: paymentMethod || 'cod',
    note: note || '',
    status: 'pending',
    status_history: initialHistory,
  });

  // 7. Đồng bộ hệ thống Coupon & Payment & Do dọn giỏ hàng tự động ở frontend rồi nên không cần dọn lại chờ xác nhận
  if (couponCode) {
    await applyCoupon(couponCode.toUpperCase());
  }
  await createPaymentRecord(order);

  // Dọn giỏ hàng trên DB sau khi lưu xong đơn
  cart.items = [];
  await cart.save();

  res.status(201).json({
    success: true,
    data: order,
    message: 'Đặt hàng thành công.',
  });
};

/**
 * ── USER: LẤY DANH SÁCH ĐƠN HÀNG ────────────────────────────────────
 * GET /api/orders
 */
export const getMyOrders = async (req, res) => {
  const orders = await Order.find({ user_id: req.user._id }).sort({ created_at: -1 });
  res.json({ success: true, data: orders });
};

/**
 * ── USER: XEM CHI TIẾT ĐƠN ───────────────────────────────────────────
 * GET /api/orders/:id
 */
export const getOrderById = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng.');
  }

  // Phải là đơn của user hoặc user là Admin/Staff
  if (order.user_id.toString() !== req.user._id.toString() && req.user.role === 'customer') {
    res.status(403);
    throw new Error('Bạn không có quyền xem đơn hàng này.');
  }

  res.json({ success: true, data: order });
};

/**
 * ── USER: HỦY ĐƠN HÀNG ─────────────────────────────────────────────
 * PUT /api/orders/:id/cancel
 * Người dùng chỉ được hủy khi đơn ở trạng thái `pending` hoặc `confirmed`.
 */
export const cancelOrder = async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng.');
  }

  if (order.user_id.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('Không có quyền hủy đơn hàng này.');
  }

  if (order.status !== 'pending' && order.status !== 'confirmed') {
    res.status(400);
    throw new Error('Không thể hủy đơn hàng đã hoặc đang được giao.');
  }

  order.status = 'cancelled';
  order.status_history.push({
    status: 'cancelled',
    note: 'Khách hàng tự hủy đơn',
    changed_by: req.user._id.toString(),
    changed_at: new Date(),
  });

  await order.save();

  // Đồng bộ Payment: Đánh dấu failed/refunded
  await syncPaymentStatus(order._id.toString(), 'cancelled');

  res.json({ success: true, data: order, message: 'Đã hủy đơn hàng thành công.' });
};

// ====================================================================================
// ADMIN / STAFF APIS
// ====================================================================================

/**
 * ── ADMIN/STAFF: LẤY DANH SÁCH TẤT CẢ ĐƠN ──────────────────────────
 * GET /api/admin/orders?status=pending&page=1&limit=20
 */
export const getAllOrdersAdmin = async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (status) {
    filter.status = status;
  }

  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const total = await Order.countDocuments(filter);
  const orders = await Order.find(filter)
    .sort({ created_at: -1 })
    .skip(skip)
    .limit(limitNum);

  res.json({
    success: true,
    data: orders,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

/**
 * ── ADMIN/STAFF: CẬP NHẬT TRẠNG THÁI ĐƠN ───────────────────────────
 * PUT /api/admin/orders/:id/status
 * Body: { status, trackingCode, note }
 */
export const updateOrderStatusAdmin = async (req, res) => {
  const { status, trackingCode, note } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Không tìm thấy đơn hàng.');
  }

  const validStatuses = ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    res.status(400);
    throw new Error('Trạng thái đơn hàng không hợp lệ.');
  }

  // Nếu cập nhật tracking code
  if (trackingCode) {
    order.tracking_code = trackingCode;
  }

  // Thêm lịch sử nếu trạng thái có thay đổi
  if (order.status !== status) {
    order.status = status;
    order.status_history.push({
      status,
      note: note || 'Quản trị viên/Nhân viên đã cập nhật trạng thái',
      changed_by: req.user._id.toString(),
      changed_at: new Date(),
    });
  }

  await order.save();

  // Nếu chuyển sang delivered hoặc cancelled -> Báo cho Payment Module
  if (status === 'delivered' || status === 'cancelled') {
    await syncPaymentStatus(order._id.toString(), status);
  }

  res.json({
    success: true,
    data: order,
    message: 'Cập nhật trạng thái đơn hàng thành công.',
  });
};
