package com.rental.service;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.rental.entity.Bill;
import com.rental.entity.Lease;
import com.rental.mapper.BillMapper;
import com.rental.mapper.LeaseMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.UUID;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class BillService {
    
    private final BillMapper billMapper;
    private final LeaseMapper leaseMapper;
    
    public Bill createBill(Bill bill) {
        if (!StringUtils.hasText(bill.getId())) {
            bill.setId(UUID.randomUUID().toString());
        }
        billMapper.insert(bill);
        return bill;
    }

    public void deleteBill(String id, String landlordId) {
        Bill bill = billMapper.findById(id);
        if (bill == null || !bill.getLandlordId().equals(landlordId)) {
            throw new RuntimeException("账单不存在");
        }
        billMapper.deleteById(id);
    }
    
    public PageInfo<Bill> getBillsByLandlord(String landlordId, int page, int size) {
        PageHelper.startPage(page, size);
        List<Bill> list = billMapper.findByLandlordId(landlordId);
        return new PageInfo<>(list);
    }
    
    public PageInfo<Bill> searchBills(String landlordId, Bill.BillStatus status,
                                 Bill.BillType billType, String tenantId,
                                 int page, int size) {
        PageHelper.startPage(page, size);
        String statusStr = (status == null || status.name().isEmpty()) ? null : status.name();
        String billTypeStr = (billType == null || billType.name().isEmpty()) ? null : billType.name();
        List<Bill> list = billMapper.searchBills(landlordId,
            statusStr,
            billTypeStr,
            tenantId, null);
        return new PageInfo<>(list);
    }
    
    public Bill getBillById(String id, String landlordId) {
        Bill bill = billMapper.findById(id);
        if (bill == null || !bill.getLandlordId().equals(landlordId)) {
            throw new RuntimeException("账单不存在");
        }
        return bill;
    }
    
    @Transactional
    public Bill recordPayment(String id, String landlordId, Map<String, Object> paymentData) {
        Bill bill = getBillById(id, landlordId);

        if (paymentData.get("paidAmount") != null) {
            bill.setPaidAmount(new BigDecimal(paymentData.get("paidAmount").toString()));
        }
        if (paymentData.get("paidDate") != null) {
            bill.setPaidDate(LocalDate.parse(paymentData.get("paidDate").toString()));
        }
        if (paymentData.get("paymentMethod") != null && !paymentData.get("paymentMethod").toString().isEmpty()) {
            bill.setPaymentMethod(Bill.PaymentMethod.valueOf(paymentData.get("paymentMethod").toString()));
        }
        if (paymentData.get("paymentReceipt") != null) {
            bill.setPaymentReceipt(paymentData.get("paymentReceipt").toString());
        }
        bill.setStatus(Bill.BillStatus.已支付);

        billMapper.recordPayment(bill);
        return billMapper.findById(id);
    }
    
    @Transactional
    public void recordBatchPayment(List<Map<String, Object>> payments) {
        for (Map<String, Object> payment : payments) {
            String billId = (String) payment.get("billId");
            try {
                Bill bill = billMapper.findById(billId);
                if (bill != null) {
                    bill.setPaidAmount(new BigDecimal(payment.get("paidAmount").toString()));
                    bill.setPaidDate(LocalDate.parse(payment.get("paidDate").toString()));
                    bill.setStatus(Bill.BillStatus.已支付);
                    billMapper.recordPayment(bill);
                }
            } catch (Exception e) {
                // Log error and continue
                System.err.println("Failed to process payment for bill: " + billId);
            }
        }
    }
    
    public Map<String, Object> getStatistics(String landlordId) {
        Map<String, Object> stats = new HashMap<>();

        long paidCount = billMapper.countByLandlordIdAndStatus(landlordId, Bill.BillStatus.已支付.name());
        long pendingCount = billMapper.countByLandlordIdAndStatus(landlordId, Bill.BillStatus.待支付.name());
        long overdueCount = billMapper.countByLandlordIdAndStatus(landlordId, Bill.BillStatus.逾期.name());

        BigDecimal totalIncome = billMapper.sumPaidAmountByLandlordId(landlordId);

        stats.put("paid_count", paidCount);
        stats.put("pending_count", pendingCount);
        stats.put("overdue_count", overdueCount);
        stats.put("total_income", totalIncome != null ? totalIncome : BigDecimal.ZERO);

        return stats;
    }

    public List<Bill> getPendingBills(String landlordId) {
        return billMapper.findPendingBills(landlordId);
    }
    
    // Scheduled task to generate bills for active leases
    @Scheduled(cron = "0 0 */6 * * *") // Every 6 hours
    @Transactional
    public void generateBills() {
        List<Lease> activeLeases = leaseMapper.findByLandlordIdAndStatus(null, Lease.LeaseStatus.生效中.name());
        LocalDate today = LocalDate.now();
        
        for (Lease lease : activeLeases) {
            // Calculate next due date based on payment day
            LocalDate nextDueDate = LocalDate.of(today.getYear(), today.getMonth(), lease.getPaymentDay());
            
            if (nextDueDate.isBefore(today)) {
                nextDueDate = nextDueDate.plusMonths(1);
            }
            
            // Check if bill already exists
            // Simplified - in production, add proper query to check existing bills
            
            // Create bill
            Bill bill = Bill.builder()
                    .landlordId(lease.getLandlordId())
                    .leaseId(lease.getId())
                    .propertyId(lease.getPropertyId())
                    .tenantId(lease.getTenantId())
                    .billType(Bill.BillType.租金)
                    .amount(lease.getRent())
                    .dueDate(nextDueDate)
                    .status(Bill.BillStatus.待支付)
                    .build();
            
            billMapper.insert(bill);
        }
    }
    
    // Scheduled task to update overdue bills
    @Scheduled(cron = "0 0 0 * * *") // Daily at midnight
    @Transactional
    public void updateOverdueBills() {
        LocalDate today = LocalDate.now();
        List<Bill> overdueBills = billMapper.findOverdueBills(today);
        
        BigDecimal defaultOverdueRate = new BigDecimal("0.0005"); // 0.05% per day
        
        for (Bill bill : overdueBills) {
            long overdueDays = ChronoUnit.DAYS.between(bill.getDueDate(), today);
            BigDecimal overdueFee = bill.getAmount()
                    .multiply(defaultOverdueRate)
                    .multiply(new BigDecimal(overdueDays));
            
            bill.setOverdueDays((int) overdueDays);
            bill.setOverdueFee(overdueFee);
            bill.setStatus(Bill.BillStatus.逾期);
            
            billMapper.update(bill);
        }
    }
}
