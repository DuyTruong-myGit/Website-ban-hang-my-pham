import mongoose from 'mongoose';

/**
 * Model mã giảm giá — TV3
 *
 * discountType:
 *   "percent" → giảm theo %, có thể có max_discount_amount
 *   "fixed"   → giảm số tiền cố định
 */
const couponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    description: { type: String, default: '' },

    // "percent" | "fixed"
    discount_type: {
      type: String,
      enum: ['percent', 'fixed'],
      default: 'percent',
    },

    // Giá trị giảm: nếu percent → 0-100, nếu fixed → số tiền VND
    value: { type: Number, required: true },

    // Giá trị đơn tối thiểu để áp dụng (0 = không giới hạn)
    min_order_amount: { type: Number, default: 0 },

    // Giảm tối đa (chỉ dùng cho percent, null = không giới hạn)
    max_discount_amount: { type: Number, default: null },

    // Số lần sử dụng tối đa (null = không giới hạn)
    usage_limit: { type: Number, default: null },

    // Số lần đã sử dụng
    used_count: { type: Number, default: 0 },

    // Ngày hết hạn (null = không hết hạn)
    expires_at: { type: Date, default: null },

    // Kích hoạt / vô hiệu hóa
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Map dữ liệu đầu ra cho frontend
couponSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.discountType = ret.discount_type;
    ret.minOrderAmount = ret.min_order_amount;
    ret.maxDiscountAmount = ret.max_discount_amount;
    ret.usageLimit = ret.usage_limit;
    ret.usedCount = ret.used_count;
    ret.expiresAt = ret.expires_at;
    ret.isActive = ret.is_active;
    ret.createdAt = ret.created_at;

    delete ret._id;
    delete ret.__v;
    delete ret.discount_type;
    delete ret.min_order_amount;
    delete ret.max_discount_amount;
    delete ret.usage_limit;
    delete ret.used_count;
    delete ret.expires_at;
    delete ret.is_active;
    delete ret.created_at;
    delete ret.updated_at;

    return ret;
  },
});

export default mongoose.model('Coupon', couponSchema);
