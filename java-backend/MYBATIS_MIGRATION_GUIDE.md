# MyBatis Migration Guide - JPA to MyBatis

## 已完成的更改 ✅

### 1. pom.xml 更新
- ❌ 移除: `spring-boot-starter-data-jpa`
- ❌ 移除: `flyway-core`, `flyway-mysql`
- ✅ 添加: `mybatis-spring-boot-starter` (3.0.3)
- ✅ 添加: `pagehelper-spring-boot-starter` (2.1.0) - 用于分页

### 2. application.yml 更新
```yaml
# 移除 JPA 配置
# jpa:
#   hibernate:
#     ddl-auto: update

# 添加 MyBatis 配置
mybatis:
  mapper-locations: classpath:mapper/*.xml
  type-aliases-package: com.rental.model
  configuration:
    map-underscore-to-camel-case: true  # 自动转换下划线到驼峰命名
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl

# PageHelper 分页配置
pagehelper:
  helper-dialect: mysql
  reasonable: true
  support-methods-arguments: true
```

### 3. 主应用类更新
```java
// 移除
// @EnableJpaAuditing

// 添加
@MapperScan("com.rental.mapper")
```

### 4. 数据库Schema
创建了完整的SQL初始化脚本: `src/main/resources/schema.sql`
包含所有表结构和索引定义。

### 5. 实体类简化
移除了所有JPA注解:
- ❌ `@Entity`, `@Table`, `@Column`, `@Id`, `@GeneratedValue`
- ❌ `@OneToMany`, `@ManyToOne`, `@ElementCollection`
- ❌ `@EntityListeners`, `@CreatedDate`, `@LastModifiedDate`

保留简化后的POJO类,只使用Lombok注解:
- ✅ `@Data`, `@NoArgsConstructor`, `@AllArgsConstructor`, `@Builder`

### 6. Mapper接口示例

创建了 `LandlordMapper.java` 示例:

```java
@Repository
@Mapper
public interface LandlordMapper {
    
    @Select("SELECT * FROM landlords WHERE account = #{account}")
    Landlord findByAccount(@Param("account") String account);
    
    @Insert("INSERT INTO landlords(...) VALUES(...)")
    int insert(Landlord landlord);
    
    @Update("UPDATE landlords SET ... WHERE id = #{id}")
    int update(Landlord landlord);
}
```

## 需要继续完成的工作

### 1. 创建其余Mapper接口

需要为以下实体创建Mapper:

#### PropertyMapper.java
```java
@Mapper
public interface PropertyMapper {
    
    @Select("SELECT * FROM properties WHERE id = #{id}")
    @Results({
        @Result(property = "facilities", column = "id", 
                many = @Many(select = "findFacilitiesByPropertyId")),
        @Result(property = "images", column = "id", 
                many = @Many(select = "findImagesByPropertyId"))
    })
    Property findById(String id);
    
    @Select("SELECT facility FROM property_facilities WHERE property_id = #{propertyId}")
    List<String> findFacilitiesByPropertyId(String propertyId);
    
    @Select("SELECT image_url FROM property_images WHERE property_id = #{propertyId}")
    List<String> findImagesByPropertyId(String propertyId);
    
    @Insert("INSERT INTO properties(...) VALUES(...)")
    int insert(Property property);
    
    @Update("UPDATE properties SET ... WHERE id = #{id}")
    int update(Property property);
    
    @Delete("DELETE FROM properties WHERE id = #{id}")
    int delete(String id);
    
    @Select("SELECT * FROM properties WHERE landlord_id = #{landlordId} " +
            "ORDER BY created_at DESC")
    List<Property> findByLandlordId(String landlordId);
}
```

#### TenantMapper.java
```java
@Mapper
public interface TenantMapper {
    
    @Select("SELECT * FROM tenants WHERE id = #{id}")
    Tenant findById(String id);
    
    @Select("SELECT * FROM tenants WHERE id_card = #{idCard}")
    Tenant findByIdCard(String idCard);
    
    @Select("SELECT * FROM tenants WHERE phone = #{phone}")
    Tenant findByPhone(String phone);
    
    @Insert("INSERT INTO tenants(...) VALUES(...)")
    int insert(Tenant tenant);
    
    @Update("UPDATE tenants SET ... WHERE id = #{id}")
    int update(Tenant tenant);
}
```

