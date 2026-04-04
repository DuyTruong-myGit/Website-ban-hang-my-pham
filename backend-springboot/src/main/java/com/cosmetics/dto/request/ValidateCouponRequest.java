package com.cosmetics.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

/**
 * DTO validate coupon — TV3
 * User gửi kèm mã coupon và giá trị đơn hàng để kiểm tra và tính tiền giảm.
 */
@Data
public class ValidateCouponRequest {

    /** Mã coupon cần kiểm tra */
    @NotBlank(message = "Mã giảm giá không được để trống")
    private String code;

    /** Giá trị đơn hàng hiện tại (để tính discount và kiểm tra minOrderAmount) */
    @NotNull(message = "Giá trị đơn hàng không được để trống")
    @Positive(message = "Giá trị đơn hàng phải lớn hơn 0")
    private Double orderAmount;
}
