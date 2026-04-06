package com.cosmetics.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.data.mongodb.core.mapping.Field;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "addresses")
public class Address {

    @Id
    private String id;

    @Field("user_id")
    private String userId;

    @Field("full_name")
    private String fullName;

    private String phone;

    private String province;

    private String district;

    private String ward;

    private String street;

    @Field("is_default")
    @Builder.Default
    private Boolean isDefault = false;
}
