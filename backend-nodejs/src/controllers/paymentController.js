import Payment from '../models/Payment.js';
import Order from '../models/Order.js';

/**
 * PaymentController — TV3
 *
 * GET /api/payments/:orderId
 *   → Lấy thông tin thanh toán của đơn hàng (cần JWT)
 *   → Tự tạo payment record nếu đơn cũ chưa có
 */

/**
 * GET /api/payments/:orderId
 * → Fetch thông tin thanh toán (COD/Banking) trả về view lịch sử đơn
 */
export const getPaymentByOrderId = async (req, res) => {
  const { orderId } = req.params;

  // Tìm payment theo order_id
  let payment = await Payment.findOne({ order_id: orderId });

  if (!payment) {
    // Nếu chưa có payment record (đơn cũ), tự tạo mới từ Order
    const order = await Order.findById(orderId);
    if (!order) {
      res.status(404);
      throw new Error('Không tìm thấy đơn hàng.');
    }

    payment = await Payment.create({
      order_id: order._id,
      order_code: order.order_code,
      payment_method: order.payment_method || 'cod',
      payment_status: 'pending',
      amount: order.total,
      note: 'Thanh toán khi nhận hàng (COD)',
    });
  }

  res.json({ success: true, data: payment });
};

// ── INTERNAL HELPERS (export để orderController gọi) ────────────────────

/**
 * Tạo bản ghi Payment khi Order được tạo.
 * Gọi từ OrderController sau khi save đơn thành công.
 */
export const createPaymentRecord = async (order) => {
  // Tránh tạo trùng
  const existing = await Payment.findOne({ order_id: order._id });
  if (existing) return existing;

  return Payment.create({
    order_id: order._id,
    order_code: order.order_code,
    payment_method: order.payment_method || 'cod',
    payment_status: 'pending',
    amount: order.total,
    note: 'Thanh toán khi nhận hàng (COD)',
  });
};

/**
 * Đồng bộ trạng thái Payment khi Order thay đổi trạng thái.
 *
 * Mapping:
 *   order "delivered"  → payment "paid" + ghi paid_at
 *   order "cancelled"  → payment "refunded" (nếu đã paid) hoặc "failed"
 */
export const syncPaymentStatus = async (orderId, newOrderStatus) => {
  const payment = await Payment.findOne({ order_id: orderId });
  if (!payment) return;

  switch (newOrderStatus) {
    case 'delivered':
      payment.payment_status = 'paid';
      payment.paid_at = new Date();
      payment.note = 'Đã giao hàng thành công — COD thu tiền.';
      break;

    case 'cancelled':
      if (payment.payment_status === 'paid') {
        payment.payment_status = 'refunded';
        payment.note = 'Đơn hàng bị hủy — chờ hoàn tiền.';
      } else {
        payment.payment_status = 'failed';
        payment.note = 'Đơn hàng bị hủy trước khi thanh toán.';
      }
      break;

    default:
      // pending, confirmed, shipping → không đổi payment status
      return;
  }

  await payment.save();
};
