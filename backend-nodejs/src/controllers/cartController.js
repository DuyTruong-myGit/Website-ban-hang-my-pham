import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * CartController — TV3
 *
 * Yêu cầu đăng nhập (sử dụng Token) cho tất cả các API, middleware sẽ map user vào req.user
 *
 * GET    /api/cart                        → Lấy giỏ hàng của user hiện tại
 * POST   /api/cart/items                  → Thêm item vào giỏ (body: productId, variantSku, name, price, ...)
 * PUT    /api/cart/items/:productId       → Cập nhật số lượng (body: quantity)
 * DELETE /api/cart/items/:productId       → Xóa mặt hàng khỏi giỏ
 * DELETE /api/cart                        → Xóa toàn bộ giỏ (sau khi Checkout)
 */

/**
 * GET /api/cart
 * Lấy danh sách sản phẩm trong giỏ của user. Tự động tạo giỏ nếu chưa có.
 */
export const getCart = async (req, res) => {
  let cart = await Cart.findOne({ user_id: req.user._id });

  if (!cart) {
    cart = await Cart.create({
      user_id: req.user._id,
      items: [],
    });
  }

  res.json({ success: true, data: cart });
};

export const addItemToCart = async (req, res) => {
  const { productId, variantSku, quantity = 1 } = req.body;

  if (!productId) {
    res.status(400);
    throw new Error('Thiếu thông tin productId bắt buộc.');
  }

  // Lấy thông tin sản phẩm từ DB
  const product = await Product.findById(productId);
  if (!product || !product.is_active) {
    res.status(404);
    throw new Error('Sản phẩm không tồn tại hoặc đã ngừng kinh doanh.');
  }

  let finalPrice = product.sale_price > 0 ? product.sale_price : product.base_price;
  let finalName = product.name;
  let finalImageUrl = product.images && product.images.length > 0 ? product.images[0] : '';
  let finalVariantName = '';
  const skuToCheck = variantSku || '';

  // Xử lý variant nếu có
  if (skuToCheck && product.variants && product.variants.length > 0) {
    const variant = product.variants.find((v) => v.sku === skuToCheck);
    if (variant) {
      finalPrice = variant.sale_price > 0 ? variant.sale_price : variant.price;
      finalImageUrl = variant.image_url || finalImageUrl;
      finalVariantName = variant.name || '';
      // Kiểm tra stock variant
      if (variant.stock < quantity) {
        res.status(400);
        throw new Error('Sản phẩm đã hết hàng hoặc không đủ số lượng.');
      }
    } else {
      res.status(404);
      throw new Error('Phân loại sản phẩm không hợp lệ.');
    }
  } else {
    // Kiểm tra stock chung
    if (product.stock < quantity && !product.in_stock) {
      res.status(400);
      throw new Error('Sản phẩm đã hết hàng hoặc không đủ số lượng.');
    }
  }

  let cart = await Cart.findOne({ user_id: req.user._id });
  if (!cart) {
    cart = await Cart.create({ user_id: req.user._id, items: [] });
  }

  // Tìm index
  const itemIndex = cart.items.findIndex(
    (item) => item.product_id.toString() === productId && item.variant_sku === skuToCheck
  );

  if (itemIndex > -1) {
    // Nếu sản phẩm đã tồn tại thì cộng dồn số lượng
    cart.items[itemIndex].quantity += Number(quantity);
    // Cập nhật lại giá theo giá mới nhất trong DB
    cart.items[itemIndex].price = finalPrice;
    cart.items[itemIndex].name = finalName;
    cart.items[itemIndex].image_url = finalImageUrl;
  } else {
    // Thêm mới vào giỏ
    cart.items.push({
      product_id: productId,
      variant_sku: skuToCheck,
      name: finalName,
      image_url: finalImageUrl,
      variant_name: finalVariantName,
      price: finalPrice,
      quantity: Number(quantity),
    });
  }

  await cart.save();
  res.json({ success: true, data: cart, message: 'Đã thêm sản phẩm vào giỏ.' });
};

/**
 * PUT /api/cart/items/:productId
 * Cập nhật lại số lượng sản phẩm
 * Nhận query param ?variantSku=... nếu có variant.
 */
export const updateCartItem = async (req, res) => {
  const { productId } = req.params;
  const { quantity } = req.body;
  const { variantSku = '' } = req.query;

  if (quantity == null || quantity < 1) {
    res.status(400);
    throw new Error('Số lượng không hợp lệ.');
  }

  const cart = await Cart.findOne({ user_id: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Không tìm thấy giỏ hàng.');
  }

  const itemIndex = cart.items.findIndex(
    (item) => item.product_id.toString() === productId && item.variant_sku === variantSku
  );

  if (itemIndex === -1) {
    res.status(404);
    throw new Error('Sản phẩm không có trong giỏ hàng.');
  }

  cart.items[itemIndex].quantity = Number(quantity);
  await cart.save();

  res.json({ success: true, data: cart, message: 'Đã cập nhật số lượng.' });
};

/**
 * DELETE /api/cart/items/:productId
 * Xóa 1 sản phẩm khỏi giỏ.
 * Có thể truyền ?variantSku=...
 */
export const removeCartItem = async (req, res) => {
  const { productId } = req.params;
  const { variantSku = '' } = req.query;

  const cart = await Cart.findOne({ user_id: req.user._id });
  if (!cart) {
    res.status(404);
    throw new Error('Không tìm thấy giỏ hàng.');
  }

  cart.items = cart.items.filter(
    (item) => !(item.product_id.toString() === productId && item.variant_sku === variantSku)
  );

  await cart.save();
  res.json({ success: true, data: cart, message: 'Đã xóa sản phẩm khỏi giỏ.' });
};

/**
 * DELETE /api/cart
 * Dọn sạch giỏ hàng (Gọi sau khi checkout thành công)
 */
export const clearCart = async (req, res) => {
  const cart = await Cart.findOne({ user_id: req.user._id });
  
  if (cart) {
    cart.items = [];
    await cart.save();
  }

  res.json({ success: true, message: 'Đã dọn sạch giỏ hàng.' });
};
