# 🔧 故障排查指南

## 常见问题与解决方案

---

## 🚨 启动问题

### 问题 1: 后端启动失败 - Java 版本错误

**错误信息:**
```
Fatal error compiling: 无效的标记: --release
```

**原因:** Spring Boot 3.x 需要 Java 17，但系统安装的是 Java 8

**解决方案:**
```bash
# 检查 Java 版本
java -version

# 如果是 Java 8，项目已自动降级到 Spring Boot 2.7
# 重新编译即可
cd java-backend
mvn clean compile
```

---

### 问题 2: 端口被占用

**错误信息:**
```
Port 8080 was already in use
```

**解决方案 (Windows):**
```powershell
# 查找占用端口的进程
netstat -ano | findstr :8080

# 杀死进程 (替换 PID)
taskkill /PID <进程ID> /F

# 或者修改端口
# 编辑 java-backend/src/main/resources/application.yml
server:
  port: 8081  # 改为其他端口
```

**解决方案 (Linux/Mac):**
```bash
# 查找占用端口的进程
lsof -i :8080
# 或
netstat -tulpn | grep :8080

# 杀死进程 (替换 PID)
kill -9 <进程ID>

# 或者修改端口
# 编辑 application.yml，修改 server.port
```

---

### 问题 3: MySQL 连接失败

**错误信息:**
```
Communications link failure
Access denied for user 'root'@'localhost'
```

**解决方案:**

1. **检查 MySQL 服务是否运行**
```bash
# Windows
services.msc  # 找到 MySQL 服务，确保已启动

# Linux
sudo systemctl status mysql
sudo systemctl start mysql

# Mac
brew services start mysql
```

2. **验证用户名密码**
```bash
mysql -u root -p
# 如果能登录，说明密码正确
```

3. **更新配置文件**
```yaml
# java-backend/src/main/resources/application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/rental_management?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root          # 确认用户名
    password: your_password # 确认密码
```

4. **检查数据库是否创建**
```sql
mysql -u root -p
SHOW DATABASES;
-- 如果没有 rental_management，执行:
CREATE DATABASE rental_management DEFAULT CHARACTER SET utf8mb4;
```

---

### 问题 4: npm install 失败

**错误信息:**
```
npm ERR! network timeout
npm ERR! ERESOLVE unable to resolve dependency tree
```

**解决方案:**

1. **使用淘宝镜像**
```bash
npm config set registry https://registry.npmmirror.com
npm install
```

2. **清除缓存**
```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

3. **使用 yarn**
```bash
npm install -g yarn
yarn install
```

---

### 问题 5: 前端启动后空白页

**症状:** 访问 http://localhost:5173 显示空白

**解决方案:**

1. **打开浏览器开发者工具 (F12)**
   - 查看 Console 标签页的错误信息
   
2. **检查后端是否运行**
```bash
# 访问后端
curl http://localhost:8080

# 如果后端未运行，启动它
cd java-backend
mvn spring-boot:run
```

3. **检查代理配置**
```javascript
// vue-frontend/vite.config.js
export default defineConfig({
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // 确保地址正确
        changeOrigin: true
      }
    }
  }
})
```

4. **重新构建**
```bash
cd vue-frontend
rm -rf node_modules .vite
npm install
npm run dev
```

---

## 🔐 认证问题

### 问题 6: 登录失败 - 401 Unauthorized

**错误信息:**
```
POST http://localhost:8080/api/auth/login 401 (Unauthorized)
```

**解决方案:**

1. **检查账号密码是否正确**
   - 默认账号: `admin` 或 `test`
   - 默认密码: `admin123`

2. **检查数据库中是否有用户**
```sql
mysql -u root -p rental_management
SELECT id, account, name, status FROM landlords;

-- 如果没有数据，导入测试数据
source java-backend/src/main/resources/test-data.sql;
```

3. **检查后端日志**
```bash
# 查看是否有错误信息
# 后端控制台会显示详细的错误堆栈
```

4. **手动测试 API**
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"account":"admin","password":"admin123"}'
```

---

### 问题 7: Token 过期频繁

**症状:** 经常需要重新登录

**解决方案:**

