# 🏠 房东租房管理系统

> 一个功能完整的全栈租房管理系统，基于 Java Spring Boot + MyBatis 后端和 Vue 3 + Element Plus 前端构建。

[![Java](https://img.shields.io/badge/Java-8+-blue.svg)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-2.7-brightgreen.svg)](https://spring.io/projects/spring-boot)
[![MyBatis](https://img.shields.io/badge/MyBatis-2.3-orange.svg)](https://mybatis.org/)
[![Vue](https://img.shields.io/badge/Vue-3.4-emerald.svg)](https://vuejs.org/)
[![Element Plus](https://img.shields.io/badge/Element%20Plus-2.5-409EFF.svg)](https://element-plus.org/)

---

## ✨ 特性亮点

- 🎯 **功能完整** - 房源、租客、租约、账单、消息全模块覆盖
- 🔐 **安全可靠** - JWT 认证、密码加密、账号锁定机制
- 📊 **智能管理** - 自动生成账单、逾期计算、到期提醒
- 🚀 **快速部署** - 支持本地、Docker、传统服务器多种部署方式
- 📱 **响应式设计** - 适配桌面和移动设备
- 🎨 **现代化 UI** - 基于 Element Plus 的美观界面
- 📝 **完整文档** - 详细的部署、开发、API 文档

---

## 📸 系统截图

### 登录页面
简洁美观的登录界面，支持表单验证

### 仪表盘
- 4个统计卡片（总房源、已出租、活跃租约、本月收入）
- 即将到期租约提醒
- 待支付账单列表

### 房源管理
- 列表展示、搜索筛选、分页
- 创建/编辑表单
- 配套设施选择
- 状态管理

### 租客管理
- 租客信息列表
- 身份证信息管理
- 紧急联系人
- 退租操作

### 租约管理
- 租约列表与状态筛选
- 创建租约（选择房源和租客）
- 续租功能
- 终止租约

### 账单管理
- 账单统计卡片
- 账单列表与搜索
- 收款记录
- 逾期账单管理

### 消息沟通
- 消息列表
- 发送/接收消息
- 已读/未读状态
- 批量标记已读

---

## 🏗️ 技术架构

### 后端技术栈
```
Spring Boot 2.7.18          # 核心框架
MyBatis 2.3.2               # ORM 框架
PageHelper 2.1.0            # 分页插件
Spring Security             # 安全框架
JWT (jjwt 0.9.1)            # Token 认证
MySQL 8.0+                  # 数据库
Maven                       # 构建工具
```

### 前端技术栈
```
Vue 3.4                     # 渐进式框架
Vite 5.0                    # 构建工具
Vue Router 4.2              # 路由管理
Pinia 2.1                   # 状态管理
Element Plus 2.5            # UI 组件库
Axios 1.6                   # HTTP 客户端
Day.js                      # 日期处理
```

---

## 📁 项目结构

```
zufangguanlixitong/
├── java-backend/                        # 后端项目
│   ├── src/main/java/com/rental/
│   │   ├── mapper/                      # MyBatis Mapper 接口 (6个)
│   │   ├── entity/                      # 实体类 (6个)
│   │   ├── service/                     # 业务逻辑层 (5个)
│   │   ├── controller/                  # REST 控制器 (5个)
│   │   ├── security/                    # 安全配置
│   │   │   ├── JwtTokenProvider.java   # JWT Token 生成与验证
│   │   │   ├── JwtAuthenticationFilter.java
│   │   │   └── SecurityConfig.java
│   │   ├── dto/                         # 数据传输对象
│   │   └── exception/                   # 异常处理
│   ├── src/main/resources/
│   │   ├── mapper/                      # MyBatis XML 映射文件 (6个)
│   │   ├── application.yml              # 应用配置
│   │   ├── schema.sql                   # 数据库初始化脚本
│   │   └── test-data.sql                # 测试数据脚本
│   └── pom.xml                          # Maven 依赖配置
│
├── vue-frontend/                        # 前端项目
│   ├── src/
│   │   ├── api/                         # API 接口层
│   │   │   ├── index.js                 # Axios 配置与拦截器
│   │   │   └── modules.js               # 各模块 API 封装
│   │   ├── views/                       # 页面组件
│   │   │   ├── Login.vue                # 登录页
│   │   │   ├── Dashboard.vue            # 仪表盘
│   │   │   ├── Property/                # 房源管理
│   │   │   │   ├── List.vue             # 房源列表
│   │   │   │   └── Form.vue             # 房源表单
│   │   │   ├── Tenant/                  # 租客管理
│   │   │   │   ├── List.vue             # 租客列表
│   │   │   │   └── Form.vue             # 租客表单
│   │   │   ├── Lease/                   # 租约管理
│   │   │   │   ├── List.vue             # 租约列表
│   │   │   │   └── Form.vue             # 租约表单
│   │   │   ├── Bill/                    # 账单管理
│   │   │   │   └── List.vue             # 账单列表
│   │   │   └── Message/                 # 消息沟通
│   │   │       └── List.vue             # 消息列表
│   │   ├── layouts/                     # 布局组件
│   │   │   └── MainLayout.vue           # 主布局（侧边栏+顶栏）
│   │   ├── router/                      # 路由配置
│   │   │   └── index.js                 # 路由与导航守卫
│   │   ├── stores/                      # Pinia 状态管理
│   │   │   └── user.js                  # 用户状态
│   │   ├── App.vue                      # 根组件
│   │   └── main.js                      # 入口文件
│   ├── package.json                     # 依赖配置
│   ├── vite.config.js                   # Vite 配置
│   └── index.html                       # HTML 入口
│
├── README.md                            # 项目说明（本文件）
├── QUICKSTART.md                        # 5分钟快速开始
├── DEPLOYMENT.md                        # 部署与运维指南
└── PROJECT_COMPLETION_SUMMARY.md        # 项目完成总结
```

---

## 🚀 快速开始

### 前置要求

确保已安装以下软件：

- ✅ Java 8+
- ✅ Maven 3.6+
- ✅ MySQL 8.0+
- ✅ Node.js 18+
- ✅ npm 9+

### 1️⃣ 初始化数据库

```bash
# 创建数据库
mysql -u root -p

CREATE DATABASE rental_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rental_management;

# 导入表结构
source java-backend/src/main/resources/schema.sql;

# 导入测试数据（可选）
source java-backend/src/main/resources/test-data.sql;

exit;
```

### 2️⃣ 启动后端

```bash
cd java-backend

# 编辑数据库配置（如需要）
# 编辑 src/main/resources/application.yml

# 编译并运行
mvn spring-boot:run
```

后端将在 **http://localhost:8080** 启动

### 3️⃣ 启动前端

```bash
# 打开新的终端
cd vue-frontend

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev
```

前端将在 **http://localhost:5173** 启动

### 4️⃣ 访问系统

打开浏览器访问: **http://localhost:5173**

**默认账号:**
- 账号: `admin` 或 `test`
- 密码: `admin123`

---

## 📊 核心功能模块

### 1. 登录权限管理
- ✅ JWT Token 认证（7天有效期）
- ✅ 密码 BCrypt 加密
- ✅ 密码错误5次锁定1小时
- ✅ 自动登出与 Token 刷新

### 2. 房源管理
- ✅ 房源 CRUD 操作
- ✅ 多种房源类型（住宅、商铺、写字楼、厂房、仓库）
- ✅ 配套设施多选（空调、冰箱、洗衣机等）
- ✅ 图片管理
- ✅ 状态管理（草稿、空闲、已出租、维护中）
- ✅ 搜索与筛选

### 3. 租客管理
- ✅ 租客信息管理
- ✅ 身份证信息记录
- ✅ 紧急联系人管理
- ✅ 租客状态（在住、已退租）
- ✅ 搜索功能

### 4. 租约管理
- ✅ 创建租约（关联房源和租客）
- ✅ 租约续签
- ✅ 提前终止租约
- ✅ 自动状态同步（创建租约→房源变已出租）
- ✅ 到期提醒
- ✅ 多种付款方式（押一付三、押一付一、年付等）

### 5. 账单管理
- ✅ 定时自动生成租金账单（每6小时）
- ✅ 逾期自动计算滞纳金（每日0.05%）
- ✅ 多种账单类型（租金、水电费、物业费）
- ✅ 收款记录
- ✅ 账单统计（待支付、已支付、逾期）
- ✅ 支付提醒

### 6. 消息沟通
- ✅ 房东与租客双向通信
- ✅ 文字消息
- ✅ 未读消息计数
- ✅ 标记已读/全部已读
- ✅ 消息历史

### 7. 统计报表
- ✅ 仪表盘统计卡片
- ✅ 房源统计
- ✅ 租约统计
- ✅ 账单统计
- ✅ 到期提醒

### 8. 系统设置
- ✅ 逾期费率配置
- ✅ 账单提前生成天数
- ✅ 租约到期提醒天数
- ✅ 登录失败限制

---

## 🗄️ 数据库设计

### 核心表结构

```
landlords (房东表)
  ├── id (主键)
  ├── account (账号)
  ├── password (加密密码)
  ├── name (姓名)
  ├── phone (电话)
  ├── email (邮箱)
  ├── status (状态)
  └── login_fail_count (登录失败次数)

properties (房源表)
  ├── id (主键)
  ├── landlord_id (外键→landlords)
  ├── name (房源名称)
  ├── property_type (类型)
  ├── status (状态)
  ├── address (地址)
  ├── area (面积)
  ├── rent (租金)
  └── deposit (押金)

property_facilities (配套设施表)
  ├── property_id (外键→properties)
  └── facility (设施名称)

property_images (房源图片表)
  ├── property_id (外键→properties)
  └── image_url (图片URL)

tenants (租客表)
  ├── id (主键)
  ├── name (姓名)
  ├── gender (性别)
  ├── phone (电话)
  ├── id_card (身份证号)
  ├── emergency_contact_name (紧急联系人)
  ├── emergency_contact_phone (紧急联系电话)
  └── status (状态)

leases (租约表)
  ├── id (主键)
  ├── property_id (外键→properties)
  ├── tenant_id (外键→tenants)
  ├── landlord_id (外键→landlords)
  ├── start_date (开始日期)
  ├── end_date (结束日期)
  ├── rent (月租金)
  ├── deposit (押金)
  ├── payment_method (付款方式)
  └── status (状态)

bills (账单表)
  ├── id (主键)
  ├── landlord_id (外键→landlords)
  ├── lease_id (外键→leases)
  ├── bill_type (账单类型)
  ├── amount (金额)
  ├── overdue_fee (滞纳金)
  ├── due_date (到期日期)
  ├── paid_date (支付日期)
  └── status (状态)

messages (消息表)
  ├── id (主键)
  ├── landlord_id (外键→landlords)
  ├── tenant_id (外键→tenants)
  ├── sender_id (发送者)
  ├── content (内容)
  ├── message_type (消息类型)
  └── is_read (是否已读)

settings (系统设置表)
  ├── setting_key (配置键)
  ├── setting_value (配置值)
  └── description (描述)
```

---

## 🔌 API 接口

### 认证接口
```
POST   /api/auth/login          # 登录
POST   /api/auth/register       # 注册
GET    /api/auth/me             # 获取当前用户信息
```

### 房源接口
```
GET    /api/properties                    # 获取房源列表
GET    /api/properties/search             # 搜索房源
GET    /api/properties/{id}               # 获取房源详情
POST   /api/properties                    # 创建房源
PUT    /api/properties/{id}               # 更新房源
DELETE /api/properties/{id}               # 删除房源
PATCH  /api/properties/{id}/status        # 更新房源状态
```

### 租客接口
```
GET    /api/tenants                       # 获取租客列表
GET    /api/tenants/{id}                  # 获取租客详情
POST   /api/tenants                       # 创建租客
PUT    /api/tenants/{id}                  # 更新租客
PATCH  /api/tenants/{id}/move-out         # 标记退租
```

### 租约接口
```
GET    /api/leases                        # 获取租约列表
GET    /api/leases/search                 # 搜索租约
GET    /api/leases/active                 # 获取活跃租约
GET    /api/leases/expiring               # 获取即将到期租约
POST   /api/leases                        # 创建租约
POST   /api/leases/{id}/renew             # 续租
POST   /api/leases/{id}/terminate         # 终止租约
```

### 账单接口
```
GET    /api/bills                         # 获取账单列表
GET    /api/bills/search                  # 搜索账单
GET    /api/bills/statistics              # 获取统计数据
POST   /api/bills                         # 创建账单
POST   /api/bills/{id}/payment            # 记录付款
```

### 消息接口
```
GET    /api/messages                      # 获取消息列表
POST   /api/messages                      # 发送消息
PATCH  /api/messages/{id}/read            # 标记已读
PATCH  /api/messages/read-all/{tenantId}  # 全部标记已读
```

---

## 📖 文档索引

| 文档 | 说明 | 链接 |
|------|------|------|
| 🚀 快速开始 | 5分钟快速运行系统 | [QUICKSTART.md](QUICKSTART.md) |
| 📦 部署指南 | 完整部署与运维手册 | [DEPLOYMENT.md](DEPLOYMENT.md) |
| 📊 项目总结 | 详细的项目完成报告 | [PROJECT_COMPLETION_SUMMARY.md](PROJECT_COMPLETION_SUMMARY.md) |
| 🔧 MyBatis迁移 | MyBatis迁移技术文档 | [java-backend/MIGRATION_FINAL_SUMMARY.md](java-backend/MIGRATION_FINAL_SUMMARY.md) |
| ⚡ 快速参考 | 开发者快速参考 | [java-backend/QUICK_START.md](java-backend/QUICK_START.md) |

---

## 🛠️ 开发指南

### 后端开发

#### 添加新的 API 接口

1. **创建 Mapper 接口**
```java
@Mapper
public interface NewMapper {
    List<Entity> findAll();
    Entity findById(String id);
    int insert(Entity entity);
    int update(Entity entity);
    int delete(String id);
}
```

2. **创建 XML 映射文件**
```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE mapper PUBLIC "-//mybatis.org//DTD Mapper 3.0//EN" 
"http://mybatis.org/dtd/mybatis-3-mapper.dtd">
<mapper namespace="com.rental.mapper.NewMapper">
    
    <select id="findAll" resultType="Entity">
        SELECT * FROM table_name
    </select>
    
</mapper>
```

3. **创建 Service**
```java
@Service
@RequiredArgsConstructor
public class NewService {
    private final NewMapper mapper;
    
    public List<Entity> getList() {
        return mapper.findAll();
    }
}
```

4. **创建 Controller**
```java
@RestController
@RequestMapping("/api/new-module")
@RequiredArgsConstructor
public class NewController {
    private final NewService service;
    
    @GetMapping
    public ApiResponse<List<Entity>> getList() {
        return ApiResponse.success(service.getList());
    }
}
```

### 前端开发

#### 添加新的页面

1. **创建 Vue 组件**
```vue
<template>
  <div class="new-page">
    <h1>新页面</h1>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'

onMounted(() => {
  // 初始化逻辑
})
</script>
```

2. **添加路由**
```javascript
// src/router/index.js
{
  path: 'new-page',
  name: 'NewPage',
  component: () => import('@/views/NewPage.vue')
}
```

3. **添加 API 接口**
```javascript
// src/api/modules.js
export const newAPI = {
  getList() {
    return api.get('/new-module')
  }
}
```

---

## 🐛 常见问题

### Q1: 数据库连接失败
**A:** 检查 `application.yml` 中的数据库配置是否正确

### Q2: 前端跨域问题
**A:** 开发环境已配置代理，生产环境需配置 Nginx 或 CORS

### Q3: Token 过期
**A:** 前端会自动检测 401 并跳转登录页

### Q4: Maven 依赖下载慢
**A:** 已配置阿里云镜像源

### Q5: 如何创建测试数据？
**A:** 运行 `test-data.sql` 脚本

---

## 📈 性能优化建议

### 后端优化
1. 使用 Redis 缓存热点数据
2. 数据库查询添加索引
3. 使用连接池（HikariCP）
4. 分页查询优化

### 前端优化
1. 路由懒加载（已实现）
2. 组件按需加载
3. 图片压缩与懒加载
4. 使用 CDN 加速

---

## 🔐 安全建议

1. 修改默认密码
2. 启用 HTTPS
3. 定期备份数据库
4. 更新依赖包版本
5. 配置防火墙
6. 限制登录尝试次数
7. 定期审查日志

---

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 本仓库
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 开启 Pull Request

---

## 📄 许可证

MIT License

---

## 📧 联系方式

如有问题或建议，请创建 Issue。

---

## 🙏 致谢

感谢以下开源项目：

- [Spring Boot](https://spring.io/projects/spring-boot)
- [MyBatis](https://mybatis.org/)
- [Vue.js](https://vuejs.org/)
- [Element Plus](https://element-plus.org/)

---

**⭐ 如果这个项目对你有帮助，请给一个 Star！**

**祝您使用愉快！** 🎉
