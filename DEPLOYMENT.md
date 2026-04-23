# 📦 部署与运维指南

## 完整部署流程 - 从开发到生产

---

## 🎯 部署选项

### 选项 1: 本地开发环境（推荐用于测试）
- 适用场景: 开发、测试、演示
- 优点: 简单快速
- 缺点: 不适合生产使用

### 选项 2: Docker 容器化部署（推荐用于生产）
- 适用场景: 生产环境、团队协作
- 优点: 环境一致、易于扩展
- 缺点: 需要Docker知识

### 选项 3: 传统服务器部署
- 适用场景: 已有服务器基础设施
- 优点: 完全控制
- 缺点: 配置复杂

---

## 🚀 选项 1: 本地开发环境部署

### 前置条件
```bash
# 检查已安装的软件
java -version          # 需要 Java 8+
mvn -version           # 需要 Maven 3.6+
node -v                # 需要 Node.js 18+
npm -v                 # 需要 npm 9+
mysql --version        # 需要 MySQL 8.0+
```

### Step 1: 数据库初始化

```bash
# 1. 登录 MySQL
mysql -u root -p

# 2. 创建数据库
CREATE DATABASE rental_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# 3. 退出 MySQL
exit;

# 4. 导入数据库表结构
mysql -u root -p rental_management < java-backend/src/main/resources/schema.sql

# 5. 导入测试数据（可选）
mysql -u root -p rental_management < java-backend/src/main/resources/test-data.sql
```

### Step 2: 配置后端

编辑 `java-backend/src/main/resources/application.yml`:

```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/rental_management?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
    username: root          # 修改为你的MySQL用户名
    password: your_password # 修改为你的MySQL密码
    
# JWT配置（保持默认即可）
jwt:
  secret: your-secret-key-here-must-be-at-least-256-bits-long-for-hs512
  expiration: 604800000  # 7天（毫秒）
```

### Step 3: 启动后端

```bash
# Windows PowerShell
cd e:\workspace\zufangguanlixitong\java-backend

# 方式 1: 使用 Maven 运行（开发模式）
mvn spring-boot:run

# 方式 2: 打包后运行
mvn clean package -DskipTests
java -jar target/rental-management-1.0.0.jar
```

**验证后端启动成功:**
```bash
# 打开浏览器访问
http://localhost:8080

# 或使用 curl 测试
curl http://localhost:8080/api/auth/login -X POST -H "Content-Type: application/json" -d "{\"account\":\"admin\",\"password\":\"admin123\"}"
```

### Step 4: 配置前端

前端已配置好代理，无需修改。如需修改，编辑 `vue-frontend/vite.config.js`:

```javascript
export default defineConfig({
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',  // 后端地址
        changeOrigin: true
      }
    }
  }
})
```

### Step 5: 启动前端

```bash
# 打开新的终端窗口
cd e:\workspace\zufangguanlixitong\vue-frontend

# 首次运行需要安装依赖
npm install

# 启动开发服务器
npm run dev
```

**访问系统:**
- 前端地址: http://localhost:5173
- 默认账号: `admin` / `admin123`

---

## 🐳 选项 2: Docker 容器化部署

### Step 1: 创建 Dockerfile

创建文件 `java-backend/Dockerfile`:

```dockerfile
# 构建阶段
FROM maven:3.8-openjdk-8-slim AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline
COPY src ./src
RUN mvn clean package -DskipTests

# 运行阶段
FROM openjdk:8-jre-slim
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
```

### Step 2: 创建前端 Dockerfile

创建文件 `vue-frontend/Dockerfile`:

