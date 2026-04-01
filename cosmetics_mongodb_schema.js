/**
 * ============================================================
 * MONGODB DATABASE SCHEMA - WEBSITE BÁN MỸ PHẨM (FINAL)
 * File: cosmetics_mongodb_schema.js
 * Mongoose + Node.js
 * ============================================================
 */

const mongoose = require("mongoose");
const { Schema } = mongoose;

// ============================================================
// 1. USERS - Người dùng
// ============================================================
const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password_hash: { type: String, required: true },
    phone: { type: String, trim: true },
    avatar_url: { type: String, default: "" },
    role: {
      type: String,
      enum: ["customer", "admin", "staff"],
      default: "customer",
    },
    is_active: { type: Boolean, default: true },
    oauth: {
      google_id: { type: String, default: null },
      facebook_id: { type: String, default: null },
    },
    last_login: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

UserSchema.index({ email: 1 }, { unique: true });
UserSchema.index({ phone: 1 });
UserSchema.index({ role: 1, is_active: 1 });

const User = mongoose.model("User", UserSchema);

// ============================================================
// 2. ADDRESSES - Địa chỉ giao hàng
// ============================================================
const AddressSchema = new Schema({
  user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
  full_name: { type: String, required: true, trim: true },
  phone: { type: String, required: true, trim: true },
  province: { type: String, required: true },
  district: { type: String, required: true },
  ward: { type: String, required: true },
  street: { type: String, required: true },
  is_default: { type: Boolean, default: false },
});

AddressSchema.index({ user_id: 1 });

const Address = mongoose.model("Address", AddressSchema);

// ============================================================
// 3. CATEGORIES - Danh mục sản phẩm (hỗ trợ đa cấp)
// ============================================================
const CategorySchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  description: { type: String, default: "" },
  image_url: { type: String, default: "" },
  parent_id: { type: Schema.Types.ObjectId, ref: "Category", default: null },
  sort_order: { type: Number, default: 0 },
  is_active: { type: Boolean, default: true },
});

CategorySchema.index({ slug: 1 }, { unique: true });
CategorySchema.index({ parent_id: 1, is_active: 1 });

const Category = mongoose.model("Category", CategorySchema);

// ============================================================
// 4. BRANDS - Thương hiệu
// ============================================================
const BrandSchema = new Schema({
  name: { type: String, required: true, trim: true },
  slug: { type: String, required: true, unique: true, lowercase: true },
  logo_url: { type: String, default: "" },
  description: { type: String, default: "" },
  origin_country: { type: String, default: "" },
  website: { type: String, default: "" },
  is_active: { type: Boolean, default: true },
});

BrandSchema.index({ slug: 1 }, { unique: true });

const Brand = mongoose.model("Brand", BrandSchema);

// ============================================================
// 5. PRODUCTS - Sản phẩm
// ============================================================
const VariantSchema = new Schema(
  {
    sku: { type: String, required: true },
    name: { type: String, required: true },
    attributes: {
      color: { type: String, default: "" },
      shade: { type: String, default: "" },
      size: { type: String, default: "" },
    },
    price: { type: Number, required: true, min: 0 },
    sale_price: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],
  },
  { _id: true }
);

const AttributeSchema = new Schema(
  {
    key: { type: String, required: true },
    value: { type: String, required: true },
  },
  { _id: false }
);

const ProductSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true },
    sku: { type: String, unique: true, sparse: true },
    description: { type: String, default: "" },
    short_description: { type: String, default: "" },

    category_id: { type: Schema.Types.ObjectId, ref: "Category", required: true },
    brand_id: { type: Schema.Types.ObjectId, ref: "Brand", required: true },

    base_price: { type: Number, required: true, min: 0 },
    sale_price: { type: Number, default: 0, min: 0 },
    images: [{ type: String }],

    variants: [VariantSchema],
    attributes: [AttributeSchema],

    tags: [{ type: String }],

    avg_rating: { type: Number, default: 0, min: 0, max: 5 },
    review_count: { type: Number, default: 0, min: 0 },
    sold_count: { type: Number, default: 0, min: 0 },
    view_count: { type: Number, default: 0, min: 0 },

    is_active: { type: Boolean, default: true },
    is_featured: { type: Boolean, default: false },
    is_new: { type: Boolean, default: false },
    is_best_seller: { type: Boolean, default: false },
    in_stock: { type: Boolean, default: true }, // Đã thêm: Cờ lọc nhanh còn hàng/hết hàng

    meta_title: { type: String, default: "" },
    meta_description: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

