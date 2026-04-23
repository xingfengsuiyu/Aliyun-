package com.rental.mapper;

import com.rental.entity.VerificationCode;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface VerificationCodeMapper {

    int insert(VerificationCode code);

    VerificationCode findByEmailAndType(@Param("email") String email,
                                      @Param("type") String type,
                                      @Param("used") Boolean used);

    int markAsUsed(@Param("id") String id);

    int deleteExpired();
}