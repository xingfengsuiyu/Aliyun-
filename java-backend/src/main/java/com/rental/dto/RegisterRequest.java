package com.rental.dto;

import lombok.Data;

@Data
public class RegisterRequest {
    private String account;
    private String password;
    private String confirmPassword;
    private String phone;
    private String email;
}
