<template>
  <div class="difficulty-indicator">
    <div class="difficulty-level" :class="levelClass">
      {{ levelText }}
    </div>
    <div v-if="score !== undefined" class="difficulty-score">
      {{ score.toFixed(1) }}
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

// 组件名称
defineOptions({
  name: 'DifficultyIndicator'
})

// Props定义
const props = defineProps({
  level: {
    type: [String, Number],
    required: true
  },
  score: {
    type: Number,
    default: undefined
  }
})

// 计算属性
const levelClass = computed(() => {
  if (typeof props.level === 'string') {
    return props.level.toLowerCase()
  }
  
  // 根据数值计算难度等级
  if (props.level >= 80) return 'hard'
  if (props.level >= 60) return 'medium'
  return 'easy'
})

const levelText = computed(() => {
  if (typeof props.level === 'string') {
    const levelMap = {
      'easy': '简单',
      'medium': '中等', 
      'hard': '困难'
    }
    return levelMap[props.level.toLowerCase()] || props.level
  }
  
  // 根据数值生成文本
  if (props.level >= 80) return '困难'
  if (props.level >= 60) return '中等'
  return '简单'
})
</script>

<style scoped>
.difficulty-indicator {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-xs);
}

.difficulty-level {
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  font-size: var(--text-xs);
  font-weight: var(--font-medium);
  text-align: center;
  min-width: 40px;
}

.difficulty-level.easy {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: var(--color-success);
}

.difficulty-level.medium {
  background: linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%);
  color: var(--color-warning);
}

.difficulty-level.hard {
  background: linear-gradient(135deg, #fef2f2 0%, #fecaca 100%);
  color: var(--color-danger);
}

.difficulty-score {
  font-size: var(--text-xs);
  color: var(--color-gray-500);
  font-weight: var(--font-medium);
}
</style> 