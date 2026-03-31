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

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "skinprofiles")
public class SkinProfile {

    @Id
    private String id;

    @Indexed(unique = true)
    @Field("user_id")
    private String userId;

    @Field("skin_type")
    @Builder.Default
    private String skinType = "";

    @Field("skin_concerns")
    private List<String> skinConcerns;

    private List<String> allergies;

    @Field("age_range")
    @Builder.Default
    private String ageRange = "";

    @CreatedDate
    @Field("created_at")
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Field("updated_at")
    private LocalDateTime updatedAt;
}
