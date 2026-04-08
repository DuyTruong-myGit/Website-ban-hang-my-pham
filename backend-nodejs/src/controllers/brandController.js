import Brand from "../models/Brand.js";

// GET /api/brands
export const getAllBrands = async (req, res) => {
  const brands = await Brand.find({});
  res.json({ success: true, data: brands });
};

// GET /api/brands/:slug
export const getBrandBySlug = async (req, res) => {
  const brand = await Brand.findOne({ slug: req.params.slug });
  if (!brand) {
    res.status(400);
    throw new Error("Không tìm thấy thương hiệu với slug: " + req.params.slug);
  }
  res.json({ success: true, data: brand });
};

// POST /api/brands
export const createBrand = async (req, res) => {
  const brand = await Brand.create(req.body);
  res
    .status(201)
    .json({
      success: true,
      message: "Thêm thương hiệu thành công.",
      data: brand,
    });
};

// PUT /api/brands/:id
export const updateBrand = async (req, res) => {
  const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!brand) {
    res.status(400);
    throw new Error("Không tìm thấy thương hiệu");
  }
  res.json({
    success: true,
    message: "Cập nhật thương hiệu thành công.",
    data: brand,
  });
};

// DELETE /api/brands/:id
export const deleteBrand = async (req, res) => {
  await Brand.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Xóa thương hiệu thành công." });
};
