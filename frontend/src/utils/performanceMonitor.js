/**
 * 性能监控工具
 * 监控页面性能指标，优化用户体验
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = {
      pageLoad: {},
      apiCalls: [],
      userInteractions: [],
      memoryUsage: [],
      renderTime: []
    }
    
    this.thresholds = {
      pageLoadTime: 3000,    // 页面加载时间阈值 (ms)
      apiResponseTime: 2000, // API响应时间阈值 (ms)
      renderTime: 16,        // 渲染时间阈值 (ms) - 60fps
      memoryUsage: 50        // 内存使用阈值 (MB)
    }
    
    this.observers = {
      performance: null,
      mutation: null,
      intersection: null
    }
    
    this.init()
  }

  /**
   * 初始化性能监控
   */
  init() {
    // 监控页面加载性能
    this.monitorPageLoad()
    
    // 监控API调用性能
    this.monitorApiCalls()
    
    // 监控渲染性能
    this.monitorRenderPerformance()
    
    // 监控内存使用
    this.monitorMemoryUsage()
    
    // 监控用户交互
    this.monitorUserInteractions()
  }

  /**
   * 监控页面加载性能
   */
  monitorPageLoad() {
    if ('performance' in window) {
      window.addEventListener('load', () => {
        setTimeout(() => {
          const navigation = performance.getEntriesByType('navigation')[0]
          const paint = performance.getEntriesByType('paint')
          
          this.metrics.pageLoad = {
            domContentLoaded: navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            firstPaint: paint.find(p => p.name === 'first-paint')?.startTime || 0,
            firstContentfulPaint: paint.find(p => p.name === 'first-contentful-paint')?.startTime || 0,
            totalTime: navigation.loadEventEnd - navigation.fetchStart
          }
          
          // 检查是否超过阈值
          if (this.metrics.pageLoad.totalTime > this.thresholds.pageLoadTime) {
            console.warn('页面加载时间超过阈值:', this.metrics.pageLoad.totalTime)
            this.reportPerformanceIssue('slow_page_load', this.metrics.pageLoad)
          }
        }, 0)
      })
    }
  }

  /**
   * 监控API调用性能
   */
  monitorApiCalls() {
    // 拦截fetch请求
    const originalFetch = window.fetch
    window.fetch = async (...args) => {
      const startTime = performance.now()
      const url = args[0]
      
      try {
        const response = await originalFetch(...args)
        const endTime = performance.now()
        const duration = endTime - startTime
        
        this.recordApiCall({
          url,
          method: args[1]?.method || 'GET',
          duration,
          status: response.status,
          success: response.ok,
          timestamp: Date.now()
        })
        
        // 检查响应时间
        if (duration > this.thresholds.apiResponseTime) {
          console.warn('API响应时间超过阈值:', { url, duration })
          this.reportPerformanceIssue('slow_api_response', { url, duration })
        }
        
        return response
      } catch (error) {
        const endTime = performance.now()
        const duration = endTime - startTime
        
        this.recordApiCall({
          url,
          method: args[1]?.method || 'GET',
          duration,
          status: 0,
          success: false,
          error: error.message,
          timestamp: Date.now()
        })
        
        throw error
      }
    }
  }

  /**
   * 记录API调用
   */
  recordApiCall(callInfo) {
    this.metrics.apiCalls.push(callInfo)
    
    // 限制记录数量
    if (this.metrics.apiCalls.length > 100) {
      this.metrics.apiCalls.shift()
    }
  }

  /**
   * 监控渲染性能
   */
  monitorRenderPerformance() {
    if ('PerformanceObserver' in window) {
      // 监控长任务
      try {
        this.observers.performance = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            if (entry.entryType === 'longtask') {
              console.warn('检测到长任务:', entry.duration)
              this.reportPerformanceIssue('long_task', {
                duration: entry.duration,
                startTime: entry.startTime
              })
            }
          })
        })
        
        this.observers.performance.observe({ entryTypes: ['longtask'] })
      } catch (error) {
        console.warn('PerformanceObserver不支持longtask:', error)
      }
    }
    
    // 监控帧率
    this.monitorFrameRate()
  }

  /**
   * 监控帧率
   */
  monitorFrameRate() {
    let lastTime = performance.now()
    let frameCount = 0
    let totalFrameTime = 0
    
    const measureFrame = (currentTime) => {
      const frameTime = currentTime - lastTime
      lastTime = currentTime
      frameCount++
      totalFrameTime += frameTime
      
      // 每秒统计一次
      if (frameCount >= 60) {
        const avgFrameTime = totalFrameTime / frameCount
        const fps = 1000 / avgFrameTime
        
        this.metrics.renderTime.push({
          avgFrameTime,
          fps,
          timestamp: Date.now()
        })
        
        // 检查帧率
        if (avgFrameTime > this.thresholds.renderTime) {
          console.warn('帧率过低:', { avgFrameTime, fps })
          this.reportPerformanceIssue('low_fps', { avgFrameTime, fps })
        }
        
        frameCount = 0
        totalFrameTime = 0
        
        // 限制记录数量
        if (this.metrics.renderTime.length > 60) {
          this.metrics.renderTime.shift()
        }
      }
      
      requestAnimationFrame(measureFrame)
    }
    
    requestAnimationFrame(measureFrame)
  }

  /**
   * 监控内存使用
   */
  monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory
        const memoryInfo = {
          used: memory.usedJSHeapSize / 1024 / 1024, // MB
          total: memory.totalJSHeapSize / 1024 / 1024, // MB
          limit: memory.jsHeapSizeLimit / 1024 / 1024, // MB
          timestamp: Date.now()
        }
        
        this.metrics.memoryUsage.push(memoryInfo)
        
        // 检查内存使用
        if (memoryInfo.used > this.thresholds.memoryUsage) {
          console.warn('内存使用过高:', memoryInfo)
          this.reportPerformanceIssue('high_memory_usage', memoryInfo)
        }
        
        // 限制记录数量
        if (this.metrics.memoryUsage.length > 60) {
          this.metrics.memoryUsage.shift()
        }
      }, 5000) // 每5秒检查一次
    }
  }

  /**
   * 监控用户交互
   */
  monitorUserInteractions() {
    const interactionTypes = ['click', 'scroll', 'keydown', 'touchstart']
    
    interactionTypes.forEach(type => {
      document.addEventListener(type, (event) => {
        const startTime = performance.now()
        
        // 使用requestAnimationFrame来测量交互响应时间
        requestAnimationFrame(() => {
          const responseTime = performance.now() - startTime
          
          this.metrics.userInteractions.push({
            type,
            target: event.target.tagName,
            responseTime,
            timestamp: Date.now()
          })
          
          // 限制记录数量
          if (this.metrics.userInteractions.length > 100) {
            this.metrics.userInteractions.shift()
          }
        })
      }, { passive: true })
    })
  }

  /**
   * 报告性能问题
   */
  reportPerformanceIssue(type, data) {
    const issue = {
      type,
      data,
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      url: window.location.href
    }
    
    // 这里可以发送到服务器
    console.warn('性能问题:', issue)
    
    // 触发自定义事件
    window.dispatchEvent(new CustomEvent('performanceIssue', {
      detail: issue
    }))
  }

  /**
   * 获取性能报告
   */
  getPerformanceReport() {
    const report = {
      pageLoad: this.metrics.pageLoad,
      apiCalls: {
        total: this.metrics.apiCalls.length,
        avgResponseTime: this.getAvgApiResponseTime(),
        successRate: this.getApiSuccessRate(),
        slowCalls: this.getSlowApiCalls()
      },
      rendering: {
        avgFps: this.getAvgFps(),
        frameDrops: this.getFrameDrops()
      },
      memory: {
        current: this.getCurrentMemoryUsage(),
        peak: this.getPeakMemoryUsage(),
        trend: this.getMemoryTrend()
      },
      userInteractions: {
        total: this.metrics.userInteractions.length,
        avgResponseTime: this.getAvgInteractionResponseTime()
      },
      timestamp: Date.now()
    }
    
    return report
  }

  /**
   * 获取平均API响应时间
   */
  getAvgApiResponseTime() {
    if (this.metrics.apiCalls.length === 0) return 0
    
    const total = this.metrics.apiCalls.reduce((sum, call) => sum + call.duration, 0)
    return total / this.metrics.apiCalls.length
  }

  /**
   * 获取API成功率
   */
  getApiSuccessRate() {
    if (this.metrics.apiCalls.length === 0) return 100
    
    const successCount = this.metrics.apiCalls.filter(call => call.success).length
    return (successCount / this.metrics.apiCalls.length) * 100
  }

  /**
   * 获取慢API调用
   */
  getSlowApiCalls() {
    return this.metrics.apiCalls.filter(call => 
      call.duration > this.thresholds.apiResponseTime
    )
  }

  /**
   * 获取平均帧率
   */
  getAvgFps() {
    if (this.metrics.renderTime.length === 0) return 60
    
    const total = this.metrics.renderTime.reduce((sum, frame) => sum + frame.fps, 0)
    return total / this.metrics.renderTime.length
  }

  /**
   * 获取掉帧次数
   */
  getFrameDrops() {
    return this.metrics.renderTime.filter(frame => 
      frame.avgFrameTime > this.thresholds.renderTime
    ).length
  }

  /**
   * 获取当前内存使用
   */
  getCurrentMemoryUsage() {
    if (this.metrics.memoryUsage.length === 0) return 0
    
    return this.metrics.memoryUsage[this.metrics.memoryUsage.length - 1].used
  }

  /**
   * 获取峰值内存使用
   */
  getPeakMemoryUsage() {
    if (this.metrics.memoryUsage.length === 0) return 0
    
    return Math.max(...this.metrics.memoryUsage.map(m => m.used))
  }

  /**
   * 获取内存使用趋势
   */
  getMemoryTrend() {
    if (this.metrics.memoryUsage.length < 2) return 'stable'
    
    const recent = this.metrics.memoryUsage.slice(-5)
    const first = recent[0].used
    const last = recent[recent.length - 1].used
    
    const change = (last - first) / first * 100
    
    if (change > 10) return 'increasing'
    if (change < -10) return 'decreasing'
    return 'stable'
  }

  /**
   * 获取平均交互响应时间
   */
  getAvgInteractionResponseTime() {
    if (this.metrics.userInteractions.length === 0) return 0
    
    const total = this.metrics.userInteractions.reduce((sum, interaction) => 
      sum + interaction.responseTime, 0
    )
    return total / this.metrics.userInteractions.length
  }

  /**
   * 优化建议
   */
  getOptimizationSuggestions() {
    const suggestions = []
    const report = this.getPerformanceReport()
    
    // 页面加载优化
    if (report.pageLoad.totalTime > this.thresholds.pageLoadTime) {
      suggestions.push({
        type: 'page_load',
        message: '页面加载时间过长，建议优化资源加载',
        priority: 'high'
      })
    }
    
    // API优化
    if (report.apiCalls.avgResponseTime > this.thresholds.apiResponseTime) {
      suggestions.push({
        type: 'api_performance',
        message: 'API响应时间过长，建议优化后端接口',
        priority: 'medium'
      })
    }
    
    // 渲染优化
    if (report.rendering.avgFps < 50) {
      suggestions.push({
        type: 'rendering',
        message: '帧率过低，建议优化DOM操作和动画',
        priority: 'medium'
      })
    }
    
    // 内存优化
    if (report.memory.trend === 'increasing') {
      suggestions.push({
        type: 'memory',
        message: '内存使用持续增长，可能存在内存泄漏',
        priority: 'high'
      })
    }
    
    return suggestions
  }

  /**
   * 清理监控数据
   */
  cleanup() {
    // 断开观察器
    Object.values(this.observers).forEach(observer => {
      if (observer) {
        observer.disconnect()
      }
    })
    
    // 清理数据
    this.metrics = {
      pageLoad: {},
      apiCalls: [],
      userInteractions: [],
      memoryUsage: [],
      renderTime: []
    }
  }

  /**
   * 导出性能数据
   */
  exportData() {
    const data = {
      metrics: this.metrics,
      report: this.getPerformanceReport(),
      suggestions: this.getOptimizationSuggestions(),
      exportTime: new Date().toISOString()
    }
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json'
    })
    
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${Date.now()}.json`
    a.click()
    
    URL.revokeObjectURL(url)
  }
}

// 创建单例实例
export const performanceMonitor = new PerformanceMonitor()

// 导出便捷方法
export const getPerformanceReport = () => {
  return performanceMonitor.getPerformanceReport()
}

export const getOptimizationSuggestions = () => {
  return performanceMonitor.getOptimizationSuggestions()
}

export default performanceMonitor 