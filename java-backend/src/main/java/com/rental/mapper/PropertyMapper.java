package com.rental.mapper;

import com.rental.entity.Property;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Mapper
@Repository
public interface PropertyMapper {
    
    Property findById(String id);

    int insert(Property property);
    
    int insertFacility(@Param("propertyId") String propertyId, @Param("facility") String facility);
    
    int insertImage(@Param("propertyId") String propertyId, @Param("imageUrl") String imageUrl);
    
    int update(Property property);
    
    int deleteFacilities(String propertyId);
    
    int deleteImages(String propertyId);
    
    int delete(String id);
    
    List<Property> findByLandlordId(String landlordId);
    
    List<Property> searchProperties(@Param("landlordId") String landlordId,
                                   @Param("name") String name,
                                   @Param("status") String status,
                                   @Param("propertyType") String propertyType);
    
    long countByLandlordId(String landlordId);
    
    long countByLandlordIdAndStatus(@Param("landlordId") String landlordId, @Param("status") String status);
}
