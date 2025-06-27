<template>
  <div 
    class="metric-card" 
    :class="[metric.type, { 'clickable': clickable }]"
    @click="handleClick"
  >
    <div class="metric-icon">
      <el-icon :color="metric.iconColor" :size="iconSize">
        <component :is="metric.icon" />
      </el-icon>
    </div>
    
    <div class="metric-content">
      <div class="metric-number" :style="{ color: metric.numberColor }">
        {{ formatNumber(metric.value) }}
      </div>
      
      <div class="metric-label">{{ metric.label }}</div>
      
      <div v-if="metric.unit" class="metric-unit">{{ metric.unit }}</div>
      
      <div v-if="metric.change !== undefined" class="metric-change">
        <el-icon :color="changeColor">
          <CaretTop v-if="metric.change >= 0" />
          <CaretBottom v-else />
        </el-icon>
        <span>{{ Math.abs(metric.change) }}%</span>
      </div>
      
      <div v-if="metric.progress !== undefined" class="metric-progress">
        <el-progress
          :percentage="metric.progress"
          :color="metric.progressColor || progressColor"
          :stroke-width="4"
          :show-text="false"
        />
      </div>
    </div>
    
    <div v-if="$slots.extra" class="metric-extra">
      <slot name="extra"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { CaretTop, CaretBottom } from '@element-plus/icons-vue'

// 组件名称
defineOptions({
  name: 'MetricCard'
})

// Props定义
const props = defineProps({
  metric: {
    type: Object,
    required: true,
    validator: (value) => {
      return value && typeof value.value !== 'undefined' && value.label
    }
  },
  clickable: {
    type: Boolean,
    default: false
  },
  iconSize: {
    type: [String, Number],
    default: 24
  }
})

// Emits定义
const emits = defineEmits(['click'])

// 计算属性
const changeColor = computed(() => {
  if (props.metric.change === undefined) return ''
  return props.metric.change >= 0 ? '#10b981' : '#ef4444'
})

const progressColor = computed(() => {
  if (props.metric.progress === undefined) return '#4f46e5'
  if (props.metric.progress >= 80) return '#10b981'
  if (props.metric.progress >= 60) return '#f59e0b'
  return '#ef4444'
})

// 方法
const formatNumber = (value) => {
  if (typeof value !== 'number') return value
  
  // 根据数值大小选择格式化方式
  if (value >= 1000000) {
    return (value / 1000000).toFixed(1) + 'M'
  } else if (value >= 1000) {
    return (value / 1000).toFixed(1) + 'K'
  } else if (value % 1 !== 0) {
    return value.toFixed(1)
  }
  return value.toString()
}

const handleClick = () => {
  if (props.clickable) {
    emits('click', props.metric)
  }
}
</script>

<style scoped>
.metric-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-card);
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  position: relative;
  overflow: hidden;
}

.metric-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.metric-card.clickable {
  cursor: pointer;
}

.metric-card.clickable:hover {
  transform: translateY(-4px);
  box-shadow: var(--shadow-xl);
}

/* 主题样式 */
.metric-card.primary {
  border-left: 4px solid var(--color-primary);
}

.metric-card.success {
  border-left: 4px solid var(--color-success);
}

.metric-card.warning {
  border-left: 4px solid var(--color-warning);
}

.metric-card.info {
  border-left: 4px solid var(--color-info);
}

.metric-card.danger {
  border-left: 4px solid var(--color-danger);
}

.metric-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
}

.metric-content {
  flex: 1;
  min-width: 0;
}

.metric-number {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-xs);
  line-height: 1;
}

.metric-label {
  color: var(--color-gray-500);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--spacing-xs);
}

.metric-unit {
  font-size: var(--text-xs);
  color: var(--color-gray-400);
  margin-bottom: var(--spacing-xs);
}

.metric-change {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
}

.metric-progress {
  margin-top: var(--spacing-xs);
}

.metric-extra {
  position: absolute;
  top: var(--spacing-sm);
  right: var(--spacing-sm);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .metric-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .metric-icon {
    margin-bottom: var(--spacing-sm);
  }
}
</style> 