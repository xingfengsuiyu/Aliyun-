package com.rental.controller;

import com.rental.dto.ApiResponse;
import com.rental.entity.Tenant;
import com.rental.service.TenantService;
import lombok.RequiredArgsConstructor;
import com.github.pagehelper.PageInfo;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/tenants")
@RequiredArgsConstructor
public class TenantController {

    private final TenantService tenantService;

    @PostMapping
    public ApiResponse<Tenant> createTenant(@RequestBody Tenant tenant, Authentication auth) {
        tenant.setLandlordId(auth.getName());
        return ApiResponse.success(tenantService.createTenant(tenant));
    }

    @PostMapping("/list")
    public ApiResponse<PageInfo<Tenant>> getTenants(@RequestBody Map<String, Object> params, Authentication auth) {
        int page = params.containsKey("page") ? (int) params.get("page") : 0;
        int size = params.containsKey("size") ? (int) params.get("size") : 10;
        String name = (String) params.get("name");
        String phone = (String) params.get("phone");
        String status = (String) params.get("status");

        Tenant.TenantStatus statusEnum = null;
        if (status != null && !status.isEmpty()) {
            statusEnum = Tenant.TenantStatus.valueOf(status);
        }

        boolean hasSearch = (name != null && !name.isEmpty()) ||
                           (phone != null && !phone.isEmpty()) ||
                           (status != null && !status.isEmpty());

        PageInfo<Tenant> tenants;
        if (hasSearch) {
            tenants = tenantService.searchTenants(auth.getName(), name, phone, statusEnum, page, size);
        } else {
            tenants = tenantService.getTenantsByLandlord(auth.getName(), page, size);
        }
        return ApiResponse.success(tenants);
    }

    @PostMapping("/get")
    public ApiResponse<Tenant> getTenant(@RequestBody Map<String, String> params, Authentication auth) {
        String id = params.get("id");
        return ApiResponse.success(tenantService.getTenantById(id, auth.getName()));
    }

    @PostMapping("/update")
    public ApiResponse<Tenant> updateTenant(@RequestBody Map<String, Object> params, Authentication auth) {
        String id = (String) params.get("id");
        @SuppressWarnings("unchecked")
        Map<String, Object> tenantMap = (Map<String, Object>) params.get("tenant");
        Tenant tenant = parseTenantFromMap(tenantMap);
        return ApiResponse.success(tenantService.updateTenant(id, auth.getName(), tenant));
    }

    private Tenant parseTenantFromMap(Map<String, Object> map) {
        Tenant tenant = new Tenant();
        tenant.setName((String) map.get("name"));
        Object genderObj = map.get("gender");
        if (genderObj != null) {
            if (genderObj instanceof String) {
                tenant.setGender(Tenant.Gender.fromValue((String) genderObj));
            } else {
                tenant.setGender((Tenant.Gender) genderObj);
            }
        }
        tenant.setPhone((String) map.get("phone"));
        tenant.setIdCard((String) map.get("idCard"));
        tenant.setEmail((String) map.get("email"));
        tenant.setEmergencyContactName((String) map.get("emergencyContactName"));
        tenant.setEmergencyContactPhone((String) map.get("emergencyContactPhone"));
        tenant.setPropertyId((String) map.get("propertyId"));
        tenant.setNotes((String) map.get("notes"));
        return tenant;
    }

    @PostMapping("/moveout")
    public ApiResponse<Tenant> markAsMovedOut(@RequestBody Map<String, String> params, Authentication auth) {
        String id = params.get("id");
        return ApiResponse.success(tenantService.markAsMovedOut(id, auth.getName()));
    }
}