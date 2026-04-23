package com.rental.entity;

import lombok.*;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Landlord {
    
    private String id;
    private String account;
    private String password;
    /** 展示名称，默认可与账号相同 */
    private String name;
    private String phone;
    private String email;
    /** 账号状态，如：正常 */
    @Builder.Default
    private String status = "正常";
    
    @Builder.Default
    private Integer failedLoginAttempts = 0;
    
    private LocalDateTime lockedUntil;
    private LocalDateTime lastLoginAt;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
