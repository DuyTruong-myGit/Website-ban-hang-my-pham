package com.cosmetics.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

/**
 * DTO nhận request thêm/cập nhật item vào giỏ hàng — TV3
 */
@Data
public class CartRequest {

    /** ID sản phẩm (bắt buộc) */
    @NotBlank(message = "productId không được để trống")
    private String productId;

    /**
     * SKU của variant nếu sản phẩm có biến thể.
     * Để null hoặc "" nếu là sản phẩm không có variant.
     */
    private String variantSku;

    /** Số lượng muốn thêm/cập nhật (>= 1) */
    @NotNull(message = "quantity không được để trống")
    @Min(value = 1, message = "quantity phải >= 1")
    private Integer quantity;
}
