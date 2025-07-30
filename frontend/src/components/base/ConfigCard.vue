<template>
  <div class="config-card" :class="{ active: active }">
    <div class="card-header">
      <div class="header-icon">
        <el-icon><component :is="icon" /></el-icon>
      </div>
      <div class="header-content">
        <h4 class="title">{{ title }}</h4>
        <p class="subtitle">{{ subtitle }}</p>
      </div>
      <div class="header-action" v-if="$slots.action">
        <slot name="action" />
      </div>
    </div>
    
    <div class="card-content">
      <slot />
    </div>
    
    <div class="card-footer" v-if="$slots.footer">
      <slot name="footer" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ConfigCard',
  props: {
    title: {
      type: String,
      required: true
    },
    subtitle: {
      type: String,
      default: ''
    },
    icon: {
      type: String,
      default: 'Setting'
    },
    active: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style scoped>
.config-card {
  background: var(--el-bg-color);
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  border: 1px solid var(--el-border-color-light);
}

.config-card.active {
  border-color: var(--el-color-primary);
  box-shadow: 0 4px 16px rgba(var(--el-color-primary-rgb), 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 20px;
}

.header-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background: var(--el-color-primary-light-9);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--el-color-primary);
}

.header-icon .el-icon {
  font-size: 20px;
}

.header-content {
  flex: 1;
}

.title {
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
  line-height: 1.4;
}

.subtitle {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  margin: 4px 0 0;
  line-height: 1.4;
}

.card-content {
  margin-bottom: 16px;
}

.card-footer {
  padding-top: 16px;
  border-top: 1px solid var(--el-border-color-lighter);
}
</style> 