package com.rental.mapper;

import com.rental.entity.Message;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface MessageMapper {
    
    Message findById(String id);
    
    int insert(Message message);
    
    int update(Message message);
    
    List<Message> findByLandlordIdAndTenantId(@Param("landlordId") String landlordId, 
                                              @Param("tenantId") String tenantId);
    
    List<Message> findByLandlordId(String landlordId);
    
    List<Message> findByTenantId(String tenantId);
    
    long countUnreadMessages(@Param("landlordId") String landlordId, @Param("tenantId") String tenantId);
    
    int markAllAsRead(@Param("landlordId") String landlordId, @Param("tenantId") String tenantId);
}
