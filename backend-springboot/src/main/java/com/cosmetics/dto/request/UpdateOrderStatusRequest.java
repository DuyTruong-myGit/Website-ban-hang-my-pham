package com.cosmetics.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/**
 * DTO cập nhật trạng thái đơn hàng — TV3 (dùng cho Admin/Staff)
 */
@Data
public class UpdateOrderStatusRequest {

    /** Trạng thái mới: confirmed | shipping | delivered | cancelled */
    @NotBlank(message = "Trạng thái không được để trống")
    private String status;

    /** Ghi chú thêm khi cập nhật trạng thái (optional) */
    private String note;

    /** Mã vận đơn (optional, điền khi chuyển sang shipping) */
    private String trackingCode;
}
