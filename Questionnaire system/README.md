# 问卷系统

这是一个基于Spring Boot + Vue 3的完整问卷调查系统，包含问卷创建、发布、填写、数据统计等完整功能。

## 技术栈

### 后端
- Java 1.8
- Spring Boot 2.6.13
- MySQL 8.0+
- MyBatis Plus 3.5.2
- Maven 3.6+

### 前端
- Vue 3.3.4
- Element Plus 2.3.8
- ECharts 5.4.2
- Vite 4.4.0
- Axios 1.4.0

## 项目功能

### 📊 仪表盘
- 问卷统计概览
- 数据可视化图表
- 最近创建的问卷列表

### 📝 问卷管理
- 创建问卷（支持多种题型）
- 编辑问卷
- 发布/结束问卷
- 问卷预览和填写

### 📈 数据统计
- 回复数据统计
- 图表可视化分析
- 回复趋势分析

### 🎯 支持的题型
- 单选题
- 多选题
- 填空题
- 下拉选择题
- 评分题

## 快速开始

### 环境要求
- JDK 1.8+
- MySQL 8.0+
- Node.js 16.0+
- Maven 3.6+

### 数据库设置

1. 创建MySQL数据库：
```sql
CREATE DATABASE questionnaire_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. 执行数据库脚本：
```bash
mysql -u root -p questionnaire_db < src/main/resources/questionnaire.sql
```

3. 修改数据库配置（src/main/resources/application.properties）：
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/questionnaire_db?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
spring.datasource.username=your_username
spring.datasource.password=your_password
```

### 后端启动

1. 进入项目根目录：
```bash
cd /path/to/Questionnaire\ system
```

2. 使用Maven编译运行：
```bash
mvn clean install
mvn spring-boot:run
```

后端服务将在 http://localhost:8080 启动

### 前端启动

1. 进入前端目录：
```bash
cd frontend
```

2. 安装依赖：
```bash
npm install
```

3. 启动开发服务器：
```bash
npm run dev
```

前端应用将在 http://localhost:3000 启动

## 项目结构

```
├── src/main/java/com/gujian/questionnaire/
│   ├── entity/          # 实体类
│   ├── dto/             # 数据传输对象
│   ├── mapper/          # MyBatis映射器
│   ├── service/         # 业务逻辑层
│   ├── controller/      # 控制器层
│   └── common/          # 通用工具类
├── src/main/resources/
│   ├── application.properties  # 应用配置
│   └── questionnaire.sql      # 数据库脚本
└── frontend/
    ├── src/
    │   ├── views/       # 页面组件
    │   ├── api/         # API接口
    │   └── router/      # 路由配置
    ├── package.json     # 前端依赖
    └── vite.config.js   # Vite配置
```

## API接口

### 问卷相关
- GET /api/questionnaire - 获取问卷列表
- POST /api/questionnaire - 创建问卷
- PUT /api/questionnaire/{id} - 更新问卷
- GET /api/questionnaire/{id} - 获取问卷详情
- DELETE /api/questionnaire/{id} - 删除问卷
- PUT /api/questionnaire/{id}/publish - 发布问卷
- PUT /api/questionnaire/{id}/end - 结束问卷
- GET /api/questionnaire/statistics - 获取统计数据

### 答案相关
- POST /api/answer/submit - 提交答案
- GET /api/answer/statistics/{questionnaireId} - 获取问卷统计
- GET /api/answer/trend/{questionnaireId} - 获取回复趋势

## 功能截图

系统包含以下主要页面：
- 仪表盘：展示系统概览和统计信息
- 问卷列表：管理所有问卷
- 创建问卷：可视化问卷编辑器
- 问卷预览：预览和填写问卷
- 数据统计：详细的数据分析和图表

## 部署说明

### 生产环境部署

1. 后端打包：
```bash
mvn clean package -DskipTests
```

2. 前端打包：
```bash
cd frontend
npm run build
```

3. 部署JAR文件到服务器并运行：
```bash
java -jar target/Questionnaire-0.0.1-SNAPSHOT.jar
```

## 开发说明

- 后端采用分层架构：Controller -> Service -> Mapper -> Database
- 前端采用Vue 3 Composition API
- 使用Element Plus作为UI组件库
- 使用ECharts进行数据可视化
- 支持响应式设计，适配不同屏幕尺寸

## 许可证

MIT License