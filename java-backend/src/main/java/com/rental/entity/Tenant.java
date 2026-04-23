package com.rental.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.*;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Tenant {

    private String id;

    private String landlordId;

    private String name;

    private Gender gender;

    private String idCard;

    private java.util.List<String> idCardPhotos;

    private String phone;

    private String email;

    private String emergencyContactName;

    private String emergencyContactPhone;

    private String propertyId;

    private String notes;

    @Builder.Default
    private TenantStatus status = TenantStatus.正常;

    private LocalDateTime createdAt;

    public enum Gender {
        男("男"), 女("女"), 其他("其他");

        private final String value;

        Gender(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static Gender fromValue(String value) {
            for (Gender gender : Gender.values()) {
                if (gender.value.equals(value)) {
                    return gender;
                }
            }
            throw new IllegalArgumentException("Invalid Gender value: " + value);
        }
    }

    public enum TenantStatus {
        正常("正常"), 已退租("已退租");

        private final String value;

        TenantStatus(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static TenantStatus fromValue(String value) {
            for (TenantStatus status : TenantStatus.values()) {
                if (status.value.equals(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Invalid TenantStatus value: " + value);
        }
    }
}
