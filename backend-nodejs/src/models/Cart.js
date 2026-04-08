import mongoose from 'mongoose';

// Giỏ hàng - Sub Schema (Embedded)
const cartItemSchema = new mongoose.Schema(
  {
    product_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    variant_sku: {
      type: String,
      default: '',
    },
    // Snapshot tĩnh cho giao diện
    name: {
      type: String,
      required: true,
    },
    image_url: {
      type: String,
      default: '',
    },
    variant_name: {
      type: String,
      default: '',
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },
  },
  { _id: false }
);

const cartSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
    },
    items: [cartItemSchema],
  },
  { timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' } }
);

// Map dữ liệu đầu ra JSON cho Frontend (CamelCase)
cartSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.userId = ret.user_id;

    if (ret.items) {
      ret.items = ret.items.map((item) => ({
        productId: item.product_id,
        variantSku: item.variant_sku,
        name: item.name,
        imageUrl: item.image_url,
        variantName: item.variant_name,
        price: item.price,
        quantity: item.quantity,
      }));
    }

    ret.updatedAt = ret.updated_at;

    delete ret._id;
    delete ret.__v;
    delete ret.user_id;
    delete ret.created_at;
    delete ret.updated_at;

    return ret;
  },
});

export default mongoose.model('Cart', cartSchema);
