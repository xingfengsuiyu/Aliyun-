@echo off
REM ========================================
REM 房东租房管理系统 - Windows 启动脚本
REM ========================================

echo.
echo ========================================
echo    房东租房管理系统 - 启动脚本
echo ========================================
echo.

REM 检查 Java
echo [1/5] 检查 Java 环境...
java -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Java，请先安装 Java 8+
    pause
    exit /b 1
)
echo [成功] Java 环境正常

REM 检查 Maven
echo [2/5] 检查 Maven...
mvn -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Maven，请先安装 Maven
    pause
    exit /b 1
)
echo [成功] Maven 环境正常

REM 检查 Node.js
echo [3/5] 检查 Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 18+
    pause
    exit /b 1
)
echo [成功] Node.js 环境正常

REM 检查 MySQL
echo [4/5] 检查 MySQL 连接...
mysql -u root -e "SELECT 1" >nul 2>&1
if %errorlevel% neq 0 (
    echo [警告] 无法连接 MySQL，请确保:
    echo   1. MySQL 服务已启动
    echo   2. 数据库已创建
    echo   3. 用户名密码正确
    echo.
    set /p continue="是否继续? (y/n): "
    if /i not "%continue%"=="y" exit /b 1
) else (
    echo [成功] MySQL 连接正常
)

echo.
echo [5/5] 环境检查完成!
echo.
echo ========================================
echo    请选择启动方式
echo ========================================
echo.
echo   1. 仅启动后端服务
echo   2. 仅启动前端服务  
echo   3. 同时启动后端和前端
echo   4. 编译后端并启动
echo   5. 安装前端依赖并启动
echo.

set /p choice="请输入选项 (1-5): "

if "%choice%"=="1" goto START_BACKEND
if "%choice%"=="2" goto START_FRONTEND
if "%choice%"=="3" goto START_BOTH
if "%choice%"=="4" goto BUILD_AND_START_BACKEND
if "%choice%"=="5" goto INSTALL_AND_START_FRONTEND

echo [错误] 无效选项
pause
exit /b 1

:START_BACKEND
echo.
echo ========================================
echo    启动后端服务...
echo ========================================
echo.
cd /d "%~dp0java-backend"
start "后端服务" cmd /k "mvn spring-boot:run"
echo 后端服务已在新窗口启动
echo 访问地址: http://localhost:8080
goto END

:START_FRONTEND
echo.
echo ========================================
echo    启动前端服务...
echo ========================================
echo.
cd /d "%~dp0vue-frontend"
start "前端服务" cmd /k "npm run dev"
echo 前端服务已在新窗口启动
echo 访问地址: http://localhost:5173
goto END

:START_BOTH
echo.
echo ========================================
echo    同时启动后端和前端...
echo ========================================
echo.

echo 启动后端...
cd /d "%~dp0java-backend"
start "后端服务" cmd /k "mvn spring-boot:run"
timeout /t 2 /nobreak >nul

echo 启动前端...
cd /d "%~dp0vue-frontend"
start "前端服务" cmd /k "npm run dev"

echo.
echo ========================================
echo    服务启动完成!
echo ========================================
echo.
echo 后端地址: http://localhost:8080
echo 前端地址: http://localhost:5173
echo.
echo 默认账号: admin
echo 默认密码: admin123
echo.
goto END

:BUILD_AND_START_BACKEND
echo.
echo ========================================
echo    编译并启动后端...
echo ========================================
echo.
cd /d "%~dp0java-backend"
echo 开始编译...
call mvn clean package -DskipTests
if %errorlevel% neq 0 (
    echo [错误] 编译失败
    pause
    exit /b 1
)
echo 编译成功!
echo.
echo 启动服务...
start "后端服务" cmd /k "java -jar target\rental-management-1.0.0.jar"
echo 后端服务已启动
echo 访问地址: http://localhost:8080
goto END

:INSTALL_AND_START_FRONTEND
echo.
echo ========================================
echo    安装依赖并启动前端...
echo ========================================
echo.
cd /d "%~dp0vue-frontend"
echo 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo [错误] 依赖安装失败
    pause
    exit /b 1
)
echo 依赖安装完成!
echo.
echo 启动服务...
start "前端服务" cmd /k "npm run dev"
echo 前端服务已启动
echo 访问地址: http://localhost:5173
goto END

:END
echo.
echo ========================================
echo    按任意键关闭此窗口
echo ========================================
pause >nul
