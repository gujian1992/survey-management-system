# 🎨 组件化设计系统使用指南

## 📋 概述

本项目基于组件化原则重构，建立了完整的设计系统，解决了以下问题：
- ✅ CSS样式冲突和覆盖
- ✅ 代码重复和维护困难
- ✅ 设计不一致性
- ✅ 响应式适配问题

## 🏗️ 架构设计

```
frontend/src/
├── styles/                    # 全局样式系统
│   ├── base/                 # 基础样式
│   │   ├── variables.css     # CSS变量和设计令牌
│   │   ├── reset.css         # 样式重置和基础样式
│   │   └── utilities.css     # 工具类样式
│   ├── components/           # 组件样式
│   │   ├── form.css         # 表单组件样式
│   │   ├── button.css       # 按钮组件样式
│   │   └── card.css         # 卡片组件样式
│   ├── themes/              # 主题样式
│   │   └── element-plus-override.css
│   └── index.css            # 样式入口文件
├── components/               # 组件库
│   ├── base/                # 基础UI组件
│   │   ├── PageHeader.vue   # 页面头部
│   │   ├── SearchPanel.vue  # 搜索面板
│   │   └── DataTable.vue    # 数据表格
│   ├── business/            # 业务组件
│   └── layout/              # 布局组件
│       └── PageContainer.vue
└── views/                   # 页面组件
```

## 🎨 设计令牌

### 颜色系统
```css
/* 主色调 */
--color-primary: #667eea;
--color-primary-light: #a5b3f6;
--color-primary-dark: #4c63d2;

/* 辅助色 */
--color-success: #48bb78;
--color-warning: #ed8936;
--color-danger: #f56565;

/* 渐变色 */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-bg: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
```

### 间距系统
```css
--spacing-xs: 4px;    /* 超小间距 */
--spacing-sm: 8px;    /* 小间距 */
--spacing-md: 12px;   /* 中等间距 */
--spacing-lg: 16px;   /* 大间距 */
--spacing-xl: 20px;   /* 超大间距 */
--spacing-2xl: 24px;  /* 2倍大间距 */
```

### Z-index系统
```css
--z-dropdown: 1000;
--z-sticky: 1020;
--z-fixed: 1030;
--z-modal: 1050;
```

## 🧩 组件使用

### 1. 页面容器
```vue
<template>
  <PageContainer>
    <!-- 页面内容 -->
  </PageContainer>
</template>

<script setup>
import { PageContainer } from '@/components'
</script>
```

### 2. 页面头部
```vue
<template>
  <PageHeader
    title="题库管理"
    description="智能题库系统，支持多种题型的创建、编辑和管理"
    :icon="Collection"
  >
    <template #actions>
      <el-button type="primary" class="btn-primary">
        <el-icon><Plus /></el-icon>
        新建题目
      </el-button>
    </template>
  </PageHeader>
</template>

<script setup>
import { PageHeader } from '@/components'
import { Collection, Plus } from '@element-plus/icons-vue'
</script>
```

### 3. 搜索面板
```vue
<template>
  <SearchPanel
    v-model:searchModel="searchForm"
    :searching="loading"
    @search="handleSearch"
    @reset="handleReset"
  >
    <template #search-fields>
      <div class="search-field">
        <label>题目搜索</label>
        <el-input
          v-model="searchForm.title"
          placeholder="输入题目标题关键词"
          clearable
          class="search-input"
        />
      </div>
    </template>
  </SearchPanel>
</template>

<script setup>
import { SearchPanel } from '@/components'
</script>
```

### 4. 数据表格
```vue
<template>
  <DataTable
    :data="questionList"
    :loading="loading"
    :pagination="pagination"
    title="题目列表"
    :icon="Document"
    show-batch-actions
    @selection-change="handleSelectionChange"
    @size-change="handleSizeChange"
    @current-change="handleCurrentChange"
  >
    <el-table-column type="selection" width="50" />
    <el-table-column prop="title" label="题目标题" min-width="300" />
    <!-- 其他列 -->
  </DataTable>
</template>

<script setup>
import { DataTable } from '@/components'
import { Document } from '@element-plus/icons-vue'
</script>
```

## 🎯 CSS类命名规范

### BEM命名规范
```css
/* 块(Block) */
.search-panel { }

/* 元素(Element) */
.search-panel__form { }
.search-panel__button { }

/* 修饰符(Modifier) */
.search-panel--loading { }
.search-panel__button--primary { }
```

