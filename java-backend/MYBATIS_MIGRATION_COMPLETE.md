# MyBatis Migration - Completed Summary

## ✅ 已完成的工作

### 1. 依赖配置 (pom.xml)
- ✅ 移除 JPA 和 Flyway 依赖
- ✅ 添加 MyBatis Spring Boot Starter 3.0.3
- ✅ 添加 PageHelper 分页插件 2.1.0

### 2. 配置文件 (application.yml)
- ✅ 添加 MyBatis 配置
  - mapper-locations: classpath:mapper/*.xml
  - type-aliases-package: com.rental.model
  - map-underscore-to-camel-case: true
- ✅ 添加 PageHelper 分页配置

### 3. 主应用类
- ✅ 移除 @EnableJpaAuditing
- ✅ 添加 @MapperScan("com.rental.mapper")

### 4. 数据库架构
- ✅ 创建完整的 SQL 初始化脚本: `schema.sql`
- ✅ 包含所有8个核心表:
  - landlords (房东表)
  - properties (房源表)
  - property_facilities (房源设施表)
  - property_images (房源图片表)
  - tenants (租客表)
  - tenant_id_photos (租客身份证照片表)
  - leases (租约表)
  - lease_attachments (租约附件表)
  - bills (账单表)
  - messages (消息表)
  - settings (系统配置表)

### 5. 实体类简化
所有实体类已移除JPA注解,保留为简洁的POJO:
- ✅ Landlord.java
- ✅ Property.java  
- ✅ Tenant.java
- ✅ Lease.java
- ✅ Bill.java
- ✅ Message.java

### 6. MyBatis Mapper 接口 (已完成全部6个)

#### ✅ LandlordMapper.java
```java
- findByAccount(String account)
- findByPhone(String phone)
- findByEmail(String email)
- insert(Landlord landlord)
- update(Landlord landlord)
- updatePassword(String id, String password)
```

#### ✅ PropertyMapper.java
```java
- findById(String id) - 含关联查询(设施、图片)
- findFacilities(String propertyId)
- findImages(String propertyId)
- insert(Property property)
- insertFacility(propertyId, facility)
- insertImage(propertyId, imageUrl)
- update(Property property)
- deleteFacilities(String propertyId)
- deleteImages(String propertyId)
- delete(String id)
- findByLandlordId(String landlordId)
- searchProperties(landlordId, name, status, propertyType) - 动态SQL
- countByLandlordId(String landlordId)
- countByLandlordIdAndStatus(landlordId, status)
```

#### ✅ TenantMapper.java
```java
- findById(String id) - 含关联查询(身份证照片)
- findIdPhotos(String tenantId)
- findByIdCard(String idCard)
- findByPhone(String phone)
- insert(Tenant tenant)
- insertIdPhoto(tenantId, photoUrl)
- update(Tenant tenant)
- findByLandlordId(String landlordId)
- countByLandlordId(String landlordId)
- existsByIdCard(String idCard)
- existsByPhone(String phone)
```

#### ✅ LeaseMapper.java
```java
- findById(String id) - 含关联查询(附件)
- findAttachments(String leaseId)
- insert(Lease lease)
- insertAttachment(leaseId, attachmentUrl)
- update(Lease lease)
- findByLandlordId(String landlordId)
- searchLeases(landlordId, status, tenantId, propertyId) - 动态SQL
- findByLandlordIdAndStatus(landlordId, status)
- findExpiringLeases(LocalDate date)
- countByLandlordIdAndStatus(landlordId, status)
```

#### ✅ BillMapper.java
```java
- findById(String id)
- insert(Bill bill)
- update(Bill bill)
- recordPayment(Bill bill)
- findByLandlordId(String landlordId)
- searchBills(landlordId, status, billType, tenantId, leaseId) - 动态SQL
- findOverdueBills(LocalDate today)
- findByLeaseId(String leaseId)
- findByTenantId(String tenantId)
- sumPaidAmountByLandlordId(String landlordId)
- sumPendingAmountByLandlordId(String landlordId)
- countByLandlordIdAndStatus(landlordId, status)
```

#### ✅ MessageMapper.java
```java
- findById(String id)
- insert(Message message)
- update(Message message)
- findByLandlordIdAndTenantId(landlordId, tenantId)
- findByLandlordId(String landlordId)
- findByTenantId(String tenantId)
- countUnreadMessages(landlordId, tenantId)
- markAllAsRead(landlordId, tenantId)
```

### 7. Service 层更新

#### ✅ AuthService.java (已更新)
```java
// Before (JPA)
private final LandlordRepository landlordRepository;
Landlord landlord = landlordRepository.findByAccount(account)
    .orElseThrow(() -> new RuntimeException("账号不存在"));
landlordRepository.save(landlord);

// After (MyBatis)
private final LandlordMapper landlordMapper;
Landlord landlord = landlordMapper.findByAccount(account);
if (landlord == null) {
    throw new RuntimeException("账号不存在");
}
landlordMapper.update(landlord);
```

## ⏳ 待完成的工作

### 1. 剩余 Service 类更新 (4个)

需要更新以下Service类,将Repository调用改为Mapper调用:

#### PropertyService.java
```java
// 需要更改:
private final PropertyMapper propertyMapper;  // 替换 PropertyRepository

// createProperty 方法:
propertyMapper.insert(property);
// 批量插入设施
for (String facility : property.getFacilities()) {
    propertyMapper.insertFacility(property.getId(), facility);
}
// 批量插入图片
for (String image : property.getImages()) {
    propertyMapper.insertImage(property.getId(), image);
}

// 使用 PageHelper 分页:
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;

public PageInfo<Property> getProperties(String landlordId, int page, int size) {
    PageHelper.startPage(page, size);
    List<Property> list = propertyMapper.findByLandlordId(landlordId);
    return new PageInfo<>(list);
}
```

#### TenantService.java
```java
private final TenantMapper tenantMapper;  // 替换 TenantRepository

// 创建租客时插入身份证照片
tenantMapper.insert(tenant);
for (String photo : tenant.getIdCardPhotos()) {
    tenantMapper.insertIdPhoto(tenant.getId(), photo);
}

// 检查唯一性
if (tenantMapper.existsByIdCard(idCard)) {
    throw new RuntimeException("身份证号已存在");
}
```

#### LeaseService.java
```java
private final LeaseMapper leaseMapper;  // 替换 LeaseRepository
private final PropertyMapper propertyMapper;  // 需要添加
private final TenantMapper tenantMapper;  // 需要添加

// 创建租约时的状态同步
@Transactional
public Lease createLease(Lease lease) {
    leaseMapper.insert(lease);
    // 更新房源状态
    Property property = propertyMapper.findById(lease.getPropertyId());
    property.setStatus("已出租");
    propertyMapper.update(property);
    // 更新租客关联房源
    tenantMapper.update(tenant);
    return lease;
}
```

#### BillService.java
```java
private final BillMapper billMapper;  // 替换 BillRepository
private final LeaseMapper leaseMapper;  // 替换 LeaseRepository

// 定时任务生成账单
@Scheduled(cron = "0 0 */6 * * *")
@Transactional
public void generateBills() {
    List<Lease> activeLeases = leaseMapper.findByLandlordIdAndStatus(null, "生效中");
    for (Lease lease : activeLeases) {
        Bill bill = Bill.builder()
            .landlordId(lease.getLandlordId())
            .leaseId(lease.getId())
            .billType(Bill.BillType.租金)
            .amount(lease.getRent())
            .dueDate(nextDueDate)
            .status(Bill.BillStatus.待支付)
            .build();
        billMapper.insert(bill);
    }
}

