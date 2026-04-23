package com.rental.controller;

import com.rental.dto.ApiResponse;
import com.rental.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @PostMapping("/statistics")
    public ApiResponse<Map<String, Object>> getStatistics(Authentication auth) {
        return ApiResponse.success(dashboardService.getStatistics(auth.getName()));
    }
}