### 状态类
```css
.is-active { }      /* 激活状态 */
.is-disabled { }    /* 禁用状态 */
.is-loading { }     /* 加载状态 */
.is-error { }       /* 错误状态 */
```

### 工具类
```css
.flex { display: flex; }
.justify-center { justify-content: center; }
.text-primary { color: var(--color-primary); }
.rounded-lg { border-radius: var(--radius-lg); }
```

## 🔧 样式作用域管理

### 1. 全局样式
放在 `styles/` 目录下，通过 `index.css` 统一导入。

### 2. 组件样式
使用 `scoped` 避免样式污染：
```vue
<style scoped>
.component-class {
  /* 只影响当前组件 */
}
</style>
```

### 3. 样式隔离
使用特定前缀避免冲突：
```css
/* 搜索表单专用 */
.search-form .form-row { display: grid; }

/* 对话框表单专用 */
.dialog-content .form-row { display: flex; }
```

## 📱 响应式设计

### 断点系统
```css
/* 移动端 */
@media (max-width: 768px) { }

/* 平板 */
@media (max-width: 1024px) { }

/* 桌面端 */
@media (max-width: 1200px) { }
```

### 响应式工具类
```css
.md:hidden { }       /* 中等屏幕隐藏 */
.lg:flex { }         /* 大屏幕显示flex */
.xl:grid-cols-4 { }  /* 超大屏幕4列网格 */
```

## 🚀 性能优化

### 1. CSS性能
```css
/* GPU加速 */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform;
}

/* 防止重绘 */
.backface-hidden {
  backface-visibility: hidden;
}
```

### 2. 组件懒加载
```javascript
// 异步加载组件
const QuestionForm = defineAsyncComponent(() => 
  import('@/components/business/QuestionForm.vue')
)
```

## 🎨 主题定制

### 1. 颜色主题
```css
/* 深色主题 */
[data-theme="dark"] {
  --color-white: #1a202c;
  --color-gray-50: #2d3748;
  /* ... */
}
```

### 2. 动态主题切换
```javascript
// 切换主题
document.documentElement.setAttribute('data-theme', 'dark')
```

## 📋 最佳实践

### 1. 组件设计原则
- **单一职责**: 每个组件只负责一个功能
- **可复用性**: 通过props和slots提供灵活性
- **一致性**: 遵循设计系统规范
- **可访问性**: 支持键盘导航和屏幕阅读器

### 2. 样式组织
- **分层管理**: 基础 → 组件 → 页面 → 工具类
- **命名规范**: 使用BEM或语义化命名
- **避免!important**: 通过选择器特异性管理优先级
- **性能优先**: 减少重绘和回流

### 3. 代码健壮性
- **样式隔离**: 使用scoped或命名空间
- **兼容性**: 考虑不同浏览器支持
- **可维护性**: 清晰的文档和注释
- **测试覆盖**: 单元测试和视觉回归测试

## 🔄 迁移指南

### 从旧代码迁移到新组件系统：

1. **替换页面容器**:
```vue
<!-- 旧代码 -->
<div class="question-bank-manage">
  <!-- 内容 -->
</div>

<!-- 新代码 -->
<PageContainer>
  <!-- 内容 -->
</PageContainer>
```

2. **替换页面头部**:
```vue
<!-- 旧代码 -->
<div class="modern-header">
  <div class="header-content">
    <!-- 复杂的头部结构 -->
  </div>
</div>

<!-- 新代码 -->
<PageHeader title="标题" description="描述" :icon="Icon">
  <template #actions>
    <!-- 操作按钮 -->
  </template>
</PageHeader>
```

3. **使用设计令牌**:
```css
/* 旧代码 */
.component {
  color: #667eea;
  padding: 20px;
  border-radius: 12px;
}

/* 新代码 */
.component {
  color: var(--color-primary);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
}
```

## 🛠️ 开发工具

### 1. 样式检查
```bash
# 检查CSS语法
npm run lint:css

# 检查设计令牌使用
npm run check:tokens
```

### 2. 组件文档
```bash
# 生成组件文档
npm run docs:generate

# 启动文档服务
npm run docs:serve
```

通过这套组件化系统，我们彻底解决了样式冲突、代码重复等问题，建立了可维护、可扩展的前端架构。 