import Product from "../models/Product.js";

// GET /api/products (Lọc & Phân trang)
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

  if (categoryId) filter.category_id = categoryId;
  if (brandId) filter.brand_id = brandId;
  if (search) filter.name = { $regex: search, $options: "i" }; // Tìm kiếm không phân biệt hoa thường
  if (inStock === "true") filter.in_stock = true;
  if (minRating) filter.rating = { $gte: Number(minRating) };

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
  const skip = (Number(page) - 1) * Number(limit);
  const total = await Product.countDocuments(filter);
  const products = await Product.find(filter)
    .sort(sortOption)
    .skip(skip)
    .limit(Number(limit));

  res.json({
    success: true,
    data: products,
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: total,
      totalPages: Math.ceil(total / Number(limit)),
    },
  });
};

// GET /api/products/:slug
export const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    is_active: true,
  });
  if (!product) {
    res.status(404);
    throw new Error("Không tìm thấy sản phẩm");
  }
  res.json({ success: true, data: product });
};

// --- CÁC API CHO TRANG CHỦ (HOME.JSX) ---

export const getFeaturedProducts = async (req, res) => {
  const products = await Product.find({
    is_active: true,
    is_featured: true,
  }).limit(12);
  res.json({ success: true, data: products });
};

export const getBestSellers = async (req, res) => {
  const products = await Product.find({
    is_active: true,
    is_best_seller: true,
  }).limit(12);
  res.json({ success: true, data: products });
};

export const getNewArrivals = async (req, res) => {
  const products = await Product.find({ is_active: true, is_new_product: true })
    .sort({ created_at: -1 })
    .limit(12);
  res.json({ success: true, data: products });
};

export const getFlashSale = async (req, res) => {
  const products = await Product.find({
    is_active: true,
    sale_price: { $gt: 0 },
  }).limit(12);
  res.json({ success: true, data: products });
};

// --- CÁC API ADMIN (CRUD) ---

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
