import { ElMessage } from 'element-plus'

/**
 * 统一错误处理函数
 * @param {Error} error - 错误对象
 * @param {string} [customMessage] - 自定义错误消息
 */
export const handleError = (error, customMessage) => {
  console.error('Error:', error)
  
  // 如果提供了自定义消息，使用自定义消息
  if (customMessage) {
    ElMessage.error(customMessage)
    return
  }

  // 处理不同类型的错误
  if (error.response) {
    // 服务器响应错误
    const status = error.response.status
    const message = error.response.data?.message || '服务器响应错误'
    
    switch (status) {
      case 400:
        ElMessage.error('请求参数错误：' + message)
        break
      case 401:
        ElMessage.error('未授权：' + message)
        break
      case 403:
        ElMessage.error('访问被拒绝：' + message)
        break
      case 404:
        ElMessage.error('请求的资源不存在：' + message)
        break
      case 500:
        ElMessage.error('服务器内部错误：' + message)
        break
      default:
        ElMessage.error(`请求失败(${status})：${message}`)
    }
  } else if (error.request) {
    // 请求发送失败
    ElMessage.error('网络请求失败，请检查网络连接')
  } else {
    // 其他错误
    ElMessage.error(error.message || '发生未知错误')
  }
}

/**
 * 处理业务逻辑错误
 * @param {Object} response - 响应对象
 * @param {string} [defaultMessage] - 默认错误消息
 */
export const handleBusinessError = (response, defaultMessage = '操作失败') => {
  const message = response?.message || defaultMessage
  ElMessage.error(message)
} 