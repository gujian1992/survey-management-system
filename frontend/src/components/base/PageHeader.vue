<template>
  <div class="page-header">
    <div class="header-bg-decoration"></div>
    <div class="header-content">
      <div class="title-section">
        <div v-if="icon" class="title-icon">
          <el-icon :size="iconSize" :color="iconColor">
            <component :is="icon" />
          </el-icon>
        </div>
        <div class="title-text">
          <h1 v-if="title">{{ title }}</h1>
          <p v-if="description">{{ description }}</p>
          <slot name="title-extra"></slot>
        </div>
      </div>
      
      <div v-if="$slots.actions" class="action-section">
        <slot name="actions"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  icon: {
    type: [String, Object],
    default: null
  },
  iconSize: {
    type: [String, Number],
    default: 28
  },
  iconColor: {
    type: String,
    default: 'white'
  },
  theme: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'success', 'warning', 'danger'].includes(value)
  }
})

const headerClass = computed(() => [
  'page-header',
  `page-header--${props.theme}`
])
</script>

<style scoped>
.page-header {
  background: var(--gradient-primary);
  border-radius: var(--radius-2xl);
  padding: var(--spacing-4xl);
  margin-bottom: var(--spacing-2xl);
  color: var(--color-white);
  position: relative;
  z-index: var(--z-fixed);
  overflow: hidden;
  box-shadow: var(--shadow-card);
}

.page-header--success {
  background: var(--gradient-success);
}

.page-header--warning {
  background: var(--gradient-warning);
}

.page-header--danger {
  background: linear-gradient(135deg, #f56565 0%, #e53e3e 100%);
}

.header-bg-decoration {
  position: absolute;
  top: -50%;
  right: -20%;
  width: 200px;
  height: 200px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.1) 0%, transparent 70%);
  border-radius: var(--radius-full);
}

.header-bg-decoration::after {
  content: '';
  position: absolute;
  bottom: -150%;
  left: -150%;
  width: 150px;
  height: 150px;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.08) 0%, transparent 70%);
  border-radius: var(--radius-full);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 2;
}

.title-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.title-icon {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.title-text h1 {
  margin: 0 0 var(--spacing-sm) 0;
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-white);
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.title-text p {
  margin: 0;
  font-size: var(--text-base);
  color: rgba(255, 255, 255, 0.9);
  font-weight: var(--font-normal);
}

.action-section {
  display: flex;
  gap: var(--spacing-md);
}

/* 统一页面头部按钮样式 */
.action-section :deep(.el-button) {
  height: 44px;
  border-radius: var(--radius-lg);
  font-weight: var(--font-semibold);
  padding: var(--spacing-md) var(--spacing-xl);
  border: 2px solid rgba(255, 255, 255, 0.2);
  backdrop-filter: blur(10px);
  transition: all var(--transition-normal);
  font-size: var(--text-sm);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

/* 主要按钮样式 */
.action-section :deep(.el-button--primary) {
  background: rgba(255, 255, 255, 0.15);
  color: var(--color-white);
  border-color: rgba(255, 255, 255, 0.3);
}

.action-section :deep(.el-button--primary:hover) {
  background: rgba(255, 255, 255, 0.25);
  border-color: rgba(255, 255, 255, 0.4);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* 次要按钮样式 */
.action-section :deep(.el-button--default) {
  background: rgba(255, 255, 255, 0.1);
  color: var(--color-white);
  border-color: rgba(255, 255, 255, 0.2);
}

.action-section :deep(.el-button--default:hover) {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

/* 按钮图标样式 */
.action-section :deep(.el-button .el-icon) {
  margin-right: var(--spacing-sm);
  font-size: var(--text-base);
}

/* 按钮激活状态 */
.action-section :deep(.el-button:active) {
  transform: translateY(0);
}

/* 按钮禁用状态 */
.action-section :deep(.el-button.is-disabled) {
  background: rgba(255, 255, 255, 0.05) !important;
  color: rgba(255, 255, 255, 0.5) !important;
  border-color: rgba(255, 255, 255, 0.1) !important;
  transform: none !important;
  cursor: not-allowed;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-header {
    padding: var(--spacing-2xl);
  }
  
  .header-content {
    flex-direction: column;
    gap: var(--spacing-lg);
    align-items: flex-start;
  }
  
  .title-section {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-md);
  }
  
  .action-section {
    width: 100%;
    flex-wrap: wrap;
  }
  
  .action-section :deep(.el-button) {
    flex: 1;
    min-width: 120px;
  }
}
</style> 