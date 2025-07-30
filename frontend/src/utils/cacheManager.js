/**
 * 智能缓存管理器
 * 平衡性能和稳定性，避免页面重叠问题
 */

class CacheManager {
  constructor() {
    this.cacheStatus = new Map()
    this.conflictRoutes = new Set([
      'QuestionnaireAnswer',
      'QuestionnaireFill',
      'QuestionnaireCreate',
      'QuestionnaireEdit',
      'QuestionnairePreview'
    ])
    this.performanceRoutes = new Set([
      'Dashboard',
      'QuestionnaireList',
      'Statistics'
    ])

    this.initEventListeners()
  }

  /**
   * 初始化事件监听
   */
  initEventListeners() {
    // 监听页面可见性变化
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        this.checkCacheHealth()
      }
    })

    // 监听路由变化
    window.addEventListener('beforeunload', () => {
      this.cleanup()
    })
  }

  /**
   * 检查是否应该缓存组件
   */
  shouldCache(componentName, route) {
    // 冲突路由永不缓存
    if (this.conflictRoutes.has(componentName)) {
      return false
    }

    // 性能关键路由优先缓存
    if (this.performanceRoutes.has(componentName)) {
      return true
    }

    // 带参数的动态路由不缓存
    if (route && (route.params && Object.keys(route.params).length > 0)) {
      return false
    }

    return false
  }

  /**
   * 记录缓存状态
   */
  recordCacheStatus(componentName, status) {
    this.cacheStatus.set(componentName, {
      status,
      timestamp: Date.now(),
      accessCount: (this.cacheStatus.get(componentName)?.accessCount || 0) + 1
    })
  }

  /**
   * 获取当前应该缓存的组件列表
   */
  getCachedComponents(userRole) {
    const cached = []

    if (userRole === 'ADMIN') {
      // 管理员：缓存核心管理页面
      this.performanceRoutes.forEach(route => {
        if (['Dashboard', 'QuestionnaireList', 'Statistics'].includes(route)) {
          cached.push(route)
        }
      })
    } else {
      // 普通用户：暂时不缓存，确保数据一致性
      // 可以根据稳定性情况后续添加 MyResponses 等页面
    }

    return cached
  }

  /**
   * 强制清理特定组件缓存
   */
  forceClearCache(componentName) {
    // 触发缓存清理事件
    window.dispatchEvent(new CustomEvent('forceClearCache', {
      detail: { componentName }
    }))

    this.cacheStatus.delete(componentName)
  }

  /**
   * 检查缓存健康状态
   */
  checkCacheHealth() {
    const now = Date.now()
    const expireTime = 10 * 60 * 1000 // 10分钟过期

    for (const [componentName, info] of this.cacheStatus.entries()) {
      if (now - info.timestamp > expireTime) {
        console.log(`缓存过期，清理组件: ${componentName}`)
        this.forceClearCache(componentName)
      }
    }
  }

  /**
   * 获取路由唯一键
   */
  getRouteKey(route, componentName) {
    // 冲突组件使用时间戳键
    if (this.conflictRoutes.has(componentName)) {
      return `${route.path}_${componentName}_${Date.now()}`
    }

    // 动态路由使用完整路径 + 参数
    if (route.params && Object.keys(route.params).length > 0) {
      const paramStr = Object.entries(route.params)
        .map(([key, value]) => `${key}=${value}`)
        .join('&')
      return `${route.path}?${paramStr}_${Date.now()}`
    }

    // 静态路由使用固定键
    return route.path
  }

  /**
   * 处理页面切换前的清理
   */
  beforePageLeave(from, to) {
    // 跳过答题页面的处理
    if (from && from.name === 'AnswerQuestion') {
      return
    }

    if (from && this.conflictRoutes.has(from.name)) {
      console.log(`清理冲突路由缓存: ${from.name}`)
      this.forceClearCache(from.name)

      // 延迟清理，确保动画完成
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('pageTransition', {
          detail: { from: from.name, to: to.name, action: 'cleanup' }
        }))
      }, 100)
    }
  }

  /**
   * 处理页面进入后的初始化
   */
  afterPageEnter(to, from) {
    // 跳过答题页面的处理
    if (to.name === 'AnswerQuestion') {
      return
    }

    this.recordCacheStatus(to.name, 'active')

    // 对于冲突路由，确保状态完全清理
    if (this.conflictRoutes.has(to.name)) {
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('pageStateReset', {
          detail: { componentName: to.name }
        }))
      }, 50)
    }
  }

  /**
   * 清理所有缓存
   */
  cleanup() {
    this.cacheStatus.clear()

    // 清理可能残留的状态
    this.conflictRoutes.forEach(componentName => {
      this.forceClearCache(componentName)
    })
  }

  /**
   * 获取性能统计
   */
  getPerformanceStats() {
    const stats = {
      totalCached: this.cacheStatus.size,
      cacheHitRate: 0,
      components: []
    }

    for (const [name, info] of this.cacheStatus.entries()) {
      stats.components.push({
        name,
        accessCount: info.accessCount,
        lastAccess: new Date(info.timestamp).toLocaleString(),
        age: Date.now() - info.timestamp
      })
    }

    return stats
  }
}

// 创建全局实例
const cacheManager = new CacheManager()

// 导出方法供组件使用
export const shouldCacheComponent = (componentName, route) => {
  return cacheManager.shouldCache(componentName, route)
}

export const getCachedComponents = (userRole) => {
  return cacheManager.getCachedComponents(userRole)
}

export const getRouteKey = (route, componentName) => {
  return cacheManager.getRouteKey(route, componentName)
}

export const beforePageLeave = (from, to) => {
  return cacheManager.beforePageLeave(from, to)
}

export const afterPageEnter = (to, from) => {
  return cacheManager.afterPageEnter(to, from)
}

export const forceClearCache = (componentName) => {
  return cacheManager.forceClearCache(componentName)
}

export const getPerformanceStats = () => {
  return cacheManager.getPerformanceStats()
}

export default cacheManager 