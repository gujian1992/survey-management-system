@echo off
echo 测试SpringDoc OpenAPI配置...
echo.

echo 清理Maven缓存...
mvn clean

echo.
echo 编译项目...
mvn compile -DskipTests

echo.
echo 启动应用进行测试...
echo 请在浏览器中访问以下地址验证配置：
echo.
echo - Swagger UI: http://localhost:8080/swagger-ui.html
echo - API文档JSON: http://localhost:8080/v3/api-docs
echo - 测试接口: http://localhost:8080/api/test/health
echo.

mvn spring-boot:run -DskipTests

pause 