package com.rental.dto;

import lombok.Data;

@Data
public class ForgotPasswordRequest {
    private String email;
    private String verificationCode;
    private String newPassword;
}