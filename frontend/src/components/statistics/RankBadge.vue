<template>
  <div class="rank-badge" :class="rankClass">
    <div v-if="rank <= 3" class="medal-icon">
      <el-icon>
        <Trophy v-if="rank === 1" />
        <Medal v-else />
      </el-icon>
    </div>
    <span class="rank-number">{{ rank }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { Trophy, Medal } from '@element-plus/icons-vue'

// 组件名称
defineOptions({
  name: 'RankBadge'
})

// Props定义
const props = defineProps({
  rank: {
    type: Number,
    required: true
  }
})

// 计算属性
const rankClass = computed(() => {
  if (props.rank === 1) return 'gold'
  if (props.rank === 2) return 'silver'
  if (props.rank === 3) return 'bronze'
  if (props.rank <= 10) return 'top10'
  return 'normal'
})
</script>

<style scoped>
.rank-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-xs);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-full);
  font-weight: var(--font-bold);
  font-size: var(--text-sm);
  min-width: 40px;
  position: relative;
}

.rank-badge.gold {
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(251, 191, 36, 0.3);
}

.rank-badge.silver {
  background: linear-gradient(135deg, #e5e7eb 0%, #9ca3af 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(156, 163, 175, 0.3);
}

.rank-badge.bronze {
  background: linear-gradient(135deg, #d97706 0%, #92400e 100%);
  color: white;
  box-shadow: 0 4px 15px rgba(217, 119, 6, 0.3);
}

.rank-badge.top10 {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
}

.rank-badge.normal {
  background: var(--color-gray-100);
  color: var(--color-gray-600);
}

.medal-icon {
  font-size: var(--text-base);
}

.rank-number {
  line-height: 1;
}

/* 特殊效果 - 前三名闪光效果 */
.rank-badge.gold::before,
.rank-badge.silver::before,
.rank-badge.bronze::before {
  content: '';
  position: absolute;
  top: -2px;
  left: -2px;
  right: -2px;
  bottom: -2px;
  border-radius: var(--radius-full);
  opacity: 0.6;
  z-index: -1;
  animation: shine 2s infinite;
}

.rank-badge.gold::before {
  background: linear-gradient(45deg, #fbbf24, #f59e0b, #fbbf24);
}

.rank-badge.silver::before {
  background: linear-gradient(45deg, #e5e7eb, #9ca3af, #e5e7eb);
}

.rank-badge.bronze::before {
  background: linear-gradient(45deg, #d97706, #92400e, #d97706);
}

@keyframes shine {
  0%, 100% {
    transform: scale(1);
    opacity: 0.6;
  }
  50% {
    transform: scale(1.05);
    opacity: 0.8;
  }
}
</style> 