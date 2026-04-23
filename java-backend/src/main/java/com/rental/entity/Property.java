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
public class Property {

    private String id;

    private String landlordId;

    private String name;

    private String address;

    private PropertyType propertyType;

    private String layout;

    private String description;

    private BigDecimal area;

    private Decoration decoration;

    private Orientation orientation;

    private Integer totalFloors;

    private Integer currentFloor;

    private String floor;

    private String roomNumber;

    @Builder.Default
    private List<String> facilities = new java.util.ArrayList<>();

    private BigDecimal rent;

    private BigDecimal deposit;

    private String depositMode;

    private LocalDate availableFrom;

    private Integer minLeaseTerm;

    @Builder.Default
    private Boolean allowPets = false;

    @Builder.Default
    private Boolean allowSublet = false;

    @Builder.Default
    private List<String> images = new java.util.ArrayList<>();

    @Builder.Default
    private PropertyStatus status = PropertyStatus.草稿;

    private String maintenanceReason;

    private LocalDate expectedAvailableDate;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public enum PropertyType {
        住宅("住宅"), 商铺("商铺"), 写字楼("写字楼"), 厂房("厂房"), 仓库("仓库"), 其他("其他");

        private final String value;

        PropertyType(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static PropertyType fromValue(String value) {
            for (PropertyType type : PropertyType.values()) {
                if (type.value.equals(value)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Invalid PropertyType value: " + value);
        }
    }

    public enum Decoration {
        毛坯("毛坯"), 简装("简装"), 精装("精装");

        private final String value;

        Decoration(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static Decoration fromValue(String value) {
            for (Decoration decoration : Decoration.values()) {
                if (decoration.value.equals(value)) {
                    return decoration;
                }
            }
            throw new IllegalArgumentException("Invalid Decoration value: " + value);
        }
    }

    public enum Orientation {
        东("东"), 南("南"), 西("西"), 北("北"), 东南("东南"), 西南("西南"), 东北("东北"), 西北("西北"), 南北通透("南北通透");

        private final String value;

        Orientation(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static Orientation fromValue(String value) {
            for (Orientation orientation : Orientation.values()) {
                if (orientation.value.equals(value)) {
                    return orientation;
                }
            }
            throw new IllegalArgumentException("Invalid Orientation value: " + value);
        }
    }

    public enum PropertyStatus {
        草稿("草稿"), 空闲("空闲"), 已出租("已出租"), 维护中("维护中");

        private final String value;

        PropertyStatus(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static PropertyStatus fromValue(String value) {
            for (PropertyStatus status : PropertyStatus.values()) {
                if (status.value.equals(value)) {
                    return status;
                }
            }
            throw new IllegalArgumentException("Invalid PropertyStatus value: " + value);
        }
    }
}