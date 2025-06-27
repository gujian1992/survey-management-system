# 问卷系统API集成指南

## 🎯 更新内容概述

已成功将普通用户功能从模拟数据迁移到真实的后端API调用，现在所有功能都使用实际的数据库数据。

## 🔧 后端API更新

### 新增接口

#### 1. 获取用户可填写问卷列表
- **接口**: `GET /api/questionnaire/available`
- **参数**: 
  - `page`: 页码（默认1）
  - `size`: 每页数量（默认10）
- **返回**: 当前用户可填写的问卷列表

#### 2. 获取用户个人答题记录
- **接口**: `GET /api/answer/my-answers`
- **参数**: 
  - `page`: 页码（默认1）
  - `size`: 每页数量（默认10）
- **返回**: 当前用户的答题记录列表

#### 3. 获取答题详情
- **接口**: `GET /api/answer/{id}`
- **参数**: 
  - `id`: 答题记录ID
- **返回**: 具体的答题详情和问卷内容

### 服务层实现

#### QuestionnaireService 新增方法
```java
List<Map<String, Object>> getAvailableQuestionnaires(String token, Integer page, Integer size)
```
- 根据JWT令牌验证用户身份
- 返回已发布且在有效期内的问卷
- 包含问题数量统计

#### AnswerService 新增方法
```java
List<Map<String, Object>> getMyAnswers(String token, Integer page, Integer size)
Map<String, Object> getAnswerDetail(Long id, String token)
```
- 验证用户身份和权限
- 支持分页查询
- 按提交时间分组和排序

## 🎨 前端更新

### API调用更新

#### questionnaireAPI 新增方法
```javascript
// 获取用户可填写问卷列表
getAvailable: (params) => request.get('/questionnaire/available', { params })
```

#### 页面组件更新

1. **QuestionnaireFill.vue** - 问卷填写页面
   - ✅ 移除模拟数据
   - ✅ 集成真实API调用
   - ✅ 错误处理和loading状态

2. **MyResponses.vue** - 个人记录页面
   - ✅ 移除模拟数据
   - ✅ 集成真实API调用
   - ✅ 分页功能支持

## 🚀 启动指南

### 后端启动
```bash
cd "Questionnaire system"
# 运行启动脚本
start-backend.bat

# 或手动启动
mvn spring-boot:run
```

### 前端启动
```bash
cd frontend
# 运行启动脚本
start-frontend.bat

# 或手动启动
npm install
npm run dev
```

### 数据库准备
```sql
-- 执行SQL脚本添加普通用户
mysql -u root -p your_database < "Questionnaire system/src/main/resources/db/add_user.sql"
```

## 🔑 测试账户

### 管理员账户
- **用户名**: `admin`
- **密码**: `admin123`
- **权限**: 完整管理权限

### 普通用户账户
- **用户名**: `zhangsan` / `lisi` / `wangwu`
- **密码**: `admin123`
- **权限**: 问卷填写和查看个人记录

## 📱 功能验证

### 普通用户功能测试

1. **登录验证**
   - 使用普通用户账户登录
   - 验证JWT令牌生成和存储
   - 确认角色权限正确设置

2. **问卷填写功能**
   - 访问 `/questionnaire-fill`
   - 查看可填写问卷列表（需要管理员先发布问卷）
   - 验证问卷状态和时间限制

3. **个人记录功能**
   - 访问 `/my-responses`
   - 查看个人答题历史
   - 测试分页功能

### API调用流程

```
用户登录 → 获取JWT令牌 → 
↓
请求问卷列表 → 验证令牌 → 返回可填写问卷 →
↓
填写问卷 → 提交答案 → 保存到数据库 →
↓
查看记录 → 验证权限 → 返回个人答题记录
```

## 🔍 调试信息

### 后端日志
- 查看控制台输出的JWT验证日志
- 监控SQL查询执行情况
- 观察用户权限验证过程

### 前端调试
- 使用浏览器开发工具查看API请求
- 检查JWT令牌是否正确携带
- 验证响应数据格式

### 常见问题解决

1. **401 Unauthorized**
   - 检查JWT令牌是否过期
   - 确认请求头包含正确的Authorization字段

2. **Empty Data**
   - 确保数据库中有已发布的问卷
   - 检查问卷的时间范围设置

3. **API调用失败**
   - 确认后端服务正常运行（端口8080）
   - 检查跨域配置是否正确

## 📊 数据流示例

### 获取可填写问卷
```
前端请求: GET /api/questionnaire/available?page=1&size=10
↓
后端处理: 
1. 验证JWT令牌
2. 查询已发布且有效的问卷
3. 统计问题数量
4. 返回格式化数据
↓
前端接收: 问卷列表数据用于页面展示
```

### 获取答题记录
```
前端请求: GET /api/answer/my-answers?page=1&size=10
↓
后端处理:
1. 验证用户身份
2. 查询用户答题记录
3. 按responseId分组
4. 关联问卷信息
↓
前端接收: 个人答题记录列表
```

## ✅ 完成状态

- ✅ 后端API接口实现
- ✅ 服务层方法添加
- ✅ JWT权限验证集成
- ✅ 前端模拟数据移除
- ✅ 真实API调用集成
- ✅ 错误处理完善
- ✅ 启动脚本创建
- ✅ 测试用户数据准备

现在普通用户的所有功能都已连接到真实的后端API，可以进行完整的功能测试！ 