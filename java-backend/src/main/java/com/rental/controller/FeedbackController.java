package com.rental.controller;

import com.rental.dto.ApiResponse;
import com.rental.entity.Feedback;
import com.rental.service.FeedbackService;
import com.github.pagehelper.PageInfo;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/feedbacks")
@RequiredArgsConstructor
public class FeedbackController {

    private final FeedbackService feedbackService;

    @PostMapping
    public ApiResponse<Feedback> createFeedback(@RequestBody Map<String, Object> params, Authentication auth) {
        Feedback feedback = parseFeedbackFromMap(params);
        feedback.setLandlordId(auth.getName());
        return ApiResponse.success(feedbackService.createFeedback(feedback));
    }

    @PostMapping("/list")
    public ApiResponse<PageInfo<Feedback>> getFeedbacks(@RequestBody Map<String, Object> params, Authentication auth) {
        int page = params.containsKey("page") ? (int) params.get("page") : 0;
        int size = params.containsKey("size") ? (int) params.get("size") : 10;
        return ApiResponse.success(feedbackService.getFeedbacksByLandlord(auth.getName(), page, size));
    }

    @PostMapping("/get")
    public ApiResponse<Feedback> getFeedback(@RequestBody Map<String, String> params) {
        String id = params.get("id");
        return ApiResponse.success(feedbackService.getFeedbackById(id));
    }

    private Feedback parseFeedbackFromMap(Map<String, Object> map) {
        Feedback feedback = new Feedback();
        feedback.setTitle((String) map.get("title"));
        feedback.setContent((String) map.get("content"));
        Object typeObj = map.get("feedbackType");
        if (typeObj != null) {
            if (typeObj instanceof String) {
                feedback.setFeedbackType(Feedback.FeedbackType.fromValue((String) typeObj));
            } else {
                feedback.setFeedbackType((Feedback.FeedbackType) typeObj);
            }
        }
        return feedback;
    }
}