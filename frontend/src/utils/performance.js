/**
 * 性能监控工具
 */

// 页面加载时间监控
export const measurePageLoad = () => {
  if (typeof window !== 'undefined' && window.performance) {
    const navigation = performance.getEntriesByType('navigation')[0]
    if (navigation) {
      const loadTime = navigation.loadEventEnd - navigation.fetchStart
      console.log(`页面加载时间: ${loadTime}ms`)
      return loadTime
    }
  }
  return 0
}

// 组件渲染时间监控
export const measureComponentRender = (componentName) => {
  const startTime = performance.now()
  
  return () => {
    const endTime = performance.now()
    const renderTime = endTime - startTime
    console.log(`${componentName} 渲染时间: ${renderTime.toFixed(2)}ms`)
    return renderTime
  }
}

// API请求时间监控
export const measureApiRequest = (apiName) => {
  const startTime = performance.now()
  
  return () => {
    const endTime = performance.now()
    const requestTime = endTime - startTime
    console.log(`${apiName} 请求时间: ${requestTime.toFixed(2)}ms`)
    return requestTime
  }
}

// 路由切换时间监控
export const measureRouteChange = (from, to) => {
  const startTime = performance.now()
  
  return () => {
    const endTime = performance.now()
    const changeTime = endTime - startTime
    console.log(`路由切换 ${from} -> ${to}: ${changeTime.toFixed(2)}ms`)
    return changeTime
  }
}

// 内存使用监控
export const measureMemoryUsage = () => {
  if (typeof window !== 'undefined' && window.performance && window.performance.memory) {
    const memory = window.performance.memory
    console.log('内存使用情况:', {
      used: `${(memory.usedJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      total: `${(memory.totalJSHeapSize / 1024 / 1024).toFixed(2)}MB`,
      limit: `${(memory.jsHeapSizeLimit / 1024 / 1024).toFixed(2)}MB`
    })
    return memory
  }
  return null
}

// 长任务监控
export const observeLongTasks = () => {
  if (typeof window !== 'undefined' && 'PerformanceObserver' in window) {
    const observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        console.warn(`长任务检测: ${entry.duration.toFixed(2)}ms`, entry)
      }
    })
    
    try {
      observer.observe({ entryTypes: ['longtask'] })
      return observer
    } catch (e) {
      console.warn('长任务监控不支持')
    }
  }
  return null
}

// FPS监控
export const measureFPS = (duration = 1000) => {
  let frames = 0
  let lastTime = performance.now()
  
  const countFrame = () => {
    frames++
    const currentTime = performance.now()
    
    if (currentTime >= lastTime + duration) {
      const fps = Math.round((frames * 1000) / (currentTime - lastTime))
      console.log(`FPS: ${fps}`)
      frames = 0
      lastTime = currentTime
    }
    
    requestAnimationFrame(countFrame)
  }
  
  requestAnimationFrame(countFrame)
}

// 性能报告
export const generatePerformanceReport = () => {
  const report = {
    timestamp: new Date().toISOString(),
    pageLoad: measurePageLoad(),
    memory: measureMemoryUsage(),
    userAgent: navigator.userAgent,
    url: window.location.href
  }
  
  console.log('性能报告:', report)
  return report
}

// Vue组合式API的性能监控hook
export const usePerformanceMonitor = (componentName) => {
  const measureRender = measureComponentRender(componentName)
  
  return {
    measureRender,
    measureApi: measureApiRequest,
    measureMemory: measureMemoryUsage
  }
} 