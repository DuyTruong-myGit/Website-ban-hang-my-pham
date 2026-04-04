package com.cosmetics.service;

import com.cosmetics.dto.request.CouponRequest;
import com.cosmetics.dto.request.ValidateCouponRequest;
import com.cosmetics.exception.AppException;
import com.cosmetics.exception.ErrorCode;
import com.cosmetics.model.Coupon;
import com.cosmetics.repository.CouponRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Service xử lý coupon — TV3
 *
 * Luồng:
 *  1. User nhập mã → validateCoupon() → trả về discount amount
 *  2. Khi tạo đơn (OrderService) → applyCoupon() để tăng usedCount
 *  3. Admin CRUD coupon qua các hàm create/update/delete
 */
@Service
public class CouponService {

    @Autowired
    private CouponRepository couponRepository;

    // ─────────────────────────────────────────────────────────────
    // USER: Validate coupon
    // ─────────────────────────────────────────────────────────────

    /**
     * Kiểm tra và tính toán discount từ coupon code.
     *
     * @param request chứa code + orderAmount
     * @return Map chứa: coupon, discountAmount, finalAmount
     */
    public Map<String, Object> validateCoupon(ValidateCouponRequest request) {
        String code = request.getCode().trim().toUpperCase();
        double orderAmount = request.getOrderAmount();

        Coupon coupon = couponRepository.findByCode(code)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        // Kiểm tra trạng thái hoạt động
        if (!Boolean.TRUE.equals(coupon.getIsActive())) {
            throw new AppException(ErrorCode.COUPON_INACTIVE);
        }

        // Kiểm tra hết hạn
        if (coupon.getExpiresAt() != null && coupon.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new AppException(ErrorCode.COUPON_EXPIRED);
        }

        // Kiểm tra giới hạn sử dụng
        if (coupon.getUsageLimit() != null && coupon.getUsedCount() >= coupon.getUsageLimit()) {
            throw new AppException(ErrorCode.COUPON_USAGE_LIMIT);
        }

        // Kiểm tra đơn tối thiểu
        if (orderAmount < coupon.getMinOrderAmount()) {
            throw new AppException(ErrorCode.COUPON_MIN_ORDER);
        }

        // Tính discount
        double discountAmount = calculateDiscount(coupon, orderAmount);

        Map<String, Object> result = new HashMap<>();
        result.put("coupon", coupon);
        result.put("discountAmount", discountAmount);
        result.put("finalAmount", Math.max(0, orderAmount - discountAmount));
        return result;
    }

    /**
     * Tính số tiền giảm thực tế dựa trên loại coupon.
     */
    public double calculateDiscount(Coupon coupon, double orderAmount) {
        if ("percent".equals(coupon.getDiscountType())) {
            double discount = orderAmount * (coupon.getValue() / 100.0);
            if (coupon.getMaxDiscountAmount() != null) {
                discount = Math.min(discount, coupon.getMaxDiscountAmount());
            }
            return discount;
        } else {
            // fixed
            return Math.min(coupon.getValue(), orderAmount);
        }
    }

    // ─────────────────────────────────────────────────────────────
    // USER: Lấy coupon khả dụng (public)
    // ─────────────────────────────────────────────────────────────

    /** Lấy danh sách coupon còn hiệu lực để hiển thị cho user */
    public List<Coupon> getAvailableCoupons() {
        return couponRepository.findByIsActiveTrueOrderByCreatedAtDesc()
                .stream()
                .filter(c -> {
                    if (!Boolean.TRUE.equals(c.getIsActive())) return false;
                    if (c.getExpiresAt() != null && c.getExpiresAt().isBefore(LocalDateTime.now())) return false;
                    if (c.getUsageLimit() != null && c.getUsedCount() >= c.getUsageLimit()) return false;
                    return true;
                })
                .toList();
    }

    // ─────────────────────────────────────────────────────────────
    // INTERNAL: Apply coupon khi tạo đơn hàng
    // ─────────────────────────────────────────────────────────────

    /**
     * Tăng usedCount của coupon. Gọi sau khi tạo đơn thành công.
     * Nếu coupon không tồn tại thì bỏ qua (không throw).
     */
    public void applyCoupon(String code) {
        if (code == null || code.isBlank()) return;
        couponRepository.findByCode(code.trim().toUpperCase()).ifPresent(coupon -> {
            coupon.setUsedCount(coupon.getUsedCount() + 1);
            couponRepository.save(coupon);
        });
    }

    // ─────────────────────────────────────────────────────────────
    // ADMIN: CRUD
    // ─────────────────────────────────────────────────────────────

    /** Lấy tất cả coupon (bao gồm cả inactive) */
    public List<Coupon> getAllCoupons() {
        return couponRepository.findAll();
    }

    /** Tạo mã giảm giá mới */
    public Coupon createCoupon(CouponRequest request) {
        String code = request.getCode().trim().toUpperCase();
        if (couponRepository.findByCode(code).isPresent()) {
            throw new AppException(ErrorCode.COUPON_ALREADY_EXISTS);
        }

        Coupon coupon = Coupon.builder()
                .code(code)
                .description(request.getDescription())
                .discountType(request.getDiscountType() != null ? request.getDiscountType() : "percent")
                .value(request.getValue())
                .minOrderAmount(request.getMinOrderAmount() != null ? request.getMinOrderAmount() : 0.0)
                .maxDiscountAmount(request.getMaxDiscountAmount())
                .usageLimit(request.getUsageLimit())
                .usedCount(0)
                .expiresAt(request.getExpiresAt())
                .isActive(request.getIsActive() != null ? request.getIsActive() : true)
                .build();

        return couponRepository.save(coupon);
    }

    /** Cập nhật coupon (không thay đổi usedCount) */
    public Coupon updateCoupon(String id, CouponRequest request) {
        Coupon coupon = couponRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.COUPON_NOT_FOUND));

        if (request.getDescription() != null)     coupon.setDescription(request.getDescription());
        if (request.getDiscountType() != null)    coupon.setDiscountType(request.getDiscountType());
        if (request.getValue() != null)           coupon.setValue(request.getValue());
        if (request.getMinOrderAmount() != null)  coupon.setMinOrderAmount(request.getMinOrderAmount());
        if (request.getMaxDiscountAmount() != null) coupon.setMaxDiscountAmount(request.getMaxDiscountAmount());
        if (request.getUsageLimit() != null)      coupon.setUsageLimit(request.getUsageLimit());
        if (request.getExpiresAt() != null)       coupon.setExpiresAt(request.getExpiresAt());
        if (request.getIsActive() != null)        coupon.setIsActive(request.getIsActive());

        return couponRepository.save(coupon);
    }

    /** Xóa coupon */
    public void deleteCoupon(String id) {
        if (!couponRepository.existsById(id)) {
            throw new AppException(ErrorCode.COUPON_NOT_FOUND);
        }
        couponRepository.deleteById(id);
    }
}
