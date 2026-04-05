package com.cosmetics.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "reviews")
public class Review {

    @Id
    private String id;

    @Indexed
    @Field("product_id")
    private String productId;

    @Indexed
    @Field("user_id")
    private String userId;

    @Field("user_name")
    private String userName;

    @Field("order_id")
    private String orderId;

    private Integer rating; // 1-5

    private String comment;

    private List<String> images; // URL ảnh đính kèm

    @Field("skin_type")
    private String skinType; // da dầu, da khô, da hỗn hợp...

    @Field("helpful_count")
    @Builder.Default
    private Integer helpfulCount = 0;

    @Field("is_hidden")
    @Builder.Default
    private Boolean isHidden = false;

    @Field("admin_reply")
    private AdminReply adminReply;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AdminReply {
        private String content;

        @Field("replied_by")
        private String repliedBy;

        @Field("replied_by_name")
        private String repliedByName;

        @Field("replied_at")
        private LocalDateTime repliedAt;
    }
}
