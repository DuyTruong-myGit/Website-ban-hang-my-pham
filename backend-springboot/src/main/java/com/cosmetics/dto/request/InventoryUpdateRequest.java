package com.cosmetics.dto.request;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryUpdateRequest {

    @NotNull(message = "Số lượng không được để trống.")
    @Min(value = 0, message = "Số lượng phải lớn hơn hoặc bằng 0.")
    private Integer quantity;

    @Min(value = 0, message = "Số lượng đã đặt phải lớn hơn hoặc bằng 0.")
    private Integer reserved;

    private String warehouse;

    @Min(value = 0, message = "Ngưỡng hết hàng phải lớn hơn hoặc bằng 0.")
    private Integer lowStockThreshold;
}
