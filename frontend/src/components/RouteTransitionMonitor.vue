<template>
  <div class="route-monitor">
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { answerSessionApi } from '@/api/answerSession'
import { SimplePremiumDialog } from '@/utils/simplePremiumDialog'

const router = useRouter()
const route = useRoute()

// 状态变量
const isExamPage = ref(false)
const currentSessionCode = ref(null)

// 检查是否是答题页面
const checkIsExamPage = (path) => {
  return path.includes('/answer-session/')
}

// 更新页面状态
const updatePageState = () => {
  isExamPage.value = checkIsExamPage(route.path)
  if (isExamPage.value) {
    currentSessionCode.value = route.params.sessionCode
  }
}

// 处理放弃答题（带超时保护）
const handleAbandonSession = async () => {
  if (!currentSessionCode.value) return true
  
  try {
    // 设置5秒超时，避免网络问题导致用户卡死
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('请求超时')), 5000)
    )
    
    const abandonPromise = answerSessionApi.abandonSession(currentSessionCode.value)
    
    await Promise.race([abandonPromise, timeoutPromise])
    ElMessage.warning('已放弃本次答题')
    return true
  } catch (error) {
    console.error('放弃答题失败:', error)
    // 无论什么错误，都要让用户能够退出页面，不能卡死
    // 常见的错误情况：
    // 1. 会话已经结束
    // 2. 会话不存在  
    // 3. 网络错误
    // 4. 服务器错误
    // 5. 请求超时
    console.log('放弃答题请求失败，但仍允许用户退出页面')
    return true // 强制返回成功，确保用户能退出
  }
}

// 路由守卫
const setupRouteGuard = () => {
  router.beforeEach(async (to, from, next) => {
    // 只在从答题页面离开时启用保护（不包括初始加载）
    if (checkIsExamPage(from.path) && from.name) {
      // 检查是否是正常完成答题的跳转
      if (window._examCompleted) {
        // 清除标志
        window._examCompleted = false
        // 更新页面状态
        updatePageState()
        next()
        return
      }
      
      try {
        const confirmed = await SimplePremiumDialog.confirm(
          '您确定要离开答题页面吗？\n\n离开页面将自动放弃本次答题，答题记录将被标记为"已放弃"。\n\n点击"继续答题"返回答题页面\n点击"放弃答题"结束本次答题',
          '确认离开答题',
          {
            confirmButtonText: '放弃答题',
            cancelButtonText: '继续答题',
            type: 'warning',
            customClass: 'session-dialog',
            closeOnClickModal: false,
            distinguishCancelAndClose: true,
            center: true
          }
        )
        
        if (!confirmed) {
          // 用户选择继续答题
          next(false)
          return
        }
        
        // 用户选择放弃答题
        currentSessionCode.value = from.params.sessionCode
        const success = await handleAbandonSession()
        if (!success) {
          next(false)
          return
        }
        
        next()
      } catch (error) {
        // 用户取消或关闭对话框，阻止路由跳转
        next(false)
      }
    } else {
      // 更新页面状态
      updatePageState()
      next()
    }
  })
}

// 页面刷新保护
const setupRefreshProtection = () => {
  window.addEventListener('beforeunload', (e) => {
    if (isExamPage.value) {
      e.preventDefault()
      e.returnValue = '您正在进行答题，离开页面将自动放弃本次答题。确定要离开吗？'
    }
  })
}

// 添加刷新确认
const setupBeforeUnloadHandler = () => {
  window.onbeforeunload = (e) => {
    if (checkIsExamPage(route.path)) {
      const message = '警告：您正在答题中。刷新页面将清空当前题目的作答，已提交的答案不受影响。是否确定要刷新页面？'
      e.returnValue = message
      return message
    }
  }
}

// 移除刷新确认
const removeBeforeUnloadHandler = () => {
  window.onbeforeunload = null
}

// 监听路由变化
const handleRouteChange = async (to, from) => {
  const isFromAnswer = checkIsExamPage(from.path)
  const isToAnswer = checkIsExamPage(to.path)

  // 进入答题页面
  if (isToAnswer) {
    setupBeforeUnloadHandler()
  } else {
    removeBeforeUnloadHandler()
  }
}

// 生命周期
onMounted(() => {
  setupRouteGuard()
  setupRefreshProtection()
  updatePageState()
  if (checkIsExamPage(route.path)) {
    setupBeforeUnloadHandler()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('beforeunload', setupRefreshProtection)
  removeBeforeUnloadHandler()
})

// 监听路由
router.beforeEach(handleRouteChange)
</script>

<style scoped>
.route-monitor {
  height: 100%;
  position: relative;
  overflow-y: auto;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.route-monitor > :deep(*) {
  flex: 1;
  width: 100%;
  height: 100%;
}

:deep(.session-dialog) {
  .el-message-box__message {
    white-space: pre-line;
    text-align: center;
    font-size: 14px;
    line-height: 1.6;
  }
}
</style> 