ProductSchema.index({ slug: 1 }, { unique: true });
ProductSchema.index({ category_id: 1, is_active: 1 });
ProductSchema.index({ brand_id: 1, is_active: 1 });
ProductSchema.index({ sale_price: 1, avg_rating: -1 });
ProductSchema.index({ sold_count: -1 });
ProductSchema.index({ is_featured: 1, is_active: 1 });
ProductSchema.index({ tags: 1 });
ProductSchema.index(
  { name: "text", short_description: "text", "attributes.value": "text" },
  { name: "product_text_search" }
);

const Product = mongoose.model("Product", ProductSchema);

// ============================================================
// 6. INVENTORY - Tồn kho
// ============================================================
const InventorySchema = new Schema(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant_sku: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 0, default: 0 },
    reserved: { type: Number, default: 0, min: 0 },
    warehouse: { type: String, default: "main" },
    low_stock_threshold: { type: Number, default: 5 },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

InventorySchema.virtual("available").get(function () {
  return Math.max(0, this.quantity - this.reserved);
});

InventorySchema.index({ product_id: 1, variant_sku: 1 }, { unique: true });
InventorySchema.index({ quantity: 1 });

const Inventory = mongoose.model("Inventory", InventorySchema);

// ============================================================
// 7. CARTS - Giỏ hàng
// ============================================================
const CartItemSchema = new Schema(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant_sku: { type: String, default: "" },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
  },
  { _id: false }
);

const CartSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
    session_id: { type: String, default: null },
    items: [CartItemSchema],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

CartSchema.index({ user_id: 1 });
CartSchema.index({ session_id: 1 });
CartSchema.index(
  { updated_at: 1 },
  { expireAfterSeconds: 7 * 24 * 60 * 60, partialFilterExpression: { user_id: null } }
);

const Cart = mongoose.model("Cart", CartSchema);

