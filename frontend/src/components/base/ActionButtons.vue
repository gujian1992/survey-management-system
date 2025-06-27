<template>
  <div class="action-buttons-container">
    <el-button
      v-for="action in actions"
      :key="action.key"
      :type="action.type || 'default'"
      :size="action.size || 'small'"
      :plain="action.plain !== false"
      :disabled="action.disabled"
      :loading="action.loading"
      @click="handleAction(action)"
      class="action-btn"
    >
      <el-icon v-if="action.icon">
        <component :is="action.icon" />
      </el-icon>
      {{ action.label }}
    </el-button>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue'

const props = defineProps({
  actions: {
    type: Array,
    required: true,
    validator: (actions) => {
      return actions.every(action => 
        action.key && action.label && typeof action.handler === 'function'
      )
    }
  },
  size: {
    type: String,
    default: 'small',
    validator: (value) => ['large', 'default', 'small'].includes(value)
  },
  gap: {
    type: String,
    default: '6px'
  }
})

const emit = defineEmits(['action'])

const handleAction = (action) => {
  if (action.disabled || action.loading) return
  
  // 触发事件给父组件
  emit('action', {
    key: action.key,
    data: action.data
  })
  
  // 执行操作函数
  if (typeof action.handler === 'function') {
    action.handler(action.data)
  }
}
</script>

<style scoped>
.action-buttons-container {
  display: flex;
  gap: v-bind(gap);
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
}

.action-btn {
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  font-size: 11px !important;
  padding: 4px 6px !important;
  height: 26px !important;
  min-width: 50px !important;
  flex-shrink: 0 !important;
}

.action-btn .el-icon {
  font-size: 11px !important;
  margin-right: 2px !important;
}

.action-btn:hover {
  transform: translateY(-1px) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1) !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .action-buttons-container {
    gap: 4px;
  }
  
  .action-btn {
    font-size: 10px !important;
    padding: 3px 5px !important;
    height: 24px !important;
    min-width: 45px !important;
  }
}
</style> 