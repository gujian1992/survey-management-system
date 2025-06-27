/**
 * 时间工具函数
 */

/**
 * 格式化日期时间
 * @param {string|Date} dateTime 日期时间
 * @param {string} format 格式类型：'datetime', 'date', 'time'
 * @returns {string} 格式化后的时间字符串
 */
export const formatDateTime = (dateTime, format = 'datetime') => {
  if (!dateTime) return ''
  
  try {
    const date = new Date(dateTime)
    
    if (isNaN(date.getTime())) {
      return dateTime
    }
    
    const options = {
      datetime: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      },
      date: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      },
      time: {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      },
      short: {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }
    }
    
    return date.toLocaleString('zh-CN', options[format] || options.datetime)
  } catch (error) {
    console.error('时间格式化失败:', error)
    return dateTime
  }
}

/**
 * 获取相对时间描述
 * @param {string|Date} dateTime 日期时间
 * @returns {string} 相对时间描述
 */
export const getRelativeTime = (dateTime) => {
  if (!dateTime) return ''
  
  try {
    const date = new Date(dateTime)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    
    const minute = 60 * 1000
    const hour = 60 * minute
    const day = 24 * hour
    const week = 7 * day
    const month = 30 * day
    const year = 365 * day
    
    if (diff < minute) {
      return '刚刚'
    } else if (diff < hour) {
      return `${Math.floor(diff / minute)}分钟前`
    } else if (diff < day) {
      return `${Math.floor(diff / hour)}小时前`
    } else if (diff < week) {
      return `${Math.floor(diff / day)}天前`
    } else if (diff < month) {
      return `${Math.floor(diff / week)}周前`
    } else if (diff < year) {
      return `${Math.floor(diff / month)}个月前`
    } else {
      return `${Math.floor(diff / year)}年前`
    }
  } catch (error) {
    console.error('相对时间计算失败:', error)
    return formatDateTime(dateTime, 'short')
  }
}

/**
 * 判断问卷时间状态
 * @param {Object} questionnaire 问卷对象
 * @returns {Object} 时间状态信息
 */
export const getQuestionnaireTimeStatus = (questionnaire) => {
  const now = new Date()
  const startTime = questionnaire.startTime ? new Date(questionnaire.startTime) : null
  const endTime = questionnaire.endTime ? new Date(questionnaire.endTime) : null
  const publishTime = questionnaire.publishTime ? new Date(questionnaire.publishTime) : null
  
  const status = {
    canFill: false,
    timeStatus: 'unknown',
    timeMessage: '',
    isExpired: false,
    isNotStarted: false
  }
  
  // 如果问卷未发布
  if (questionnaire.status !== 1) {
    status.timeStatus = 'not-published'
    status.timeMessage = '问卷未发布'
    return status
  }
  
  // 如果有开始时间且还未开始
  if (startTime && now < startTime) {
    status.timeStatus = 'not-started'
    status.timeMessage = `问卷将于 ${formatDateTime(startTime)} 开始`
    status.isNotStarted = true
    return status
  }
  
  // 如果有结束时间且已过期
  if (endTime && now > endTime) {
    status.timeStatus = 'expired'
    status.timeMessage = `问卷已于 ${formatDateTime(endTime)} 结束`
    status.isExpired = true
    return status
  }
  
  // 可以填写
  status.canFill = true
  status.timeStatus = 'active'
  
  if (endTime) {
    const timeLeft = endTime.getTime() - now.getTime()
    const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000))
    const hoursLeft = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000))
    
    if (daysLeft > 0) {
      status.timeMessage = `距离结束还有 ${daysLeft} 天`
    } else if (hoursLeft > 0) {
      status.timeMessage = `距离结束还有 ${hoursLeft} 小时`
    } else {
      status.timeMessage = '即将结束'
    }
  } else {
    status.timeMessage = '长期有效'
  }
  
  return status
}

/**
 * 验证时间范围
 * @param {string} startTime 开始时间
 * @param {string} endTime 结束时间
 * @returns {Object} 验证结果
 */
export const validateTimeRange = (startTime, endTime) => {
  const result = {
    valid: true,
    message: ''
  }
  
  if (!startTime && !endTime) {
    return result
  }
  
  if (startTime && endTime) {
    const start = new Date(startTime)
    const end = new Date(endTime)
    
    if (start >= end) {
      result.valid = false
      result.message = '开始时间必须早于结束时间'
      return result
    }
    
    const now = new Date()
    if (end <= now) {
      result.valid = false
      result.message = '结束时间不能早于当前时间'
      return result
    }
  }
  
  return result
}

/**
 * 获取时间范围描述
 * @param {string} startTime 开始时间
 * @param {string} endTime 结束时间
 * @returns {string} 时间范围描述
 */
export const getTimeRangeDescription = (startTime, endTime) => {
  if (!startTime && !endTime) {
    return '长期有效'
  }
  
  if (startTime && !endTime) {
    return `${formatDateTime(startTime)} 开始，长期有效`
  }
  
  if (!startTime && endTime) {
    return `截止到 ${formatDateTime(endTime)}`
  }
  
  return `${formatDateTime(startTime)} 至 ${formatDateTime(endTime)}`
}

/**
 * 获取时间状态标签类型
 * @param {string} timeStatus 时间状态
 * @returns {string} Element Plus 标签类型
 */
export const getTimeStatusTagType = (timeStatus) => {
  const typeMap = {
    'active': 'success',
    'not-started': 'warning',
    'expired': 'danger',
    'not-published': 'info'
  }
  
  return typeMap[timeStatus] || 'info'
} 