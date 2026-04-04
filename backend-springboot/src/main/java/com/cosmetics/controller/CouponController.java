package com.cosmetics.controller;

import com.cosmetics.dto.request.CouponRequest;
import com.cosmetics.dto.request.ValidateCouponRequest;
import com.cosmetics.dto.response.ApiResponse;
import com.cosmetics.model.Coupon;
import com.cosmetics.service.CouponService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller quản lý mã giảm giá — TV3
 *
 * Public (không cần JWT):
 *   POST /api/coupons/validate      → Kiểm tra mã giảm giá và tính discount
 *   GET  /api/coupons/available     → Danh sách coupon khả dụng
 *
 * Admin (cần JWT):
 *   GET    /api/admin/coupons       → Tất cả coupon (kể cả inactive)
 *   POST   /api/admin/coupons       → Tạo mã giảm giá mới
 *   PUT    /api/admin/coupons/:id   → Cập nhật
 *   DELETE /api/admin/coupons/:id   → Xóa
 */
@RestController
public class CouponController {

    @Autowired
    private CouponService couponService;

    // ── PUBLIC ──────────────────────────────────────────────────────────────

    /**
     * Validate mã giảm giá và trả về discount amount.
     * Body: { code, orderAmount }
     */
    @PostMapping("/api/coupons/validate")
    public ApiResponse<Map<String, Object>> validateCoupon(
            @Valid @RequestBody ValidateCouponRequest request
    ) {
        Map<String, Object> result = couponService.validateCoupon(request);
        return ApiResponse.success(result, "Mã giảm giá hợp lệ.");
    }

    /**
     * Lấy danh sách coupon đang hoạt động (hiển thị cho user chọn).
     */
    @GetMapping("/api/coupons/available")
    public ApiResponse<List<Coupon>> getAvailableCoupons() {
        return ApiResponse.success(couponService.getAvailableCoupons());
    }

    // ── ADMIN ────────────────────────────────────────────────────────────────

    /** Lấy tất cả coupon */
    @GetMapping("/api/admin/coupons")
    public ApiResponse<List<Coupon>> getAllCoupons() {
        return ApiResponse.success(couponService.getAllCoupons());
    }

    /** Tạo mã giảm giá mới */
    @PostMapping("/api/admin/coupons")
    public ApiResponse<Coupon> createCoupon(@RequestBody CouponRequest request) {
        Coupon coupon = couponService.createCoupon(request);
        return ApiResponse.success(coupon, "Tạo mã giảm giá thành công.");
    }

    /** Cập nhật mã giảm giá */
    @PutMapping("/api/admin/coupons/{id}")
    public ApiResponse<Coupon> updateCoupon(
            @PathVariable String id,
            @RequestBody CouponRequest request
    ) {
        Coupon coupon = couponService.updateCoupon(id, request);
        return ApiResponse.success(coupon, "Cập nhật mã giảm giá thành công.");
    }

    /** Xóa mã giảm giá */
    @DeleteMapping("/api/admin/coupons/{id}")
    public ApiResponse<Void> deleteCoupon(@PathVariable String id) {
        couponService.deleteCoupon(id);
        return ApiResponse.success(null, "Đã xóa mã giảm giá.");
    }
}
