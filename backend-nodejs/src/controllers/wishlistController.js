import Wishlist from '../models/Wishlist.js';
import Product from '../models/Product.js';

// @desc    Lấy danh sách yêu thích
// @route   GET /api/wishlist
export const getWishlist = async (req, res) => {
  let wishlist = await Wishlist.findOne({ user_id: req.user._id }).populate('products');
  
  if (!wishlist) {
    wishlist = await Wishlist.create({ user_id: req.user._id, products: [] });
  }

  // Map lại mảng products để frontend hiển thị đúng (camelCase)
  const mappedProducts = wishlist.products.filter(p => p !== null).map(p => ({
      id: p._id,
      name: p.name,
      slug: p.slug,
      shortDescription: p.short_description,
      basePrice: p.base_price,
      salePrice: p.sale_price,
      images: p.images,
      rating: p.rating,
      reviewCount: p.review_count,
      inStock: p.in_stock,
      imageUrl: p.images && p.images.length > 0 ? p.images[0] : ''
  }));

  res.json({ success: true, data: mappedProducts });
};

// @desc    Thêm sản phẩm vào danh sách yêu thích
// @route   POST /api/wishlist/:productId
export const addToWishlist = async (req, res) => {
  const { productId } = req.params;
  
  // Kiểm tra sản phẩm có tồn tại
  const product = await Product.findById(productId);
  if (!product) {
      res.status(404);
      throw new Error('Sản phẩm không tồn tại');
  }

  let wishlist = await Wishlist.findOne({ user_id: req.user._id });
  
  if (!wishlist) {
    wishlist = await Wishlist.create({ user_id: req.user._id, products: [productId] });
  } else {
    // Nếu chưa có thì thêm vào
    if (!wishlist.products.includes(productId)) {
        wishlist.products.push(productId);
        await wishlist.save();
    }
  }

  res.json({ success: true, message: 'Đã thêm vào yêu thích' });
};

// @desc    Xóa sản phẩm khỏi danh sách yêu thích
// @route   DELETE /api/wishlist/:productId
export const removeFromWishlist = async (req, res) => {
  const { productId } = req.params;
  let wishlist = await Wishlist.findOne({ user_id: req.user._id });
  
  if (wishlist) {
      wishlist.products = wishlist.products.filter(id => id.toString() !== productId);
      await wishlist.save();
  }
  
  res.json({ success: true, message: 'Đã bỏ yêu thích' });
};

// @desc    Kiểm tra xem sản phẩm có nằm trong danh sách yêu thích chưa
// @route   GET /api/wishlist/check/:productId
export const checkWishlist = async (req, res) => {
  const { productId } = req.params;
  const wishlist = await Wishlist.findOne({ user_id: req.user._id });
  
  const inWishlist = wishlist ? wishlist.products.some(id => id.toString() === productId) : false;
  
  res.json({ success: true, data: { inWishlist } });
};
