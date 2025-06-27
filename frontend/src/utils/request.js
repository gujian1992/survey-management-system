import axios from 'axios'
import { ElMessage, ElLoading } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ErrorCode, getErrorMessage } from '@/constants/errorCode'

/**
 * 请求配置
 */
const config = {
  // 基础URL
  baseURL: process.env.NODE_ENV === 'development' ? 'http://localhost:8080/api' : '/api',
  // 超时时间
  timeout: 10000,
  // 重试次数
  retryTimes: 2,
  // 重试延迟（毫秒）
  retryDelay: 1000,
  // 请求超时时间
  requestTimeout: 10000,
  // 是否显示错误消息
  showError: true
}

/**
 * 创建axios实例
 */
const request = axios.create({
  baseURL: config.baseURL,
  timeout: config.timeout,
  // 允许跨域携带cookie
  withCredentials: true,
  // 请求头
  headers: {
    'Content-Type': 'application/json;charset=utf-8'
  }
})

/**
 * 请求缓存
 */
const requestCache = new Map()
const cacheTimeout = 5 * 60 * 1000 // 5分钟缓存

/**
 * loading实例
 */
let loadingInstance = null
let loadingCount = 0

/**
 * 显示loading
 */
const showLoading = () => {
  if (loadingCount === 0) {
    loadingInstance = ElLoading.service({
      lock: true,
      text: '加载中...',
      background: 'rgba(0, 0, 0, 0.7)'
    })
  }
  loadingCount++
}

/**
 * 隐藏loading
 */
const hideLoading = () => {
  loadingCount--
  if (loadingCount <= 0) {
    loadingCount = 0
    if (loadingInstance) {
      loadingInstance.close()
      loadingInstance = null
    }
  }
}

/**
 * 生成缓存key
 */
const generateCacheKey = (config) => {
  return `${config.method}_${config.url}_${JSON.stringify(config.params || {})}_${JSON.stringify(config.data || {})}`
}

/**
 * 请求重试机制
 */
const retryRequest = async (error) => {
  const config = error.config
  // 设置用于跟踪重试次数的变量
  config.__retryCount = config.__retryCount || 0
  
  if (config.__retryCount >= config.retryTimes) {
    return Promise.reject(error)
  }
  
  config.__retryCount += 1
  
  // 延迟请求
  await new Promise(resolve => setTimeout(resolve, config.retryDelay))
  
  // 重新发起请求
  return request(config)
}

// 请求拦截器
request.interceptors.request.use(
  config => {
    // 添加JWT令牌
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    
    // 添加时间戳防止缓存
    if (config.method === 'get') {
      config.params = { ...config.params, _t: Date.now() }
    }
    
    // 配置重试次数
    config.retryTimes = config.retryTimes || config.retryTimes
    
    // 检查缓存（只对GET请求缓存）
    if (config.method === 'get' && !config.skipCache) {
      const cacheKey = generateCacheKey(config)
      const cached = requestCache.get(cacheKey)
      if (cached && Date.now() - cached.timestamp < cacheTimeout) {
        config.useCache = true
        config.cachedData = cached.data
      }
    }
    
    // 显示loading（除非明确禁用）
    if (!config.hideLoading) {
      showLoading()
    }
    
    return config
  },
  error => {
    hideLoading()
    return Promise.reject(error)
  }
)

// 响应拦截器
request.interceptors.response.use(
  response => {
    hideLoading()
    
    // 如果使用了缓存，直接返回缓存数据
    if (response.config.useCache) {
      return Promise.resolve({
        data: response.config.cachedData,
        status: 200,
        statusText: 'OK (cached)'
      })
    }

    // 缓存GET请求的响应
    if (response.config.method === 'get' && !response.config.skipCache) {
      const cacheKey = generateCacheKey(response.config)
      requestCache.set(cacheKey, {
        data: response.data,
        timestamp: Date.now()
      })
    }

    const res = response.data
    
    // 处理成功响应
    if (res.code === ErrorCode.SUCCESS) {
      return res
    }
    
    // 处理特定错误码
    switch (res.code) {
      case ErrorCode.UNAUTHORIZED:
      case ErrorCode.TOKEN_EXPIRED:
      case ErrorCode.TOKEN_INVALID:
        // 清除token并跳转到登录页
        handleUnauthorized()
        break
        
      case ErrorCode.FORBIDDEN:
        ElMessage.error('没有权限访问')
        break
        
      case ErrorCode.NOT_FOUND:
        return { ...res, data: null }
        
              case ErrorCode.QUESTIONNAIRE_NOT_FOUND:
        case ErrorCode.QUESTIONNAIRE_EXPIRED:
        case ErrorCode.QUESTIONNAIRE_NOT_PUBLISHED:
        case ErrorCode.QUESTIONNAIRE_ALREADY_SUBMITTED:
          ElMessage.warning(getErrorMessage(res.code))
          break
          
        default:
          // 其他错误码统一处理
          ElMessage.error(res.message || getErrorMessage(res.code))
    }
    
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  async error => {
    hideLoading()
    
    // 处理请求超时
    if (error.code === 'ECONNABORTED' && error.message.includes('timeout')) {
      // 尝试重试请求
      return retryRequest(error)
    }
    
    // 处理网络错误、超时等
    if (error.response) {
      const status = error.response.status
      switch (status) {
        case 401:
          handleUnauthorized()
          break
          
        case 403:
          ElMessage.error('没有权限访问')
          break
          
        case 404:
          ElMessage.error('请求的资源不存在')
          break
          
        case 500:
          ElMessage.error('服务器内部错误')
          break
          
        default:
          ElMessage.error('网络错误')
      }
    } else if (error.code === 'ECONNABORTED') {
      ElMessage.error('请求超时，请重试')
    } else {
      ElMessage.error('网络异常，请检查网络连接')
    }
    
    return Promise.reject(error)
  }
)

/**
 * 处理未授权情况
 */
const handleUnauthorized = () => {
  const userStore = useUserStore()
  const router = useRouter()
  
  // 清除用户信息
  userStore.logout()
  
  // 跳转到登录页
  router.push('/login')
  
  ElMessage.error('登录已过期，请重新登录')
}

// 清除缓存的方法
export const clearCache = (pattern) => {
  if (pattern) {
    for (const key of requestCache.keys()) {
      if (key.includes(pattern)) {
        requestCache.delete(key)
      }
    }
  } else {
    requestCache.clear()
  }
}

export default request 