package com.cosmetics.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "banners")
public class Banner {

    @Id
    private String id;

    private String title;

    @Field("image_url")
    private String imageUrl;

    @Field("link_url")
    private String linkUrl;

    @Builder.Default
    private String position = "hero"; // hero, popup, sidebar, category_top

    @Field("sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Field("is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Field("start_date")
    private LocalDateTime startDate;

    @Field("end_date")
    private LocalDateTime endDate;
}