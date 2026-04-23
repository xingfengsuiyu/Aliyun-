@echo off
REM ========================================
REM 数据库初始化脚本 - Windows
REM ========================================

echo.
echo ========================================
echo    数据库初始化脚本
echo ========================================
echo.
echo 此脚本将:
echo   1. 创建数据库
echo   2. 导入表结构
echo   3. 导入测试数据
echo.

set /p mysql_user="请输入 MySQL 用户名 (默认 root): "
if "%mysql_user%"=="" set mysql_user=root

set /p mysql_pass="请输入 MySQL 密码: "

echo.
echo [1/3] 创建数据库...
echo CREATE DATABASE IF NOT EXISTS rental_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; | mysql -u %mysql_user% -p%mysql_pass%
if %errorlevel% neq 0 (
    echo [错误] 数据库创建失败，请检查用户名和密码
    pause
    exit /b 1
)
echo [成功] 数据库创建完成

echo.
echo [2/3] 导入表结构...
mysql -u %mysql_user% -p%mysql_pass% rental_management < "%~dp0java-backend\src\main\resources\schema.sql"
if %errorlevel% neq 0 (
    echo [错误] 表结构导入失败
    pause
    exit /b 1
)
echo [成功] 表结构导入完成

echo.
echo [3/3] 导入测试数据...
set /p import_test="是否导入测试数据? (y/n): "
if /i "%import_test%"=="y" (
    mysql -u %mysql_user% -p%mysql_pass% rental_management < "%~dp0java-backend\src\main\resources\test-data.sql"
    if %errorlevel% neq 0 (
        echo [警告] 测试数据导入失败（可能已存在）
    ) else (
        echo [成功] 测试数据导入完成
    )
)

echo.
echo ========================================
echo    数据库初始化完成!
echo ========================================
echo.
echo 数据库名称: rental_management
echo.
if /i "%import_test%"=="y" (
    echo 测试账号:
    echo   账号: admin 或 test
    echo   密码: admin123
    echo.
)
echo 下一步:
echo   1. 启动后端服务
echo   2. 启动前端服务
echo   3. 访问 http://localhost:5173
echo.
pause