// 统计收入
public BigDecimal getTotalIncome(String landlordId) {
    return billMapper.sumPaidAmountByLandlordId(landlordId);
}
```

### 2. Controller 层无需更改
Controller层不需要修改,因为它们调用的是Service层,Service接口保持不变。

## 📊 迁移对比

### JPA vs MyBatis 代码对比

#### Repository/Mapper 定义

**JPA (Before):**
```java
public interface PropertyRepository extends JpaRepository<Property, String> {
    List<Property> findByLandlordId(String landlordId);
    
    @Query("SELECT p FROM Property p WHERE p.landlordId = :landlordId " +
           "AND (:name IS NULL OR p.name LIKE %:name%) " +
           "AND (:status IS NULL OR p.status = :status)")
    Page<Property> search(@Param("landlordId") String landlordId,
                         @Param("name") String name,
                         @Param("status") String status,
                         Pageable pageable);
}
```

**MyBatis (After):**
```java
@Mapper
public interface PropertyMapper {
    @Select("SELECT * FROM properties WHERE landlord_id = #{landlordId}")
    @Results({
        @Result(property = "facilities", column = "id", 
                many = @Many(select = "findFacilities")),
        @Result(property = "images", column = "id", 
                many = @Many(select = "findImages"))
    })
    List<Property> findByLandlordId(String landlordId);
    
