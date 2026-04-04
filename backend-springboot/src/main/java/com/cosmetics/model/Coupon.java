package com.cosmetics.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

/**
 * Model mã giảm giá — TV3
 *
 * discountType:
 *   "percent" → giảm theo %, có thể có maxDiscountAmount
 *   "fixed"   → giảm số tiền cố định
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "coupons")
public class Coupon {

    @Id
    private String id;

    /** Mã coupon (viết hoa, unique) — VD: SUMMER20 */
    @Indexed(unique = true)
    private String code;

    /** Mô tả ngắn hiển thị cho khách */
    private String description;

    /**
     * Loại giảm giá: "percent" | "fixed"
     */
    @Field("discount_type")
    @Builder.Default
    private String discountType = "percent";

    /**
     * Giá trị giảm:
     *   - Nếu percent: 0-100 (%)
     *   - Nếu fixed: số tiền VND
     */
    private Double value;

    /** Giá trị đơn hàng tối thiểu để áp dụng (0 = không giới hạn) */
    @Field("min_order_amount")
    @Builder.Default
    private Double minOrderAmount = 0.0;

    /** Giảm tối đa (chỉ áp dụng cho percent, null = không giới hạn) */
    @Field("max_discount_amount")
    private Double maxDiscountAmount;

    /** Số lần sử dụng tối đa (null = không giới hạn) */
    @Field("usage_limit")
    private Integer usageLimit;

    /** Số lần đã sử dụng */
    @Field("used_count")
    @Builder.Default
    private Integer usedCount = 0;

    /** Ngày hết hạn (null = không hết hạn) */
    @Field("expires_at")
    private LocalDateTime expiresAt;

    /** Kích hoạt / vô hiệu hóa */
    @Field("is_active")
    @Builder.Default
    private Boolean isActive = true;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}
