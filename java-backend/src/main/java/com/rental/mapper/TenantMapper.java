package com.rental.mapper;

import com.rental.entity.Tenant;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface TenantMapper {
    
    Tenant findById(String id);
    
    Tenant findByIdCard(String idCard);
    
    Tenant findByPhone(String phone);
    
    int insert(Tenant tenant);
    
    int insertIdPhoto(@Param("tenantId") String tenantId, @Param("photoUrl") String photoUrl);
    
    int update(Tenant tenant);
    
    List<Tenant> findByLandlordId(String landlordId);

    List<Tenant> searchTenants(@Param("landlordId") String landlordId,
                               @Param("name") String name,
                               @Param("phone") String phone,
                               @Param("status") String status);

    long countByLandlordId(String landlordId);
    
    boolean existsByIdCard(String idCard);
    
    boolean existsByPhone(String phone);
}
