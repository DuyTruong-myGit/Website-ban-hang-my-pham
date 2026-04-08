import Product from "../models/Product.js";
import Category from "../models/Category.js";

/**
 * ProductController — TV2 (CRUD, Homepage) + TV3 (Storefront Display: lọc, search, phân trang)
 *
 * Public APIs:
 *   GET /api/products              → Danh sách cửa hàng (filter, search, sort, phân trang)
 *   GET /api/products/featured     → Sản phẩm trưng bày (trang chủ)
 *   GET /api/products/best-sellers → Bán chạy
 *   GET /api/products/new-arrivals → Mới về
 *   GET /api/products/flash-sale   → Flash sale
 *   GET /api/products/:slug        → Chi tiết 1 sản phẩm (populate đầy đủ category, brand)
 *
 * Admin APIs:
 *   POST   /api/products           → Tạo
 *   PUT    /api/products/:id       → Sửa
 *   DELETE /api/products/:id       → Xóa
 */

// ═══════════════════════════════════════════════════════════════════════════
// TV3: GET /api/products — Danh sách cửa hàng mạnh mẽ
//   Handle: ?limit=20&page=1&minPrice=&maxPrice=&search=&categoryId=&brandId=
//           &inStock=true&minRating=4&sort=price_asc|price_desc|best_seller|rating|newest
// ═══════════════════════════════════════════════════════════════════════════
export const getProducts = async (req, res) => {
  const {
    categoryId,
    brandId,
    minPrice,
    maxPrice,
    search,
    inStock,
    minRating,
    sort = "newest",
    page = 1,
    limit = 20,
  } = req.query;

  // 1. Build Query Filter
  let filter = { is_active: true };

  // Lọc theo danh mục (bao gồm mảng ID bằng dấu phẩy)
  if (categoryId) {
    const categories = categoryId.split(',');
    const childCategories = await Category.find({ parent_id: { $in: categories } });
    const categoryIds = [...categories, ...childCategories.map((c) => c._id.toString())];
    filter.category_id = { $in: categoryIds };
  }

  // Lọc theo mảng brand (cách nhau bởi dấu phẩy)
  if (brandId) {
    const brands = brandId.split(',');
    filter.brand_id = { $in: brands };
  }

  // Tìm kiếm theo keyword (tên + mô tả ngắn)
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: "i" } },
      { short_description: { $regex: search, $options: "i" } },
    ];
  }

  if (inStock === "true") filter.in_stock = true;
  if (minRating) filter.rating = { $gte: Number(minRating) };

  // Lọc theo khoảng giá
  if (minPrice || maxPrice) {
    filter.base_price = {};
    if (minPrice) filter.base_price.$gte = Number(minPrice);
    if (maxPrice) filter.base_price.$lte = Number(maxPrice);
  }

  // 2. Build Sort
  let sortOption = { created_at: -1 }; // Mặc định newest
  if (sort === "price_asc") sortOption = { base_price: 1 };
  if (sort === "price_desc") sortOption = { base_price: -1 };
  if (sort === "best_seller") sortOption = { sold_count: -1 };
  if (sort === "rating") sortOption = { rating: -1 };

  // 3. Pagination & Execute
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(100, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  const [total, products] = await Promise.all([
    Product.countDocuments(filter),
    Product.find(filter)
      .sort(sortOption)
      .skip(skip)
      .limit(limitNum)
      .lean(),
  ]);

  // Dùng lean() để query nhanh hơn, rồi tự map field cho frontend
  const mappedProducts = products.map((p) => mapProductFields(p));

  res.json({
    success: true,
    data: mappedProducts,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
};

// ═══════════════════════════════════════════════════════════════════════════
// TV3: GET /api/products/:slug — Chi tiết 1 mặt hàng
//   Trả về đủ toàn bộ data mô tả để render giao diện chi tiết
//   Populate đầy đủ: category name, brand name
// ═══════════════════════════════════════════════════════════════════════════
export const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    is_active: true,
  })
    .populate("category_id", "name slug image_url")
    .populate("brand_id", "name slug logo_url");

  if (!product) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm");
  }

  // Kèm thêm data đầy đủ cho frontend render:
  // category info, brand info đã được populate
  const productData = product.toJSON();

  // Thêm category & brand object riêng để frontend dễ render
  if (product.category_id && typeof product.category_id === "object") {
    productData.category = {
      id: product.category_id._id,
      name: product.category_id.name,
      slug: product.category_id.slug,
    };
  }

  if (product.brand_id && typeof product.brand_id === "object") {
    productData.brand = {
      id: product.brand_id._id,
      name: product.brand_id.name,
      slug: product.brand_id.slug,
    };
  }

  res.json({ success: true, data: productData });
};

