package com.cosmetics.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PageContentRequest {

    @NotBlank(message = "Slug không được để trống.")
    private String slug;

    @NotBlank(message = "Tiêu đề không được để trống.")
    private String title;

    @NotBlank(message = "Nội dung không được để trống.")
    private String content;

    private Boolean isActive;
}
