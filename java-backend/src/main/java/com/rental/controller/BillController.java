package com.rental.controller;

import com.rental.dto.ApiResponse;
import com.rental.entity.Bill;
import com.rental.service.BillService;
import lombok.RequiredArgsConstructor;
import com.github.pagehelper.PageInfo;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/bills")
@RequiredArgsConstructor
public class BillController {

    private final BillService billService;

    @PostMapping
    public ApiResponse<Bill> createBill(@RequestBody Bill bill, Authentication auth) {
        bill.setLandlordId(auth.getName());
        return ApiResponse.success(billService.createBill(bill));
    }

    @PostMapping("/delete")
    public ApiResponse<Void> deleteBill(@RequestBody Map<String, String> params, Authentication auth) {
        String id = params.get("id");
        billService.deleteBill(id, auth.getName());
        return ApiResponse.success(null);
    }

    @PostMapping("/list")
    public ApiResponse<PageInfo<Bill>> getBills(@RequestBody Map<String, Object> params, Authentication auth) {
        int page = params.containsKey("page") ? (int) params.get("page") : 0;
        int size = params.containsKey("size") ? (int) params.get("size") : 10;
        String status = (String) params.get("status");
        String billType = (String) params.get("billType");
        String tenantId = (String) params.get("tenantId");

        Bill.BillStatus statusEnum = null;
        Bill.BillType billTypeEnum = null;
        if (status != null && !status.isEmpty()) {
            statusEnum = Bill.BillStatus.valueOf(status);
        }
        if (billType != null && !billType.isEmpty()) {
            billTypeEnum = Bill.BillType.valueOf(billType);
        }
        PageInfo<Bill> bills = billService.searchBills(auth.getName(), statusEnum, billTypeEnum, tenantId, page, size);
        return ApiResponse.success(bills);
    }

    @PostMapping("/get")
    public ApiResponse<Bill> getBill(@RequestBody Map<String, String> params, Authentication auth) {
        String id = params.get("id");
        return ApiResponse.success(billService.getBillById(id, auth.getName()));
    }

    @PostMapping("/pay")
    public ApiResponse<Bill> recordPayment(@RequestBody Map<String, Object> params, Authentication auth) {
        String id = (String) params.get("id");
        @SuppressWarnings("unchecked")
        Map<String, Object> paymentData = (Map<String, Object>) params.get("paymentData");
        return ApiResponse.success(billService.recordPayment(id, auth.getName(), paymentData));
    }

    @PostMapping("/batch-pay")
    public ApiResponse<Void> batchPayment(@RequestBody Map<String, Object> params, Authentication auth) {
        @SuppressWarnings("unchecked")
        List<Map<String, Object>> payments = (List<Map<String, Object>>) params.get("payments");
        billService.recordBatchPayment(payments);
        return ApiResponse.success(null);
    }

    @PostMapping("/statistics")
    public ApiResponse<Map<String, Object>> getStatistics(Authentication auth) {
        return ApiResponse.success(billService.getStatistics(auth.getName()));
    }

    @PostMapping("/pending")
    public ApiResponse<List<Bill>> getPendingBills(Authentication auth) {
        return ApiResponse.success(billService.getPendingBills(auth.getName()));
    }
}