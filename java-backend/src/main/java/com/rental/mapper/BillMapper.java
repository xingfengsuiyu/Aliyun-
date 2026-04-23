package com.rental.mapper;

import com.rental.entity.Bill;
import org.apache.ibatis.annotations.Mapper;
import org.apache.ibatis.annotations.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Mapper
@Repository
public interface BillMapper {
    
    Bill findById(String id);
    
    int insert(Bill bill);
    
    int update(Bill bill);

    int deleteById(String id);

    int recordPayment(Bill bill);
    
    List<Bill> findByLandlordId(String landlordId);
    
    List<Bill> searchBills(@Param("landlordId") String landlordId,
                          @Param("status") String status,
                          @Param("billType") String billType,
                          @Param("tenantId") String tenantId,
                          @Param("leaseId") String leaseId);
    
    List<Bill> findOverdueBills(@Param("today") LocalDate today);
    
    List<Bill> findByLeaseId(String leaseId);
    
    List<Bill> findByTenantId(String tenantId);
    
    BigDecimal sumPaidAmountByLandlordId(String landlordId);
    
    BigDecimal sumPendingAmountByLandlordId(String landlordId);

    BigDecimal sumPaidAmountByLandlordIdAndMonth(@Param("landlordId") String landlordId,
                                                  @Param("year") int year,
                                                  @Param("month") int month);

    long countByLandlordIdAndStatus(@Param("landlordId") String landlordId, @Param("status") String status);

    List<Bill> findPendingBills(@Param("landlordId") String landlordId);

    long existsByLeaseIdAndDueDate(@Param("leaseId") String leaseId, @Param("dueDate") LocalDate dueDate);

    List<Bill> findUnpaidBills();
}
