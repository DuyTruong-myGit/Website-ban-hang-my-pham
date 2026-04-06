package com.cosmetics.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class QuestionRequest {

    @NotBlank(message = "Mã sản phẩm không được để trống")
    private String productId;

    @NotBlank(message = "Câu hỏi không được để trống")
    private String question;
}
