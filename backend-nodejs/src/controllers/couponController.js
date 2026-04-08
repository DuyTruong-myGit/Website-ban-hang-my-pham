import Coupon from '../models/Coupon.js';

/**
 * CouponController — TV3
 *
 * Public:
 *   POST /api/coupons/validate   → Kiểm tra mã giảm giá và tính discount
 *   GET  /api/coupons/available  → Danh sách coupon đang khả dụng
 *
 * Admin:
 *   GET    /api/admin/coupons       → Tất cả coupon
 *   POST   /api/admin/coupons       → Tạo mới
 *   PUT    /api/admin/coupons/:id   → Cập nhật
 *   DELETE /api/admin/coupons/:id   → Xóa
 */

// ── Helper: Tính discount ────────────────────────────────────────────────
const calculateDiscount = (coupon, orderAmount) => {
  if (coupon.discount_type === 'percent') {
    let discount = orderAmount * (coupon.value / 100);
    if (coupon.max_discount_amount != null) {
      discount = Math.min(discount, coupon.max_discount_amount);
    }
    return discount;
  }
  // fixed
  return Math.min(coupon.value, orderAmount);
};

// ── PUBLIC ──────────────────────────────────────────────────────────────

/**
 * POST /api/coupons/validate
 * Body: { code, orderAmount }
 * → Kiểm tra mã giảm giá: thời hạn, usage limit, min order
 * → Trả về: coupon info + discountAmount + finalAmount
 */
export const validateCoupon = async (req, res) => {
  const { code, orderAmount } = req.body;

  if (!code || orderAmount == null) {
    res.status(400);
    throw new Error('Vui lòng cung cấp mã giảm giá và tổng tiền hàng.');
  }

  const normalizedCode = code.trim().toUpperCase();
  const amount = Number(orderAmount);

  // 1. Tìm coupon
  const coupon = await Coupon.findOne({ code: normalizedCode });
  if (!coupon) {
    res.status(404);
    throw new Error('Mã giảm giá không tồn tại.');
  }

  // 2. Check trạng thái hoạt động
  if (!coupon.is_active) {
    res.status(400);
    throw new Error('Mã giảm giá đã bị vô hiệu hóa.');
  }

  // 3. Check hết hạn
  if (coupon.expires_at && new Date(coupon.expires_at) < new Date()) {
    res.status(400);
    throw new Error('Mã giảm giá đã hết hạn.');
  }

  // 4. Check giới hạn sử dụng
  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) {
    res.status(400);
    throw new Error('Mã giảm giá đã hết lượt sử dụng.');
  }

  // 5. Check đơn tối thiểu
  if (amount < coupon.min_order_amount) {
    res.status(400);
    throw new Error(
      `Đơn hàng tối thiểu ${coupon.min_order_amount.toLocaleString('vi-VN')}₫ để áp dụng mã này.`
    );
  }

  // 6. Tính discount
  const discountAmount = calculateDiscount(coupon, amount);
  const finalAmount = Math.max(0, amount - discountAmount);

  res.json({
    success: true,
    data: {
      coupon,
      discountAmount,
      finalAmount,
    },
    message: 'Mã giảm giá hợp lệ.',
  });
};

/**
 * GET /api/coupons/available
 * → Trả về danh sách coupon đang hoạt động, chưa hết hạn, còn lượt dùng
 */
export const getAvailableCoupons = async (req, res) => {
  const now = new Date();

  const coupons = await Coupon.find({ is_active: true })
    .sort({ created_at: -1 });

  // Lọc thêm ở application layer: hết hạn + hết lượt
  const available = coupons.filter((c) => {
    if (c.expires_at && new Date(c.expires_at) < now) return false;
    if (c.usage_limit != null && c.used_count >= c.usage_limit) return false;
    return true;
  });

  res.json({ success: true, data: available });
};

// ── ADMIN ───────────────────────────────────────────────────────────────

/** GET /api/admin/coupons — Tất cả coupon (kể cả inactive) */
export const adminGetAllCoupons = async (req, res) => {
  const coupons = await Coupon.find().sort({ created_at: -1 });
  res.json({ success: true, data: coupons });
};

/** POST /api/admin/coupons — Tạo mã giảm giá mới */
export const adminCreateCoupon = async (req, res) => {
  const {
    code, description, discountType, value,
    minOrderAmount, maxDiscountAmount,
    usageLimit, expiresAt, isActive,
  } = req.body;

  if (!code || value == null) {
    res.status(400);
    throw new Error('Vui lòng nhập mã và giá trị giảm giá.');
  }

  const normalizedCode = code.trim().toUpperCase();

  // Check trùng mã
  const existing = await Coupon.findOne({ code: normalizedCode });
  if (existing) {
    res.status(400);
    throw new Error('Mã giảm giá này đã tồn tại.');
  }

  const coupon = await Coupon.create({
    code: normalizedCode,
    description: description || '',
    discount_type: discountType || 'percent',
    value,
    min_order_amount: minOrderAmount || 0,
    max_discount_amount: maxDiscountAmount || null,
    usage_limit: usageLimit || null,
    used_count: 0,
    expires_at: expiresAt || null,
    is_active: isActive != null ? isActive : true,
  });

  res.status(201).json({
    success: true,
    data: coupon,
    message: 'Tạo mã giảm giá thành công.',
  });
};

/** PUT /api/admin/coupons/:id — Cập nhật coupon */
export const adminUpdateCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Không tìm thấy mã giảm giá.');
  }

  const {
    description, discountType, value,
    minOrderAmount, maxDiscountAmount,
    usageLimit, expiresAt, isActive,
  } = req.body;

  if (description != null) coupon.description = description;
  if (discountType != null) coupon.discount_type = discountType;
  if (value != null) coupon.value = value;
  if (minOrderAmount != null) coupon.min_order_amount = minOrderAmount;
  if (maxDiscountAmount !== undefined) coupon.max_discount_amount = maxDiscountAmount;
  if (usageLimit !== undefined) coupon.usage_limit = usageLimit;
  if (expiresAt !== undefined) coupon.expires_at = expiresAt;
  if (isActive != null) coupon.is_active = isActive;

  const updated = await coupon.save();
  res.json({
    success: true,
    data: updated,
    message: 'Cập nhật mã giảm giá thành công.',
  });
};

/** DELETE /api/admin/coupons/:id — Xóa coupon */
export const adminDeleteCoupon = async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);
  if (!coupon) {
    res.status(404);
    throw new Error('Không tìm thấy mã giảm giá.');
  }

  await Coupon.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Đã xóa mã giảm giá.' });
};

// ── INTERNAL: Apply coupon (gọi từ orderController) ─────────────────────
/**
 * Tăng usedCount khi đơn hàng tạo thành công.
 * Export để orderController gọi internal.
 */
export const applyCoupon = async (code) => {
  if (!code) return;
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (coupon) {
    coupon.used_count += 1;
    await coupon.save();
  }
};
