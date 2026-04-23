# 房东租房管理系统 - 完整全栈应用

一个基于 **Java Spring Boot + MyBatis** 后端和 **Vue 3 + Element Plus** 前端的完整租房管理系统。

---

## 🎯 系统特性

### 核心功能模块
1. ✅ **登录权限管理** - JWT认证、账号锁定机制
2. ✅ **房源管理** - CRUD、图片上传、状态管理
3. ✅ **租客管理** - 身份证信息、紧急联系人
4. ✅ **租约管理** - 创建、续租、退租、自动状态同步
5. ✅ **账单管理** - 自动生成、逾期计算、支付记录
6. ✅ **消息沟通** - 房东租客文字/图片/文件消息
7. ✅ **统计报表** - 入住率、收入统计、逾期统计
8. ✅ **系统设置** - 逾期率配置、数据备份

---

## 🏗️ 技术栈

### 后端 (Java Spring Boot)
- **框架**: Spring Boot 3.2.0
- **数据库**: MySQL 8.0+
- **ORM**: MyBatis 3.0.3 + XML Mapper
- **分页**: PageHelper 2.1.0
- **安全**: Spring Security + JWT (jjwt 0.12.3)
- **加密**: BCrypt
- **构建工具**: Maven
- **Java版本**: 17+

### 前端 (Vue.js)
- **框架**: Vue 3.4.0 (Composition API)
- **构建工具**: Vite 5.0.8
- **UI组件库**: Element Plus 2.5.1
- **路由**: Vue Router 4.2.5
- **状态管理**: Pinia 2.1.7
- **HTTP客户端**: Axios 1.6.2
- **图标**: @element-plus/icons-vue

---

## 📁 项目结构

```
zufangguanlixitong/
├── java-backend/                    # 后端项目
│   ├── src/main/java/com/rental/
│   │   ├── mapper/                  # MyBatis Mapper接口 (6个)
│   │   ├── entity/                  # 实体类 (6个)
│   │   ├── service/                 # 业务层 (5个)
│   │   ├── controller/              # 控制器 (5个)
│   │   ├── security/                # 安全配置
│   │   └── dto/                     # 数据传输对象
│   ├── src/main/resources/
│   │   ├── mapper/                  # MyBatis XML映射文件 (6个)
│   │   ├── application.yml          # 配置文件
│   │   └── schema.sql               # 数据库初始化脚本
│   └── pom.xml                      # Maven配置
│
└── vue-frontend/                    # 前端项目
    ├── src/
    │   ├── api/                     # API接口层
    │   │   ├── index.js             # Axios配置
    │   │   └── modules.js           # 各模块API
    │   ├── views/                   # 页面组件
    │   │   ├── Login.vue            # 登录页
    │   │   ├── Dashboard.vue        # 仪表盘
    │   │   ├── Property/            # 房源管理
    │   │   ├── Tenant/              # 租客管理
    │   │   ├── Lease/               # 租约管理
    │   │   ├── Bill/                # 账单管理
    │   │   └── Message/             # 消息沟通
    │   ├── layouts/                 # 布局组件
    │   │   └── MainLayout.vue       # 主布局
    │   ├── router/                  # 路由配置
    │   ├── stores/                  # Pinia状态管理
    │   ├── App.vue                  # 根组件
    │   └── main.js                  # 入口文件
    ├── package.json
    └── vite.config.js
```

---

## 🚀 快速开始

### 前置要求
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Node.js 18+
- npm 或 yarn

### 1. 后端启动

```bash
# 进入后端目录
cd java-backend

# 初始化数据库
mysql -u root -p < src/main/resources/schema.sql

# 配置数据库连接
# 编辑 src/main/resources/application.yml
# 修改 spring.datasource.username 和 password

# 编译项目
mvn clean install

# 运行后端服务
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 2. 前端启动

```bash
# 进入前端目录
cd vue-frontend

# 安装依赖
npm install

