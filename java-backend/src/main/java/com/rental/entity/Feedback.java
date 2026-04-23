package com.rental.entity;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;
import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Feedback {

    private String id;

    private String landlordId;

    private FeedbackType feedbackType;

    private String title;

    private String content;

    private LocalDateTime createdAt;

    public enum FeedbackType {
        功能建议("功能建议"), 系统bug("系统bug"), 体验反馈("体验反馈"), 其他("其他");

        private final String value;

        FeedbackType(String value) {
            this.value = value;
        }

        @JsonValue
        public String getValue() {
            return value;
        }

        @JsonCreator
        public static FeedbackType fromValue(String value) {
            for (FeedbackType type : FeedbackType.values()) {
                if (type.value.equals(value)) {
                    return type;
                }
            }
            throw new IllegalArgumentException("Invalid FeedbackType value: " + value);
        }
    }
}