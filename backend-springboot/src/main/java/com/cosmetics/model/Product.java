package com.cosmetics.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "products")
public class Product {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String slug;

    @Indexed(sparse = true)
    private String sku;

    private String description;

    @Field("short_description")
    private String shortDescription;

    @Field("category_id")
    private String categoryId;

    @Field("brand_id")
    private String brandId;

    @Field("base_price")
    private Double basePrice;

    @Field("sale_price")
    @Builder.Default
    private Double salePrice = 0.0;

    private List<String> images;

    private List<Variant> variants;

    private List<Attribute> attributes;

    private List<String> tags;

    @Field("avg_rating")
    @Builder.Default
    private Double avgRating = 0.0;

    @Field("review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Field("sold_count")
    @Builder.Default
    private Integer soldCount = 0;

    @Field("is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Field("is_featured")
    @Builder.Default
    private Boolean isFeatured = false;

    @Field("is_new")
    @Builder.Default
    private Boolean isNew = false;

    @Field("is_best_seller")
    @Builder.Default
    private Boolean isBestSeller = false;

    @Field("in_stock")
    @Builder.Default
    private Boolean inStock = true;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    // --- Embedded Classes ---
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Variant {
        private String sku;
        private String name;
        private Map<String, String> attributes; // vd: {"size": "50ml", "color": "red"}
        private Double price;
        @Field("sale_price")
        private Double salePrice;
        private List<String> images;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class Attribute {
        private String key;   // vd: "Thành phần", "Cách dùng"
        private String value; // vd: "Water, Glycerin...", "Thoa đều lên mặt..."
    }
}