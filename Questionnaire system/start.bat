@echo off
echo 启动问卷系统后端服务...
echo.

echo 检查Java环境...
java -version
if %errorlevel% neq 0 (
    echo 错误：未找到Java环境，请确保已安装Java 8或更高版本
    pause
    exit /b 1
)

echo.
echo 检查Maven环境...
mvn -version
if %errorlevel% neq 0 (
    echo 错误：未找到Maven环境，请确保已安装Maven
    pause
    exit /b 1
)

echo.
echo 编译项目...
mvn clean compile
if %errorlevel% neq 0 (
    echo 错误：项目编译失败
    pause
    exit /b 1
)

echo.
echo 启动Spring Boot应用...
echo 访问地址：
echo - 应用首页：http://localhost:8080
echo - Swagger UI：http://localhost:8080/swagger-ui/index.html
echo - API文档：http://localhost:8080/v3/api-docs
echo.

mvn spring-boot:run

pause 