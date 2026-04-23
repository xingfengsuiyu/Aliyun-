package com.rental.controller;

import com.rental.dto.ApiResponse;
import com.rental.dto.ForgotPasswordRequest;
import com.rental.service.ForgotPasswordService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class ForgotPasswordController {

    private final ForgotPasswordService forgotPasswordService;

    @PostMapping("/send-code")
    public ApiResponse<String> sendVerificationCode(@RequestBody String email) {
        forgotPasswordService.sendVerificationCode(email);
        return ApiResponse.success("验证码已发送");
    }

    @PostMapping("/reset-password")
    public ApiResponse<String> resetPassword(@RequestBody ForgotPasswordRequest request) {
        forgotPasswordService.resetPassword(
            request.getEmail(),
            request.getVerificationCode(),
            request.getNewPassword()
        );
        return ApiResponse.success("密码重置成功");
    }
}