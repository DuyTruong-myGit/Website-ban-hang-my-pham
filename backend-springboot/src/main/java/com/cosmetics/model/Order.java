package com.cosmetics.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Model đơn hàng — TV3
 *
 * Status flow:
 *   pending → confirmed → shipping → delivered
 *           ↘ cancelled  (chỉ từ pending hoặc confirmed)
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "orders")
public class Order {

    @Id
    private String id;

    /** Mã đơn hàng hiển thị cho khách, ví dụ: ORD-20260404-001 */
    @Indexed(unique = true)
    @Field("order_code")
    private String orderCode;

    @Indexed
    @Field("user_id")
    private String userId;

    @Builder.Default
    private List<OrderItem> items = new ArrayList<>();

    @Field("shipping_address")
    private ShippingAddress shippingAddress;

    /** Tổng tiền hàng trước phí ship */
    private Double subtotal;

    /** Phí vận chuyển */
    @Field("shipping_fee")
    @Builder.Default
    private Double shippingFee = 30000.0;

    /** Tổng thanh toán = subtotal + shippingFee - discount */
    private Double total;

    /** Số tiền giảm giá (từ coupon, nếu có) */
    @Builder.Default
    private Double discount = 0.0;

    /** Mã coupon đã dùng (nếu có) */
    @Field("coupon_code")
    private String couponCode;

    /**
     * Trạng thái đơn hàng.
     * pending | confirmed | shipping | delivered | cancelled
     */
    @Builder.Default
    private String status = "pending";

    /** Phương thức thanh toán: cod | bank_transfer | momo */
    @Field("payment_method")
    @Builder.Default
    private String paymentMethod = "cod";

    /** Ghi chú của khách */
    private String note;

    /** Mã vận đơn (do staff điền) */
    @Field("tracking_code")
    private String trackingCode;

    /** Lịch sử thay đổi trạng thái */
    @Builder.Default
    @Field("status_history")
    private List<StatusHistory> statusHistory = new ArrayList<>();

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    // ── Embedded: OrderItem ───────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class OrderItem {
        @Field("product_id")
        private String productId;

        @Field("variant_sku")
        @Builder.Default
        private String variantSku = "";

        /** Snapshot tên sản phẩm tại thời điểm đặt hàng */
        private String name;

        @Field("variant_name")
        private String variantName;

        @Field("image_url")
        private String imageUrl;

        /** Giá tại thời điểm đặt hàng */
        private Double price;

        private Integer quantity;

        /** Thành tiền = price * quantity */
        private Double lineTotal;
    }

    // ── Embedded: ShippingAddress ─────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class ShippingAddress {
        @Field("full_name")
        private String fullName;

        private String phone;
        private String province;
        private String district;
        private String ward;
        private String street;
    }

    // ── Embedded: StatusHistory ───────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class StatusHistory {
        private String status;
        private String note;

        @Field("changed_by")
        private String changedBy;  // userId của người thay đổi

        @Field("changed_at")
        private LocalDateTime changedAt;
    }
}