1. **延长 Token 有效期**
```yaml
# java-backend/src/main/resources/application.yml
jwt:
  expiration: 604800000  # 7天 (毫秒)
  # 改为 30 天:
  # expiration: 2592000000
```

2. **检查系统时间**
```bash
# Windows
w32tm /query /status

# Linux
timedatectl

# 如果时间不正确，同步时间
# Windows: w32tm /resync
# Linux: sudo ntpdate -s time.nist.gov
```

---

## 📊 数据库问题

### 问题 8: 表不存在

**错误信息:**
```
Table 'rental_management.landlords' doesn't exist
```

**解决方案:**
```bash
# 重新导入表结构
mysql -u root -p rental_management < java-backend/src/main/resources/schema.sql

# 验证表是否创建成功
mysql -u root -p rental_management -e "SHOW TABLES;"
```

---

### 问题 9: 字符编码问题

**症状:** 中文显示为乱码

**解决方案:**

1. **数据库字符集**
```sql
-- 检查数据库字符集
SHOW CREATE DATABASE rental_management;

-- 应该是 utf8mb4
-- 如果不是，重新创建:
DROP DATABASE rental_management;
CREATE DATABASE rental_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. **连接字符串**
```yaml
# application.yml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/rental_management?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
```

3. **MySQL 配置**
```ini
# my.cnf 或 my.ini
[mysqld]
character-set-server=utf8mb4
collation-server=utf8mb4_unicode_ci

[client]
default-character-set=utf8mb4
```

---

## 🌐 网络问题

### 问题 10: 跨域错误 (CORS)

**错误信息:**
```
Access to XMLHttpRequest at 'http://localhost:8080/api/...' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**解决方案:**

项目已配置 CORS，如果仍有问题:

```java
// java-backend/src/main/java/com/rental/security/SecurityConfig.java
@Bean
public CorsConfigurationSource corsConfigurationSource() {
    CorsConfiguration configuration = new CorsConfiguration();
    configuration.setAllowedOrigins(Arrays.asList("http://localhost:5173"));
    configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"));
    configuration.setAllowedHeaders(Arrays.asList("*"));
    configuration.setAllowCredentials(true);
    
    UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
    source.registerCorsConfiguration("/**", configuration);
    return source;
}
```

---

### 问题 11: 前端无法连接后端

**症状:** 前端显示"网络错误"

**解决方案:**

1. **检查后端是否运行**
```bash
curl http://localhost:8080
# 应该有响应
```

2. **检查防火墙**
```bash
# Windows
netsh advfirewall firewall add rule name="Java" dir=in action=allow protocol=TCP localport=8080

# Linux
sudo ufw allow 8080/tcp

# Mac
sudo /usr/libexec/ApplicationFirewall/socketfilterfw --add /path/to/java
```

3. **检查代理配置**
```javascript
// vite.config.js - 确保代理配置正确
server: {
  proxy: {
    '/api': {
      target: 'http://localhost:8080',
      changeOrigin: true
    }
  }
}
```

---

## 🐛 编译问题

### 问题 12: Maven 编译失败

**错误信息:**
```
Compilation failure
```

**解决方案:**

1. **清理并重新编译**
```bash
cd java-backend
mvn clean
mvn compile
```

2. **跳过测试**
```bash
mvn clean package -DskipTests
```

3. **更新依赖**
```bash
mvn clean install -U
```

4. **检查 Java 版本**
```bash
java -version
javac -version
# 确保一致且 >= 8
```

---

### 问题 13: Vue 构建失败

**错误信息:**
```
Build failed with errors
```

**解决方案:**

1. **查看详细错误**
```bash
npm run build -- --debug
```

2. **清除缓存**
```bash
rm -rf node_modules .vite dist
npm install
npm run build
```

3. **检查 Node.js 版本**
```bash
node -v
# 需要 >= 18
```

---

## 📁 文件权限问题

### 问题 14: 权限不足 (Linux/Mac)

**错误信息:**
```
Permission denied
```

**解决方案:**

```bash
# 给脚本添加执行权限
chmod +x start.sh
chmod +x setup-database.sh

# 给 Maven wrapper 添加权限
chmod +x mvnw

# 如果遇到文件写入权限问题
sudo chown -R $USER:$USER /path/to/project
```

---

## 🔍 调试技巧

