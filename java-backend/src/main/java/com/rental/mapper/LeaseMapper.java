package com.rental.mapper;

import com.rental.entity.Lease;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Mapper
@Repository
public interface LeaseMapper {

    Lease findById(String id);

    Lease findByIdWithDetails(String id);

    int insert(Lease lease);

    int insertAttachment(@Param("leaseId") String leaseId, @Param("attachmentUrl") String attachmentUrl);

    int update(Lease lease);

    List<Lease> findByLandlordId(String landlordId);

    List<Lease> findByLandlordIdWithDetails(String landlordId);

    List<Lease> searchLeases(@Param("landlordId") String landlordId,
                            @Param("status") String status,
                            @Param("tenantId") String tenantId,
                            @Param("propertyId") String propertyId);

    List<Lease> searchLeasesWithDetails(@Param("landlordId") String landlordId,
                                       @Param("status") String status,
                                       @Param("tenantId") String tenantId,
                                       @Param("propertyId") String propertyId);

    List<Lease> findByLandlordIdAndStatus(@Param("landlordId") String landlordId, @Param("status") String status);

    List<Lease> findExpiringLeases(@Param("landlordId") String landlordId, @Param("date") LocalDate date);

    List<Lease> findAllActiveLeases();

    long countByLandlordIdAndStatus(@Param("landlordId") String landlordId, @Param("status") String status);
}
