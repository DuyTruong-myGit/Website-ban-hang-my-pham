package com.cosmetics.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateChatRoomRequest {

    @NotBlank(message = "Vui lòng chọn chủ đề tư vấn.")
    private String subject;
}
