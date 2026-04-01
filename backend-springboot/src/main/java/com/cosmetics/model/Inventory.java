package com.cosmetics.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "inventories")
@CompoundIndex(name = "product_variant_idx", def = "{'product_id': 1, 'variant_sku': 1}", unique = true)
public class Inventory {

    @Id
    private String id;

    @Field("product_id")
    private String productId;

    @Field("variant_sku")
    @Builder.Default
    private String variantSku = "";

    @Indexed
    @Builder.Default
    private Integer quantity = 0;

    @Builder.Default
    private Integer reserved = 0;

    @Builder.Default
    private String warehouse = "main";

    @Field("low_stock_threshold")
    @Builder.Default
    private Integer lowStockThreshold = 5;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;
}
