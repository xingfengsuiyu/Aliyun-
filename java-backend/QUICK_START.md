# Quick Start Guide - MyBatis Rental Management System

## 🚀 快速开始

### 前置要求
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### 1. 数据库初始化
```bash
# 登录MySQL
mysql -u root -p

# 执行初始化脚本
source src/main/resources/schema.sql

# 验证表创建成功
USE rental_management;
SHOW TABLES;
```

### 2. 配置数据库连接
编辑 `src/main/resources/application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/rental_management?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root
    password: your_password
```

### 3. 编译运行
```bash
# 编译
mvn clean install

# 运行
mvn spring-boot:run
```

### 4. 验证启动
访问：http://localhost:8080/api/health

---

## 📋 API快速测试

### 1. 登录获取Token
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "account": "admin",
    "password": "admin123"
  }'
```

响应：
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid",
      "account": "admin",
      "phone": "138****1234"
    }
  }
}
```

### 2. 创建房源
```bash
curl -X POST http://localhost:8080/api/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "阳光小区1号楼",
    "address": "北京市朝阳区xxx路xxx号",
    "propertyType": "住宅",
    "layout": "3室2厅",
    "area": 120.5,
    "decoration": "精装",
    "orientation": "南北通透",
    "totalFloors": 18,
    "currentFloor": 10,
    "rent": 5000.00,
    "deposit": 10000.00,
    "depositMode": "押一付三",
    "availableFrom": "2026-05-01",
    "minLeaseTerm": 12,
    "allowPets": false,
    "allowSublet": false,
    "status": "空闲",
    "facilities": ["空调", "冰箱", "洗衣机", "热水器"],
    "images": ["image1.jpg", "image2.jpg"]
  }'
```

### 3. 查询房源列表（分页）
```bash
curl "http://localhost:8080/api/properties?page=0&size=10" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. 搜索房源
```bash
curl "http://localhost:8080/api/properties/search?name=阳光&status=空闲" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🔧 常用MyBatis操作

### Mapper调用示例

#### 1. 简单查询
```java
// Service中
Property property = propertyMapper.findById(id);
if (property == null) {
    throw new RuntimeException("房源不存在");
}
```

#### 2. 分页查询
```java
// 使用PageHelper
PageHelper.startPage(page, size);
List<Property> list = propertyMapper.findByLandlordId(landlordId);
PageInfo<Property> pageInfo = new PageInfo<>(list);

// 返回结果
return pageInfo;
```

#### 3. 插入数据（含关联）
```java
@Transactional
public Property createProperty(Property property) {
    // 1. 插入主表
    propertyMapper.insert(property);
    
    // 2. 插入配套设施
    if (property.getFacilities() != null) {
        for (String facility : property.getFacilities()) {
            propertyMapper.insertFacility(property.getId(), facility);
        }
    }
    
    // 3. 插入图片
    if (property.getImages() != null) {
        for (String image : property.getImages()) {
            propertyMapper.insertImage(property.getId(), image);
        }
    }
    
    return property;
}
```

#### 4. 更新数据
```java
@Transactional
public Property updateProperty(String id, Property updates) {
    Property property = propertyMapper.findById(id);
    
    // 更新字段
    property.setName(updates.getName());
    property.setAddress(updates.getAddress());
    // ... 其他字段
    
    // 更新主表
    propertyMapper.update(property);
    
    // 更新关联数据（先删后增）
    propertyMapper.deleteFacilities(id);
    for (String facility : updates.getFacilities()) {
        propertyMapper.insertFacility(id, facility);
    }
    
    return propertyMapper.findById(id);
}
```

#### 5. 动态条件查询
```java
// 传递null表示不限制该条件
List<Property> properties = propertyMapper.searchProperties(
    landlordId,
    name,           // 可为null
    status != null ? status.name() : null,  // 枚举转字符串
    propertyType != null ? propertyType.name() : null
);
```

---

## 📊 XML Mapper编写指南

