package com.rental.controller;

import com.rental.dto.ApiResponse;
import com.rental.entity.Lease;
import com.rental.service.LeaseService;
import lombok.RequiredArgsConstructor;
import com.github.pagehelper.PageInfo;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/leases")
@RequiredArgsConstructor
public class LeaseController {

    private final LeaseService leaseService;

    @PostMapping
    public ApiResponse<Lease> createLease(@RequestBody Lease lease, Authentication auth) {
        lease.setLandlordId(auth.getName());
        return ApiResponse.success(leaseService.createLease(lease));
    }

    @PostMapping("/list")
    public ApiResponse<PageInfo<Lease>> getLeases(@RequestBody Map<String, Object> params, Authentication auth) {
        int page = params.containsKey("page") ? (int) params.get("page") : 0;
        int size = params.containsKey("size") ? (int) params.get("size") : 10;
        String status = (String) params.get("status");
        String tenantId = (String) params.get("tenantId");
        String propertyId = (String) params.get("propertyId");

        Lease.LeaseStatus statusEnum = null;
        if (status != null && !status.isEmpty()) {
            statusEnum = Lease.LeaseStatus.valueOf(status);
        }
        PageInfo<Lease> leases = leaseService.searchLeases(auth.getName(), statusEnum, tenantId, propertyId, page, size);
        return ApiResponse.success(leases);
    }

    @PostMapping("/get")
    public ApiResponse<Lease> getLease(@RequestBody Map<String, String> params, Authentication auth) {
        String id = params.get("id");
        return ApiResponse.success(leaseService.getLeaseById(id, auth.getName()));
    }

    @PostMapping("/renew")
    public ApiResponse<Lease> renewLease(@RequestBody Map<String, Object> params, Authentication auth) {
        String id = (String) params.get("id");
        @SuppressWarnings("unchecked")
        Map<String, Object> leaseMap = (Map<String, Object>) params.get("newLeaseData");
        Lease newLeaseData = parseLeaseFromMap(leaseMap);
        return ApiResponse.success(leaseService.renewLease(id, auth.getName(), newLeaseData));
    }

    private Lease parseLeaseFromMap(Map<String, Object> map) {
        Lease lease = new Lease();
        lease.setStartDate(map.get("startDate") != null ? java.time.LocalDate.parse((String) map.get("startDate")) : null);
        lease.setEndDate(map.get("endDate") != null ? java.time.LocalDate.parse((String) map.get("endDate")) : null);
        lease.setRent(map.get("rent") != null ? new java.math.BigDecimal(map.get("rent").toString()) : null);
        lease.setDeposit(map.get("deposit") != null ? new java.math.BigDecimal(map.get("deposit").toString()) : null);
        lease.setPaymentMode((String) map.get("paymentMode"));
        lease.setPaymentDay((Integer) map.get("paymentDay"));
        lease.setIncludePropertyFee((Boolean) map.get("includePropertyFee"));
        lease.setIncludeUtility((Boolean) map.get("includeUtility"));
        lease.setOtherTerms((String) map.get("otherTerms"));
        Object statusObj = map.get("status");
        if (statusObj != null) {
            if (statusObj instanceof String) {
                lease.setStatus(Lease.LeaseStatus.fromValue((String) statusObj));
            } else {
                lease.setStatus((Lease.LeaseStatus) statusObj);
            }
        }
        return lease;
    }

    @PostMapping("/terminate")
    public ApiResponse<Lease> terminateLease(@RequestBody Map<String, Object> params, Authentication auth) {
        String id = (String) params.get("id");
        String terminationReason = (String) params.get("terminationReason");
        LocalDate actualTerminationDate = params.containsKey("actualTerminationDate")
            ? LocalDate.parse((String) params.get("actualTerminationDate"))
            : null;
        return ApiResponse.success(leaseService.terminateLease(id, auth.getName(), terminationReason, actualTerminationDate));
    }

    @PostMapping("/active")
    public ApiResponse<List<Lease>> getActiveLeases(Authentication auth) {
        return ApiResponse.success(leaseService.getActiveLeases(auth.getName()));
    }

    @PostMapping("/expiring")
    public ApiResponse<List<Lease>> getExpiringLeases(Authentication auth) {
        return ApiResponse.success(leaseService.getExpiringLeases(auth.getName()));
    }
}