package com.rental.controller;

import com.rental.task.BillGenerationTask;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/tasks")
@RequiredArgsConstructor
public class TaskController {

    private final BillGenerationTask billGenerationTask;

    @GetMapping("/generate-bills")
    public ResponseEntity<Map<String, Object>> triggerGenerateBills() {
        log.info("Manual trigger: generate monthly bills");
        try {
            billGenerationTask.generateMonthlyBills();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "账单生成任务已触发执行");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to trigger bill generation task", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "任务执行失败: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }

    @GetMapping("/update-overdue-bills")
    public ResponseEntity<Map<String, Object>> triggerUpdateOverdueBills() {
        log.info("Manual trigger: update overdue bills");
        try {
            billGenerationTask.updateOverdueBills();
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "逾期账单更新任务已触发执行");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Failed to trigger overdue bills update task", e);
            Map<String, Object> response = new HashMap<>();
            response.put("success", false);
            response.put("message", "任务执行失败: " + e.getMessage());
            return ResponseEntity.internalServerError().body(response);
        }
    }
}