# 运行开发服务器
npm run dev
```

前端服务将在 http://localhost:5173 启动

### 3. 访问系统

打开浏览器访问: http://localhost:5173

默认登录账号:
- 账号: admin
- 密码: admin123 (需先在数据库中创建)

---

## 📊 数据库表结构

### 核心表
1. **landlords** - 房东信息表
2. **properties** - 房源信息表
3. **property_facilities** - 房源配套设施表
4. **property_images** - 房源图片表
5. **tenants** - 租客信息表
6. **tenant_id_photos** - 租客身份证照片表
7. **leases** - 租约信息表
8. **lease_attachments** - 租约附件表
9. **bills** - 账单信息表
10. **messages** - 消息记录表
11. **settings** - 系统配置表

完整的SQL脚本见: `java-backend/src/main/resources/schema.sql`

---

## 🔑 核心功能说明

### 1. 登录与安全
- 密码错误5次后账号锁定1小时
- JWT Token 7天有效期
- 请求拦截器自动添加Token
- 401自动跳转登录页

### 2. 房源管理
- 支持多种房源类型（住宅、商铺、写字楼等）
- 配套设施多选
- 图片上传（多张）
- 状态管理（草稿、空闲、已出租、维护中）

### 3. 租约管理
- 创建租约自动更新房源状态为"已出租"
- 终止租约自动恢复房源状态为"空闲"
- 支持租约续签（创建新租约，旧租约标记为已终止）
- 即将到期租约提醒

### 4. 账单管理
- 定时任务每6小时自动生成租金账单
- 每日午夜更新逾期账单
- 逾期费计算: 金额 × 0.05% × 逾期天数
- 支持多种支付方式

### 5. 消息沟通
- 房东与租客双向通信
- 支持文字、图片、文件消息
- 未读消息计数
- 一键标记全部已读

---

## 📝 API文档

### 认证接口
```
POST   /api/auth/login          # 登录
POST   /api/auth/register       # 注册
GET    /api/auth/me             # 获取用户信息
```

### 房源接口
```
GET    /api/properties          # 获取房源列表
GET    /api/properties/search   # 搜索房源
GET    /api/properties/:id      # 获取房源详情
POST   /api/properties          # 创建房源
PUT    /api/properties/:id      # 更新房源
DELETE /api/properties/:id      # 删除房源
PATCH  /api/properties/:id/status # 更新状态
```

### 租客接口
```
GET    /api/tenants             # 获取租客列表
GET    /api/tenants/:id         # 获取租客详情
POST   /api/tenants             # 创建租客
PUT    /api/tenants/:id         # 更新租客
PATCH  /api/tenants/:id/move-out # 标记退租
```

### 租约接口
```
GET    /api/leases              # 获取租约列表
GET    /api/leases/search       # 搜索租约
GET    /api/leases/active       # 获取活跃租约
GET    /api/leases/expiring     # 获取即将到期租约
POST   /api/leases              # 创建租约
POST   /api/leases/:id/renew    # 续租
POST   /api/leases/:id/terminate # 终止租约
```

### 账单接口
```
GET    /api/bills               # 获取账单列表
GET    /api/bills/search        # 搜索账单
GET    /api/bills/statistics    # 获取统计数据
POST   /api/bills               # 创建账单
POST   /api/bills/:id/payment   # 记录付款
```

### 消息接口
```
GET    /api/messages            # 获取消息列表
POST   /api/messages            # 发送消息
PATCH  /api/messages/:id/read   # 标记已读
PATCH  /api/messages/read-all/:tenantId # 全部已读
```

---

## 🎨 前端页面

### 已完成 ✅
- [x] 登录页面 - 表单验证、JWT登录
- [x] 主布局 - 侧边栏导航、用户菜单
- [x] 仪表盘 - 统计卡片、到期提醒

### 待完善 📋
以下页面已创建目录，需要实现具体功能：
- [ ] 房源列表页 - 表格、搜索、分页
- [ ] 房源表单页 - 创建/编辑表单
- [ ] 租客列表页 - 表格、搜索
- [ ] 租客表单页 - 创建/编辑表单
- [ ] 租约列表页 - 表格、状态筛选
- [ ] 租约表单页 - 创建表单
- [ ] 账单列表页 - 表格、统计
- [ ] 消息列表页 - 聊天界面

---

## 🔧 开发指南

### 后端开发

#### 添加新的Mapper
1. 在 `src/main/java/com/rental/mapper/` 创建接口
2. 在 `src/main/resources/mapper/` 创建XML文件
3. 在Service中注入Mapper使用

#### 添加新的Service
```java
@Service
@RequiredArgsConstructor
public class NewService {
    private final NewMapper mapper;
    
    public Result method(Params params) {
        // 业务逻辑
    }
}
```

#### 添加新的Controller
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

#### 添加新页面
1. 在 `src/views/` 创建Vue组件
2. 在 `src/router/index.js` 添加路由
3. 在 `src/api/modules.js` 添加API接口

#### 使用API
```javascript
import { propertyAPI } from '@/api/modules'

// 获取列表
const { data } = await propertyAPI.getList({ page: 0, size: 10 })

// 创建
await propertyAPI.create(formData)
```

#### 使用状态管理
```javascript
import { useUserStore } from '@/stores/user'

const userStore = useUserStore()
console.log(userStore.userInfo)
```

---

## 📚 详细文档

- [MyBatis迁移总结](java-backend/MIGRATION_FINAL_SUMMARY.md)
- [快速开始指南](java-backend/QUICK_START.md)
- [MyBatis XML迁移](java-backend/MYBATIS_XML_MIGRATION_COMPLETE.md)

---

## 🐛 常见问题

### Q1: 数据库连接失败
A: 检查 `application.yml` 中的数据库配置是否正确

### Q2: 前端跨域问题
A: 开发环境已配置代理，生产环境需配置CORS或Nginx

### Q3: Token过期
A: 前端会自动检测401并跳转登录页

### Q4: Maven依赖下载慢
A: 已配置阿里云镜像源

---

## 📄 许可证

MIT License

---

## 🤝 贡献

欢迎提交 Issue 和 Pull Request!

---

## 📧 联系方式

如有问题，请创建 Issue 或联系项目维护者。

---

**祝您使用愉快！** 🎉
