package com.cosmetics.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * Model giỏ hàng — TV3
 * Mỗi user có 1 document cart, chứa danh sách CartItem embedded.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "carts")
public class Cart {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("user_id")
    private String userId;

    @Builder.Default
    private List<CartItem> items = new ArrayList<>();

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;

    // ── Embedded document ────────────────────────────────────────────
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class CartItem {

        /** ID sản phẩm trong collection products */
        @Field("product_id")
        private String productId;

        /**
         * SKU của variant nếu sản phẩm có biến thể (size, màu...).
         * Để trống ("") nếu là sản phẩm đơn giản không có variant.
         */
        @Field("variant_sku")
        @Builder.Default
        private String variantSku = "";

        /** Tên sản phẩm — snapshot tại thời điểm thêm vào giỏ */
        private String name;

        /** Ảnh đại diện sản phẩm */
        @Field("image_url")
        private String imageUrl;

        /** Tên variant hiển thị, vd: "50ml - Đỏ" */
        @Field("variant_name")
        private String variantName;

        /** Giá tại thời điểm thêm vào giỏ (sale_price nếu đang sale, không thì base_price) */
        private Double price;

        /** Số lượng (>= 1) */
        @Builder.Default
        private Integer quantity = 1;
    }
}
