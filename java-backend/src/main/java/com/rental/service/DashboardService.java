package com.rental.service;

import com.rental.mapper.BillMapper;
import com.rental.mapper.LeaseMapper;
import com.rental.mapper.PropertyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final PropertyMapper propertyMapper;
    private final LeaseMapper leaseMapper;
    private final BillMapper billMapper;

    public Map<String, Object> getStatistics(String landlordId) {
        Map<String, Object> stats = new HashMap<>();

        long totalProperties = propertyMapper.countByLandlordId(landlordId);
        long rentedProperties = propertyMapper.countByLandlordIdAndStatus(landlordId, "已出租");
        long activeLeases = leaseMapper.countByLandlordIdAndStatus(landlordId, "生效中");

        BigDecimal monthlyIncome = billMapper.sumPaidAmountByLandlordIdAndMonth(
            landlordId,
            LocalDate.now().getYear(),
            LocalDate.now().getMonthValue()
        );

        stats.put("totalProperties", totalProperties);
        stats.put("rentedProperties", rentedProperties);
        stats.put("activeLeases", activeLeases);
        stats.put("monthlyIncome", monthlyIncome != null ? monthlyIncome : BigDecimal.ZERO);

        return stats;
    }
}