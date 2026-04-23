# 🚀 快速启动指南

## 5分钟快速运行

### 前提条件
确保已安装：
- ✅ Java 17+
- ✅ MySQL 8.0+
- ✅ Node.js 18+
- ✅ Maven 3.6+

---

## 步骤 1: 初始化数据库 (2分钟)

```bash
# 登录MySQL
mysql -u root -p

# 创建数据库
CREATE DATABASE rental_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE rental_management;

# 导入表结构
source e:/workspace/zufangguanlixitong/java-backend/src/main/resources/schema.sql;

# 可选：插入测试数据
INSERT INTO landlords (id, account, password, name, phone, email, status, login_fail_count) 
VALUES ('test-landlord-001', 'admin', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', '测试房东', '13800138000', 'admin@test.com', '正常', 0);

exit;
```

> 默认密码: `admin123`

---

## 步骤 2: 启动后端 (1分钟)

```bash
# 打开终端1
cd e:\workspace\zufangguanlixitong\java-backend

# 编辑数据库配置（如需要）
# 编辑文件: src/main/resources/application.yml
# 修改以下两行：
#   username: your_mysql_username
#   password: your_mysql_password

# 编译并运行
mvn spring-boot:run
```

等待看到：`Started RentalManagementApplication in X seconds`

**后端地址**: http://localhost:8080

---

## 步骤 3: 启动前端 (2分钟)

```bash
# 打开新终端2
cd e:\workspace\zufangguanlixitong\vue-frontend

# 安装依赖（首次运行）
npm install

# 启动开发服务器
npm run dev
```

等待看到：`Local: http://localhost:5173/`

**前端地址**: http://localhost:5173

---

## 步骤 4: 访问系统

1. 打开浏览器访问: **http://localhost:5173**
2. 使用默认账号登录:
   - 账号: `admin`
   - 密码: `admin123`

---

## 🎯 功能测试清单

登录后，依次测试：

### ✅ 房源管理
1. 点击左侧"房源管理"
2. 点击"新增房源"
3. 填写房源信息并保存
4. 验证房源列表显示

### ✅ 租客管理
1. 点击"租客管理"
2. 点击"新增租客"
3. 填写租客信息（注意身份证格式）
4. 验证租客列表显示

### ✅ 租约管理
1. 点击"租约管理"
2. 点击"新增租约"
3. 选择房源和租客
4. 设置租期和租金
5. 验证租约创建成功

### ✅ 账单管理
1. 点击"账单管理"
2. 查看统计数据
3. 点击"收款"按钮
4. 填写收款信息并确认

### ✅ 消息沟通
1. 点击"消息沟通"
2. 查看消息列表
3. 测试发送消息功能

---

## 🐛 常见问题解决

### 问题1: 后端启动失败 - 数据库连接错误
**解决方案**: 
```yaml
# 检查 application.yml 配置
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/rental_management
    username: root        # 确保正确
    password: yourpass    # 确保正确
```

### 问题2: 前端 npm install 失败
**解决方案**:
```bash
# 清除缓存
npm cache clean --force

# 使用淘宝镜像
npm install --registry=https://registry.npmmirror.com
```

### 问题3: 登录失败 - 401错误
**解决方案**:
- 确认数据库中已有房东账号
- 检查密码是否为 `admin123`
- 查看后端控制台错误日志

### 问题4: 前端页面空白
**解决方案**:
- 打开浏览器开发者工具 (F12)
- 查看 Console 标签页的错误信息
- 确认后端服务正在运行

### 问题5: 端口被占用
**解决方案**:
```bash
# Windows 查看占用端口的进程
netstat -ano | findstr :8080
netstat -ano | findstr :5173

# 杀死进程
taskkill /PID <进程ID> /F

# 或者修改端口
# 后端: application.yml 中修改 server.port
# 前端: vite.config.js 中修改 server.port
```

---

## 📝 开发模式

### 热重载
- **前端**: 修改代码后自动刷新
- **后端**: 需要手动重启或使用 `spring-boot-devtools`

### 查看日志
```bash
# 后端日志在运行终端中直接显示
# 前端日志在浏览器控制台 (F12)
```

### API测试
使用 Postman 或 curl 测试API:
```bash
# 测试登录
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin123"}'
```

---

## 📦 生产部署

### 后端打包
```bash
cd java-backend
mvn clean package -DskipTests

# 运行jar包
java -jar target/rental-management-*.jar
```

### 前端打包
```bash
cd vue-frontend
npm run build

# 生成的文件在 dist/ 目录
# 部署到 Nginx、Apache 或任何静态文件服务器
```

### Nginx配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    # 前端
    location / {
        root /path/to/vue-frontend/dist;
        try_files $uri $uri/ /index.html;
    }
    
    # 后端API
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

---

## 🎓 下一步

系统运行正常后，你可以：

1. 📖 阅读 [完整文档](README.md) 了解所有功能
2. 🔍 查看 [API文档](README.md#api文档) 进行二次开发
3. 🎨 自定义UI样式和主题
4. 📊 添加更多统计图表
5. 📱 开发移动端App
6. 🔔 添加消息推送功能

---

## 💬 获取帮助

- 📚 查看项目文档
- 🔍 查看后端控制台日志
- 🌐 查看浏览器开发者工具
- 📝 检查数据库数据

---

**祝您使用愉快！** 🎉

*如有问题，请查看详细文档或联系技术支持。*
