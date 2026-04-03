package com.cosmetics.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "categories")
public class Category {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String slug;

    private String description;

    @Field("image_url")
    private String imageUrl;

    @Field("parent_id")
    private String parentId; // ID của category cha, null nếu là category gốc

    @Field("sort_order")
    @Builder.Default
    private Integer sortOrder = 0;

    @Field("is_active")
    @Builder.Default
    private Boolean isActive = true;
}