    @Select("<script>" +
            "SELECT * FROM properties WHERE landlord_id = #{landlordId} " +
            "<if test='name != null'>AND name LIKE CONCAT('%', #{name}, '%') </if>" +
            "<if test='status != null'>AND status = #{status} </if>" +
            "ORDER BY created_at DESC" +
            "</script>")
    List<Property> searchProperties(@Param("landlordId") String landlordId,
                                   @Param("name") String name,
                                   @Param("status") String status);
}
```

#### Service 调用

**JPA (Before):**
```java
@Service
public class PropertyService {
    private final PropertyRepository propertyRepository;
    
    public Page<Property> getProperties(String landlordId, Pageable pageable) {
        return propertyRepository.findByLandlordId(landlordId, pageable);
    }
    
    public Property createProperty(Property property) {
        return propertyRepository.save(property);
    }
}
```

**MyBatis (After):**
```java
@Service
public class PropertyService {
    private final PropertyMapper propertyMapper;
    
    public PageInfo<Property> getProperties(String landlordId, int page, int size) {
        PageHelper.startPage(page, size);
        List<Property> list = propertyMapper.findByLandlordId(landlordId);
        return new PageInfo<>(list);
    }
    
    public Property createProperty(Property property) {
        propertyMapper.insert(property);
        // 插入关联数据
        if (property.getFacilities() != null) {
            for (String facility : property.getFacilities()) {
                propertyMapper.insertFacility(property.getId(), facility);
            }
        }
        return property;
    }
}
```

## 🎯 关键变更点

### 1. 分页处理
```java
// JPA
Pageable pageable = PageRequest.of(page, size);
Page<Property> result = repository.findAll(pageable);

// MyBatis
PageHelper.startPage(page, size);
List<Property> list = mapper.findAll();
PageInfo<Property> result = new PageInfo<>(list);
```

### 2. 保存/更新
```java
// JPA
entity = repository.save(entity);

// MyBatis
mapper.insert(entity);  // 或 mapper.update(entity)
// 注意: MyBatis不会自动返回更新后的实体
```

### 3. 关联查询
```java
// JPA - 自动加载
@OneToMany(mappedBy = "property")
private List<Image> images;

// MyBatis - 手动配置
@Result(property = "images", column = "id", 
        many = @Many(select = "findImages"))
```

### 4. 空值检查
```java
// JPA - Optional
Optional<Entity> opt = repository.findById(id);
Entity entity = opt.orElseThrow(() -> new RuntimeException("Not found"));

// MyBatis - null check
Entity entity = mapper.findById(id);
if (entity == null) {
    throw new RuntimeException("Not found");
}
```

## 📝 下一步建议

1. **更新剩余4个Service类** (PropertyService, TenantService, LeaseService, BillService)
2. **测试所有API接口** 确保功能正常
3. **优化复杂查询** 可考虑使用XML Mapper替代注解方式
4. **添加二级缓存** 如需提升性能可配置MyBatis缓存

## 🚀 快速开始

```bash
# 1. 执行数据库初始化
mysql -u root -p < src/main/resources/schema.sql

# 2. 编译项目
mvn clean compile

# 3. 运行应用
mvn spring-boot:run
```

所有Mapper接口已创建完成,AuthService已更新为示例。其余Service的更新遵循相同模式。
