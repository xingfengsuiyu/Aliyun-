package com.rental.entity;

import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Bill {

    private String id;

    private String landlordId;

    private String leaseId;

    private String propertyId;

    private String tenantId;

    private BillType billType;

    private BigDecimal amount;

    private LocalDate dueDate;

    private BigDecimal paidAmount;

    private LocalDate paidDate;
    private PaymentMethod paymentMethod;

    private String paymentReceipt;

    @Builder.Default
    private BillStatus status = BillStatus.待支付;

    @Builder.Default
    private Integer overdueDays = 0;

    @Builder.Default
    private BigDecimal overdueFee = BigDecimal.ZERO;

    private String remark;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String propertyName;
    private String propertyAddress;
    private String tenantName;
    private String leaseStartDate;
    private String leaseEndDate;

    public enum BillType {
        租金, 押金, 物业费, 水电费, 维修费, 其他
    }

    public enum PaymentMethod {
        微信支付, 支付宝支付, 现金支付, 银行转账, 移动支付, 其他
    }

    public enum BillStatus {
        待支付, 已支付, 逾期
    }
}