package com.rental.mapper;

import com.rental.entity.Feedback;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface FeedbackMapper {

    Feedback findById(@Param("id") String id);

    int insert(Feedback feedback);

    List<Feedback> findByLandlordId(@Param("landlordId") String landlordId);
}