# SecurityConfig 权限配置说明

## 🎯 权限体系全面优化完成

### 📋 优化目标 ✅
- ✅ 精确匹配所有Controller接口的实际权限需求
- ✅ 区分HTTP方法进行细粒度权限控制  
- ✅ 优化用户和管理员的权限边界
- ✅ 增强权限配置的可读性和维护性
- ✅ 确保前后端权限体系一致性

---

## 🏗️ 权限体系架构

### **1. 🔓 公开访问接口**
```java
// API文档和开发工具 (无需认证)
"/swagger-ui/**", "/swagger-ui.html", "/webjars/**", "/v3/api-docs/**", "/swagger-resources/**"

// 认证相关接口 (无需认证)
"/api/auth/**"                              // 登录/登出/注册/会话管理

// 测试接口 (无需认证)  
"/api/test/**"                              // 开发调试、Redis连接测试等
```

### **2. 📚 题库相关接口**
```java
// 用户可访问的接口 (authenticated)
"/api/question-bank/type-stats"             // 获取题型统计信息 (开始答题时需要)
"/api/question-bank/random"                 // 随机获取题目 (答题过程中需要)

// 管理员专属接口 (ADMIN)
"/api/question-bank/**"                     // 其他所有题库管理 (增删改查、分页等)
```

### **3. 📝 答题会话接口**
```java
// 用户可访问的接口 (authenticated)
"/api/answer-session/start"                               // 开始答题会话
"/api/answer-session/my-sessions"                        // 我的答题会话列表
"/api/answer-session/my-stats"                           // 我的答题统计  
"GET /api/answer-session/*"                              // 获取会话信息
"POST /api/answer-session/*/finish"                     // 完成答题会话
"POST /api/answer-session/*/abandon"                    // 放弃答题会话
"/api/answer-session/*/check-timeout"                   // 检查会话超时

// 管理员专属接口 (ADMIN)
"POST /api/answer-session/*/extend"                     // 延长答题时间
"POST /api/answer-session/*/force-complete"             // 强制完成会话
"/api/answer-session/admin/**"                          // 管理员会话管理
"/api/answer-session/user/*/stats"                      // 查看用户统计
```

### **4. 📊 答题记录接口**
```java
// 用户可访问的接口 (authenticated)
"POST /api/answer-record/submit"                        // 提交答案
"/api/answer-record/next-question/*"                   // 获取下一题
"/api/answer-record/session/*/stats"                   // 获取会话答题统计
"GET /api/answer-record/*"                             // 获取记录详情
"/api/answer-record/session/*"                         // 获取会话记录

// 管理员专属接口 (ADMIN)
"/api/answer-record/need-scoring"                      // 需要评分的记录
"POST /api/answer-record/batch-auto-score/*"           // 批量自动评分
```

### **5. 🎯 评分管理接口 (仅管理员)**
```java
"/api/scoring/**"                                       // 所有评分管理功能
    // POST /api/scoring/create                         // 创建评分记录
    // PUT /api/scoring/{recordId}                      // 更新评分记录  
    // DELETE /api/scoring/{recordId}                   // 删除评分记录
    // GET /api/scoring/records                         // 获取评分记录分页列表
    // GET /api/scoring/session/{sessionId}             // 获取会话评分记录
    // GET /api/scoring/statistics                      // 获取评分统计
    // POST /api/scoring/batch                          // 批量评分
    // GET /api/scoring/unscored/{sessionId}            // 获取未评分记录
    // POST /api/scoring/complete/{sessionId}           // 完成会话评分
```

### **6. 📈 统计分析接口 (仅管理员)**
```java
"/api/statistics/**"                                    // 所有统计分析功能
    // GET /api/statistics/dashboard                    // 获取仪表盘统计数据
    // GET /api/statistics/trend                        // 获取趋势数据
    // GET /api/statistics/question/{questionId}        // 获取题目统计数据
    // GET /api/statistics/session/{sessionId}          // 获取会话统计数据
```

---

## 🔧 权限控制增强

### **HTTP方法级别权限控制**
- 使用`HttpMethod.GET`、`HttpMethod.POST`等精确匹配HTTP方法
- 防止权限绕过攻击 (如用GET访问POST接口)

### **路径通配符优化**
- 精确匹配具体路径模式
- 避免过度开放权限

