import Banner from "../models/Banner.js";

// GET /api/banners?position=hero
export const getBanners = async (req, res) => {
  const { position } = req.query;
  let query = {};

  if (position) {
    query = { position: position, is_active: true };
    // Mongoose sort: 1 là ASC (tăng dần), -1 là DESC (giảm dần)
    const banners = await Banner.find(query).sort({ sort_order: 1 });
    return res.json({ success: true, data: banners });
  }

  const banners = await Banner.find({});
  res.json({ success: true, data: banners });
};

// POST /api/banners
export const createBanner = async (req, res) => {
  const banner = await Banner.create(req.body);
  res
    .status(201)
    .json({ success: true, message: "Thêm banner thành công.", data: banner });
};

// PUT /api/banners/:id
export const updateBanner = async (req, res) => {
  const banner = await Banner.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!banner) {
    res.status(400);
    throw new Error("Không tìm thấy Banner.");
  }
  res.json({
    success: true,
    message: "Cập nhật banner thành công.",
    data: banner,
  });
};

// DELETE /api/banners/:id
export const deleteBanner = async (req, res) => {
  await Banner.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: "Xóa banner thành công." });
};
