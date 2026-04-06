package com.cosmetics.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "brands")
public class Brand {

    @Id
    private String id;

    private String name;

    @Indexed(unique = true)
    private String slug;

    @Field("logo_url")
    private String logoUrl;

    private String description;

    @Field("origin_country")
    private String originCountry;

    private String website;

    @Field("is_active")
    @Builder.Default
    private Boolean isActive = true;
}