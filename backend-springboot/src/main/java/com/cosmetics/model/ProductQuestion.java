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
@Document(collection = "productquestions")
public class ProductQuestion {

    @Id
    private String id;

    @Indexed
    @Field("product_id")
    private String productId;

    @Field("user_id")
    private String userId;

    @Field("user_name")
    private String userName;

    private String question;

    private String answer;

    @Field("answered_by")
    private String answeredBy;

    @Field("answered_by_name")
    private String answeredByName;

    @Field("answered_at")
    private LocalDateTime answeredAt;

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;
}
