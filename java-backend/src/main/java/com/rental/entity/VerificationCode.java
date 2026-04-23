package com.rental.entity;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VerificationCode {

    private String id;

    private String email;

    private String code;

    private VerificationType type;

    private Boolean used;

    private LocalDateTime expiresAt;

    private LocalDateTime createdAt;

    public enum VerificationType {
        FORGOT_PASSWORD,
        REGISTER
    }
}