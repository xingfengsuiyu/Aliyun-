package com.rental.service;

import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;
import com.rental.entity.Property;
import com.rental.mapper.PropertyMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PropertyService {
    
    private final PropertyMapper propertyMapper;
    
    @Transactional
    public Property createProperty(Property property) {
        if (!StringUtils.hasText(property.getId())) {
            property.setId(UUID.randomUUID().toString());
        }
        if (property.getDecoration() == null) {
            property.setDecoration(Property.Decoration.简装);
        }
        if (property.getOrientation() == null) {
            property.setOrientation(Property.Orientation.南);
        }
        property.setStatus(Property.PropertyStatus.空闲);
        propertyMapper.insert(property);
        
        // Insert facilities
        if (property.getFacilities() != null && !property.getFacilities().isEmpty()) {
            for (String facility : property.getFacilities()) {
                propertyMapper.insertFacility(property.getId(), facility);
            }
        }
        
        // Insert images
        if (property.getImages() != null && !property.getImages().isEmpty()) {
            for (String image : property.getImages()) {
                propertyMapper.insertImage(property.getId(), image);
            }
        }
        
        return property;
    }
    
    public PageInfo<Property> getPropertiesByLandlord(String landlordId, int page, int size) {
        PageHelper.startPage(page, size);
        List<Property> list = propertyMapper.findByLandlordId(landlordId);
        return new PageInfo<>(list);
    }
    
    public PageInfo<Property> searchProperties(String landlordId, String name,
                                              String status, String propertyType,
                                              int page, int size) {
        PageHelper.startPage(page, size);
        Property.PropertyStatus statusEnum = null;
        Property.PropertyType propertyTypeEnum = null;
        if (status != null && !status.isEmpty()) {
            try {
                statusEnum = Property.PropertyStatus.valueOf(status);
            } catch (IllegalArgumentException e) {
            }
        }
        if (propertyType != null && !propertyType.isEmpty()) {
            try {
                propertyTypeEnum = Property.PropertyType.valueOf(propertyType);
            } catch (IllegalArgumentException e) {
            }
        }
        String statusStr = (statusEnum == null) ? null : statusEnum.name();
        String propertyTypeStr = (propertyTypeEnum == null) ? null : propertyTypeEnum.name();
        List<Property> list = propertyMapper.searchProperties(landlordId, name,
            statusStr,
            propertyTypeStr);
        return new PageInfo<>(list);
    }
    
    public Property getPropertyById(String id, String landlordId) {
        Property property = propertyMapper.findById(id);
        if (property == null || !property.getLandlordId().equals(landlordId)) {
            throw new RuntimeException("房源不存在");
        }
        return property;
    }
    
    @Transactional
    public Property updateProperty(String id, String landlordId, Property updates) {
        Property property = getPropertyById(id, landlordId);
        
        // Update main fields
        property.setName(updates.getName());
        property.setAddress(updates.getAddress());
        property.setPropertyType(updates.getPropertyType());
        property.setLayout(updates.getLayout());
        property.setArea(updates.getArea());
        property.setDecoration(updates.getDecoration());
        property.setOrientation(updates.getOrientation());
        property.setTotalFloors(updates.getTotalFloors());
        property.setCurrentFloor(updates.getCurrentFloor());
        property.setFloor(updates.getFloor());
        property.setRent(updates.getRent());
        property.setDeposit(updates.getDeposit());
        property.setDepositMode(updates.getDepositMode());
        property.setAvailableFrom(updates.getAvailableFrom());
        property.setMinLeaseTerm(updates.getMinLeaseTerm());
        property.setAllowPets(updates.getAllowPets());
        property.setAllowSublet(updates.getAllowSublet());
        
        // Update main table
        propertyMapper.update(property);
        
        // Update facilities (delete old, insert new)
        if (updates.getFacilities() != null) {
            propertyMapper.deleteFacilities(id);
            for (String facility : updates.getFacilities()) {
                propertyMapper.insertFacility(id, facility);
            }
        }
        
        // Update images (delete old, insert new)
        if (updates.getImages() != null) {
            propertyMapper.deleteImages(id);
            for (String image : updates.getImages()) {
                propertyMapper.insertImage(id, image);
            }
        }
        
        return propertyMapper.findById(id);
    }
    
    @Transactional
    public void deleteProperty(String id, String landlordId) {
        Property property = getPropertyById(id, landlordId);

        if ("已出租".equals(property.getStatus())) {
            throw new RuntimeException("已出租的房源不能删除，请先终止租约");
        }
        if ("维护中".equals(property.getStatus())) {
            throw new RuntimeException("维护中的房源不能删除");
        }

        // Delete related data first
        propertyMapper.deleteFacilities(id);
        propertyMapper.deleteImages(id);
        propertyMapper.delete(id);
    }
    
    @Transactional
    public Property updateStatus(String id, String landlordId, 
                                Property.PropertyStatus status,
                                String maintenanceReason,
                                java.time.LocalDate expectedAvailableDate) {
        Property property = getPropertyById(id, landlordId);
        property.setStatus(status);
        
        if ("维护中".equals(status)) {
            property.setMaintenanceReason(maintenanceReason);
            property.setExpectedAvailableDate(expectedAvailableDate);
        } else {
            property.setMaintenanceReason(null);
            property.setExpectedAvailableDate(null);
        }
        
        propertyMapper.update(property);
        return propertyMapper.findById(id);
    }
    
    public long getTotalProperties(String landlordId) {
        return propertyMapper.countByLandlordId(landlordId);
    }
    
    public long getRentedProperties(String landlordId) {
        return propertyMapper.countByLandlordIdAndStatus(landlordId, "已出租");
    }

    @Transactional
    public List<Property> batchCreateProperties(List<Map<String, Object>> paramsList, String landlordId) {
        List<Property> created = new ArrayList<>();
        for (Map<String, Object> params : paramsList) {
            Property property = parsePropertyFromMap(params);
            property.setId(UUID.randomUUID().toString());
            property.setLandlordId(landlordId);
            if (property.getDecoration() == null) {
                property.setDecoration(Property.Decoration.简装);
            }
            if (property.getOrientation() == null) {
                property.setOrientation(Property.Orientation.南);
            }
            if (property.getStatus() == null) {
                property.setStatus(Property.PropertyStatus.空闲);
            }
            propertyMapper.insert(property);
            if (property.getFacilities() != null && !property.getFacilities().isEmpty()) {
                for (String facility : property.getFacilities()) {
                    propertyMapper.insertFacility(property.getId(), facility);
                }
            }
            if (property.getImages() != null && !property.getImages().isEmpty()) {
                for (String image : property.getImages()) {
                    propertyMapper.insertImage(property.getId(), image);
                }
            }
            created.add(property);
        }
        return created;
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
        property.setRoomNumber((String) map.get("roomNumber"));
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

        @SuppressWarnings("unchecked")
        List<String> images = (List<String>) map.get("images");
        property.setImages(images);

        return property;
    }

    @Transactional
    public List<Property> batchUpdateProperties(List<Map<String, Object>> paramsList, String landlordId) {
        List<Property> updated = new ArrayList<>();
        for (Map<String, Object> params : paramsList) {
            String id = (String) params.get("id");
            Property property = getPropertyById(id, landlordId);

            Object nameObj = params.get("name");
            if (nameObj != null) property.setName((String) nameObj);

            Object addressObj = params.get("address");
            if (addressObj != null) property.setAddress((String) addressObj);

            Object typeObj = params.get("propertyType");
            if (typeObj != null && typeObj instanceof String) {
                String typeStr = (String) typeObj;
                for (Property.PropertyType type : Property.PropertyType.values()) {
                    if (type.getValue().equals(typeStr)) {
                        property.setPropertyType(type);
                        break;
                    }
                }
            }

            Object statusObj = params.get("status");
            if (statusObj != null && statusObj instanceof String) {
                String statusStr = (String) statusObj;
                for (Property.PropertyStatus status : Property.PropertyStatus.values()) {
                    if (status.getValue().equals(statusStr)) {
                        property.setStatus(status);
                        break;
                    }
                }
            }

            Object areaObj = params.get("area");
            if (areaObj != null) property.setArea(new BigDecimal(areaObj.toString()));

            Object rentObj = params.get("rent");
            if (rentObj != null) property.setRent(new BigDecimal(rentObj.toString()));

            Object depositObj = params.get("deposit");
            if (depositObj != null) property.setDeposit(new BigDecimal(depositObj.toString()));

            Object floorObj = params.get("floor");
            if (floorObj != null) property.setFloor(floorObj.toString());

            propertyMapper.update(property);

            Object facilitiesObj = params.get("facilities");
            if (facilitiesObj != null) {
                @SuppressWarnings("unchecked")
                List<String> facilities = (List<String>) facilitiesObj;
                propertyMapper.deleteFacilities(id);
                for (String facility : facilities) {
                    propertyMapper.insertFacility(id, facility);
                }
            }

            updated.add(property);
        }
        return updated;
    }
}
