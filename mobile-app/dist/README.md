# 房东租房管理系统 - Web 版本

## 构建完成

Web 项目已成功构建，包含以下文件：
- `index.html` - 应用入口文件
- `bundle.js` - JavaScript 应用逻辑

## 部署到阿里云服务器

### 方法一：使用 SCP 上传

```bash
# 1. 压缩 dist 目录
cd e:\workspace\zufangguanlixitong\mobile-app
tar -czvf web-app.tar.gz dist

# 2. 上传到阿里云服务器
scp web-app.tar.gz root@<阿里云IP>:/var/www/html/

# 3. 登录服务器解压
ssh root@<阿里云IP>
cd /var/www/html
tar -xzvf web-app.tar.gz
```

### 方法二：直接上传 dist 目录

```bash
# 使用 SCP 直接上传整个目录
scp -r dist root@<阿里云IP>:/var/www/html/
```

### 方法三：使用 FTP/SFTP 工具

使用 FileZilla、WinSCP 等 FTP 客户端工具，将 dist 目录上传到服务器的 `/var/www/html` 目录。

## Nginx 配置

创建配置文件 `/etc/nginx/conf.d/rental-app.conf`：

```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    location / {
        root /var/www/html/dist;
        index index.html;
        try_files $uri $uri/ /index.html;
    }
}
```

重启 Nginx：
```bash
systemctl restart nginx
```

## 访问应用

部署完成后，通过以下方式访问：
- `http://<阿里云IP>`
- `http://your-domain.com`（如果配置了域名）

## 功能特性

- 房源管理：添加、编辑、删除房源
- 租户管理：管理租户信息和联系方式
- 租约管理：创建、续租、终止租约
- 账单管理：生成、查看、收款账单

## 注意事项

1. 确保服务器已安装 Nginx
2. 确保 80 端口已开放
3. 建议配置 HTTPS 以确保数据安全
4. 完整功能需要与后端 API 集成

## 技术支持

如有问题，请联系技术支持团队。