#### LeaseMapper.java
```java
@Mapper
public interface LeaseMapper {
    
    @Select("SELECT * FROM leases WHERE id = #{id}")
    Lease findById(String id);
    
    @Insert("INSERT INTO leases(...) VALUES(...)")
    int insert(Lease lease);
    
    @Update("UPDATE leases SET ... WHERE id = #{id}")
    int update(Lease lease);
    
    @Select("SELECT * FROM leases WHERE landlord_id = #{landlordId} " +
            "AND status = #{status}")
    List<Lease> findByLandlordIdAndStatus(
        @Param("landlordId") String landlordId, 
        @Param("status") String status);
}
```

#### BillMapper.java
```java
@Mapper
public interface BillMapper {
    
    @Select("SELECT * FROM bills WHERE id = #{id}")
    Bill findById(String id);
    
    @Insert("INSERT INTO bills(...) VALUES(...)")
    int insert(Bill bill);
    
    @Update("UPDATE bills SET ... WHERE id = #{id}")
    int update(Bill bill);
    
    @Select("SELECT SUM(paid_amount) FROM bills " +
            "WHERE landlord_id = #{landlordId} AND status = '已支付'")
    BigDecimal sumPaidAmountByLandlordId(String landlordId);
}
```

### 2. 或使用XML Mapper文件

对于复杂查询,推荐使用XML方式:

创建 `src/main/resources/mapper/PropertyMapper.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">

<mapper namespace="com.rental.mapper.PropertyMapper">
    
    <resultMap id="PropertyResultMap" type="com.rental.entity.Property">
        <id property="id" column="id"/>
        <result property="landlordId" column="landlord_id"/>
        <result property="name" column="name"/>
        <result property="address" column="address"/>
        <result property="propertyType" column="property_type"/>
        <result property="layout" column="layout"/>
        <result property="area" column="area"/>
        <result property="decoration" column="decoration"/>
        <result property="orientation" column="orientation"/>
        <result property="totalFloors" column="total_floors"/>
        <result property="currentFloor" column="current_floor"/>
        <result property="rent" column="rent"/>
        <result property="deposit" column="deposit"/>
        <result property="depositMode" column="deposit_mode"/>
        <result property="availableFrom" column="available_from"/>
        <result property="minLeaseTerm" column="min_lease_term"/>
        <result property="allowPets" column="allow_pets"/>
        <result property="allowSublet" column="allow_sublet"/>
        <result property="status" column="status"/>
        <result property="maintenanceReason" column="maintenance_reason"/>
        <result property="expectedAvailableDate" column="expected_available_date"/>
        <result property="createdAt" column="created_at"/>
        <result property="updatedAt" column="updated_at"/>
        
        <collection property="facilities" 
                    ofType="string"
                    select="findFacilitiesByPropertyId" 
                    column="id"/>
        <collection property="images" 
                    ofType="string"
                    select="findImagesByPropertyId" 
                    column="id"/>
    </resultMap>
    
    <select id="findById" resultMap="PropertyResultMap">
        SELECT * FROM properties WHERE id = #{id}
    </select>
    
    <select id="findFacilitiesByPropertyId" resultType="string">
        SELECT facility FROM property_facilities WHERE property_id = #{id}
    </select>
    
    <select id="findImagesByPropertyId" resultType="string">
        SELECT image_url FROM property_images WHERE property_id = #{id}
    </select>
    
    <select id="findByLandlordId" resultMap="PropertyResultMap">
        SELECT * FROM properties 
        WHERE landlord_id = #{landlordId}
        ORDER BY created_at DESC
    </select>
    
    <select id="searchProperties" resultMap="PropertyResultMap">
        SELECT * FROM properties 
        WHERE landlord_id = #{landlordId}
        <if test="name != null">
            AND name LIKE CONCAT('%', #{name}, '%')
        </if>
        <if test="status != null">
            AND status = #{status}
        </if>
        <if test="propertyType != null">
            AND property_type = #{propertyType}
        </if>
        ORDER BY created_at DESC
    </select>
    
    <insert id="insert" parameterType="com.rental.entity.Property">
        INSERT INTO properties(
            id, landlord_id, name, address, property_type, layout, area,
            decoration, orientation, total_floors, current_floor, rent,
            deposit, deposit_mode, available_from, min_lease_term,
            allow_pets, allow_sublet, status, created_at, updated_at
        ) VALUES(
            #{id}, #{landlordId}, #{name}, #{address}, #{propertyType},
            #{layout}, #{area}, #{decoration}, #{orientation},
            #{totalFloors}, #{currentFloor}, #{rent}, #{deposit},
            #{depositMode}, #{availableFrom}, #{minLeaseTerm},
            #{allowPets}, #{allowSublet}, #{status}, NOW(), NOW()
        )
    </insert>
    
    <update id="update" parameterType="com.rental.entity.Property">
        UPDATE properties SET
            name = #{name},
            address = #{address},
            property_type = #{propertyType},
            layout = #{layout},
            area = #{area},
            decoration = #{decoration},
            orientation = #{orientation},
            total_floors = #{totalFloors},
            current_floor = #{currentFloor},
            rent = #{rent},
            deposit = #{deposit},
            deposit_mode = #{depositMode},
            available_from = #{availableFrom},
            min_lease_term = #{minLeaseTerm},
            allow_pets = #{allowPets},
            allow_sublet = #{allowSublet},
            status = #{status},
            maintenance_reason = #{maintenanceReason},
            expected_available_date = #{expectedAvailableDate},
            updated_at = NOW()
        WHERE id = #{id}
    </update>
    
    <delete id="delete">
        DELETE FROM properties WHERE id = #{id}
    </delete>
    
</mapper>
```

