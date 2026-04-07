import mongoose from 'mongoose';

/**
 * Product Model — Phiên bản tối thiểu cho TV5 (Inventory)
 * TV2 sẽ mở rộng model này khi refactor phần Product
 */

const variantSchema = new mongoose.Schema(
  {
    sku: String,
    name: String,
    attributes: { type: Map, of: String },
    price: Number,
    sale_price: { type: Number, default: 0 },
    stock: { type: Number, default: 0 },
    images: [String],
  },
  { _id: false }
);

const attributeSchema = new mongoose.Schema(
  {
    key: String,
    value: String,
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      unique: true,
      trim: true,
    },
    sku: {
      type: String,
      sparse: true,
    },
    description: String,
    short_description: String,
    category_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Category',
    },
    brand_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Brand',
    },
    base_price: {
      type: Number,
      default: 0,
    },
    sale_price: {
      type: Number,
      default: 0,
    },
    images: [String],
    variants: [variantSchema],
    attributes: [attributeSchema],
    tags: [String],
    avg_rating: {
      type: Number,
      default: 0,
    },
    review_count: {
      type: Number,
      default: 0,
    },
    sold_count: {
      type: Number,
      default: 0,
    },
    is_active: {
      type: Boolean,
      default: true,
    },
    is_featured: {
      type: Boolean,
      default: false,
    },
    is_new: {
      type: Boolean,
      default: false,
    },
    is_best_seller: {
      type: Boolean,
      default: false,
    },
    stock: {
      type: Number,
      default: 0,
    },
    in_stock: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' },
  }
);

const Product = mongoose.model('Product', productSchema);

export default Product;
