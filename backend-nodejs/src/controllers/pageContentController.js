import PageContent from '../models/PageContent.js';
import AdminLog from '../models/AdminLog.js';

// ======================== PUBLIC ========================

// @desc    Lấy trang nội dung theo slug (Public)
// @route   GET /api/pages/:slug
export const getPageBySlug = async (req, res) => {
  const page = await PageContent.findOne({ slug: req.params.slug });

  if (!page) {
    res.status(404);
    throw new Error('Không tìm thấy trang nội dung.');
  }

  res.json({
    success: true,
    data: page,
  });
};

// @desc    Lấy danh sách các trang công khai (Public - Only active)
// @route   GET /api/pages
export const getPublicPages = async (req, res) => {
  const pages = await PageContent.find({ is_active: true })
    .sort({ created_at: -1 });

  res.json({
    success: true,
    data: pages,
  });
};

// ======================== ADMIN ========================

// @desc    Lấy danh sách tất cả trang nội dung (Admin)
// @route   GET /api/admin/pages
export const getAllPages = async (req, res) => {
  const page = parseInt(req.query.page) || 0;
  const limit = parseInt(req.query.limit) || 20;
  const skip = page * limit;

  const [pages, total] = await Promise.all([
    PageContent.find({})
      .sort({ created_at: -1 })
      .skip(skip)
      .limit(limit),
    PageContent.countDocuments(),
  ]);

  res.json({
    success: true,
    data: pages,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
};

// @desc    Tạo trang nội dung mới (Admin)
// @route   POST /api/admin/pages
export const createPage = async (req, res) => {
  const { slug, title, content, is_active } = req.body;

  if (!slug || !title || !content) {
    res.status(400);
    throw new Error('Slug, tiêu đề và nội dung không được để trống.');
  }

  // Kiểm tra slug trùng
  const existingPage = await PageContent.findOne({ slug });
  if (existingPage) {
    res.status(400);
    throw new Error('Slug đã tồn tại.');
  }

  const newPage = await PageContent.create({
    slug,
    title,
    content,
    is_active: is_active !== undefined ? is_active : true,
  });

  // Ghi admin log
  await AdminLog.create({
    user_id: req.user._id,
    action: 'CREATE_PAGE',
    target: `page:${newPage._id}`,
    metadata: { slug, title },
  });

  res.status(201).json({
    success: true,
    message: 'Tạo trang nội dung thành công.',
    data: newPage,
  });
};

// @desc    Cập nhật trang nội dung (Admin)
// @route   PUT /api/admin/pages/:id
export const updatePage = async (req, res) => {
  const page = await PageContent.findById(req.params.id);

  if (!page) {
    res.status(404);
    throw new Error('Không tìm thấy trang nội dung.');
  }

  const { slug, title, content, is_active } = req.body;

  if (slug !== undefined) page.slug = slug;
  if (title !== undefined) page.title = title;
  if (content !== undefined) page.content = content;
  if (is_active !== undefined) page.is_active = is_active;

  const updated = await page.save();

  // Ghi admin log
  await AdminLog.create({
    user_id: req.user._id,
    action: 'UPDATE_PAGE',
    target: `page:${req.params.id}`,
    metadata: { title: updated.title },
  });

  res.json({
    success: true,
    message: 'Cập nhật trang nội dung thành công.',
    data: updated,
  });
};

// @desc    Xóa trang nội dung (Admin)
// @route   DELETE /api/admin/pages/:id
export const deletePage = async (req, res) => {
  const page = await PageContent.findById(req.params.id);

  if (!page) {
    res.status(404);
    throw new Error('Không tìm thấy trang nội dung.');
  }

  await page.deleteOne();

  // Ghi admin log
  await AdminLog.create({
    user_id: req.user._id,
    action: 'DELETE_PAGE',
    target: `page:${req.params.id}`,
    metadata: {},
  });

  res.json({
    success: true,
    message: 'Xóa trang nội dung thành công.',
    data: null,
  });
};
