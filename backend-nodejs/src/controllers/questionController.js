import ProductQuestion from '../models/ProductQuestion.js';
import Product from '../models/Product.js';

const formatQuestion = (q) => ({
  id: q._id,
  productId: q.product_id?._id || q.product_id,
  userName: q.user_id?.name || 'Khách',
  question: q.question,
  answer: q.answer,
  answeredByName: q.answer ? 'Nhân viên' : null,
  createdAt: q.createdAt,
  answeredAt: q.updatedAt
});

// @desc    Lấy các câu hỏi của một sản phẩm
// @route   GET /api/questions/product/:productId
export const getProductQuestions = async (req, res) => {
  const { productId } = req.params;
  
  const questions = await ProductQuestion.find({ product_id: productId })
    .populate('user_id', 'name avatar_url')
    .populate('answered_by', 'name')
    .sort('-createdAt');
    
  res.json({ success: true, data: questions.map(formatQuestion) });
};

// @desc    Người dùng đặt câu hỏi
// @route   POST /api/questions
export const askQuestion = async (req, res) => {
  const { question } = req.body;
  const product_id = req.body.product_id || req.body.productId;
  
  if (!product_id || !product_id.match(/^[0-9a-fA-F]{24}$/)) {
    res.status(400);
    throw new Error('Mã sản phẩm không hợp lệ');
  }
  
  const product = await Product.findById(product_id);
  if (!product) {
    res.status(404);
    throw new Error('Sản phẩm không tồn tại');
  }
  
  const newQuestion = await ProductQuestion.create({
    product_id,
    user_id: req.user._id,
    question
  });
  
  await newQuestion.populate('user_id', 'name avatar_url');
  
  res.status(201).json({ success: true, data: formatQuestion(newQuestion) });
};

// @desc    Nhân viên lấy câu hỏi chờ trả lời
// @route   GET /api/staff/questions/pending
export const getPendingQuestions = async (req, res) => {
  const pendingQuestions = await ProductQuestion.find({ answer: { $in: [null, ''] } })
    .populate('user_id', 'name avatar_url')
    .populate('product_id', 'name image_url')
    .sort('createdAt');
    
  res.json({ success: true, data: pendingQuestions.map(formatQuestion) });
};

// @desc    Nhân viên trả lời câu hỏi
// @route   PUT /api/staff/questions/:id/answer
export const answerQuestion = async (req, res) => {
  const { answer } = req.body;
  
  const question = await ProductQuestion.findById(req.params.id);
  if (!question) {
    res.status(404);
    throw new Error('Câu hỏi không tồn tại');
  }
  
  question.answer = answer;
  question.answered_by = req.user._id;
  await question.save();
  await question.populate('user_id', 'name avatar_url');
  
  res.json({ success: true, data: formatQuestion(question) });
};

// @desc    Nhân viên lấy tất cả câu hỏi
// @route   GET /api/staff/questions
export const getAllQuestions = async (req, res) => {
  const questions = await ProductQuestion.find()
    .populate('user_id', 'name avatar_url')
    .sort('-createdAt');
    
  res.json({ success: true, data: questions.map(formatQuestion) });
};
