<template>
  <div class="chart-card" :class="{ 'loading': loading }">
    <div class="chart-header">
      <div class="chart-title">
        <h3>{{ title }}</h3>
        <div v-if="subtitle" class="chart-subtitle">{{ subtitle }}</div>
      </div>
      
      <div v-if="$slots.controls" class="chart-controls">
        <slot name="controls"></slot>
      </div>
    </div>
    
    <div class="chart-body">
      <div v-if="loading" class="chart-loading">
        <el-skeleton animated>
          <template #template>
            <div class="loading-content">
              <el-skeleton-item variant="rect" style="width: 100%; height: 300px;" />
            </div>
          </template>
        </el-skeleton>
      </div>
      
      <div v-else-if="error" class="chart-error">
        <el-result icon="error" title="加载失败" :sub-title="error">
          <template #extra>
            <el-button @click="$emit('retry')" type="primary">重试</el-button>
          </template>
        </el-result>
      </div>
      
      <div v-else-if="isEmpty" class="chart-empty">
        <el-empty description="暂无数据" />
      </div>
      
      <div v-else class="chart-content">
        <slot></slot>
      </div>
    </div>
    
    <div v-if="$slots.footer" class="chart-footer">
      <slot name="footer"></slot>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 组件名称
defineOptions({
  name: 'ChartCard'
})

// Props定义
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  loading: {
    type: Boolean,
    default: false
  },
  error: {
    type: String,
    default: ''
  },
  isEmpty: {
    type: Boolean,
    default: false
  },
  height: {
    type: [String, Number],
    default: 300
  }
})

// Emits定义
const emits = defineEmits(['retry'])

// 计算属性
const chartHeight = computed(() => {
  if (typeof props.height === 'number') {
    return `${props.height}px`
  }
  return props.height
})
</script>

<style scoped>
.chart-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: var(--transition-normal);
  display: flex;
  flex-direction: column;
}

.chart-card:hover {
  box-shadow: var(--shadow-lg);
}

.chart-card.loading {
  pointer-events: none;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-100);
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

.chart-title h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-gray-800);
  line-height: 1.2;
}

.chart-subtitle {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  margin-top: var(--spacing-xs);
}

.chart-controls {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-shrink: 0;
}

.chart-body {
  flex: 1;
  position: relative;
  min-height: v-bind(chartHeight);
}

.chart-content {
  padding: var(--spacing-lg);
  height: 100%;
}

.chart-content :deep(.chart-container) {
  width: 100%;
  height: 100%;
  min-height: v-bind(chartHeight);
}

.chart-loading {
  padding: var(--spacing-lg);
}

.loading-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: v-bind(chartHeight);
}

.chart-error {
  display: flex;
  justify-content: center;
  align-items: center;
  height: v-bind(chartHeight);
  padding: var(--spacing-lg);
}

.chart-empty {
  display: flex;
  justify-content: center;
  align-items: center;
  height: v-bind(chartHeight);
}

.chart-footer {
  padding: var(--spacing-md) var(--spacing-xl);
  border-top: 1px solid var(--color-gray-100);
  background: var(--color-gray-50);
}

/* 不同尺寸的图表卡片 */
.chart-large {
  grid-column: span 2;
}

.chart-medium {
  grid-column: span 1;
}

.chart-small {
  grid-column: span 1;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-large {
    grid-column: span 1;
  }
}

@media (max-width: 768px) {
  .chart-header {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .chart-controls {
    justify-content: center;
  }
  
  .chart-content {
    padding: var(--spacing-md);
  }
  
  .chart-content :deep(.chart-container) {
    min-height: 250px;
  }
}
</style> 