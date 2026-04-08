import mongoose from 'mongoose';

/**
 * Model đơn hàng — TV3
 *
 * Status flow:
 *   pending → confirmed → shipping → delivered
 *           ↘ cancelled  (chỉ từ pending hoặc confirmed)
 */

// Sub-schema: OrderItem (snapshot sản phẩm tại thời điểm đặt hàng)
const orderItemSchema = new mongoose.Schema(
  {
    product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    variant_sku: { type: String, default: '' },
    name: { type: String, required: true },
    variant_name: { type: String, default: '' },
    image_url: { type: String, default: '' },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, min: 1 },
    line_total: { type: Number },  // price * quantity
  },
  { _id: false }
);

// Sub-schema: Địa chỉ giao hàng
const shippingAddressSchema = new mongoose.Schema(
  {
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, default: '' },
    district: { type: String, default: '' },
    ward: { type: String, default: '' },
    street: { type: String, default: '' },
  },
  { _id: false }
);

// Sub-schema: Lịch sử trạng thái
const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true },
    note: { type: String, default: '' },
    changed_by: { type: String, default: '' },   // userId
    changed_at: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    // Mã đơn hàng hiển thị: ORD-20260404-001
    order_code: { type: String, unique: true, required: true },

    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    items: [orderItemSchema],

    shipping_address: shippingAddressSchema,

    // Tổng tiền hàng trước phí ship
    subtotal: { type: Number, required: true },

    // Phí vận chuyển
    shipping_fee: { type: Number, default: 30000 },

    // Tổng thanh toán = subtotal + shipping_fee - discount
    total: { type: Number, required: true },

    // Số tiền giảm giá (từ coupon)
    discount: { type: Number, default: 0 },

    // Mã coupon đã dùng
    coupon_code: { type: String, default: '' },

    // Trạng thái: pending | confirmed | shipping | delivered | cancelled
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'shipping', 'delivered', 'cancelled'],
      default: 'pending',
    },

    // Phương thức thanh toán: cod | bank_transfer | momo
    payment_method: { type: String, default: 'cod' },

    // Ghi chú của khách
    note: { type: String, default: '' },

    // Mã vận đơn (do staff điền)
    tracking_code: { type: String, default: '' },

    // Lịch sử thay đổi trạng thái
    status_history: [statusHistorySchema],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Map dữ liệu đầu ra cho frontend (camelCase)
orderSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.orderCode = ret.order_code;
    ret.userId = ret.user_id;
    ret.shippingAddress = ret.shipping_address;
    ret.shippingFee = ret.shipping_fee;
    ret.couponCode = ret.coupon_code;
    ret.paymentMethod = ret.payment_method;
    ret.trackingCode = ret.tracking_code;

    // Map items
    if (ret.items) {
      ret.items = ret.items.map((item) => ({
        productId: item.product_id,
        variantSku: item.variant_sku,
        name: item.name,
        variantName: item.variant_name,
        imageUrl: item.image_url,
        price: item.price,
        quantity: item.quantity,
        lineTotal: item.line_total,
      }));
    }

    // Map shipping address
    if (ret.shippingAddress) {
      ret.shippingAddress = {
        fullName: ret.shipping_address?.full_name,
        phone: ret.shipping_address?.phone,
        province: ret.shipping_address?.province,
        district: ret.shipping_address?.district,
        ward: ret.shipping_address?.ward,
        street: ret.shipping_address?.street,
      };
    }

    // Map status history
    if (ret.status_history) {
      ret.statusHistory = ret.status_history.map((h) => ({
        status: h.status,
        note: h.note,
        changedBy: h.changed_by,
        changedAt: h.changed_at,
      }));
    }

    ret.createdAt = ret.created_at;
    ret.updatedAt = ret.updated_at;

    // Dọn dẹp key thừa
    delete ret._id;
    delete ret.__v;
    delete ret.order_code;
    delete ret.user_id;
    delete ret.shipping_address;
    delete ret.shipping_fee;
    delete ret.coupon_code;
    delete ret.payment_method;
    delete ret.tracking_code;
    delete ret.status_history;
    delete ret.created_at;
    delete ret.updated_at;

    return ret;
  },
});

export default mongoose.model('Order', orderSchema);
