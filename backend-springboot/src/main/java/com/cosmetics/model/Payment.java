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
 * Model thanh toán — TV3
 *
 * Hiện tại chỉ hỗ trợ COD (thanh toán khi nhận hàng).
 * Mỗi đơn hàng có đúng 1 bản ghi Payment tương ứng.
 *
 * paymentStatus:
 *   "pending"  → Chờ thanh toán (COD: chờ giao hàng)
 *   "paid"     → Đã thanh toán (COD: giao hàng thành công)
 *   "refunded" → Đã hoàn tiền (đơn bị hủy sau khi đã trả)
 *   "failed"   → Thất bại
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "payments")
public class Payment {

    @Id
    private String id;

    /** ID đơn hàng tương ứng */
    @Indexed(unique = true)
    @Field("order_id")
    private String orderId;

    /** Mã đơn hàng (hiển thị) — vd: ORD-20260404-XXXX */
    @Field("order_code")
    private String orderCode;

    /**
     * Phương thức thanh toán:
     *   "cod" → Thanh toán khi nhận hàng
     */
    @Field("payment_method")
    @Builder.Default
    private String paymentMethod = "cod";

    /**
     * Trạng thái thanh toán:
     *   "pending" | "paid" | "refunded" | "failed"
     */
    @Field("payment_status")
    @Builder.Default
    private String paymentStatus = "pending";

    /** Tổng số tiền cần thanh toán */
    private Double amount;

    /** Ghi chú (vd: "Giao hàng thành công, đã thu tiền") */
    private String note;

    /** Thời điểm thanh toán thực tế (null nếu chưa thanh toán) */
    @Field("paid_at")
    private LocalDateTime paidAt;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}
