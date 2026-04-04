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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "chatrooms")
public class ChatRoom {

    @Id
    private String id;

    @Indexed
    @Field("customer_id")
    private String customerId;

    @Field("customer_name")
    private String customerName;

    @Field("staff_id")
    private String staffId;

    @Field("staff_name")
    private String staffName;

    private String subject; // Chủ đề: "Tư vấn da", "Hỏi về sản phẩm", ...

    @Builder.Default
    private String status = "waiting"; // waiting, active, closed

    @Field("last_message")
    private String lastMessage;

    @Field("last_message_at")
    private LocalDateTime lastMessageAt;

    @Field("unread_customer")
    @Builder.Default
    private Integer unreadCustomer = 0;

    @Field("unread_staff")
    @Builder.Default
    private Integer unreadStaff = 0;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;
}
