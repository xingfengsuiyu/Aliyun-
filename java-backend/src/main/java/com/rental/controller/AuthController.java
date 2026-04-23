package com.rental.controller;

import com.rental.dto.ApiResponse;
import com.rental.dto.LoginRequest;
import com.rental.dto.ProfileUpdateRequest;
import com.rental.dto.RegisterRequest;
import com.rental.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    @PostMapping("/login")
    public ApiResponse<Map<String, Object>> login(@RequestBody LoginRequest request) {
        return ApiResponse.success(authService.login(request));
    }

    @PostMapping("/register")
    public ApiResponse<Map<String, Object>> register(@RequestBody RegisterRequest request) {
        return ApiResponse.success(authService.register(request));
    }

    @PostMapping("/me")
    public ApiResponse<Map<String, Object>> getProfile(Authentication auth) {
        return ApiResponse.success(authService.getProfile(auth.getName()));
    }

    @PostMapping("/profile")
    public ApiResponse<Map<String, Object>> updateProfile(
            @RequestBody ProfileUpdateRequest request,
            Authentication auth) {
        return ApiResponse.success(authService.updateProfile(auth.getName(), request));
    }

    @PostMapping("/health")
    public ApiResponse<String> health() {
        return ApiResponse.success("Service is running");
    }
}