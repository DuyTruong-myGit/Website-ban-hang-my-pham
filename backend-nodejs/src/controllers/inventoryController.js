import Product from '../models/Product.js';
import AdminLog from '../models/AdminLog.js';

// @desc    Lấy danh sách tồn kho (tất cả sản phẩm với thông tin stock)
// @route   GET /api/admin/inventory
export const getInventory = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 20;
  const skip = page * limit;
  const search = req.query.search || '';

  // Filter
  const filter = { is_active: true };
  if (search) {
    filter.name = { $regex: search, $options: 'i' };
  }

  const [products, total] = await Promise.all([
    Product.find(filter)
      .select('name slug sku stock in_stock images base_price sale_price sold_count variants')
      .sort({ stock: 1 }) // Sort theo stock tăng dần (hết hàng lên trước)
      .skip(skip)
      .limit(limit),
    Product.countDocuments(filter),
  ]);

  // Format response — map thành inventory items
  const inventoryItems = products.map((product) => ({
    _id: product._id,
    product_id: product._id,
    name: product.name,
    slug: product.slug,
    sku: product.sku || '',
    stock: product.stock,
    in_stock: product.in_stock,
    image: product.images && product.images.length > 0 ? product.images[0] : '',
    base_price: product.base_price,
    sale_price: product.sale_price,
    sold_count: product.sold_count,
    variants: product.variants || [],
    low_stock: product.stock <= 5,
  }));

  res.json({
    success: true,
    data: inventoryItems,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

// @desc    Cập nhật số lượng tồn kho của sản phẩm
// @route   PUT /api/admin/inventory/:id
export const updateInventory = async (req, res) => {
  const { stock } = req.body;

  if (stock === undefined || stock < 0) {
    res.status(400);
    throw new Error('Số lượng tồn kho không hợp lệ.');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Không tìm thấy sản phẩm.');
  }

  const oldStock = product.stock;
  product.stock = stock;
  product.in_stock = stock > 0;

  await product.save();

  // Ghi admin log
  await AdminLog.create({
    user_id: req.user._id,
    action: 'UPDATE_INVENTORY',
    target: `product:${product._id}`,
    metadata: {
      product_name: product.name,
      old_stock: oldStock,
      new_stock: stock,
    },
  });

  res.json({
    success: true,
    message: `Cập nhật tồn kho thành công. ${product.name}: ${oldStock} → ${stock}`,
    data: {
      _id: product._id,
      product_id: product._id,
      name: product.name,
      stock: product.stock,
      in_stock: product.in_stock,
    },
  });
};

// @desc    Lấy danh sách SP sắp hết hàng (stock <= threshold)
// @route   GET /api/admin/inventory/low-stock
export const getLowStock = async (req, res) => {
  const threshold = parseInt(req.query.threshold) || 5;

  const lowStockProducts = await Product.find({
    stock: { $lte: threshold },
    is_active: true,
  })
    .select('name slug sku stock in_stock images base_price sale_price')
    .sort({ stock: 1 })
    .limit(50);

  const items = lowStockProducts.map((product) => ({
    _id: product._id,
    product_id: product._id,
    name: product.name,
    slug: product.slug,
    sku: product.sku || '',
    stock: product.stock,
    in_stock: product.in_stock,
    image: product.images && product.images.length > 0 ? product.images[0] : '',
    base_price: product.base_price,
    sale_price: product.sale_price,
    low_stock_threshold: threshold,
  }));

  res.json({
    success: true,
    data: items,
  });
};
