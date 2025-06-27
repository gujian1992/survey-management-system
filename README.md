# 问卷调查系统

一个基于Spring Boot + Vue 3的现代化问卷调查管理系统。

## 🚀 技术栈

### 后端
- **Spring Boot 2.7+** - 主框架
- **Spring Security** - 安全认证
- **JWT + Redis** - 用户认证与会话管理
- **MyBatis Plus** - ORM框架
- **MySQL** - 数据库
- **Swagger** - API文档

### 前端
- **Vue 3** - 前端框架
- **Element Plus** - UI组件库
- **Vue Router** - 路由管理
- **Axios** - HTTP客户端
- **Vite** - 构建工具

## 📁 项目结构

```
├── Questionnaire system/     # 后端Spring Boot项目
│   ├── src/main/java/
│   │   └── com/gujian/questionnaire/
│   │       ├── controller/   # 控制器层
│   │       ├── service/      # 服务层
│   │       ├── mapper/       # 数据访问层
│   │       ├── entity/       # 实体类
│   │       ├── config/       # 配置类
│   │       ├── auth/         # 认证相关
│   │       └── utils/        # 工具类
│   └── src/main/resources/
│       ├── mapper/           # MyBatis XML文件
│       └── application.yml   # 配置文件
├── frontend/                 # 前端Vue项目
│   ├── src/
│   │   ├── components/       # 组件
│   │   ├── views/           # 页面
│   │   ├── router/          # 路由配置
│   │   ├── api/             # API接口
│   │   └── utils/           # 工具函数
│   ├── package.json
│   └── vite.config.js
└── README.md
```

## ⚡ 快速开始

### 环境要求
- Java 8+
- Node.js 16+
- MySQL 5.7+
- Redis

### 后端启动
1. 配置数据库连接（application.yml）
2. 启动Redis服务
3. 运行Spring Boot应用
```bash
cd "Questionnaire system"
mvn spring-boot:run
```

### 前端启动
```bash
cd frontend
npm install
npm run dev
```

## 🔧 主要功能

- ✅ **用户认证** - JWT + Redis会话管理
- ✅ **题库管理** - 题目的增删改查
- ✅ **问卷管理** - 问卷创建与发布
- ✅ **答题系统** - 在线答题功能
- ✅ **成绩统计** - 答题结果分析
- ✅ **权限管理** - 基于角色的访问控制

## 🎨 UI特色

- 现代化的Material Design风格
- 响应式布局设计
- 优雅的动画效果
- 直观的用户交互体验

## 🔐 认证架构

系统采用JWT + Redis的双重认证机制：
- JWT Token用于无状态认证
- Redis存储用户会话信息
- 支持Token刷新和会话管理
- 提供`UserContextUtils`工具类便捷获取用户信息

## 📚 开发文档

- [组件系统指南](COMPONENT_SYSTEM_GUIDE.md)
- [API集成指南](API_INTEGRATION_GUIDE.md)
- [故障排除指南](TROUBLESHOOTING.md)

## 🤝 贡献

欢迎提交Issue和Pull Request来帮助改进项目。

## �� 许可证

MIT License 