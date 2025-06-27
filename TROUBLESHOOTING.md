# 问卷系统故障排除指南

## 🔧 已修复的问题

### 1. ✅ el-loading 组件错误
**问题**: `Failed to resolve component: el-loading`
**原因**: 在Element Plus中，loading不是独立组件
**解决方案**: 已修改为使用 `v-loading` 指令

### 2. ✅ Request.js 配置错误
**问题**: 响应拦截器中 `config` 变量未定义
**解决方案**: 已修复所有 `config.showError` 引用

## 🚨 当前问题分析

### 403 Forbidden 错误的可能原因

#### 1. 后端服务未启动
**检查方法**:
```bash
# 在浏览器中访问
http://localhost:8080/swagger-ui/index.html
```
**解决方案**:
```bash
cd "Questionnaire system"
mvn spring-boot:run
```

#### 2. 端口冲突或配置问题
**检查**:
- 前端运行在: `http://localhost:3000`
- 后端运行在: `http://localhost:8080`
- API代理配置: `/api` -> `http://localhost:8080`

#### 3. JWT令牌问题
**检查方法**:
1. 打开浏览器开发工具 → Network
2. 查看请求头中是否包含 `Authorization: Bearer xxx`
3. 检查 localStorage 中是否有 token

**解决方案**:
- 如果没有token，请先登录
- 如果token过期，清除localStorage重新登录

#### 4. 跨域配置问题
**检查**: 确保后端允许来自 `http://localhost:3000` 的请求

## 🛠️ 逐步排查流程

### 步骤1: 检查后端服务
```bash
# 1. 启动后端
cd "Questionnaire system"
mvn spring-boot:run

# 2. 等待启动完成后访问
curl http://localhost:8080/swagger-ui/index.html
```

### 步骤2: 检查前端配置
```bash
# 1. 启动前端
cd frontend
npm run dev

# 2. 访问前端
http://localhost:3000
```

### 步骤3: 测试登录流程
1. 使用管理员账户登录: `admin` / `admin123`
2. 检查浏览器控制台是否有错误
3. 查看Network面板中的API请求

### 步骤4: 测试普通用户功能
1. 管理员登录后，先创建并发布一个问卷
2. 登出，使用普通用户登录: `zhangsan` / `admin123`
3. 访问问卷填写页面

## 🔍 调试技巧

### 浏览器调试
```javascript
// 在控制台中检查token
console.log('Token:', localStorage.getItem('token'))

// 在控制台中检查用户信息
console.log('User Store:', JSON.parse(localStorage.getItem('userStore') || '{}'))
```

### 后端日志查看
启动后端时关注控制台输出：
- JWT令牌验证日志
- 数据库连接状态
- API请求处理日志

### 网络请求调试
在浏览器开发工具的Network面板中检查：
1. 请求URL是否正确
2. 请求方法是否正确
3. 请求头是否包含Authorization
4. 响应状态码和内容

## 🔧 常见问题解决

### 问题: 数据库连接失败
**解决**:
1. 确保MySQL服务正在运行
2. 检查数据库配置（用户名、密码、数据库名）
3. 执行初始化SQL脚本

### 问题: 问卷列表为空
**原因**: 没有已发布的问卷
**解决**:
1. 使用管理员账户登录
2. 创建问卷并发布
3. 再使用普通用户账户测试

### 问题: 403权限错误持续出现
**检查清单**:
- [ ] 后端服务正常运行
- [ ] 用户已正确登录
- [ ] Token存在且有效
- [ ] API路径正确
- [ ] 用户角色权限正确

## 📞 获取帮助

如果问题仍未解决，请提供以下信息：
1. 详细的错误信息
2. 浏览器控制台截图
3. Network面板的API请求详情
4. 后端控制台日志
5. 操作步骤描述

## 🎯 快速测试脚本

```bash
# 完整测试流程
echo "1. 启动后端..."
cd "Questionnaire system" && mvn spring-boot:run &

echo "2. 等待后端启动（30秒）"
sleep 30

echo "3. 测试后端健康状态"
curl http://localhost:8080/api/auth/login

echo "4. 启动前端..."
cd ../frontend && npm run dev
``` 