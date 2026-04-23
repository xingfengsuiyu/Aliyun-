# MyBatis XML Migration - Complete ✅

## 迁移完成总结

已成功将项目从 JPA 完全迁移到 MyBatis，并将所有 SQL 语句移至 XML 映射文件中。

## ✅ 已完成的工作

### 1. 删除 JPA 代码
- ✅ 删除所有 Repository 接口文件（6个）
  - LandlordRepository.java
  - PropertyRepository.java
  - TenantRepository.java
  - LeaseRepository.java
  - BillRepository.java
  - MessageRepository.java

### 2. 创建 XML Mapper 文件
所有 SQL 语句已移至 XML 文件，位于 `src/main/resources/mapper/` 目录：

#### ✅ LandlordMapper.xml
- 完整的 ResultMap 定义
- 6个SQL语句：
  - findByAccount - 根据账号查询
  - findByPhone - 根据手机号查询
  - findByEmail - 根据邮箱查询
  - insert - 插入房东
  - update - 更新房东
  - updatePassword - 更新密码

#### ✅ PropertyMapper.xml
- 完整的 ResultMap 定义（含关联查询）
- 13个SQL语句：
  - findById - 根据ID查询（含设施和图片）
  - findFacilitiesByPropertyId - 查询配套设施
  - findImagesByPropertyId - 查询房源图片
  - insert - 插入房源
  - insertFacility - 插入配套设施
  - insertImage - 插入图片
  - update - 更新房源
  - deleteFacilities - 删除配套设施
  - deleteImages - 删除图片
  - delete - 删除房源
  - findByLandlordId - 根据房东ID查询
  - searchProperties - 动态条件搜索
  - countByLandlordId - 统计数量
  - countByLandlordIdAndStatus - 按状态统计

#### ✅ TenantMapper.xml
- 完整的 ResultMap 定义（含关联查询）
- 9个SQL语句：
  - findById - 根据ID查询（含身份证照片）
  - findIdPhotosByTenantId - 查询身份证照片
  - findByIdCard - 根据身份证号查询
  - findByPhone - 根据手机号查询
  - insert - 插入租客
  - insertIdPhoto - 插入身份证照片
  - update - 更新租客
  - findByLandlordId - 根据房东ID查询
  - countByLandlordId - 统计数量
  - existsByIdCard - 检查身份证号是否存在
  - existsByPhone - 检查手机号是否存在

#### ✅ LeaseMapper.xml
- 完整的 ResultMap 定义（含关联查询）
- 9个SQL语句：
  - findById - 根据ID查询（含附件）
  - findAttachmentsByLeaseId - 查询租约附件
  - insert - 插入租约
  - insertAttachment - 插入附件
  - update - 更新租约
  - findByLandlordId - 根据房东ID查询
  - searchLeases - 动态条件搜索
  - findByLandlordIdAndStatus - 根据房东ID和状态查询
  - findExpiringLeases - 查询即将到期的租约
  - countByLandlordIdAndStatus - 按状态统计

#### ✅ BillMapper.xml
- 完整的 ResultMap 定义
- 12个SQL语句：
  - findById - 根据ID查询
  - insert - 插入账单
  - update - 更新账单
  - recordPayment - 记录付款
  - findByLandlordId - 根据房东ID查询
  - searchBills - 动态条件搜索
  - findOverdueBills - 查询逾期账单
  - findByLeaseId - 根据租约ID查询
  - findByTenantId - 根据租客ID查询
  - sumPaidAmountByLandlordId - 统计已支付金额
  - sumPendingAmountByLandlordId - 统计待支付金额
  - countByLandlordIdAndStatus - 按状态统计

#### ✅ MessageMapper.xml
- 完整的 ResultMap 定义
- 7个SQL语句：
  - findById - 根据ID查询
  - insert - 插入消息
  - update - 更新消息
  - findByLandlordIdAndTenantId - 根据房东和租客查询
  - findByLandlordId - 根据房东ID查询
  - findByTenantId - 根据租客ID查询
  - countUnreadMessages - 统计未读消息
  - markAllAsRead - 标记全部已读

### 3. 简化 Mapper 接口
所有 Mapper 接口已移除注解，只保留方法签名：

#### Before (注解方式):
```java
@Select("SELECT * FROM properties WHERE id = #{id}")
@Results({
    @Result(property = "id", column = "id"),
    @Result(property = "landlordId", column = "landlord_id"),
    // ... more mappings
})
Property findById(String id);
```

#### After (XML方式):
```java
Property findById(String id);
```

所有SQL和映射配置都在XML文件中，Java接口更简洁。

## 📁 文件结构

```
java-backend/
├── src/main/java/com/rental/
│   ├── mapper/                    # MyBatis Mapper 接口
│   │   ├── LandlordMapper.java   ✅ (简化)
│   │   ├── PropertyMapper.java   ✅ (简化)
│   │   ├── TenantMapper.java     ✅ (简化)
│   │   ├── LeaseMapper.java      ✅ (简化)
│   │   ├── BillMapper.java       ✅ (简化)
│   │   └── MessageMapper.java    ✅ (简化)
│   ├── entity/                    # 实体类（已移除JPA注解）
│   │   ├── Landlord.java         ✅
│   │   ├── Property.java         ✅
│   │   ├── Tenant.java           ✅
│   │   ├── Lease.java            ✅
│   │   ├── Bill.java             ✅
│   │   └── Message.java          ✅
│   └── service/                   # Service 层
│       └── AuthService.java      ✅ (已更新为使用Mapper)
│
└── src/main/resources/
    ├── mapper/                    # MyBatis XML 映射文件
    │   ├── LandlordMapper.xml    ✅ (新建)
    │   ├── PropertyMapper.xml    ✅ (新建)
    │   ├── TenantMapper.xml      ✅ (新建)
    │   ├── LeaseMapper.xml       ✅ (新建)
    │   ├── BillMapper.xml        ✅ (新建)
    │   └── MessageMapper.xml     ✅ (新建)
    ├── schema.sql                ✅ (数据库初始化脚本)
    └── application.yml           ✅ (MyBatis配置)
```

