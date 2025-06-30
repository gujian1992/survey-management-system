@echo off
chcp 65001 >nul
echo ===================================
echo 🛡️ SecurityConfig 权限配置测试
echo ===================================
echo.

echo 🔓 测试公开接口 (无需认证)
curl -s "http://localhost:8080/api/test/redis" && echo ✅ 测试接口访问正常 || echo ❌ 测试接口访问失败
echo.

echo 📚 测试题库接口 (需要认证)
echo 测试需要登录后获取token进行验证...
echo.

echo 📝 提示: 完整的权限测试需要:
echo 1. 用户登录获取token
echo 2. 管理员登录获取token  
echo 3. 分别测试不同角色的接口访问
echo.

echo 🔍 查看当前后端服务状态:
curl -s "http://localhost:8080/api/test/redis" >nul 2>&1
if %errorlevel% equ 0 (
    echo ✅ 后端服务运行正常
) else (
    echo ❌ 后端服务未启动或无法访问
    echo 请运行 start-backend.bat 启动后端服务
)

echo.
echo 📖 详细权限配置请查看: SecurityConfig-权限配置说明.md
pause 