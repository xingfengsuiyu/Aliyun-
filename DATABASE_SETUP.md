# 🗄️ 数据库自动配置指南

## ✅ 已完成的配置

### 1. 数据库连接信息

**配置文件:** `java-backend/src/main/resources/application.yml`

```yaml
数据库地址: localhost:3306
数据库名称: rental_management
用户名: root
密码: root
字符集: utf8
时区: Asia/Shanghai
```

### 2. 自动初始化脚本

**文件:** `setup-database-auto.bat`

这个脚本会自动:
- ✅ 检查 MySQL 环境
- ✅ 测试数据库连接
- ✅ 创建数据库
- ✅ 导入表结构 (11 张表)
- ✅ 导入测试数据 (50+ 条记录)
- ✅ 验证导入结果

---

## 🚀 快速开始 (3 步完成)

### 步骤 1: 确保 MySQL 服务已启动

```powershell
# 检查 MySQL 服务状态
Get-Service MySQL*

# 如果未启动，启动服务 (需要管理员权限)
net start MySQL80
# 或
net start MySQL
```

### 步骤 2: 运行自动配置脚本

**方式 1: 双击运行**
```
找到文件: setup-database-auto.bat
双击运行
```

**方式 2: 命令行运行**
```powershell
cd e:\workspace\zufangguanlixitong
.\setup-database-auto.bat
```

### 步骤 3: 等待完成

脚本会自动完成所有操作，大约需要 10-30 秒。

看到以下提示表示成功:
```
==========================================
  数据库初始化完成！
==========================================

数据库名称: rental_management
字符集: utf8mb4
排序规则: utf8mb4_unicode_ci

已创建的表:
  - landlords (房东表)
  - properties (房源表)
  - tenants (租客表)
  ...
```

---

## 📊 数据库结构

### 创建的表 (11 张)

| 表名 | 说明 | 测试数据 |
|------|------|----------|
| landlords | 房东表 | 2 条 |
| properties | 房源表 | 5 条 |
| tenants | 租客表 | 3 条 |
| leases | 租约表 | 3 条 |
| bills | 账单表 | 7 条 |
| messages | 消息表 | 4 条 |
| audit_logs | 审计日志表 | 0 条 |
| file_uploads | 文件上传表 | 0 条 |
| notifications | 通知表 | 0 条 |
| payment_records | 支付记录表 | 0 条 |
| maintenance_requests | 维修请求表 | 0 条 |

**总计: 24 条测试数据**

---

## 👤 测试账号

### 房东账号 1 (管理员)
```
账号: admin
密码: admin123
姓名: 张三房东
电话: 13800138000
邮箱: admin@rental.com
```

### 房东账号 2 (测试)
```
账号: test
密码: admin123
姓名: 测试房东
电话: 13900139000
邮箱: test@rental.com
```

---

## 🔍 验证数据库

### 方式 1: 使用脚本验证

运行脚本后会自动显示表列表和数据统计。

### 方式 2: 手动验证

```powershell
# 连接数据库
mysql -u root -proot rental_management

# 查看所有表
SHOW TABLES;

# 查看房东数据
SELECT id, account, name, phone FROM landlords;

# 查看房源数据
SELECT id, name, property_type, status, rent FROM properties;

# 查看租客数据
SELECT id, name, phone, status FROM tenants;

# 查看数据统计
SELECT 
  (SELECT COUNT(*) FROM landlords) as 房东数,
  (SELECT COUNT(*) FROM properties) as 房源数,
  (SELECT COUNT(*) FROM tenants) as 租客数,
  (SELECT COUNT(*) FROM leases) as 租约数,
  (SELECT COUNT(*) FROM bills) as 账单数,
  (SELECT COUNT(*) FROM messages) as 消息数;
```

---

## ⚙️ 配置说明

### application.yml 配置

```yaml
spring:
  datasource:
    # 数据库连接地址
    url: jdbc:mysql://localhost:3306/rental_management?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai&allowPublicKeyRetrieval=true
    
    # 数据库账号
    username: root
    
    # 数据库密码
    password: root
    
    # MySQL 驱动
    driver-class-name: com.mysql.cj.jdbc.Driver
```

### 连接参数说明

- `useUnicode=true` - 使用 Unicode 编码
- `characterEncoding=utf8` - 字符集 UTF-8
- `useSSL=false` - 禁用 SSL (本地开发)
- `serverTimezone=Asia/Shanghai` - 时区设置
- `allowPublicKeyRetrieval=true` - 允许公钥检索 (MySQL 8.0+)

