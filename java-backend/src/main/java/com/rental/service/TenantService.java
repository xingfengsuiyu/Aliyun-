package com.rental.service;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.rental.entity.Tenant;
import com.rental.mapper.TenantMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TenantService {
    
    private final TenantMapper tenantMapper;
    
    @Transactional
    public Tenant createTenant(Tenant tenant) {
        if (StringUtils.hasText(tenant.getIdCard()) && tenantMapper.existsByIdCard(tenant.getIdCard())) {
            throw new RuntimeException("身份证号已存在");
        }
        if (StringUtils.hasText(tenant.getPhone()) && tenantMapper.existsByPhone(tenant.getPhone())) {
            throw new RuntimeException("手机号已存在");
        }

        if (!StringUtils.hasText(tenant.getId())) {
            tenant.setId(UUID.randomUUID().toString());
        }

        tenantMapper.insert(tenant);
        
        // Insert ID card photos
        if (tenant.getIdCardPhotos() != null && !tenant.getIdCardPhotos().isEmpty()) {
            for (String photo : tenant.getIdCardPhotos()) {
                tenantMapper.insertIdPhoto(tenant.getId(), photo);
            }
        }
        
        return tenant;
    }
    
    public PageInfo<Tenant> getTenantsByLandlord(String landlordId, int page, int size) {
        PageHelper.startPage(page, size);
        List<Tenant> list = tenantMapper.findByLandlordId(landlordId);
        return new PageInfo<>(list);
    }
    
    public Tenant getTenantById(String id, String landlordId) {
        Tenant tenant = tenantMapper.findById(id);
        if (tenant == null || !tenant.getLandlordId().equals(landlordId)) {
            throw new RuntimeException("租客不存在");
        }
        return tenant;
    }
    
    @Transactional
    public Tenant updateTenant(String id, String landlordId, Tenant updates) {
        Tenant tenant = getTenantById(id, landlordId);

        tenant.setName(updates.getName());
        tenant.setGender(updates.getGender());
        tenant.setPhone(updates.getPhone());
        tenant.setIdCard(updates.getIdCard());
        tenant.setEmail(updates.getEmail());
        tenant.setEmergencyContactName(updates.getEmergencyContactName());
        tenant.setEmergencyContactPhone(updates.getEmergencyContactPhone());
        tenant.setPropertyId(updates.getPropertyId());
        tenant.setNotes(updates.getNotes());

        tenantMapper.update(tenant);

        return tenantMapper.findById(id);
    }
    
    @Transactional
    public Tenant markAsMovedOut(String id, String landlordId) {
        Tenant tenant = getTenantById(id, landlordId);
        tenant.setStatus(Tenant.TenantStatus.已退租);
        tenantMapper.update(tenant);
        return tenantMapper.findById(id);
    }

    public PageInfo<Tenant> searchTenants(String landlordId, String name, String phone,
                                          Tenant.TenantStatus status, int page, int size) {
        PageHelper.startPage(page, size);
        List<Tenant> list = tenantMapper.searchTenants(landlordId, name, phone,
            status != null ? status.name() : null);
        return new PageInfo<>(list);
    }
    
    public long getTotalTenants(String landlordId) {
        return tenantMapper.countByLandlordId(landlordId);
    }
}
