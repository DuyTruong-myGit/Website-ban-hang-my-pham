package com.cosmetics.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UserStatusRequest {
    @NotNull(message = "Trạng thái không được để trống")
    private Boolean isActive;
}
