<template>
  <el-button
    ref="buttonRef"
    v-bind="buttonProps"
    @click="handleClick"
    :class="['enhanced-button', themeClass]"
    :loading="loading || isEnhancing"
  >
    <template #icon v-if="icon">
      <component :is="icon" />
    </template>
    <template #loading v-if="$slots.loading">
      <slot name="loading" />
    </template>
    <slot />
    <template #default v-if="!$slots.default && text">
      {{ text }}
    </template>
  </el-button>
</template>

<script setup>
/**
 * 🚀 增强按钮组件
 * 
 * 基于高级按钮增强系统的可复用组件
 * 支持完整的企业级按钮增强功能
 * 
 * 特性：
 * - 多主题支持
 * - 自定义样式
 * - 增强策略配置
 * - 动画效果
 * - 性能优化
 * - 完整生命周期管理
 */

import { computed, toRefs, ref, onMounted, watchEffect } from 'vue'
import { useAdvancedButtonEnhancer, ENHANCEMENT_STRATEGIES } from '@/plugins/AdvancedButtonEnhancer.js'

const props = defineProps({
  // 🎨 基础按钮属性
  type: {
    type: String,
    default: 'default'
  },
  size: {
    type: String,
    default: 'default'
  },
  disabled: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  text: {
    type: String,
    default: ''
  },
  icon: {
    type: [String, Object],
    default: null
  },
  
  // 🚀 增强系统属性
  enhanceTheme: {
    type: String,
    default: 'primary',
    validator: (value) => ['search', 'reset', 'primary', 'secondary', 'success', 'danger', 'warning'].includes(value)
  },
  customStyles: {
    type: Object,
    default: () => ({})
  },
  enableAnimation: {
    type: Boolean,
    default: true
  },
  enhancementStrategy: {
    type: String,
    default: ENHANCEMENT_STRATEGIES.HYBRID,
    validator: (value) => Object.values(ENHANCEMENT_STRATEGIES).includes(value)
  },
  autoEnhance: {
    type: Boolean,
    default: true
  },
  
  // 🎯 高级配置
  debugMode: {
    type: Boolean,
    default: false
  },
  rippleEffect: {
    type: Boolean,
    default: false
  },
  hapticFeedback: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['click', 'enhance-ready', 'enhance-error'])

const buttonRef = ref(null)
const isEnhancing = ref(false)
const enhancementReady = ref(false)

// 🚀 使用高级按钮增强系统
const { enhance, remove, registerTheme, cleanup } = useAdvancedButtonEnhancer({
  debugMode: props.debugMode,
  strategy: props.enhancementStrategy
})

// 计算属性
const buttonProps = computed(() => {
  const { enhanceTheme, customStyles, enableAnimation, enhancementStrategy, autoEnhance, debugMode, rippleEffect, hapticFeedback, ...elementProps } = props
  return elementProps
})

const themeClass = computed(() => `enhanced-button--${props.enhanceTheme}`)

// 🎨 应用增强效果
const applyEnhancement = async () => {
  if (!props.autoEnhance || !buttonRef.value) return

  try {
    isEnhancing.value = true
    
    const config = {
      theme: props.enhanceTheme,
      customStyles: props.customStyles,
      enableAnimation: props.enableAnimation,
      strategy: props.enhancementStrategy
    }

    const result = await enhance(buttonRef, config)
    
    if (result) {
      enhancementReady.value = true
      emit('enhance-ready', result)
      
      if (props.debugMode) {
        console.log(`[EnhancedButton] 增强成功: ${props.enhanceTheme}`)
      }
    } else {
      emit('enhance-error', new Error('增强失败'))
    }
  } catch (error) {
    emit('enhance-error', error)
    console.error('[EnhancedButton] 增强失败:', error)
  } finally {
    isEnhancing.value = false
  }
}

// 🎯 点击处理
const handleClick = (event) => {
  // 震动反馈
  if (props.hapticFeedback && 'vibrate' in navigator) {
    navigator.vibrate(50)
  }
  
  // 涟漪效果
  if (props.rippleEffect) {
    createRippleEffect(event)
  }
  
  emit('click', event)
}

// 🌊 创建涟漪效果
const createRippleEffect = (event) => {
  const button = buttonRef.value?.$el || buttonRef.value
  if (!button) return

  const ripple = document.createElement('span')
  const rect = button.getBoundingClientRect()
  const size = Math.max(rect.width, rect.height)
  const x = event.clientX - rect.left - size / 2
  const y = event.clientY - rect.top - size / 2

  ripple.style.cssText = `
    position: absolute;
    border-radius: 50%;
    transform: scale(0);
    animation: ripple-effect 0.6s linear;
    background-color: rgba(255, 255, 255, 0.3);
    width: ${size}px;
    height: ${size}px;
    left: ${x}px;
    top: ${y}px;
    pointer-events: none;
    z-index: 1000;
  `

  const style = document.createElement('style')
  style.textContent = `
    @keyframes ripple-effect {
      to {
        transform: scale(4);
        opacity: 0;
      }
    }
  `
  
  if (!document.head.querySelector('#ripple-styles')) {
    style.id = 'ripple-styles'
    document.head.appendChild(style)
  }

  button.style.position = 'relative'
  button.style.overflow = 'hidden'
  button.appendChild(ripple)

  setTimeout(() => {
    ripple.remove()
  }, 600)
}

// 🔄 监听属性变化，重新应用增强
watchEffect(() => {
  if (enhancementReady.value && buttonRef.value) {
    applyEnhancement()
  }
})

// 🎨 生命周期管理
onMounted(() => {
  if (props.autoEnhance) {
    applyEnhancement()
  }
})

// 🎯 暴露API
defineExpose({
  enhance: applyEnhancement,
  remove: () => remove(buttonRef),
  isEnhancing,
  enhancementReady,
  buttonRef
})
</script>

<style scoped>
/* 🎨 增强按钮基础样式 */
.enhanced-button {
  position: relative !important;
  overflow: hidden !important;
  cursor: pointer !important;
  user-select: none !important;
  outline: none !important;
  border: none !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* 禁用所有Element Plus默认样式 */
.enhanced-button:hover,
.enhanced-button:focus,
.enhanced-button:active,
.enhanced-button.is-loading {
  outline: none !important;
  border: none !important;
  background: inherit !important;
}

.enhanced-button::before,
.enhanced-button::after {
  display: none !important;
}

/* 主题类名 - 用于CSS选择器特异性 */
.enhanced-button--search,
.enhanced-button--reset,
.enhanced-button--primary,
.enhanced-button--secondary,
.enhanced-button--success,
.enhanced-button--danger,
.enhanced-button--warning {
  /* 所有样式由高级增强系统管理 */
}

/* 加载状态 */
.enhanced-button.is-loading {
  pointer-events: none !important;
}

/* 禁用状态 */
.enhanced-button.is-disabled {
  opacity: 0.6 !important;
  pointer-events: none !important;
  cursor: not-allowed !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .enhanced-button {
    padding: 8px 16px !important;
    font-size: 14px !important;
    min-height: 36px !important;
  }
}

@media (max-width: 480px) {
  .enhanced-button {
    padding: 6px 12px !important;
    font-size: 13px !important;
    min-height: 32px !important;
  }
}

/* 高对比度模式支持 */
@media (prefers-contrast: high) {
  .enhanced-button {
    border: 2px solid currentColor !important;
  }
}

/* 减少动画模式支持 */
@media (prefers-reduced-motion: reduce) {
  .enhanced-button,
  .enhanced-button * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}

/* 深色模式适配 */
@media (prefers-color-scheme: dark) {
  .enhanced-button {
    filter: brightness(0.9) !important;
  }
}

/* 打印样式 */
@media print {
  .enhanced-button {
    background: transparent !important;
    color: black !important;
    box-shadow: none !important;
    border: 1px solid black !important;
  }
}
</style> 