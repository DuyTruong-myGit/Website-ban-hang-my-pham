package com.cosmetics.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.mongodb.core.index.CompoundIndex;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

import java.time.LocalDateTime;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "adminlogs")
@CompoundIndex(name = "user_created_idx", def = "{'user_id': 1, 'created_at': -1}")
public class AdminLog {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    private String action;

    @Builder.Default
    private String target = "";

    @Builder.Default
    private Map<String, Object> metadata = Map.of();

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;
}
