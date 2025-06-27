@echo off
echo ====================================
echo   启动问卷系统前端服务
echo ====================================
echo.

echo 正在检查Node.js环境...
node -v
if errorlevel 1 (
    echo 错误：未找到Node.js环境，请确保已安装Node.js 16或更高版本
    pause
    exit /b 1
)

echo.
echo 正在检查npm环境...
npm -v
if errorlevel 1 (
    echo 错误：未找到npm环境
    pause
    exit /b 1
)

echo.
echo 正在检查依赖安装...
if not exist "node_modules" (
    echo 安装依赖中...
    npm install
    if errorlevel 1 (
        echo 错误：依赖安装失败
        pause
        exit /b 1
    )
)

echo.
echo 正在启动前端开发服务器...
echo 前端地址：http://localhost:3000
echo 后端API代理：http://localhost:8080/api
echo.
echo 默认账户：
echo 管理员 - 用户名: admin, 密码: admin123
echo 普通用户 - 用户名: zhangsan, 密码: admin123
echo.

echo 按Ctrl+C停止服务
npm run dev

pause 