```dockerfile
# 构建阶段
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# 运行阶段
FROM nginx:alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### Step 3: 创建 Nginx 配置

创建文件 `vue-frontend/nginx.conf`:

```nginx
server {
    listen 80;
    server_name localhost;
    
    root /usr/share/nginx/html;
    index index.html;
    
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 代理后端 API
    location /api {
        proxy_pass http://backend:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

### Step 4: 创建 docker-compose.yml

在项目根目录创建 `docker-compose.yml`:

```yaml
version: '3.8'

services:
  # MySQL 数据库
  mysql:
    image: mysql:8.0
    container_name: rental-mysql
    environment:
      MYSQL_ROOT_PASSWORD: root123456
      MYSQL_DATABASE: rental_management
      MYSQL_CHARSET: utf8mb4
    ports:
      - "3306:3306"
    volumes:
      - mysql-data:/var/lib/mysql
      - ./java-backend/src/main/resources/schema.sql:/docker-entrypoint-initdb.d/01-schema.sql
      - ./java-backend/src/main/resources/test-data.sql:/docker-entrypoint-initdb.d/02-test-data.sql
    command: --character-set-server=utf8mb4 --collation-server=utf8mb4_unicode_ci
    networks:
      - rental-network

  # 后端服务
  backend:
    build: ./java-backend
    container_name: rental-backend
    environment:
      SPRING_DATASOURCE_URL: jdbc:mysql://mysql:3306/rental_management?useUnicode=true&characterEncoding=utf8&useSSL=false&serverTimezone=Asia/Shanghai
      SPRING_DATASOURCE_USERNAME: root
      SPRING_DATASOURCE_PASSWORD: root123456
    ports:
      - "8080:8080"
    depends_on:
      - mysql
    networks:
      - rental-network

  # 前端服务
  frontend:
    build: ./vue-frontend
    container_name: rental-frontend
    ports:
      - "80:80"
    depends_on:
      - backend
    networks:
      - rental-network

volumes:
  mysql-data:

networks:
  rental-network:
    driver: bridge
```

### Step 5: 启动 Docker

```bash
# 构建并启动所有服务
docker-compose up -d

# 查看日志
docker-compose logs -f

# 停止服务
docker-compose down

# 停止并删除数据卷（谨慎使用）
docker-compose down -v
```

**访问系统:**
- 前端: http://localhost
- 后端 API: http://localhost:8080
- MySQL: localhost:3306 (root/root123456)

---

## 🖥️ 选项 3: 传统服务器部署

### 服务器要求
- **CPU**: 2核+
- **内存**: 4GB+
- **硬盘**: 20GB+
- **操作系统**: Ubuntu 20.04 / CentOS 7+ / Windows Server

### Step 1: 安装环境

#### Ubuntu/Debian
```bash
# 安装 Java 8
sudo apt update
sudo apt install openjdk-8-jdk -y

# 安装 MySQL
sudo apt install mysql-server -y
sudo mysql_secure_installation

# 安装 Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install nodejs -y

# 安装 Nginx
sudo apt install nginx -y
```

#### CentOS/RHEL
```bash
# 安装 Java 8
sudo yum install java-1.8.0-openjdk -y

# 安装 MySQL
sudo yum install mysql-server -y
sudo systemctl start mysqld
sudo mysql_secure_installation

# 安装 Node.js
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install nodejs -y

# 安装 Nginx
sudo yum install epel-release -y
sudo yum install nginx -y
```

### Step 2: 部署后端

```bash
# 1. 上传项目到服务器
scp -r java-backend/ user@server:/opt/rental-system/

# 2. 编译打包
cd /opt/rental-system/java-backend
mvn clean package -DskipTests

# 3. 创建 systemd 服务
sudo nano /etc/systemd/system/rental-backend.service
```

创建服务文件 `/etc/systemd/system/rental-backend.service`:

```ini
[Unit]
Description=Rental Management Backend
After=syslog.target network.target mysql.service

[Service]
Type=simple
User=root
WorkingDirectory=/opt/rental-system/java-backend
ExecStart=/usr/bin/java -jar target/rental-management-1.0.0.jar
SuccessExitStatus=143
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
```

```bash
# 4. 启动服务
sudo systemctl daemon-reload
sudo systemctl enable rental-backend
sudo systemctl start rental-backend

# 5. 查看状态
sudo systemctl status rental-backend

# 6. 查看日志
sudo journalctl -u rental-backend -f
```

### Step 3: 部署前端

```bash
# 1. 上传前端代码
scp -r vue-frontend/ user@server:/opt/rental-system/

# 2. 构建生产版本
cd /opt/rental-system/vue-frontend
npm install
npm run build

# 3. 配置 Nginx
sudo nano /etc/nginx/sites-available/rental-frontend
```

创建 Nginx 配置 `/etc/nginx/sites-available/rental-frontend`:

```nginx
server {
    listen 80;
    server_name your-domain.com;  # 修改为你的域名或IP
    
    # 前端文件
    location / {
        root /opt/rental-system/vue-frontend/dist;
        try_files $uri $uri/ /index.html;
        
        # 缓存静态资源
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # 后端 API 代理
    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        # WebSocket 支持（如需要）
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }
    
    # Gzip 压缩
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml;
    gzip_min_length 1000;
}
```

```bash
# 4. 启用配置
sudo ln -s /etc/nginx/sites-available/rental-frontend /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx

# 5. 设置防火墙
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

### Step 4: 配置 HTTPS（推荐）

```bash
# 安装 Certbot
sudo apt install certbot python3-certbot-nginx -y

# 获取 SSL 证书
sudo certbot --nginx -d your-domain.com

# 自动续期
sudo certbot renew --dry-run
```

---

## 🔧 运维管理

### 数据库备份

```bash
#!/bin/bash
# backup.sh - 数据库备份脚本

BACKUP_DIR="/opt/backups/mysql"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="rental_management_${DATE}.sql"

mkdir -p $BACKUP_DIR

mysqldump -u root -p'rental_management' > ${BACKUP_DIR}/${BACKUP_FILE}

# 保留最近30天的备份
find $BACKUP_DIR -name "rental_management_*.sql" -mtime +30 -delete

echo "Backup completed: ${BACKUP_FILE}"
```

设置定时任务（每天凌晨2点备份）:
```bash
crontab -e

# 添加以下行
0 2 * * * /opt/scripts/backup.sh >> /opt/logs/backup.log 2>&1
```

### 日志管理

```bash
# 查看后端日志
tail -f /opt/rental-system/java-backend/logs/application.log

# 查看 Nginx 访问日志
tail -f /var/log/nginx/access.log

# 查看 Nginx 错误日志
tail -f /var/log/nginx/error.log

# 使用 journalctl 查看服务日志
journalctl -u rental-backend -n 100 --no-pager
```

### 性能监控

```bash
# 查看 Java 进程
ps aux | grep java

# 查看内存使用
free -h

# 查看磁盘使用
df -h

# 查看 CPU 使用
top

# 查看网络连接
netstat -tulpn | grep :8080
netstat -tulpn | grep :80
```

### 服务管理

```bash
# 重启后端
sudo systemctl restart rental-backend

# 重启 Nginx
sudo systemctl restart nginx

# 重启 MySQL
sudo systemctl restart mysql

# 查看服务状态
sudo systemctl status rental-backend nginx mysql
```

---

## 🚨 故障排查

### 后端无法启动

```bash
# 1. 检查 Java 版本
java -version

# 2. 检查端口占用
netstat -tulpn | grep :8080

# 3. 检查数据库连接
mysql -u root -p -e "SELECT 1"

# 4. 查看详细错误日志
journalctl -u rental-backend -n 200 --no-pager

# 5. 手动运行查看错误
cd /opt/rental-system/java-backend
java -jar target/rental-management-1.0.0.jar
```

### 前端无法访问

```bash
# 1. 检查 Nginx 配置
sudo nginx -t

# 2. 检查 Nginx 状态
sudo systemctl status nginx

# 3. 检查错误日志
tail -f /var/log/nginx/error.log

# 4. 检查文件权限
ls -la /opt/rental-system/vue-frontend/dist/
```

### 数据库连接失败

```bash
# 1. 检查 MySQL 服务
sudo systemctl status mysql

# 2. 测试连接
mysql -u root -p -e "SHOW DATABASES"

# 3. 检查用户权限
mysql -u root -p
SELECT user, host FROM mysql.user;
SHOW GRANTS FOR 'root'@'localhost';

# 4. 检查 MySQL 日志
tail -f /var/log/mysql/error.log
```

---

## 📊 生产环境检查清单

部署前确认:

- [ ] Java 8+ 已安装
- [ ] MySQL 8.0+ 已安装并配置
- [ ] Node.js 18+ 已安装（仅构建时需要）
- [ ] Nginx 已安装并配置
- [ ] 数据库表结构已导入
- [ ] 测试数据已导入（可选）
- [ ] 后端配置已更新（数据库密码等）
- [ ] 前端构建完成（npm run build）
- [ ] 防火墙规则已配置
- [ ] SSL 证书已配置（推荐）
- [ ] 数据库备份脚本已设置
- [ ] 日志轮转已配置
- [ ] 监控告警已设置（可选）

---

## 🎓 常用命令速查

```bash
# ===== 后端 =====
cd java-backend
mvn clean package -DskipTests          # 打包
java -jar target/*.jar                 # 运行
mvn spring-boot:run                    # 开发模式运行

# ===== 前端 =====
cd vue-frontend
npm install                            # 安装依赖
npm run dev                            # 开发服务器
npm run build                          # 生产构建

# ===== 数据库 =====
mysql -u root -p                       # 登录 MySQL
source schema.sql                      # 导入 SQL
mysqldump -u root -p db_name > backup.sql  # 备份

# ===== Docker =====
docker-compose up -d                   # 启动
docker-compose down                    # 停止
docker-compose logs -f                 # 查看日志
docker-compose rebuild                 # 重新构建

# ===== 服务管理 =====
systemctl start service_name           # 启动服务
systemctl stop service_name            # 停止服务
systemctl restart service_name         # 重启服务
systemctl status service_name          # 查看状态
journalctl -u service_name -f          # 查看日志
```

---

## 📞 技术支持

如遇到问题:

1. 📖 查看本文档的故障排查部分
2. 📝 查看应用日志
3. 🔍 搜索错误信息
4. 💬 创建 Issue 描述问题

---

**祝您部署顺利！** 🎉
