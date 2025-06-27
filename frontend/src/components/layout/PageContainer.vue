<template>
  <div class="page-container" :class="containerClass">
    <slot></slot>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  background: {
    type: String,
    default: 'gradient', // 'gradient' | 'solid' | 'transparent'
    validator: (value) => ['gradient', 'solid', 'transparent'].includes(value)
  },
  padding: {
    type: String,
    default: 'normal', // 'none' | 'small' | 'normal' | 'large'
    validator: (value) => ['none', 'small', 'normal', 'large'].includes(value)
  },
  maxWidth: {
    type: String,
    default: 'none' // 'none' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  }
})

const containerClass = computed(() => [
  `page-container--bg-${props.background}`,
  `page-container--padding-${props.padding}`,
  props.maxWidth !== 'none' && `page-container--max-${props.maxWidth}`
])
</script>

<style scoped>
.page-container {
  min-height: 100vh;
  font-family: var(--font-family);
  position: relative;
  z-index: 1;
  overflow-x: hidden;
}

/* 背景样式 */
.page-container--bg-gradient {
  background: var(--gradient-bg);
}

.page-container--bg-solid {
  background: var(--color-gray-50);
}

.page-container--bg-transparent {
  background: transparent;
}

/* 内边距样式 */
.page-container--padding-none {
  padding: 0;
}

.page-container--padding-small {
  padding: var(--spacing-lg);
}

.page-container--padding-normal {
  padding: var(--spacing-xl);
}

.page-container--padding-large {
  padding: var(--spacing-3xl);
}

/* 最大宽度限制 */
.page-container--max-sm {
  max-width: var(--container-sm);
  margin: 0 auto;
}

.page-container--max-md {
  max-width: var(--container-md);
  margin: 0 auto;
}

.page-container--max-lg {
  max-width: var(--container-lg);
  margin: 0 auto;
}

.page-container--max-xl {
  max-width: var(--container-xl);
  margin: 0 auto;
}

.page-container--max-2xl {
  max-width: var(--container-2xl);
  margin: 0 auto;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .page-container--padding-normal {
    padding: var(--spacing-lg);
  }
  
  .page-container--padding-large {
    padding: var(--spacing-xl);
  }
}
</style> 