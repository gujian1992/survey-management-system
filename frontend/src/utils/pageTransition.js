/**
 * 页面切换管理工具
 * 用于优化页面切换效果，避免重叠问题，提升用户体验
 */

// 页面状态管理
const pageStates = new Map()

/**
 * 记录页面状态
 */
export const recordPageState = (routeName, state) => {
  pageStates.set(routeName, {
    ...state,
    timestamp: Date.now()
  })
}

/**
 * 获取页面状态
 */
export const getPageState = (routeName) => {
  return pageStates.get(routeName)
}

/**
 * 清理页面状态
 */
export const clearPageState = (routeName) => {
  pageStates.delete(routeName)
}

/**
 * 清理所有过期状态（超过5分钟）
 */
export const cleanExpiredStates = () => {
  const now = Date.now()
  const expireTime = 5 * 60 * 1000 // 5分钟
  
  for (const [key, state] of pageStates.entries()) {
    if (now - state.timestamp > expireTime) {
      pageStates.delete(key)
    }
  }
}

/**
 * 页面切换前的清理工作
 */
export const beforePageLeave = (from, to) => {
  // 清理可能导致冲突的页面状态
  const conflictRoutes = [
    'QuestionnaireCreate',
    'QuestionnaireEdit', 
    'QuestionnaireAnswer',
    'QuestionnaireFill'
  ]
  
  if (conflictRoutes.includes(from.name)) {
    clearPageState(from.name)
    
    // 触发页面级别的清理事件
    window.dispatchEvent(new CustomEvent('pageLeave', {
      detail: { from: from.name, to: to.name }
    }))
  }
  
  // 定期清理过期状态
  cleanExpiredStates()
}

/**
 * 页面切换后的初始化工作
 */
export const afterPageEnter = (to, from) => {
  // 触发页面级别的进入事件
  window.dispatchEvent(new CustomEvent('pageEnter', {
    detail: { to: to.name, from: from?.name }
  }))
  
  // 对于特定页面，清理可能的缓存冲突
  const refreshRoutes = ['QuestionnaireAnswer', 'QuestionnaireFill']
  if (refreshRoutes.includes(to.name)) {
    // 延迟清理，确保页面已完全加载
    setTimeout(() => {
      clearPageState(to.name)
    }, 100)
  }
}

/**
 * 检查是否需要强制刷新
 */
export const shouldForceRefresh = (route) => {
  const forceRefreshPatterns = [
    /\/questionnaire\/fill\/\d+/,
    /\/questionnaire\/edit\/\d+/,
    /\/questionnaire\/preview\/\d+/,
    /\/questionnaire-fill/
  ]
  
  return forceRefreshPatterns.some(pattern => pattern.test(route.path))
}

/**
 * 防抖函数，避免快速切换导致的问题
 */
export const debounceRouteChange = (() => {
  let timer = null
  
  return (callback, delay = 150) => {
    if (timer) {
      clearTimeout(timer)
    }
    
    timer = setTimeout(() => {
      callback()
      timer = null
    }, delay)
  }
})()