---

## 🐛 常见问题

### 问题 1: MySQL 服务未启动

**错误信息:**
```
[错误] MySQL 连接失败！
```

**解决方案:**
```powershell
# 查看 MySQL 服务
Get-Service MySQL*

# 启动服务 (管理员权限)
net start MySQL80
# 或
net start MySQL
```

### 问题 2: 密码错误

**错误信息:**
```
Access denied for user 'root'@'localhost'
```

**解决方案:**
1. 确认 MySQL 密码确实是 `root`
2. 如果不是，修改 `application.yml` 中的密码
3. 修改脚本中的密码: 打开 `setup-database-auto.bat`，搜索 `proot` 替换为 `p你的密码`

### 问题 3: MySQL 未安装

**错误信息:**
```
[错误] 未找到 MySQL 命令！
```

**解决方案:**
1. 安装 MySQL 8.0+
2. 或将 MySQL 添加到系统 PATH:
   ```
   C:\Program Files\MySQL\MySQL Server 8.0\bin
   ```
3. 或使用完整路径运行脚本

### 问题 4: 数据库已存在

**错误信息:**
```
ERROR 1007 (HY000): Can't create database 'rental_management'
```

**解决方案:**
这是正常的！脚本使用 `CREATE DATABASE IF NOT EXISTS`，会跳过已存在的数据库。

如果想重新创建:
```powershell
# 删除旧数据库
mysql -u root -proot -e "DROP DATABASE rental_management;"

# 重新运行脚本
.\setup-database-auto.bat
```

### 问题 5: 表结构导入失败

**错误信息:**
```
ERROR 1064 (42000): You have an error in your SQL syntax
```

**解决方案:**
1. 检查 `schema.sql` 文件是否完整
2. 检查 MySQL 版本是否 >= 8.0
3. 手动导入:
   ```powershell
   mysql -u root -proot rental_management < java-backend\src\main\resources\schema.sql
   ```

### 问题 6: 中文乱码

**症状:** 插入的中文数据变成 `???`

**解决方案:**
1. 确保数据库使用 utf8mb4:
   ```sql
   SHOW VARIABLES LIKE 'character%';
   ```
2. 重建数据库:
   ```sql
   DROP DATABASE rental_management;
   CREATE DATABASE rental_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

---

## 🔄 重置数据库

如果需要完全重置数据库:

```powershell
# 1. 删除数据库
mysql -u root -proot -e "DROP DATABASE IF EXISTS rental_management;"

# 2. 重新运行脚本
.\setup-database-auto.bat
```

---

## 📝 手动操作 (可选)

如果不想使用自动脚本，可以手动执行:

```powershell
# 1. 创建数据库
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS rental_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. 导入表结构
mysql -u root -proot rental_management < java-backend\src\main\resources\schema.sql

# 3. 导入测试数据
mysql -u root -proot rental_management < java-backend\src\main\resources\test-data.sql

# 4. 验证
mysql -u root -proot rental_management -e "SHOW TABLES;"
```

---

## ✅ 完成检查清单

运行脚本后，确认以下项目:

- [ ] MySQL 服务正在运行
- [ ] 数据库 `rental_management` 已创建
- [ ] 11 张表已创建
- [ ] 测试数据已导入
- [ ] 可以查询到房东数据 (2 条)
- [ ] 可以查询到房源数据 (5 条)
- [ ] 可以查询到租客数据 (3 条)
- [ ] application.yml 中的密码是 `root`

---

## 🎯 下一步

数据库配置完成后，可以:

### 1. 启动后端服务
```powershell
cd java-backend
mvn spring-boot:run
```

### 2. 测试 API
```powershell
# 登录测试
curl -X POST http://localhost:8080/api/auth/login ^
  -H "Content-Type: application/json" ^
  -d "{\"account\":\"admin\",\"password\":\"admin123\"}"
```

### 3. 启动前端
```powershell
cd vue-frontend
npm run dev
```

### 4. 访问系统
- 前端: http://localhost:5173
- 后端: http://localhost:8080/api
- 账号: admin
- 密码: admin123

---

## 📞 需要帮助?

如果遇到问题:

1. 查看错误信息
2. 检查 MySQL 服务状态
3. 确认账号密码正确
4. 查看本指南的"常见问题"部分

---

**数据库配置完成！现在可以启动应用了！** 🎉
