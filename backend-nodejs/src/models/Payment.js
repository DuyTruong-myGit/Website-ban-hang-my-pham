import mongoose from 'mongoose';

/**
 * Model thanh toán — TV3
 *
 * Hiện tại chỉ hỗ trợ COD (thanh toán khi nhận hàng).
 * Mỗi đơn hàng có đúng 1 bản ghi Payment tương ứng.
 *
 * paymentStatus:
 *   "pending"  → Chờ thanh toán (COD: chờ giao hàng)
 *   "paid"     → Đã thanh toán (COD: giao hàng thành công)
 *   "refunded" → Đã hoàn tiền (đơn bị hủy sau khi đã trả)
 *   "failed"   → Thất bại
 */
const paymentSchema = new mongoose.Schema(
  {
    // ID đơn hàng tương ứng
    order_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true,
    },

    // Mã đơn hàng (hiển thị) — vd: ORD-20260404-XXXX
    order_code: { type: String },

    // Phương thức thanh toán: "cod"
    payment_method: {
      type: String,
      enum: ['cod', 'bank_transfer', 'momo'],
      default: 'cod',
    },

    // Trạng thái thanh toán: "pending" | "paid" | "refunded" | "failed"
    payment_status: {
      type: String,
      enum: ['pending', 'paid', 'refunded', 'failed'],
      default: 'pending',
    },

    // Tổng số tiền cần thanh toán
    amount: { type: Number, required: true },

    // Ghi chú
    note: { type: String, default: '' },

    // Thời điểm thanh toán thực tế (null nếu chưa thanh toán)
    paid_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Map dữ liệu đầu ra cho frontend
paymentSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.orderId = ret.order_id;
    ret.orderCode = ret.order_code;
    ret.paymentMethod = ret.payment_method;
    ret.paymentStatus = ret.payment_status;
    ret.paidAt = ret.paid_at;
    ret.createdAt = ret.created_at;

    delete ret._id;
    delete ret.__v;
    delete ret.order_id;
    delete ret.order_code;
    delete ret.payment_method;
    delete ret.payment_status;
    delete ret.paid_at;
    delete ret.created_at;
    delete ret.updated_at;

    return ret;
  },
});

export default mongoose.model('Payment', paymentSchema);
