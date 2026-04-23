@echo off
REM ============================================
REM  数据库自动初始化脚本
REM  MySQL账号: root
REM  MySQL密码: root
REM ============================================

chcp 65001 >nul
echo.
echo ==========================================
echo   房东租房管理系统 - 数据库初始化
echo ==========================================
echo.
echo MySQL 账号: root
echo MySQL 密码: root
echo.

REM 检查 MySQL 是否安装
echo [1/4] 检查 MySQL 环境...
mysql --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 MySQL 命令！
    echo.
    echo 请确保:
    echo 1. 已安装 MySQL
    echo 2. MySQL 已添加到系统 PATH
    echo.
    echo 或者使用完整路径，例如:
    echo "C:\Program Files\MySQL\MySQL Server 8.0\bin\mysql.exe"
    echo.
    pause
    exit /b 1
)
echo [成功] MySQL 环境正常

REM 测试 MySQL 连接
echo.
echo [2/4] 测试 MySQL 连接...
mysql -u root -proot -e "SELECT 1;" >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] MySQL 连接失败！
    echo.
    echo 请检查:
    echo 1. MySQL 服务是否已启动
    echo 2. 账号密码是否正确 (root/root)
    echo 3. MySQL 端口是否为默认 3306
    echo.
    echo 启动 MySQL 服务 (管理员权限):
    echo net start MySQL80
    echo.
    pause
    exit /b 1
)
echo [成功] MySQL 连接成功

REM 创建数据库
echo.
echo [3/4] 创建数据库...
mysql -u root -proot -e "CREATE DATABASE IF NOT EXISTS rental_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" 2>&1
if %errorlevel% neq 0 (
    echo [错误] 数据库创建失败！
    pause
    exit /b 1
)
echo [成功] 数据库 rental_management 创建成功

REM 导入表结构
echo.
echo [4/4] 导入表结构和测试数据...
echo.
echo --- 正在导入表结构 (schema.sql) ---
mysql -u root -proot rental_management < "%~dp0java-backend\src\main\resources\schema.sql" 2>&1
if %errorlevel% neq 0 (
    echo [错误] 表结构导入失败！
    pause
    exit /b 1
)
echo [成功] 表结构导入完成

echo.
echo --- 正在导入测试数据 (test-data.sql) ---
mysql -u root -proot rental_management < "%~dp0java-backend\src\main\resources\test-data.sql" 2>&1
if %errorlevel% neq 0 (
    echo [错误] 测试数据导入失败！
    pause
    exit /b 1
)
echo [成功] 测试数据导入完成

REM 验证导入结果
echo.
echo ==========================================
echo   验证导入结果
echo ==========================================
echo.
echo 数据库表列表:
mysql -u root -proot rental_management -e "SHOW TABLES;" 2>&1
echo.
echo 数据统计:
mysql -u root -proot rental_management -e "SELECT 'landlords' as 表名, COUNT(*) as 记录数 FROM landlords UNION ALL SELECT 'properties', COUNT(*) FROM properties UNION ALL SELECT 'tenants', COUNT(*) FROM tenants UNION ALL SELECT 'leases', COUNT(*) FROM leases UNION ALL SELECT 'bills', COUNT(*) FROM bills UNION ALL SELECT 'messages', COUNT(*) FROM messages;" 2>&1

echo.
echo ==========================================
echo   数据库初始化完成！
echo ==========================================
echo.
echo 数据库名称: rental_management
echo 字符集: utf8mb4
echo 排序规则: utf8mb4_unicode_ci
echo.
echo 已创建的表:
echo   - landlords (房东表)
echo   - properties (房源表)
echo   - tenants (租客表)
echo   - leases (租约表)
echo   - bills (账单表)
echo   - messages (消息表)
echo   - audit_logs (审计日志表)
echo   - file_uploads (文件上传表)
echo   - notifications (通知表)
echo   - payment_records (支付记录表)
echo   - maintenance_requests (维修请求表)
echo.
echo 测试数据:
echo   - 2 个房东账号 (admin/test, 密码: admin123)
echo   - 5 个房源
echo   - 3 个租客
echo   - 3 个租约
echo   - 7 个账单
echo   - 4 条消息
echo.
echo 默认登录账号:
echo   账号: admin
echo   密码: admin123
echo.
echo ==========================================
echo.
pause
