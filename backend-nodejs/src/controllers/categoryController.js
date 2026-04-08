import Category from "../models/Category.js";

// GET /api/categories (Dựng cây danh mục)
export const getCategoryTree = async (req, res) => {
  const categories = await Category.find({ is_active: true }).sort({
    sort_order: 1,
  });

  const categoryMap = {};
  const roots = [];

  // Khởi tạo Map
  categories.forEach((cat) => {
    // Gọi .toJSON() để trigger hàm transform đổi snake_case sang camelCase đã định nghĩa ở Model
    categoryMap[cat._id.toString()] = { ...cat.toJSON(), children: [] };
  });

  // Xây dựng cây
  categories.forEach((cat) => {
    const node = categoryMap[cat._id.toString()];
    if (!cat.parent_id) {
      roots.push(node); // Là danh mục gốc
    } else {
      const parent = categoryMap[cat.parent_id.toString()];
      if (parent) {
        parent.children.push(node);
      }
    }
  });

  res.json({ success: true, message: "Lấy danh mục thành công", data: roots });
};

// GET /api/categories/:slug
export const getCategoryBySlug = async (req, res) => {
  const category = await Category.findOne({ slug: req.params.slug });
  if (!category) {
    res.status(400);
    throw new Error("Không tìm thấy danh mục");
  }
  res.json({ success: true, data: category });
};

// POST /api/categories
export const createCategory = async (req, res) => {
  const category = await Category.create(req.body);
  res
    .status(201)
    .json({
      success: true,
      message: "Tạo danh mục thành công",
      data: category,
    });
};

// PUT /api/categories/:id
export const updateCategory = async (req, res) => {
  const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!category) {
    res.status(400);
    throw new Error("Không tìm thấy danh mục");
  }
  res.json({
    success: true,
    message: "Cập nhật danh mục thành công",
    data: category,
  });
};

// DELETE /api/categories/:id
export const deleteCategory = async (req, res) => {
  await Category.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Xóa danh mục thành công" });
};