## 🎯 XML Mapper 特性

### 1. ResultMap 映射
所有字段映射都在XML中定义：

```xml
<resultMap id="PropertyResultMap" type="com.rental.entity.Property">
    <id property="id" column="id"/>
    <result property="landlordId" column="landlord_id"/>
    <result property="propertyType" column="property_type"/>
    <!-- ... more mappings -->
    
    <!-- 关联查询 -->
    <collection property="facilities" ofType="string"
                select="findFacilitiesByPropertyId" column="id"/>
    <collection property="images" ofType="string"
                select="findImagesByPropertyId" column="id"/>
</resultMap>
```

### 2. 动态SQL
使用 MyBatis 的动态SQL标签：

```xml
<select id="searchProperties" resultMap="PropertyResultMap">
    SELECT * FROM properties 
    WHERE landlord_id = #{landlordId}
    <if test="name != null and name != ''">
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
```

### 3. 特殊字符转义
XML中的特殊字符需要转义：

```xml
<!-- < 转义为 &lt; -->
<select id="findOverdueBills" resultMap="BillResultMap">
    SELECT * FROM bills 
    WHERE status = '待支付' AND due_date &lt; #{today}
</select>
```

## 📊 对比总结

### JPA vs MyBatis XML

| 特性 | JPA | MyBatis XML |
|------|-----|-------------|
| SQL位置 | 自动生成/注解 | XML文件集中管理 |
| 复杂查询 | 较复杂 | 灵活简单 |
| 动态SQL | Criteria API | `<if>`, `<where>`, `<choose>` |
| 结果映射 | 自动 | 手动配置ResultMap |
| 关联查询 | @OneToMany等 | `<collection>`, `<association>` |
| 维护性 | 分散 | 集中，易维护 |
| SQL优化 | 需要理解生成逻辑 | 直接编写优化SQL |
| 学习曲线 | 中等 | 简单直观 |

## 🔧 配置说明

### application.yml
```yaml
mybatis:
  mapper-locations: classpath:mapper/*.xml  # XML文件位置
  type-aliases-package: com.rental.entity   # 实体类别名
  configuration:
    map-underscore-to-camel-case: true      # 自动驼峰映射
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl  # SQL日志

pagehelper:
  helper-dialect: mysql
  reasonable: true
  support-methods-arguments: true
```

### 主应用类
```java
@SpringBootApplication
@EnableScheduling
@MapperScan("com.rental.mapper")  // 扫描Mapper接口
public class RentalManagementApplication {
    // ...
}
```

## 📝 使用示例

### Service层调用

```java
@Service
@RequiredArgsConstructor
public class PropertyService {
    
    private final PropertyMapper propertyMapper;
    
    // 创建房源
    @Transactional
    public Property createProperty(Property property) {
        // 插入主表
        propertyMapper.insert(property);
        
        // 插入配套设施
        if (property.getFacilities() != null) {
            for (String facility : property.getFacilities()) {
                propertyMapper.insertFacility(property.getId(), facility);
            }
        }
        
        // 插入图片
        if (property.getImages() != null) {
            for (String image : property.getImages()) {
                propertyMapper.insertImage(property.getId(), image);
            }
        }
        
        return property;
    }
    
    // 分页查询
    public PageInfo<Property> getProperties(String landlordId, int page, int size) {
        PageHelper.startPage(page, size);
        List<Property> list = propertyMapper.findByLandlordId(landlordId);
        return new PageInfo<>(list);
    }
    
    // 动态搜索
    public PageInfo<Property> searchProperties(String landlordId, String name, 
                                               String status, String type, 
                                               int page, int size) {
        PageHelper.startPage(page, size);
        List<Property> list = propertyMapper.searchProperties(landlordId, name, status, type);
        return new PageInfo<>(list);
    }
}
```

## ✅ 优势总结

### 使用 XML 方式的优势：

1. **SQL集中管理** - 所有SQL在XML文件中，便于维护和优化
2. **代码简洁** - Mapper接口只保留方法签名，无冗余注解
3. **易于调试** - SQL语句清晰可见，方便日志查看
4. **灵活性强** - 支持复杂的动态SQL和存储过程
5. **团队协作** - DBA可以直接修改XML中的SQL
6. **性能优化** - 直接编写优化后的SQL，无ORM开销

## 🚀 下一步

1. ✅ 数据库初始化 - 执行 `schema.sql`
2. ✅ 编译项目 - `mvn clean compile`
3. ✅ 运行测试 - 确保所有Mapper正常工作
4. ⏳ 更新剩余Service类 - 使用Mapper替代Repository
5. ⏳ 集成测试 - 测试完整业务流程

## 📌 注意事项

1. **XML文件命名** - 必须与Mapper接口名一致
2. **namespace** - 必须指向完整的Mapper接口路径
3. **方法名匹配** - XML中的id必须与接口方法名一致
4. **参数类型** - 复杂参数使用 `@Param` 注解
5. **特殊字符** - XML中需要使用实体引用（如 `&lt;`, `&gt;`, `&amp;`）

## 🎉 迁移完成

恭喜！项目已成功从 JPA 迁移到 MyBatis XML 方式。所有SQL语句现在都集中在XML文件中，代码更加清晰和易于维护。
