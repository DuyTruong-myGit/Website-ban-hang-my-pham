import mongoose from "mongoose";

// Định nghĩa Sub-schema cho biến thể sản phẩm (vd: Dung tích 50ml, 100ml)
const variantSchema = new mongoose.Schema({
  sku: { type: String, required: true },
  name: { type: String, required: true },
  attributes: { type: Map, of: String },
  price: { type: Number, required: true },
  sale_price: { type: Number, default: 0 },
  stock: { type: Number, default: 0 },
  images: [{ type: String }],
});

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    sku: { type: String, sparse: true },
    description: { type: String },
    short_description: { type: String },
    category_id: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    brand_id: { type: mongoose.Schema.Types.ObjectId, ref: "Brand" },
    base_price: { type: Number, required: true },
    sale_price: { type: Number, default: 0 },
    images: [{ type: String }],
    tags: [{ type: String }],
    variants: [variantSchema],
    attributes: [
      {
        key: { type: String },
        value: { type: String },
      },
    ],
    rating: { type: Number, default: 0 },
    review_count: { type: Number, default: 0 },
    sold_count: { type: Number, default: 0 },
    is_active: { type: Boolean, default: true },
    is_featured: { type: Boolean, default: false },
    is_new_product: { type: Boolean, default: false },
    is_best_seller: { type: Boolean, default: false },
    stock: { type: Number, default: 0 },
    in_stock: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } },
);

// Map dữ liệu đầu ra để khớp với ProductCard.jsx và AdminProducts.jsx
productSchema.set("toJSON", {
  transform: (doc, ret) => {
    ret.id = ret._id;
    ret.shortDescription = ret.short_description;
    ret.categoryId = ret.category_id;
    ret.brandId = ret.brand_id;
    ret.basePrice = ret.base_price;
    ret.salePrice = ret.sale_price;
    ret.reviewCount = ret.review_count;
    ret.soldCount = ret.sold_count;
    ret.isActive = ret.is_active;
    ret.isFeatured = ret.is_featured;
    ret.isNew = ret.is_new_product;
    ret.isBestSeller = ret.is_best_seller;
    ret.inStock = ret.in_stock;

    // Map sale_price bên trong từng variant
    if (ret.variants) {
      ret.variants = ret.variants.map((v) => {
        v.salePrice = v.sale_price;
        delete v.sale_price;
        delete v._id; // Ẩn _id của sub-document cho gọn
        return v;
      });
    }

    // Dọn dẹp các key thừa
    delete ret._id;
    delete ret.__v;
    delete ret.short_description;
    delete ret.category_id;
    delete ret.brand_id;
    delete ret.base_price;
    delete ret.sale_price;
    delete ret.review_count;
    delete ret.sold_count;
    delete ret.is_active;
    delete ret.is_featured;
    delete ret.is_new_product;
    delete ret.is_best_seller;
    delete ret.in_stock;

    return ret;
  },
});

export default mongoose.model("Product", productSchema);
