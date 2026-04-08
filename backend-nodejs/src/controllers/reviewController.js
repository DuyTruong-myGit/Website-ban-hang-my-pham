import Review from '../models/Review.js';
import Product from '../models/Product.js';

const formatReview = (r) => ({
  id: r._id,
  userName: r.user_id?.name || 'Khách',
  rating: r.rating,
  createdAt: r.createdAt,
  comment: r.comment,
  images: r.images || [],
  helpfulCount: r.helpful_count || 0,
  adminReply: r.reply ? { content: r.reply, repliedByName: "Admin" } : null
});

// @desc    Lấy đánh giá của một sản phẩm
// @route   GET /api/reviews/product/:productId
export const getProductReviews = async (req, res) => {
  const { productId } = req.params;
  
  // Dành cho user thường, chỉ xem các đánh giá không bị ẩn
  const filter = { product_id: productId, is_hidden: false };
  
  // Nếu là admin/staff có thể thay đổi filter tại đây, tạm thời dùng mặc định
  if (req.user && (req.user.role === 'admin' || req.user.role === 'staff')) {
    delete filter.is_hidden; // Staff/Admin thấy hết
  }

  const reviews = await Review.find(filter)
    .populate('user_id', 'name avatar_url')
    .sort('-createdAt');
    
  const formattedReviews = reviews.map(formatReview);
  
  const totalReviews = reviews.length;
  const avgRating = totalReviews > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviews).toFixed(1) : 0;
  const distribution = {};
  for(let i = 1; i <= 5; i++) {
     distribution[i] = reviews.filter(r => r.rating === i).length;
  }
    
  res.json({ 
    success: true, 
    data: { 
      reviews: formattedReviews, 
      stats: { avgRating: Number(avgRating), totalReviews, distribution } 
    } 
  });
};

// @desc    Tạo đánh giá mới cho sản phẩm
// @route   POST /api/reviews
export const createReview = async (req, res) => {
  const { rating, comment, images } = req.body;
  const product_id = req.body.product_id || req.body.productId;
  
  // Validate ID format
  if (!product_id || !product_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error('Mã sản phẩm không hợp lệ');
  }
  
  // Checking product
  const product = await Product.findById(product_id);
  if (!product) {
    res.status(404);
    throw new Error('Sản phẩm không tồn tại');
  }
  
  // Optional: Check if user has purchased this product (bỏ qua nếu không yêu cầu chặt)
  
  const review = await Review.create({
    product_id,
    user_id: req.user._id,
    rating,
    comment,
    images: images || []
  });
  
  // Cập nhật số lượng rating cho product ở đây (rating / review_count)
  const reviews = await Review.find({ product_id });
  const numReviews = reviews.length;
  const avgRating = reviews.reduce((acc, item) => item.rating + acc, 0) / numReviews;
  
  product.rating = avgRating;
  product.review_count = numReviews;
  await product.save();

  await review.populate('user_id', 'name avatar_url');

  res.status(201).json({ success: true, data: formatReview(review) });
};

// @desc    Đánh dấu hữu ích cho đánh giá
// @route   PUT /api/reviews/:id/helpful
export const markHelpful = async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) {
    res.status(404);
    throw new Error('Không tìm thấy đánh giá');
  }
  
  review.helpful_count += 1;
  await review.save();
  
  res.json({ success: true, data: review });
};

// @desc    Admin trả lời đánh giá
// @route   PUT /api/admin/reviews/:id/reply
export const replyReview = async (req, res) => {
  const { reply } = req.body;
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    res.status(404);
    throw new Error('Không tìm thấy đánh giá');
  }
  
  review.reply = reply;
  await review.save();
  
  res.json({ success: true, data: review });
};

// @desc    Admin ẩn/hiện đánh giá
// @route   PUT /api/admin/reviews/:id/toggle-hide
export const toggleHideReview = async (req, res) => {
  const review = await Review.findById(req.params.id);
  
  if (!review) {
    res.status(404);
    throw new Error('Không tìm thấy đánh giá');
  }
  
  review.is_hidden = !review.is_hidden;
  await review.save();
  
  res.json({ success: true, data: review, message: review.is_hidden ? 'Đã ẩn đánh giá' : 'Đã hiện đánh giá' });
};

// @desc    Lấy tất cả đánh giá (Admin/Staff)
// @route   GET /api/admin/reviews
export const getAllReviews = async (req, res) => {
  const reviews = await Review.find()
    .populate('user_id', 'name avatar_url')
    .sort('-createdAt');
    
  res.json({ success: true, data: reviews.map(formatReview) });
};
