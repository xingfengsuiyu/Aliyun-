package com.rental.task;

import com.rental.entity.Bill;
import com.rental.entity.Lease;
import com.rental.mapper.BillMapper;
import com.rental.mapper.LeaseMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.UUID;

@Slf4j
@Component
@RequiredArgsConstructor
public class BillGenerationTask {

    private final LeaseMapper leaseMapper;
    private final BillMapper billMapper;

    @Scheduled(cron = "0 0 1 * * ?")
    @Transactional
    public void generateMonthlyBills() {
        log.info("Starting monthly bill generation task");
        List<Lease> activeLeases = leaseMapper.findAllActiveLeases();
        int generatedCount = 0;

        for (Lease lease : activeLeases) {
            try {
                generateBillsForLease(lease);
                generatedCount++;
            } catch (Exception e) {
                log.error("Failed to generate bill for lease: {}", lease.getId(), e);
            }
        }

        log.info("Monthly bill generation completed. Generated bills for {} leases", generatedCount);
    }

    private void generateBillsForLease(Lease lease) {
        LocalDate today = LocalDate.now();
        LocalDate startDate = lease.getStartDate();
        LocalDate endDate = lease.getEndDate();

        if (startDate == null || endDate == null) {
            return;
        }

        if (today.isBefore(startDate) || today.isAfter(endDate)) {
            return;
        }

        int paymentMode = getPaymentMode(lease.getPaymentMode());

        LocalDate nextDueDate = calculateNextDueDate(startDate, today, paymentMode);

        if (nextDueDate == null) {
            return;
        }

        if (billMapper.existsByLeaseIdAndDueDate(lease.getId(), nextDueDate) > 0) {
            log.debug("Bill already exists for lease {} on {}", lease.getId(), nextDueDate);
            return;
        }

        Bill bill = Bill.builder()
                .id(UUID.randomUUID().toString())
                .landlordId(lease.getLandlordId())
                .leaseId(lease.getId())
                .propertyId(lease.getPropertyId())
                .tenantId(lease.getTenantId())
                .billType(Bill.BillType.租金)
                .amount(lease.getRent())
                .dueDate(nextDueDate)
                .paidAmount(BigDecimal.ZERO)
                .status(Bill.BillStatus.待支付)
                .overdueDays(0)
                .overdueFee(BigDecimal.ZERO)
                .build();

        billMapper.insert(bill);
        log.info("Generated bill for lease {}, amount: {}, due date: {}",
                lease.getId(), lease.getRent(), nextDueDate);
    }

    private int getPaymentMode(String paymentMode) {
        if (paymentMode == null) {
            return 1;
        }
        return switch (paymentMode) {
            case "季付" -> 3;
            case "半年付" -> 6;
            case "年付" -> 12;
            default -> 1;
        };
    }

    private LocalDate calculateNextDueDate(LocalDate startDate, LocalDate currentDate, int paymentMode) {
        int monthsToAdd = paymentMode;

        LocalDate firstDueDate = startDate.plusMonths(monthsToAdd);

        if (currentDate.isBefore(firstDueDate)) {
            return firstDueDate;
        }

        LocalDate nextDueDate = firstDueDate;
        while (nextDueDate.isBefore(currentDate) || nextDueDate.isEqual(currentDate)) {
            nextDueDate = nextDueDate.plusMonths(monthsToAdd);
        }

        return nextDueDate;
    }

    @Scheduled(cron = "0 0 2 * * ?")
    @Transactional
    public void updateOverdueBills() {
        log.info("Starting overdue bills update task");
        List<Bill> unpaidBills = billMapper.findUnpaidBills();
        int updatedCount = 0;

        LocalDate today = LocalDate.now();

        for (Bill bill : unpaidBills) {
            try {
                if (bill.getDueDate() != null && today.isAfter(bill.getDueDate())) {
                    long overdueDays = ChronoUnit.DAYS.between(bill.getDueDate(), today);

                    BigDecimal overdueFeeRate = new BigDecimal("0.001");
                    BigDecimal overdueFee = bill.getAmount()
                            .multiply(overdueFeeRate)
                            .multiply(new BigDecimal(overdueDays));

                    bill.setOverdueDays((int) overdueDays);
                    bill.setOverdueFee(overdueFee);
                    bill.setStatus(Bill.BillStatus.逾期);

                    billMapper.update(bill);
                    updatedCount++;
                }
            } catch (Exception e) {
                log.error("Failed to update overdue bill: {}", bill.getId(), e);
            }
        }

        log.info("Overdue bills update completed. Updated {} bills", updatedCount);
    }
}
