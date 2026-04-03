package com.cosmetics.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO tạo đơn hàng mới — TV3
 * Items sẽ lấy từ Cart của user, không cần truyền lại.
 */
@Data
public class CreateOrderRequest {

    /** Họ tên người nhận */
    @NotBlank(message = "Họ tên người nhận không được để trống")
    private String fullName;

    /** Số điện thoại người nhận */
    @NotBlank(message = "Số điện thoại không được để trống")
    private String phone;

    /** Tỉnh/Thành phố */
    @NotBlank(message = "Tỉnh/Thành phố không được để trống")
    private String province;

    /** Quận/Huyện */
    @NotBlank(message = "Quận/Huyện không được để trống")
    private String district;

    /** Phường/Xã */
    @NotBlank(message = "Phường/Xã không được để trống")
    private String ward;

    /** Địa chỉ cụ thể (số nhà, tên đường) */
    @NotBlank(message = "Địa chỉ không được để trống")
    private String street;

    /** Phương thức thanh toán: cod (mặc định) */
    @NotBlank(message = "Phương thức thanh toán không được để trống")
    private String paymentMethod = "cod";

    /** Ghi chú cho đơn hàng (optional) */
    private String note;

    /** Mã giảm giá (optional, TV3 chức năng 3 — Coupon) */
    private String couponCode;
}
