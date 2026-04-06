package com.cosmetics.dto.request;

import lombok.Data;

import java.time.LocalDateTime;

/**
 * DTO tạo / cập nhật mã giảm giá — TV3 [ADMIN]
 */
@Data
public class CouponRequest {

    /** Mã coupon — bắt buộc khi tạo mới */
    private String code;

    /** Mô tả */
    private String description;

    /** Loại giảm giá: "percent" | "fixed" */
    private String discountType = "percent";

    /** Giá trị giảm (% hoặc VND) */
    private Double value;

    /** Đơn hàng tối thiểu (0 = không giới hạn) */
    private Double minOrderAmount = 0.0;

    /** Giảm tối đa (chỉ dùng cho percent, null = không giới hạn) */
    private Double maxDiscountAmount;

    /** Giới hạn số lần dùng (null = không giới hạn) */
    private Integer usageLimit;

    /** Ngày hết hạn (null = không hết hạn) */
    private LocalDateTime expiresAt;

    /** Trạng thái kích hoạt */
    private Boolean isActive = true;
}
