package com.rental.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Lease {

    private String id;

    private String landlordId;

    private String propertyId;

    private String tenantId;

    private LocalDate startDate;

    private LocalDate endDate;

    private BigDecimal rent;

    private BigDecimal deposit;

    private String paymentMode;

    private Integer paymentDay;

    @Builder.Default
    private Boolean includePropertyFee = false;

    @Builder.Default
    private Boolean includeUtility = false;

    private String otherTerms;

    @Builder.Default
    private List<String> attachments = new java.util.ArrayList<>();

    @Builder.Default
    private LeaseStatus status = LeaseStatus.生效中;

    private String terminationReason;

    private LocalDate actualTerminationDate;

    private String renewedFrom;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String propertyName;
    private String propertyAddress;
    private String tenantName;

    public enum LeaseStatus {
        草稿("草稿"), 生效中("生效中"), 已到期("已到期"), 已终止("已终止"), 待续签("待续签");

        private final String value;

        LeaseStatus(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static LeaseStatus fromValue(String value) {
            for (LeaseStatus status : LeaseStatus.values()) {
                if (status.value.equals(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Invalid LeaseStatus value: " + value);
        }
    }
}
