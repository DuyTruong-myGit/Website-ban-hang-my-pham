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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "notifications")
public class Notification {

    @Id
    private String id;

    @Indexed
    @Field("user_id")
    private String userId;

    private String type; // order_status, review_reply, chat, promotion

    private String title;

    private String message;

    private String link; // URL liên kết đến trang liên quan

    @Field("is_read")
    @Builder.Default
    private Boolean isRead = false;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}
