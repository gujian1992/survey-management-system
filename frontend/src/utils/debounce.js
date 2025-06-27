/**
 * 防抖函数
 * @param {Function} func 要防抖的函数
 * @param {number} delay 延迟时间（毫秒）
 * @param {boolean} immediate 是否立即执行
 * @returns {Function} 防抖后的函数
 */
export function debounce(func, delay = 300, immediate = false) {
  let timeout
  
  return function executedFunction(...args) {
    const later = () => {
      timeout = null
      if (!immediate) func.apply(this, args)
    }
    
    const callNow = immediate && !timeout
    
    clearTimeout(timeout)
    timeout = setTimeout(later, delay)
    
    if (callNow) func.apply(this, args)
  }
}

/**
 * 节流函数
 * @param {Function} func 要节流的函数
 * @param {number} delay 延迟时间（毫秒）
 * @returns {Function} 节流后的函数
 */
export function throttle(func, delay = 300) {
  let inThrottle
  
  return function executedFunction(...args) {
    if (!inThrottle) {
      func.apply(this, args)
      inThrottle = true
      setTimeout(() => inThrottle = false, delay)
    }
  }
}

/**
 * 组合式API的防抖hook
 * @param {Function} fn 要防抖的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 防抖后的函数
 */
export function useDebounce(fn, delay = 300) {
  return debounce(fn, delay)
}

/**
 * 组合式API的节流hook
 * @param {Function} fn 要节流的函数
 * @param {number} delay 延迟时间
 * @returns {Function} 节流后的函数
 */
export function useThrottle(fn, delay = 300) {
  return throttle(fn, delay)
} 