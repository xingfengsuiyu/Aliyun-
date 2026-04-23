package com.rental.mapper;

import com.rental.entity.Landlord;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

@Mapper
@Repository
public interface LandlordMapper {

    Landlord findById(@Param("id") String id);

    Landlord findByAccount(@Param("account") String account);

    Landlord findByPhone(@Param("phone") String phone);

    Landlord findByEmail(@Param("email") String email);

    int insert(Landlord landlord);

    int update(Landlord landlord);

    int updatePassword(@Param("id") String id, @Param("password") String password);
}
