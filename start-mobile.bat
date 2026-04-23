@echo off
REM ============================================
REM  移动应用快速启动脚本
REM ============================================

echo.
echo ==========================================
echo   房东租房管理 - 移动应用
echo ==========================================
echo.

cd /d "%~dp0mobile-app"

REM Check Node.js
echo [1/3] 检查 Node.js...
node -version >nul 2>&1
if %errorlevel% neq 0 (
    echo [错误] 未找到 Node.js，请先安装 Node.js 16+
    echo 下载地址: https://nodejs.org/
    pause
    exit /b 1
)
echo [成功] Node.js 环境正常

REM Check dependencies
echo.
echo [2/3] 检查依赖...
if not exist "node_modules" (
    echo [提示] 首次运行，正在安装依赖...
    echo 这可能需要几分钟，请耐心等待...
    echo.
    call npm install
    if %errorlevel% neq 0 (
        echo [错误] 依赖安装失败
        pause
        exit /b 1
    )
    echo [成功] 依赖安装完成
) else (
    echo [成功] 依赖已存在
)

REM Start Expo
echo.
echo [3/3] 启动 Expo 开发服务器...
echo.
echo ==========================================
echo   启动选项
echo ==========================================
echo.
echo   1. 启动 Expo (显示二维码)
echo   2. 在 Android 模拟器运行
echo   3. 在 iOS 模拟器运行
echo   4. 在浏览器中运行
echo   5. 清除缓存并启动
echo.

set /p choice="请输入选项 (1-5): "

if "%choice%"=="1" goto START_EXPO
if "%choice%"=="2" goto START_ANDROID
if "%choice%"=="3" goto START_IOS
if "%choice%"=="4" goto START_WEB
if "%choice%"=="5" goto START_CLEAR

:START_EXPO
echo.
echo 正在启动 Expo...
echo.
echo 提示: 
echo - 手机安装 Expo Go App
echo - 确保手机和电脑在同一 WiFi
echo - 用 Expo Go 扫描下方显示的二维码
echo.
call npm start
goto END

:START_ANDROID
echo.
echo 正在 Android 模拟器中启动...
echo.
call npm run android
goto END

:START_IOS
echo.
echo 正在 iOS 模拟器中启动...
echo.
call npm run ios
goto END

:START_WEB
echo.
echo 正在浏览器中启动...
echo.
call npm run web
goto END

:START_CLEAR
echo.
echo 清除缓存并启动...
echo.
call npm start -- --clear
goto END

:END
echo.
echo 应用已关闭
pause
