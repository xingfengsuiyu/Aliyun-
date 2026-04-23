package com.rental.admin.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseBody;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Controller
@RequestMapping("/tasks")
public class TaskController {

    @Value("${java.backend.url:http://localhost:8080}")
    private String javaBackendUrl;

    private final RestTemplate restTemplate = new RestTemplate();

    @GetMapping
    public String taskPage() {
        return "task-management";
    }

    @GetMapping("/generate-bills")
    @ResponseBody
    public Map<String, Object> triggerGenerateBills() {
        Map<String, Object> result = new HashMap<>();
        try {
            String url = javaBackendUrl + "/api/tasks/generate-bills";
            restTemplate.getForObject(url, Map.class);
            result.put("success", true);
            result.put("message", "账单生成任务已触发");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "调用失败: " + e.getMessage());
        }
        return result;
    }

    @GetMapping("/update-overdue-bills")
    @ResponseBody
    public Map<String, Object> triggerUpdateOverdueBills() {
        Map<String, Object> result = new HashMap<>();
        try {
            String url = javaBackendUrl + "/api/tasks/update-overdue-bills";
            restTemplate.getForObject(url, Map.class);
            result.put("success", true);
            result.put("message", "逾期账单更新任务已触发");
        } catch (Exception e) {
            result.put("success", false);
            result.put("message", "调用失败: " + e.getMessage());
        }
        return result;
    }
}