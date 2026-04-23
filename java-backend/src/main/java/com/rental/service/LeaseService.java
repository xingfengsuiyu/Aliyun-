package com.rental.service;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.rental.entity.Lease;
import com.rental.entity.Property;
import com.rental.entity.Tenant;
import com.rental.mapper.LeaseMapper;
import com.rental.mapper.PropertyMapper;
import com.rental.mapper.TenantMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDate;
import java.util.UUID;
import java.util.List;

@Service
@RequiredArgsConstructor
public class LeaseService {
    
    private final LeaseMapper leaseMapper;
    private final PropertyMapper propertyMapper;
    private final TenantMapper tenantMapper;
    
    @Transactional
    public Lease createLease(Lease lease) {
        // Verify property is available
        Property property = propertyMapper.findById(lease.getPropertyId());
        if (property == null) {
            throw new RuntimeException("房源不存在");
        }
        
        if (property.getStatus() != Property.PropertyStatus.空闲) {
            throw new RuntimeException("房源当前状态不可出租");
        }
        
        // Verify tenant exists
        Tenant tenant = tenantMapper.findById(lease.getTenantId());
        if (tenant == null) {
            throw new RuntimeException("租客不存在");
        }

        if (!StringUtils.hasText(lease.getId())) {
            lease.setId(UUID.randomUUID().toString());
        }

        // Create lease
        leaseMapper.insert(lease);
        
        // Insert attachments
        if (lease.getAttachments() != null && !lease.getAttachments().isEmpty()) {
            for (String attachment : lease.getAttachments()) {
                leaseMapper.insertAttachment(lease.getId(), attachment);
            }
        }
        
        // Update property status to rented
        property.setStatus(Property.PropertyStatus.已出租);
        propertyMapper.update(property);
        
        // Update tenant's property association
        tenant.setPropertyId(property.getId());
        tenantMapper.update(tenant);
        
        return leaseMapper.findById(lease.getId());
    }
    
    public PageInfo<Lease> getLeasesByLandlord(String landlordId, int page, int size) {
        PageHelper.startPage(page, size);
        List<Lease> list = leaseMapper.findByLandlordIdWithDetails(landlordId);
        return new PageInfo<>(list);
    }

    public PageInfo<Lease> searchLeases(String landlordId, Lease.LeaseStatus status,
                                   String tenantId, String propertyId, int page, int size) {
        PageHelper.startPage(page, size);
        String statusStr = (status == null || status.name().isEmpty()) ? null : status.name();
        List<Lease> list = leaseMapper.searchLeasesWithDetails(landlordId,
            statusStr, tenantId, propertyId);
        return new PageInfo<>(list);
    }

    public Lease getLeaseById(String id, String landlordId) {
        Lease lease = leaseMapper.findByIdWithDetails(id);
        if (lease == null || !lease.getLandlordId().equals(landlordId)) {
            throw new RuntimeException("租约不存在");
        }
        return lease;
    }
    
    @Transactional
    public Lease renewLease(String id, String landlordId, Lease newLeaseData) {
        Lease lease = getLeaseById(id, landlordId);

        if (newLeaseData.getEndDate() != null) {
            lease.setEndDate(newLeaseData.getEndDate());
        }
        if (newLeaseData.getRent() != null) {
            lease.setRent(newLeaseData.getRent());
        }
        lease.setStatus(Lease.LeaseStatus.生效中);

        leaseMapper.update(lease);

        return lease;
    }
    
    @Transactional
    public Lease terminateLease(String id, String landlordId, 
                               String terminationReason, 
                               LocalDate actualTerminationDate) {
        Lease lease = getLeaseById(id, landlordId);
        
        lease.setStatus(Lease.LeaseStatus.已终止);
        lease.setTerminationReason(terminationReason);
        lease.setActualTerminationDate(actualTerminationDate != null ? actualTerminationDate : LocalDate.now());
        leaseMapper.update(lease);
        
        // Update property status to available
        Property property = propertyMapper.findById(lease.getPropertyId());
        if (property == null) {
            throw new RuntimeException("房源不存在");
        }
        property.setStatus(Property.PropertyStatus.空闲);
        propertyMapper.update(property);
        
        return lease;
    }
    
    public List<Lease> getActiveLeases(String landlordId) {
        return leaseMapper.findByLandlordIdAndStatus(landlordId, Lease.LeaseStatus.生效中.name());
    }
    
    public List<Lease> getExpiringLeases(String landlordId) {
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        return leaseMapper.findExpiringLeases(landlordId, thirtyDaysFromNow);
    }
    
    public long getActiveLeaseCount(String landlordId) {
        return leaseMapper.countByLandlordIdAndStatus(landlordId, Lease.LeaseStatus.生效中.name());
    }
}