// ═══════════════════════════════════════════════════════════════════════════
// TV3: GET /api/products/featured — Sản phẩm trưng bày trang chủ
//   Query top sản phẩm is_featured = true, limit 12
// ═══════════════════════════════════════════════════════════════════════════
export const getFeaturedProducts = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 12, 50);

  const products = await Product.find({
    is_active: true,
    is_featured: true,
  })
    .sort({ created_at: -1 })
    .limit(limit);

  res.json({ success: true, data: products });
};

// ── Các API cho Trang chủ (HOME.JSX) ────────────────────────────────────

export const getBestSellers = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 12, 50);

  const products = await Product.find({
    is_active: true,
    is_best_seller: true,
  })
    .sort({ sold_count: -1 })
    .limit(limit);

  res.json({ success: true, data: products });
};

export const getNewArrivals = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 12, 50);

  const products = await Product.find({
    is_active: true,
    is_new_product: true,
  })
    .sort({ created_at: -1 })
    .limit(limit);

  res.json({ success: true, data: products });
};

export const getFlashSale = async (req, res) => {
  const limit = Math.min(Number(req.query.limit) || 12, 50);

  const products = await Product.find({
    is_active: true,
    sale_price: { $gt: 0 },
  })
    .sort({ updated_at: -1 })
    .limit(limit);

  res.json({ success: true, data: products });
};

// ── ADMIN CRUD ──────────────────────────────────────────────────────────

export const createProduct = async (req, res) => {
  const product = await Product.create(req.body);
  res
    .status(201)
    .json({ success: true, message: "Tạo sản phẩm thành công", data: product });
};

export const updateProduct = async (req, res) => {
  const product = await Product.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!product) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm");
  }
  res.json({
    success: true,
    message: "Cập nhật sản phẩm thành công",
    data: product,
  });
};

export const deleteProduct = async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Xóa sản phẩm thành công" });
};

// ═══════════════════════════════════════════════════════════════════════════
// HELPER: Map field từ lean() sang camelCase cho frontend
// Dùng khi gọi .lean() để giảm tải DB (bỏ qua toJSON transform của mongoose)
// ═══════════════════════════════════════════════════════════════════════════
function mapProductFields(p) {
  return {
    id: p._id,
    name: p.name,
    slug: p.slug,
    sku: p.sku,
    description: p.description,
    shortDescription: p.short_description,
    categoryId: p.category_id,
    brandId: p.brand_id,
    basePrice: p.base_price,
    salePrice: p.sale_price,
    images: p.images,
    tags: p.tags,
    variants: p.variants
      ? p.variants.map((v) => ({
          sku: v.sku,
          name: v.name,
          attributes: v.attributes,
          price: v.price,
          salePrice: v.sale_price,
          stock: v.stock,
          images: v.images,
        }))
      : [],
    attributes: p.attributes,
    rating: p.rating,
    reviewCount: p.review_count,
    soldCount: p.sold_count,
    isActive: p.is_active,
    isFeatured: p.is_featured,
    isNew: p.is_new_product,
    isBestSeller: p.is_best_seller,
    stock: p.stock,
    inStock: p.in_stock,
    createdAt: p.created_at,
    updatedAt: p.updated_at,
  };
}