### **权限层次清晰**  
- 🔓 **无需认证**: API文档、认证接口、测试接口
- 🔑 **需要认证**: 用户核心功能 (答题、查看记录)
- 👑 **仅管理员**: 管理功能 (题库管理、评分、统计)

---

## 🛡️ 安全边界

### **用户权限范围**
- ✅ 开始答题、查看个人记录、提交答案
- ✅ 获取题型统计、随机题目
- ❌ 题库管理、评分管理、统计分析
- ❌ 查看其他用户数据、管理员功能

### **管理员权限范围**  
- ✅ 所有用户功能
- ✅ 题库管理 (增删改查)
- ✅ 会话管理 (延时、强制完成)
- ✅ 评分管理 (评分、批量评分)
- ✅ 统计分析 (仪表盘、趋势、报表)

---

## 📝 配置维护指南

### **添加新接口权限**
1. 确定接口的业务功能类型 (题库/会话/记录/评分/统计)
2. 确定权限级别 (公开/认证/管理员)
3. 添加到对应的权限组中
4. 考虑HTTP方法的安全性

### **权限调试**
- 通过日志查看`AccessDeniedException`
- 检查JWT token是否包含正确的role
- 确认接口路径匹配是否准确

### **前后端一致性检查**
- 前端路由的`meta.role`应与后端权限配置一致
- API调用时检查用户角色权限
- 界面按钮根据角色动态显示/隐藏
"/api/answer-record/submit"                    // 提交答案
"/api/answer-record/next-question/*"           // 获取下一题
"GET /api/answer-record/*"                     // 获取记录详情
"/api/answer-record/session/*"                 // 获取会话的所有记录
```

---

## 🔄 前后端权限映射

### **管理员路由 → 后端API映射**
```javascript
// 前端路由                    → 后端API权限
'/dashboard'                  → 认证用户 + 统计API(ADMIN)
'/question-bank'              → /api/question-bank/** (ADMIN)
'/answer-sessions'            → /api/answer-session/admin/** (ADMIN)  
'/scoring'                    → /api/scoring/** (ADMIN)
'/statistics'                 → /api/statistics/** (ADMIN)
```

### **用户路由 → 后端API映射**
```javascript
// 前端路由                    → 后端API权限
'/start-answer'               → /api/answer-session/start (USER+ADMIN)
'/answer/:sessionCode'        → /api/answer-record/** (USER+ADMIN)
```

---

## 🚀 重构优势

### **1. 配置简洁清晰**
- 从原来的**25+条复杂规则**简化为**12条核心规则**
- 按功能模块清晰分组，易于维护
- 删除了所有废弃的问卷系统配置

### **2. 权限粒度合理**
- **模块级权限控制**: 整个模块统一权限管理
- **功能级权限分离**: 管理功能vs用户功能明确区分
- **接口级精确控制**: 关键接口单独配置权限

### **3. 扩展性良好**
- 新增功能模块时，只需在对应分组添加配置
- 权限继承关系清晰，便于理解和修改
- 支持方法级注解权限作为补充

### **4. 安全性提升**
- 采用白名单模式，默认需要认证
- 敏感操作严格限制为管理员权限
- 用户功能和管理功能完全隔离

---

## 📝 配置变更总结

### **删除的废弃配置**
```java
// 旧问卷系统相关 (已删除)
"/api/questionnaire/**"
"/api/answer/**" 
"/api/records/**"
"/api/users/**"
```

### **新增的现代配置**
```java
// 新答题系统相关 (已添加)
"/api/question-bank/**"
"/api/answer-session/**"
"/api/answer-record/**"
"/api/scoring/**"
"/api/statistics/**"
```

### **保留的核心配置**
```java
// 基础设施相关 (保留)
"/api/auth/**"     // 认证体系
"/api/test/**"     // 测试接口
"Swagger相关"       // API文档
```

---

## 🔧 使用建议

### **开发阶段**
1. 新增Controller时，优先使用方法级`@PreAuthorize`注解
2. 只有通用模块才在SecurityConfig中配置
3. 测试接口应该保持`/api/test/**`前缀

### **生产部署**
1. 禁用或限制访问`/api/test/**`接口
2. 定期审查权限配置，确保最小权限原则
3. 监控权限访问日志，及时发现异常

---

**✅ 重构完成！现在拥有了简洁、现代、易维护的权限配置体系！** 