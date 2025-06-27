# SpringDoc OpenAPI 3 文档配置说明

## 概述

本项目已集成 SpringDoc OpenAPI 3 用于 API 文档生成和接口测试。SpringDoc 是 Springfox 的现代替代方案，与 Spring Boot 2.6+ 有更好的兼容性。

## 依赖配置

在 `pom.xml` 中添加了以下依赖：

```xml
<!-- SpringDoc OpenAPI 3 -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-ui</artifactId>
    <version>1.6.14</version>
</dependency>

<!-- SpringDoc OpenAPI Security -->
<dependency>
    <groupId>org.springdoc</groupId>
    <artifactId>springdoc-openapi-security</artifactId>
    <version>1.6.14</version>
</dependency>
```

## 配置文件

### SwaggerConfig.java
- 位置：`src/main/java/com/gujian/questionnaire/config/SwaggerConfig.java`
- 功能：配置 OpenAPI 文档信息、安全认证等

### WebConfig.java
- 位置：`src/main/java/com/gujian/questionnaire/config/WebConfig.java`
- 功能：配置静态资源映射和视图控制器

### SecurityConfig.java
- 更新了安全配置，允许 SpringDoc 相关路径的匿名访问

### application.yml
- 添加了 SpringDoc 相关配置

## 访问地址

启动应用后，可以通过以下地址访问：

- **Swagger UI**: http://localhost:8080/swagger-ui.html
- **API 文档 JSON**: http://localhost:8080/v3/api-docs
- **测试接口**: http://localhost:8080/api/test/health

## 注解使用

### 控制器级别注解

```java
@Tag(name = "接口分组名称", description = "接口分组描述")
@RestController
@RequestMapping("/api/example")
public class ExampleController {
    // ...
}
```

### 方法级别注解

```java
@Operation(summary = "接口摘要", description = "接口详细描述")
@GetMapping("/list")
public Result<List<Object>> list(
    @Parameter(description = "参数描述") @RequestParam String param
) {
    // ...
}
```

### 参数注解

- `@Parameter(description = "参数描述")` - 用于描述请求参数
- `@RequestBody` - 自动生成请求体文档
- `@PathVariable` - 路径变量自动识别

## 安全认证

Swagger UI 已配置支持 JWT Token 认证：

1. 在 Swagger UI 页面点击右上角的 "Authorize" 按钮
2. 在弹出的对话框中输入：`Bearer your_jwt_token`
3. 点击 "Authorize" 完成认证
4. 之后的 API 调用将自动携带认证头

## 测试接口

项目包含测试接口用于验证 SpringDoc 配置：

- `GET /api/test/health` - 健康检查
- `GET /api/test/info` - 系统信息

这些接口无需认证即可访问。

## 启动方式

### 方式一：使用测试脚本
```bash
# Windows
test-swagger.bat
```

### 方式二：使用启动脚本
```bash
# Windows
start.bat
```

### 方式三：Maven 命令
```bash
mvn spring-boot:run
```

### 方式四：IDE 运行
直接运行 `QuestionnaireSystemApplication.java` 主类

## 配置说明

### SpringDoc 配置项

```yaml
springdoc:
  api-docs:
    enabled: true              # 启用API文档
    path: /v3/api-docs         # API文档JSON路径
  swagger-ui:
    enabled: true              # 启用Swagger UI
    path: /swagger-ui.html     # Swagger UI访问路径
    try-it-out-enabled: true   # 启用"试用"功能
    operations-sorter: alpha   # 接口排序方式
    tags-sorter: alpha         # 标签排序方式
  packages-to-scan: com.gujian.questionnaire.controller  # 扫描的包路径
```

## 常见问题

### 1. Swagger UI 无法访问
- 检查应用是否正常启动
- 确认端口 8080 未被占用
- 访问 http://localhost:8080/swagger-ui.html

### 2. API 接口不显示
- 确认控制器类在正确的包路径下 (`com.gujian.questionnaire.controller`)
- 检查是否添加了正确的注解

### 3. 认证失败
- 确认 JWT Token 格式正确
- 检查 Token 是否已过期
- 确认在认证框中添加了 "Bearer " 前缀

### 4. 启动报错
如果遇到 Springfox 相关错误，说明配置已正确切换到 SpringDoc，旧的 Springfox 依赖应该已被移除。

## 与 Springfox 的区别

| 特性 | Springfox | SpringDoc |
|------|-----------|-----------|
| Spring Boot 兼容性 | 2.5及以下 | 2.6+ |
| 注解 | @Api, @ApiOperation | @Tag, @Operation |
| 配置复杂度 | 较复杂 | 简单 |
| 维护状态 | 停止维护 | 活跃维护 |

## 开发建议

1. **接口文档编写**：为每个接口添加清晰的 `@Operation` 注解
2. **参数描述**：使用 `@Parameter` 注解描述所有参数
3. **返回值说明**：在接口描述中说明返回值结构
4. **错误码文档**：在接口描述中列出可能的错误码

## 版本信息

- Spring Boot: 2.6.13
- SpringDoc OpenAPI: 1.6.14
- OpenAPI: 3.0 