// ============================================================
// 8. ORDERS - Đơn hàng
// ============================================================
const OrderItemSchema = new Schema(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    variant_sku: { type: String, default: "" },
    name: { type: String, required: true },
    image: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    quantity: { type: Number, required: true, min: 1 },
    subtotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const ShippingAddressSchema = new Schema(
  {
    full_name: { type: String, required: true },
    phone: { type: String, required: true },
    province: { type: String, required: true },
    district: { type: String, required: true },
    ward: { type: String, required: true },
    street: { type: String, required: true },
  },
  { _id: false }
);

const OrderSchema = new Schema(
  {
    order_code: { type: String, required: true, unique: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shipping_address: { type: ShippingAddressSchema, required: true },
    items: [OrderItemSchema],

    subtotal: { type: Number, required: true, min: 0 },
    shipping_fee: { type: Number, default: 0, min: 0 },
    discount_amount: { type: Number, default: 0, min: 0 },
    total: { type: Number, required: true, min: 0 },

    coupon_id: { type: Schema.Types.ObjectId, ref: "Coupon", default: null },
    coupon_code: { type: String, default: "" },

    status: {
      type: String,
      enum: [
        "pending", "confirmed", "processing", "shipping",
        "delivered", "cancelled", "refunded", "returned",
      ],
      default: "pending",
    },

    payment_method: {
      type: String,
      enum: ["cod", "banking", "momo", "vnpay", "zalopay"],
      required: true,
    },
    payment_status: {
      type: String,
      enum: ["unpaid", "paid", "refunded"],
      default: "unpaid",
    },

    shipping_provider: { type: String, default: "" },
    tracking_number: { type: String, default: "" },
    estimated_delivery: { type: Date, default: null },

    note: { type: String, default: "" },
    cancel_reason: { type: String, default: "" },

    status_history: [
      {
        status: String,
        note: String,
        updated_at: { type: Date, default: Date.now },
        updated_by: { type: Schema.Types.ObjectId, ref: "User" },
      },
    ],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

OrderSchema.index({ order_code: 1 }, { unique: true });
OrderSchema.index({ user_id: 1, created_at: -1 });
OrderSchema.index({ status: 1, created_at: -1 });
OrderSchema.index({ payment_status: 1 });
OrderSchema.index({ created_at: -1 });

const Order = mongoose.model("Order", OrderSchema);

// ============================================================
// 9. PAYMENTS - Thanh toán
// ============================================================
const PaymentSchema = new Schema(
  {
    order_id: { type: Schema.Types.ObjectId, ref: "Order", required: true },
    provider: {
      type: String,
      enum: ["cod", "banking", "momo", "vnpay", "zalopay"],
      required: true,
    },
    transaction_id: { type: String, default: "" },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "success", "failed", "refunded"],
      default: "pending",
    },
    metadata: { type: Schema.Types.Mixed, default: {} },
    paid_at: { type: Date, default: null },
    refunded_at: { type: Date, default: null },
    refund_reason: { type: String, default: "" },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

PaymentSchema.index({ order_id: 1 });
PaymentSchema.index({ transaction_id: 1 });
PaymentSchema.index({ status: 1, created_at: -1 });

const Payment = mongoose.model("Payment", PaymentSchema);

// ============================================================
// 10. REVIEWS - Đánh giá sản phẩm
// ============================================================
const ReviewSchema = new Schema(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    order_id: { type: Schema.Types.ObjectId, ref: "Order", required: true },

    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, default: "" },
    images: [{ type: String }],

    skin_type: { type: String, default: "" },

    is_verified_purchase: { type: Boolean, default: true },
    helpful_count: { type: Number, default: 0, min: 0 },

    admin_reply: {
      content: { type: String, default: "" },
      replied_at: { type: Date, default: null },
      replied_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
    },

    is_hidden: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

ReviewSchema.index({ user_id: 1, product_id: 1 }, { unique: true });
ReviewSchema.index({ product_id: 1, created_at: -1 });
ReviewSchema.index({ product_id: 1, rating: -1 });
ReviewSchema.index({ is_hidden: 1 });

const Review = mongoose.model("Review", ReviewSchema);

// ============================================================
// 11. COUPONS - Mã giảm giá
// ============================================================
const CouponSchema = new Schema(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, default: "" },

    type: {
      type: String,
      enum: ["percent", "fixed", "free_shipping"],
      required: true,
    },
    value: { type: Number, required: true, min: 0 },
    max_discount_amount: { type: Number, default: null },
    min_order_value: { type: Number, default: 0, min: 0 },

    usage_limit: { type: Number, default: null },
    usage_per_user: { type: Number, default: 1 },
    used_count: { type: Number, default: 0, min: 0 },

    user_ids: [{ type: Schema.Types.ObjectId, ref: "User" }],
    product_ids: [{ type: Schema.Types.ObjectId, ref: "Product" }],
    category_ids: [{ type: Schema.Types.ObjectId, ref: "Category" }],
    brand_ids: [{ type: Schema.Types.ObjectId, ref: "Brand" }],

    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

CouponSchema.index({ code: 1 }, { unique: true });
CouponSchema.index({ end_date: 1 });
CouponSchema.index({ is_active: 1, start_date: 1, end_date: 1 });

const Coupon = mongoose.model("Coupon", CouponSchema);

// ============================================================
// 12. WISHLISTS - Danh sách yêu thích
// ============================================================
const WishlistSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    product_ids: [{ type: Schema.Types.ObjectId, ref: "Product" }],
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

WishlistSchema.index({ user_id: 1 }, { unique: true });

const Wishlist = mongoose.model("Wishlist", WishlistSchema);

// ============================================================
// 13. NOTIFICATIONS - Thông báo
// ============================================================
const NotificationSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    type: {
      type: String,
      enum: ["order_update", "promotion", "system", "review_reply", "restock"],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    ref_id: { type: Schema.Types.ObjectId, default: null },
    ref_type: { type: String, default: "" },
    is_read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

NotificationSchema.index({ user_id: 1, is_read: 1, created_at: -1 });
NotificationSchema.index({ created_at: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const Notification = mongoose.model("Notification", NotificationSchema);

// ============================================================
// 14. BANNERS - Banner quảng cáo
// ============================================================
const BannerSchema = new Schema({
  title: { type: String, required: true },
  image_url: { type: String, required: true },
  link_url: { type: String, default: "" },
  position: {
    type: String,
    enum: ["hero", "popup", "sidebar", "category_top"],
    default: "hero",
  },
  sort_order: { type: Number, default: 0 },
  start_date: { type: Date, default: null },
  end_date: { type: Date, default: null },
  is_active: { type: Boolean, default: true },
});

BannerSchema.index({ position: 1, is_active: 1, sort_order: 1 });

const Banner = mongoose.model("Banner", BannerSchema);

// ============================================================
// 15. CHAT ROOMS - Phòng chat giữa user và staff
// ============================================================
const ChatRoomSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    staff_id: { type: Schema.Types.ObjectId, ref: "User", default: null },

    subject: { type: String, default: "" }, // Chủ đề: "Tư vấn sản phẩm", "Hỏi về đơn hàng", "Khác"

    status: {
      type: String,
      enum: ["open", "closed"],
      default: "open",
    },

    last_message: { type: String, default: "" },
    last_sender_id: { type: Schema.Types.ObjectId, ref: "User", default: null },
    last_message_at: { type: Date, default: Date.now },

    user_unread: { type: Number, default: 0 },   // Số tin nhắn chưa đọc phía user
    staff_unread: { type: Number, default: 0 },   // Số tin nhắn chưa đọc phía staff

    closed_at: { type: Date, default: null },
    closed_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

ChatRoomSchema.index({ user_id: 1 });
ChatRoomSchema.index({ staff_id: 1 });
ChatRoomSchema.index({ status: 1 });
ChatRoomSchema.index({ last_message_at: -1 });

const ChatRoom = mongoose.model("ChatRoom", ChatRoomSchema);

// ============================================================
// 16. MESSAGES - Tin nhắn chat
// ============================================================
const MessageSchema = new Schema(
  {
    room_id: { type: Schema.Types.ObjectId, ref: "ChatRoom", required: true },
    sender_id: { type: Schema.Types.ObjectId, ref: "User", required: true },

    message: { type: String, default: "" },
    image_url: { type: String, default: "" }, // Đã thêm: Hỗ trợ gửi ảnh riêng biệt

    type: {
      type: String,
      enum: ["text", "image"],
      default: "text",
    },

    is_read: { type: Boolean, default: false },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

MessageSchema.index({ room_id: 1, created_at: 1 });
MessageSchema.index({ sender_id: 1 });

const Message = mongoose.model("Message", MessageSchema);

// ============================================================
// 17. PRODUCT QUESTIONS - Hỏi đáp sản phẩm
// ============================================================
const ProductQuestionSchema = new Schema(
  {
    product_id: { type: Schema.Types.ObjectId, ref: "Product", required: true },
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },

    question: { type: String, required: true },

    answer: { type: String, default: "" },
    answered_by: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

ProductQuestionSchema.index({ product_id: 1, created_at: -1 });

const ProductQuestion = mongoose.model("ProductQuestion", ProductQuestionSchema);

// ============================================================
// 18.5 SKIN PROFILES - Hồ sơ da khách hàng
// ============================================================
const SkinProfileSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true, unique: true },
    skin_type: {
      type: String,
      enum: ["oily", "dry", "combination", "normal", "sensitive", ""],
      default: "",
    },
    skin_concerns: [{ type: String }], // ["acne", "aging", "dark_spots", "pores", "redness", "wrinkles"]
    allergies: [{ type: String }],       // ["paraben", "fragrance", ...]
    age_range: {
      type: String,
      enum: ["under_18", "18_25", "26_35", "36_45", "over_45", ""],
      default: "",
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

SkinProfileSchema.index({ user_id: 1 }, { unique: true });

const SkinProfile = mongoose.model("SkinProfile", SkinProfileSchema);

// ============================================================
// 18.6 PAGE CONTENTS - Trang nội dung tĩnh
// ============================================================
const PageContentSchema = new Schema(
  {
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true }, // "about-us", "chinh-sach-doi-tra", "chinh-sach-van-chuyen"
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true }, // HTML content
    is_active: { type: Boolean, default: true },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

PageContentSchema.index({ slug: 1 }, { unique: true });

const PageContent = mongoose.model("PageContent", PageContentSchema);

// ============================================================
// 18. ADMIN LOGS - Log hành động admin/staff
// ============================================================
const AdminLogSchema = new Schema(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User" },
    action: { type: String, required: true },
    target: { type: String, default: "" },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

AdminLogSchema.index({ user_id: 1, created_at: -1 });

const AdminLog = mongoose.model("AdminLog", AdminLogSchema);

// ============================================================
// DATABASE CONNECTION
// ============================================================
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(
      process.env.MONGODB_URI || "mongodb://localhost:27017/cosmetics_db",
      {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }
    );
    console.log(`✅ MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB connection error: ${error.message}`);
    process.exit(1);
  }
};

// ============================================================
// SEED DATA MẪU (chạy 1 lần để khởi tạo)
// ============================================================
const seedSampleData = async () => {
  await connectDB();

  // Tạo danh mục mẫu
  const skincare = await Category.create({
    name: "Chăm sóc da",
    slug: "cham-soc-da",
    description: "Các sản phẩm dưỡng da, trị liệu",
    parent_id: null,
  });

  const moisturizer = await Category.create({
    name: "Kem dưỡng ẩm",
    slug: "kem-duong-am",
    parent_id: skincare._id,
  });

  // Tạo thương hiệu mẫu
  const laneige = await Brand.create({
    name: "LANEIGE",
    slug: "laneige",
    origin_country: "Hàn Quốc",
    website: "https://www.laneige.com",
  });

  // Tạo sản phẩm mẫu
  const product = await Product.create({
    name: "LANEIGE Water Sleeping Mask",
    slug: "laneige-water-sleeping-mask",
    sku: "LAN-WSM-80ML",
    short_description: "Mặt nạ ngủ dưỡng ẩm chuyên sâu ban đêm",
    category_id: moisturizer._id,
    brand_id: laneige._id,
    base_price: 850000,
    sale_price: 680000,
    images: [
      "https://example.com/laneige-wsm-1.jpg",
      "https://example.com/laneige-wsm-2.jpg",
    ],
    variants: [
      {
        sku: "LAN-WSM-15ML",
        name: "15ml - Mini",
        attributes: { size: "15ml" },
        price: 250000,
        sale_price: 200000,
      },
      {
        sku: "LAN-WSM-80ML",
        name: "80ml - Standard",
        attributes: { size: "80ml" },
        price: 850000,
        sale_price: 680000,
      },
    ],
    attributes: [
      { key: "skin_type", value: "Mọi loại da, đặc biệt da khô" },
      { key: "ingredients", value: "Sleepscent™, IPMP, Mineral Water" },
      { key: "volume", value: "80ml" },
      { key: "expiry", value: "36 tháng" },
      { key: "origin", value: "Hàn Quốc" },
      { key: "concern", value: "Dưỡng ẩm, làm sáng da, phục hồi qua đêm" },
      { key: "texture", value: "Gel trong suốt, thấm nhanh" },
      { key: "how_to_use", value: "Thoa lên da như bước cuối trong routine tối. Sáng rửa lại với nước." },
    ],
    tags: ["bestseller", "k-beauty", "sleeping-mask"],
    is_featured: true,
  });

  // Tạo inventory
  await Inventory.create([
    { product_id: product._id, variant_sku: "LAN-WSM-15ML", quantity: 100, warehouse: "HCM" },
    { product_id: product._id, variant_sku: "LAN-WSM-80ML", quantity: 50,  warehouse: "HCM" },
  ]);

  // Tạo coupon mẫu
  await Coupon.create({
    code: "WELCOME10",
    description: "Giảm 10% cho đơn hàng đầu tiên",
    type: "percent",
    value: 10,
    max_discount_amount: 100000,
    min_order_value: 200000,
    usage_per_user: 1,
    start_date: new Date(),
    end_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });

  await Coupon.create({
    code: "FREESHIP",
    description: "Miễn phí vận chuyển toàn quốc",
    type: "free_shipping",
    value: 0,
    min_order_value: 300000,
    start_date: new Date(),
    end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });

  console.log("✅ Seed data created successfully!");
  process.exit(0);
};

// ============================================================
// EXPORTS
// ============================================================
module.exports = {
  connectDB,
  seedSampleData,
  models: {
    User,
    Address,
    Category,
    Brand,
    Product,
    Inventory,
    Cart,
    Order,
    Payment,
    Review,
    Coupon,
    Wishlist,
    Notification,
    Banner,
    ChatRoom,
    Message,
    ProductQuestion,
    SkinProfile,
    PageContent,
    AdminLog
  }
};

// ============================================================
// CHẠY SEED (bỏ comment dòng dưới khi muốn khởi tạo data)
// ============================================================
// seedSampleData();