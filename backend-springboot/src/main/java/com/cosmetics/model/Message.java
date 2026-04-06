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
@Document(collection = "messages")
public class Message {

    @Id
    private String id;

    @Indexed
    @Field("room_id")
    private String roomId;

    @Field("sender_id")
    private String senderId;

    @Field("sender_name")
    private String senderName;

    @Field("sender_role")
    private String senderRole; // customer, staff, admin

    private String content;

    @Field("image_url")
    private String imageUrl;

    @Field("is_read")
    @Builder.Default
    private Boolean isRead = false;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}
