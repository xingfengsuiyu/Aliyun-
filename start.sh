#!/bin/bash
# ========================================
# 房东租房管理系统 - Linux/Mac 启动脚本
# ========================================

# 设置颜色
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 打印函数
print_header() {
    echo ""
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}   $1${NC}"
    echo -e "${BLUE}========================================${NC}"
    echo ""
}

print_success() {
    echo -e "${GREEN}[成功]${NC} $1"
}

print_error() {
    echo -e "${RED}[错误]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[警告]${NC} $1"
}

print_info() {
    echo -e "${BLUE}[信息]${NC} $1"
}

# 脚本目录
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

print_header "房东租房管理系统 - 启动脚本"

# 检查 Java
print_info "检查 Java 环境..."
if command -v java &> /dev/null; then
    JAVA_VERSION=$(java -version 2>&1 | head -n 1 | cut -d'"' -f2 | cut -d'.' -f1)
    if [ "$JAVA_VERSION" -ge 8 ]; then
        print_success "Java 环境正常 (版本: $JAVA_VERSION)"
    else
        print_error "Java 版本过低，需要 Java 8+ (当前: $JAVA_VERSION)"
        exit 1
    fi
else
    print_error "未找到 Java，请先安装 Java 8+"
    echo "  Ubuntu/Debian: sudo apt install openjdk-8-jdk"
    echo "  CentOS/RHEL: sudo yum install java-1.8.0-openjdk"
    echo "  Mac: brew install openjdk@8"
    exit 1
fi

# 检查 Maven
print_info "检查 Maven..."
if command -v mvn &> /dev/null; then
    MAVEN_VERSION=$(mvn -version 2>&1 | head -n 1 | cut -d' ' -f3)
    print_success "Maven 环境正常 (版本: $MAVEN_VERSION)"
else
    print_error "未找到 Maven，请先安装 Maven"
    echo "  Ubuntu/Debian: sudo apt install maven"
    echo "  CentOS/RHEL: sudo yum install maven"
    echo "  Mac: brew install maven"
    exit 1
fi

# 检查 Node.js
print_info "检查 Node.js..."
if command -v node &> /dev/null; then
    NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
    if [ "$NODE_VERSION" -ge 18 ]; then
        print_success "Node.js 环境正常 (版本: $(node -v))"
    else
        print_warning "Node.js 版本较低，建议使用 Node.js 18+ (当前: $(node -v))"
    fi
else
    print_error "未找到 Node.js，请先安装 Node.js 18+"
    echo "  参考: https://nodejs.org/"
    exit 1
fi

# 检查 MySQL
print_info "检查 MySQL 连接..."
if command -v mysql &> /dev/null; then
    if mysql -u root -e "SELECT 1" &> /dev/null; then
        print_success "MySQL 连接正常"
    else
        print_warning "无法连接 MySQL"
        echo "  请确保:"
        echo "    1. MySQL 服务已启动 (sudo systemctl start mysql)"
        echo "    2. 数据库已创建"
        echo "    3. 用户名密码正确"
        echo ""
        read -p "是否继续? (y/n): " continue_choice
        if [ "$continue_choice" != "y" ] && [ "$continue_choice" != "Y" ]; then
            exit 1
        fi
    fi
else
    print_warning "未找到 MySQL 客户端"
    echo "  Ubuntu/Debian: sudo apt install mysql-client"
    echo "  CentOS/RHEL: sudo yum install mysql"
    echo "  Mac: brew install mysql-client"
fi

print_info "环境检查完成!"

# 主菜单
print_header "请选择启动方式"

echo "  1. 仅启动后端服务"
echo "  2. 仅启动前端服务"
echo "  3. 同时启动后端和前端"
echo "  4. 编译后端并启动"
echo "  5. 安装前端依赖并启动"
echo "  6. 初始化数据库"
echo ""

read -p "请输入选项 (1-6): " choice

