package com.rental.controller;

import com.rental.dto.ApiResponse;
import com.rental.entity.Property;
import com.rental.service.PropertyService;
import lombok.RequiredArgsConstructor;
import com.github.pagehelper.PageInfo;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/properties")
@RequiredArgsConstructor
public class PropertyController {

    private final PropertyService propertyService;

    @PostMapping
    public ApiResponse<Property> createProperty(@RequestBody Map<String, Object> params, Authentication auth) {
        Property property = parsePropertyFromMap(params);
        property.setLandlordId(auth.getName());
        return ApiResponse.success(propertyService.createProperty(property));
    }

    @PostMapping("/list")
    public ApiResponse<PageInfo<Property>> getProperties(@RequestBody Map<String, Object> params, Authentication auth) {
        int page = params.containsKey("page") ? (int) params.get("page") : 0;
        int size = params.containsKey("size") ? (int) params.get("size") : 10;
        String status = (String) params.get("status");
        String propertyType = (String) params.get("propertyType");
        String name = (String) params.get("name");
        return ApiResponse.success(propertyService.searchProperties(auth.getName(), name, status, propertyType, page, size));
    }

    @PostMapping("/get")
    public ApiResponse<Property> getProperty(@RequestBody Map<String, String> params, Authentication auth) {
        String id = params.get("id");
        return ApiResponse.success(propertyService.getPropertyById(id, auth.getName()));
    }

    @PostMapping("/update")
    public ApiResponse<Property> updateProperty(@RequestBody Map<String, Object> params, Authentication auth) {
        String id = (String) params.get("id");
        @SuppressWarnings("unchecked")
        Map<String, Object> propertyMap = (Map<String, Object>) params.get("property");
        Property property = parsePropertyFromMap(propertyMap);
        return ApiResponse.success(propertyService.updateProperty(id, auth.getName(), property));
    }

    private Property parsePropertyFromMap(Map<String, Object> map) {
        Property property = new Property();
        property.setName((String) map.get("name"));

        Object typeObj = map.get("propertyType");
        if (typeObj != null && typeObj instanceof String) {
            String typeStr = (String) typeObj;
            for (Property.PropertyType type : Property.PropertyType.values()) {
                if (type.getValue().equals(typeStr)) {
                    property.setPropertyType(type);
                    break;
                }
            }
        }

        Object statusObj = map.get("status");
        if (statusObj != null && statusObj instanceof String) {
            String statusStr = (String) statusObj;
            for (Property.PropertyStatus status : Property.PropertyStatus.values()) {
                if (status.getValue().equals(statusStr)) {
                    property.setStatus(status);
                    break;
                }
            }
        }

        property.setAddress((String) map.get("address"));

        Object orientationObj = map.get("orientation");
        if (orientationObj != null && orientationObj instanceof String) {
            String orientStr = (String) orientationObj;
            for (Property.Orientation orient : Property.Orientation.values()) {
                if (orient.getValue().equals(orientStr)) {
                    property.setOrientation(orient);
                    break;
                }
            }
        }

        Object decorationObj = map.get("decoration");
        if (decorationObj != null && decorationObj instanceof String) {
            String decorStr = (String) decorationObj;
            for (Property.Decoration decor : Property.Decoration.values()) {
                if (decor.getValue().equals(decorStr)) {
                    property.setDecoration(decor);
                    break;
                }
            }
        }

        if (map.get("area") != null) {
            property.setArea(new BigDecimal(map.get("area").toString()));
        }
        if (map.get("currentFloor") != null && !map.get("currentFloor").toString().isEmpty()) {
            property.setCurrentFloor(Integer.parseInt(map.get("currentFloor").toString()));
        }
        if (map.get("totalFloors") != null && !map.get("totalFloors").toString().isEmpty()) {
            property.setTotalFloors(Integer.parseInt(map.get("totalFloors").toString()));
        }
        if (map.get("floor") != null && !map.get("floor").toString().isEmpty()) {
            property.setFloor(map.get("floor").toString());
        }
        if (map.get("rent") != null) {
            property.setRent(new BigDecimal(map.get("rent").toString()));
        }
        if (map.get("deposit") != null) {
            property.setDeposit(new BigDecimal(map.get("deposit").toString()));
        }
        property.setDepositMode((String) map.get("depositMode"));
        if (map.get("availableFrom") != null) {
            property.setAvailableFrom(java.time.LocalDate.parse((String) map.get("availableFrom")));
        }
        property.setMinLeaseTerm((Integer) map.get("minLeaseTerm"));
        property.setAllowPets((Boolean) map.get("allowPets"));
        property.setAllowSublet((Boolean) map.get("allowSublet"));
        property.setLayout((String) map.get("layout"));
        property.setDescription((String) map.get("description"));

        @SuppressWarnings("unchecked")
        List<String> facilities = (List<String>) map.get("facilities");
        property.setFacilities(facilities);

        return property;
    }

    @PostMapping("/delete")
    public ApiResponse<Void> deleteProperty(@RequestBody Map<String, String> params, Authentication auth) {
        String id = params.get("id");
        propertyService.deleteProperty(id, auth.getName());
        return ApiResponse.success(null);
    }

    @PostMapping("/status")
    public ApiResponse<Property> updateStatus(@RequestBody Map<String, Object> params, Authentication auth) {
        String id = (String) params.get("id");
        String status = (String) params.get("status");
        String maintenanceReason = (String) params.get("maintenanceReason");
        java.time.LocalDate expectedAvailableDate = params.containsKey("expectedAvailableDate")
            ? java.time.LocalDate.parse((String) params.get("expectedAvailableDate"))
            : null;
        Property.PropertyStatus statusEnum = null;
        for (Property.PropertyStatus s : Property.PropertyStatus.values()) {
            if (s.getValue().equals(status)) {
                statusEnum = s;
                break;
            }
        }
        return ApiResponse.success(propertyService.updateStatus(id, auth.getName(), statusEnum, maintenanceReason, expectedAvailableDate));
    }

    @PostMapping("/batch/create")
    public ApiResponse<List<Property>> batchCreateProperties(@RequestBody List<Map<String, Object>> paramsList, Authentication auth) {
        List<Property> created = propertyService.batchCreateProperties(paramsList, auth.getName());
        return ApiResponse.success(created);
    }

    @PostMapping("/batch/update")
    public ApiResponse<List<Property>> batchUpdateProperties(@RequestBody List<Map<String, Object>> paramsList, Authentication auth) {
        List<Property> updated = propertyService.batchUpdateProperties(paramsList, auth.getName());
        return ApiResponse.success(updated);
    }
}