### 3. 更新Service层

将Repository调用改为Mapper调用:

#### Before (JPA):
```java
@Service
public class PropertyService {
    private final PropertyRepository propertyRepository;
    
    public Property createProperty(Property property) {
        return propertyRepository.save(property);
    }
}
```

#### After (MyBatis):
```java
@Service
public class PropertyService {
    private final PropertyMapper propertyMapper;
    
    public Property createProperty(Property property) {
        propertyMapper.insert(property);
        return property;
    }
    
    public Page<Property> getPropertiesByLandlord(String landlordId, int page, int size) {
        // 使用PageHelper
        PageHelper.startPage(page, size);
        List<Property> list = propertyMapper.findByLandlordId(landlordId);
        return new PageImpl<>(list);
    }
}
```

### 4. 分页处理

使用PageHelper替代Spring Data的Pageable:

```java
import com.github.pagehelper.PageHelper;
import com.github.pagehelper.PageInfo;

// 在Service方法中
public PageInfo<Property> getProperties(String landlordId, int page, int size) {
    PageHelper.startPage(page, size);
    List<Property> list = propertyMapper.findByLandlordId(landlordId);
    return new PageInfo<>(list);
}
```

### 5. 事务管理

MyBatis同样支持Spring的事务管理:

```java
@Transactional
public void createLease(Lease lease) {
    leaseMapper.insert(lease);
    propertyMapper.updateStatus(lease.getPropertyId(), "已出租");
    tenantMapper.updatePropertyId(lease.getTenantId(), lease.getPropertyId());
}
```

## MyBatis vs JPA 对比

| 特性 | JPA | MyBatis |
|------|-----|---------|
| 学习曲线 | 中等 | 简单 |
| SQL控制 | 自动生成为主 | 完全手动控制 |
| 复杂查询 | 较复杂 | 灵活简单 |
| 性能优化 | 需要调优 | 直接优化SQL |
| 分页 | PageRequest | PageHelper |
| 关联查询 | @OneToMany等 | 嵌套查询/结果映射 |
| 适用场景 | CRUD为主 | 复杂SQL为主 |

## 下一步

1. ✅ 完成pom.xml更新
2. ✅ 完成application.yml配置
3. ✅ 创建数据库schema.sql
4. ⏳ 创建所有Mapper接口 (LandlordMapper已完成示例)
5. ⏳ 创建XML Mapper文件 (推荐用于复杂查询)
6. ⏳ 更新所有Service类使用Mapper
7. ⏳ 测试所有API接口

## 快速开始

```bash
# 1. 执行SQL脚本初始化数据库
mysql -u root -p < src/main/resources/schema.sql

# 2. 编译项目
mvn clean install

# 3. 运行应用
mvn spring-boot:run
```

所有Mapper和Service的完整转换需要根据实际需求逐步完成。建议:
- 简单查询使用注解方式 (@Select, @Insert, @Update, @Delete)
- 复杂查询使用XML方式 (动态SQL, 关联查询等)
- 保持Service层接口不变,只替换内部实现
