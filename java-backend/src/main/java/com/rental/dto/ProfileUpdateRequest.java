package com.rental.dto;

import lombok.Data;

@Data
public class ProfileUpdateRequest {
    private String name;
    private String phone;
    private String email;
    private String oldPassword;
    private String newPassword;
}