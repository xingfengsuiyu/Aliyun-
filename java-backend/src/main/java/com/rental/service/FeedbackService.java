package com.rental.service;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.rental.entity.Feedback;
import com.rental.mapper.FeedbackMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FeedbackService {

    private final FeedbackMapper feedbackMapper;

    @Transactional
    public Feedback createFeedback(Feedback feedback) {
        if (feedback.getId() == null || feedback.getId().isEmpty()) {
            feedback.setId(UUID.randomUUID().toString());
        }
        feedbackMapper.insert(feedback);
        return feedback;
    }

    public PageInfo<Feedback> getFeedbacksByLandlord(String landlordId, int page, int size) {
        PageHelper.startPage(page, size);
        return new PageInfo<>(feedbackMapper.findByLandlordId(landlordId));
    }

    public Feedback getFeedbackById(String id) {
        return feedbackMapper.findById(id);
    }
}