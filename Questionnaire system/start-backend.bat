@echo off
echo ====================================
echo   启动问卷系统后端服务
echo ====================================
echo.

echo 正在检查Java环境...
java -version
if errorlevel 1 (
    echo 错误：未找到Java环境，请确保已安装JDK 8或更高版本
    pause
    exit /b 1
)

echo.
echo 正在检查Maven环境...
mvn -version
if errorlevel 1 (
    echo 错误：未找到Maven环境，请确保已安装Maven
    pause
    exit /b 1
)

echo.
echo 正在启动后端服务...
echo 服务端口：8080
echo API地址：http://localhost:8080/api
echo Swagger文档：http://localhost:8080/swagger-ui/index.html
echo.

echo 按Ctrl+C停止服务
mvn spring-boot:run

pause 