### 启用详细日志

**后端日志:**
```yaml
# java-backend/src/main/resources/application.yml
logging:
  level:
    com.rental: DEBUG
    org.mybatis: DEBUG
    org.springframework.security: DEBUG
```

**前端日志:**
```javascript
// src/api/index.js - 添加请求日志
api.interceptors.request.use(
  (config) => {
    console.log('Request:', config)
    return config
  }
)

api.interceptors.response.use(
  (response) => {
    console.log('Response:', response)
    return response.data
  }
)
```

---

### 数据库调试

```sql
-- 查看所有表
SHOW TABLES;

-- 查看表结构
DESC landlords;

-- 查看测试数据
SELECT * FROM landlords;
SELECT * FROM properties;

-- 查看外键约束
SELECT * FROM information_schema.TABLE_CONSTRAINTS 
WHERE CONSTRAINT_TYPE = 'FOREIGN KEY';

-- 查看索引
SHOW INDEX FROM properties;
```

---

### 网络调试

```bash
# 测试端口连通性
telnet localhost 8080

# 查看网络连接
netstat -an | grep 8080

# 查看进程
# Windows
tasklist | findstr java

# Linux/Mac
ps aux | grep java
```

---

## 🆘 获取帮助

### 1. 查看日志

**后端日志位置:**
```bash
# 控制台输出（开发模式）
# 运行 mvn spring-boot:run 的终端

# 文件日志（如果配置）
java-backend/logs/application.log
```

**前端日志位置:**
```bash
# 浏览器开发者工具 (F12)
# Console 标签页
```

### 2. 系统信息

运行以下命令收集系统信息:

```bash
# Java 版本
java -version

# Maven 版本
mvn -version

# Node.js 版本
node -v

# npm 版本
npm -v

# MySQL 版本
mysql --version

# 操作系统
# Windows: ver
# Linux: uname -a
# Mac: sw_vers
```

### 3. 创建 Issue

如果问题仍未解决，请提供:

1. **错误信息** (完整的错误堆栈)
2. **系统信息** (OS, Java, Node.js 版本)
3. **复现步骤** (如何触发错误)
4. **相关日志** (后端和前端日志)
5. **配置文件** (application.yml 等)

---

## ✅ 预防性检查

### 启动前检查清单

```bash
# 1. 环境检查
java -version      # 需要 >= 8
mvn -version       # 需要 >= 3.6
node -v            # 需要 >= 18
mysql --version    # 需要 >= 8.0

# 2. 端口检查
netstat -ano | findstr :8080  # 应该为空
netstat -ano | findstr :5173  # 应该为空

# 3. 数据库检查
mysql -u root -p -e "SHOW DATABASES;" | grep rental_management

# 4. 依赖检查
cd vue-frontend
ls node_modules  # 应该存在

# 5. 配置文件检查
# 确认 application.yml 中的数据库配置正确
```

---

## 📞 快速修复命令

### Windows
```powershell
# 停止所有 Java 进程
taskkill /F /IM java.exe

# 清理 Maven
cd java-backend
mvn clean

# 重新安装前端依赖
cd vue-frontend
rmdir /s /q node_modules
npm install
```

### Linux/Mac
```bash
# 停止所有 Java 进程
pkill -f java

# 清理 Maven
cd java-backend
mvn clean

# 重新安装前端依赖
cd vue-frontend
rm -rf node_modules
npm install
```

---

## 🎯 常见错误速查表

| 错误 | 原因 | 解决方案 |
|------|------|----------|
| 401 Unauthorized | 密码错误或用户不存在 | 检查数据库，导入测试数据 |
| 403 Forbidden | 权限不足 | 检查 Spring Security 配置 |
| 404 Not Found | 接口不存在 | 检查 URL 和 Controller |
| 500 Internal Server Error | 后端错误 | 查看后端日志 |
| Connection Refused | 服务未启动 | 启动后端/前端 |
| Table doesn't exist | 数据库未初始化 | 运行 schema.sql |
| Access Denied | MySQL 密码错误 | 检查 application.yml |
| Port in use | 端口被占用 | 杀死进程或改端口 |

---

**祝您排查顺利！** 🔧

如果问题仍未解决，请查看详细文档或创建 Issue。