case $choice in
    1)
        print_header "启动后端服务..."
        cd "$SCRIPT_DIR/java-backend"
        echo "启动中..."
        mvn spring-boot:run &
        BACKEND_PID=$!
        echo $BACKEND_PID > /tmp/rental-backend.pid
        print_success "后端服务已启动 (PID: $BACKEND_PID)"
        print_info "访问地址: http://localhost:8080"
        print_info "停止服务: kill $BACKEND_PID"
        ;;
        
    2)
        print_header "启动前端服务..."
        cd "$SCRIPT_DIR/vue-frontend"
        
        if [ ! -d "node_modules" ]; then
            print_info "首次运行，正在安装依赖..."
            npm install
        fi
        
        echo "启动中..."
        npm run dev &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > /tmp/rental-frontend.pid
        print_success "前端服务已启动 (PID: $FRONTEND_PID)"
        print_info "访问地址: http://localhost:5173"
        print_info "停止服务: kill $FRONTEND_PID"
        ;;
        
    3)
        print_header "同时启动后端和前端..."
        
        # 启动后端
        print_info "启动后端..."
        cd "$SCRIPT_DIR/java-backend"
        mvn spring-boot:run &
        BACKEND_PID=$!
        echo $BACKEND_PID > /tmp/rental-backend.pid
        sleep 2
        
        # 启动前端
        print_info "启动前端..."
        cd "$SCRIPT_DIR/vue-frontend"
        
        if [ ! -d "node_modules" ]; then
            print_info "安装前端依赖..."
            npm install
        fi
        
        npm run dev &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > /tmp/rental-frontend.pid
        
        echo ""
        print_header "服务启动完成!"
        echo "  后端地址: http://localhost:8080"
        echo "  前端地址: http://localhost:5173"
        echo ""
        echo "  默认账号: admin"
        echo "  默认密码: admin123"
        echo ""
        echo "  后端 PID: $BACKEND_PID"
        echo "  前端 PID: $FRONTEND_PID"
        echo "  停止所有: kill $BACKEND_PID $FRONTEND_PID"
        echo ""
        ;;
        
    4)
        print_header "编译并启动后端..."
        cd "$SCRIPT_DIR/java-backend"
        
        print_info "开始编译..."
        mvn clean package -DskipTests
        if [ $? -ne 0 ]; then
            print_error "编译失败"
            exit 1
        fi
        
        print_success "编译成功!"
        echo ""
        print_info "启动服务..."
        java -jar target/rental-management-1.0.0.jar &
        BACKEND_PID=$!
        echo $BACKEND_PID > /tmp/rental-backend.pid
        print_success "后端服务已启动 (PID: $BACKEND_PID)"
        print_info "访问地址: http://localhost:8080"
        ;;
        
    5)
        print_header "安装依赖并启动前端..."
        cd "$SCRIPT_DIR/vue-frontend"
        
        print_info "安装依赖..."
        npm install
        if [ $? -ne 0 ]; then
            print_error "依赖安装失败"
            exit 1
        fi
        
        print_success "依赖安装完成!"
        echo ""
        print_info "启动服务..."
        npm run dev &
        FRONTEND_PID=$!
        echo $FRONTEND_PID > /tmp/rental-frontend.pid
        print_success "前端服务已启动 (PID: $FRONTEND_PID)"
        print_info "访问地址: http://localhost:5173"
        ;;
        
    6)
        print_header "初始化数据库..."
        
        read -p "MySQL 用户名 (默认 root): " mysql_user
        mysql_user=${mysql_user:-root}
        
        read -sp "MySQL 密码: " mysql_pass
        echo ""
        
        # 创建数据库
        print_info "创建数据库..."
        echo "CREATE DATABASE IF NOT EXISTS rental_management DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;" | mysql -u "$mysql_user" -p"$mysql_pass"
        if [ $? -ne 0 ]; then
            print_error "数据库创建失败，请检查用户名和密码"
            exit 1
        fi
        print_success "数据库创建完成"
        
        # 导入表结构
        print_info "导入表结构..."
        mysql -u "$mysql_user" -p"$mysql_pass" rental_management < "$SCRIPT_DIR/java-backend/src/main/resources/schema.sql"
        if [ $? -ne 0 ]; then
            print_error "表结构导入失败"
            exit 1
        fi
        print_success "表结构导入完成"
        
        # 导入测试数据
        read -p "是否导入测试数据? (y/n): " import_test
        if [ "$import_test" = "y" ] || [ "$import_test" = "Y" ]; then
            print_info "导入测试数据..."
            mysql -u "$mysql_user" -p"$mysql_pass" rental_management < "$SCRIPT_DIR/java-backend/src/main/resources/test-data.sql"
            if [ $? -ne 0 ]; then
                print_warning "测试数据导入失败（可能已存在）"
            else
                print_success "测试数据导入完成"
            fi
        fi
        
        echo ""
        print_header "数据库初始化完成!"
        echo "  数据库名称: rental_management"
        echo ""
        if [ "$import_test" = "y" ] || [ "$import_test" = "Y" ]; then
            echo "  测试账号:"
            echo "    账号: admin 或 test"
            echo "    密码: admin123"
            echo ""
        fi
        ;;
        
    *)
        print_error "无效选项"
        exit 1
        ;;
esac

echo ""
print_header "按 Ctrl+C 停止服务"
echo ""

# 等待后台进程
wait