### 1. ResultMap定义
```xml
<resultMap id="PropertyResultMap" type="com.rental.entity.Property">
    <!-- 主键 -->
    <id property="id" column="id"/>
    
    <!-- 普通字段（驼峰自动映射可省略） -->
    <result property="landlordId" column="landlord_id"/>
    <result property="propertyType" column="property_type"/>
    
    <!-- 关联集合 -->
    <collection property="facilities" ofType="string"
                select="findFacilitiesByPropertyId" column="id"/>
    <collection property="images" ofType="string"
                select="findImagesByPropertyId" column="id"/>
</resultMap>
```

### 2. INSERT语句
```xml
<insert id="insert" parameterType="com.rental.entity.Property">
    INSERT INTO properties(
        id, landlord_id, name, address, property_type,
        created_at, updated_at
    ) VALUES(
        #{id}, #{landlordId}, #{name}, #{address}, #{propertyType},
        NOW(), NOW()
    )
</insert>
```

### 3. UPDATE语句
```xml
<update id="update" parameterType="com.rental.entity.Property">
    UPDATE properties SET
        name = #{name},
        address = #{address},
        property_type = #{propertyType},
        updated_at = NOW()
    WHERE id = #{id}
</update>
```

### 4. 动态查询
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

### 5. 特殊字符
```xml
<!-- < 使用 &lt; -->
<!-- > 使用 &gt; -->
<!-- & 使用 &amp; -->

<select id="findOverdueBills">
    SELECT * FROM bills 
    WHERE status = '待支付' AND due_date &lt; #{today}
</select>
```

---

## 🎯 常见问题

### Q1: 如何查看执行的SQL？
A: application.yml中已配置：
```yaml
mybatis:
  configuration:
    log-impl: org.apache.ibatis.logging.stdout.StdOutImpl
```

### Q2: 如何处理枚举类型？
A: 使用 `.name()` 方法转换为字符串：
```java
mapper.findByStatus(PropertyStatus.空闲.name());
```

### Q3: 如何实现分页？
A: 使用PageHelper：
```java
PageHelper.startPage(page, size);
List<T> list = mapper.findAll();
return new PageInfo<>(list);
```

### Q4: 如何批量插入？
A: 在循环中调用insert：
```java
for (String facility : facilities) {
    mapper.insertFacility(propertyId, facility);
}
```

### Q5: 如何处理事务？
A: 使用@Transactional注解：
```java
@Transactional
public void createProperty(Property property) {
    // 所有数据库操作会在同一事务中
}
```

---

## 📁 重要文件位置

| 文件 | 路径 | 说明 |
|------|------|------|
| 数据库配置 | `src/main/resources/application.yml` | 数据库连接、MyBatis配置 |
| 数据库脚本 | `src/main/resources/schema.sql` | 表结构初始化 |
| Mapper接口 | `src/main/java/com/rental/mapper/` | 6个Mapper接口 |
| XML映射 | `src/main/resources/mapper/` | 6个XML文件，60个SQL |
| 服务层 | `src/main/java/com/rental/service/` | 5个Service类 |
| 控制器 | `src/main/java/com/rental/controller/` | 5个Controller类 |

---

## 🔍 调试技巧

### 1. 查看SQL日志
启动后，控制台会打印所有执行的SQL：
```
==>  Preparing: SELECT * FROM properties WHERE landlord_id = ?
==> Parameters: uuid123(String)
<==      Total: 10
```

### 2. 测试单个Mapper
```java
@SpringBootTest
class PropertyMapperTest {
    @Autowired
    PropertyMapper propertyMapper;
    
    @Test
    void testFindById() {
        Property property = propertyMapper.findById("test-id");
        assertNotNull(property);
    }
}
```

### 3. 检查XML配置
确保：
- XML文件namespace指向正确的Mapper接口
- 方法id与接口方法名一致
- parameterType和resultType正确

---

## 🎉 开始开发！

现在你已经掌握了MyBatis的基本用法，可以开始：
1. ✅ 运行项目测试API
2. ✅ 添加新的业务功能
3. ✅ 优化SQL性能
4. ✅ 编写单元测试
5. ✅ 部署到生产环境

祝开发顺利！🚀
