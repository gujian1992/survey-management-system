<template>
  <component 
    :is="tag"
    @click="handleNavigation"
    :class="linkClass"
    :disabled="navigating"
  >
    <slot />
  </component>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'

const props = defineProps({
  to: {
    type: String,
    required: true
  },
  tag: {
    type: String,
    default: 'button'
  },
  replace: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  safeMode: {
    type: Boolean,
    default: true
  }
})

const router = useRouter()
const route = useRoute()
const navigating = ref(false)

const linkClass = computed(() => ({
  'safe-router-link': true,
  'safe-router-link--navigating': navigating.value,
  'safe-router-link--disabled': props.disabled || navigating.value
}))

const handleNavigation = async (event) => {
  // 防止重复点击
  if (navigating.value || props.disabled) {
    event.preventDefault()
    return
  }

  // 相同路由不处理
  if (route.path === props.to) {
    return
  }

  try {
    navigating.value = true
    
    if (props.safeMode) {
      // 安全模式：添加短暂延迟
      await new Promise(resolve => setTimeout(resolve, 16))
    }

    if (props.replace) {
      await router.replace(props.to)
    } else {
      await router.push(props.to)
    }
  } catch (error) {
    console.error('路由跳转失败:', error)
    // 发送错误事件
    window.dispatchEvent(new CustomEvent('route-navigation-error', {
      detail: { error, from: route.path, to: props.to }
    }))
  } finally {
    navigating.value = false
  }
}
</script>

<style scoped>
.safe-router-link {
  transition: opacity 0.2s ease;
  cursor: pointer;
}

.safe-router-link--navigating {
  opacity: 0.7;
  pointer-events: none;
}

.safe-router-link--disabled {
  opacity: 0.5;
  pointer-events: none;
  cursor: not-allowed;
}
</style> 