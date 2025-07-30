/**
 * 时间工具函数
 */

/**
 * 格式化日期时间
 * @param {string|number|Date} date 要格式化的日期
 * @param {string} [format='YYYY-MM-DD HH:mm:ss'] 格式化模式
 * @returns {string} 格式化后的日期字符串
 */
export const formatDate = (date, format = 'YYYY-MM-DD HH:mm:ss') => {
  if (!date) return '-'

  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hours = String(d.getHours()).padStart(2, '0')
  const minutes = String(d.getMinutes()).padStart(2, '0')
  const seconds = String(d.getSeconds()).padStart(2, '0')

  return format
    .replace('YYYY', year)
    .replace('MM', month)
    .replace('DD', day)
    .replace('HH', hours)
    .replace('mm', minutes)
    .replace('ss', seconds)
}

/**
 * 格式化时长（秒转换为可读时间）
 * @param {number} seconds 秒数
 * @returns {string} 格式化后的时间字符串
 */
export const formatDuration = (seconds) => {
  if (!seconds || seconds < 0) return '0秒'

  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const remainingSeconds = seconds % 60

  const parts = []
  if (hours > 0) parts.push(`${hours}小时`)
  if (minutes > 0) parts.push(`${minutes}分钟`)
  if (remainingSeconds > 0 || parts.length === 0) parts.push(`${remainingSeconds}秒`)

  return parts.join('')
}

/**
 * 计算两个日期之间的时间差（秒）
 * @param {string|number|Date} startDate 开始时间
 * @param {string|number|Date} endDate 结束时间
 * @returns {number} 时间差（秒）
 */
export const calculateTimeDiff = (startDate, endDate) => {
  if (!startDate || !endDate) return 0

  const start = new Date(startDate)
  const end = new Date(endDate)

  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0

  return Math.floor((end - start) / 1000)
}

/**
 * 获取相对时间描述
 * @param {string|number|Date} date 日期
 * @returns {string} 相对时间描述
 */
export const getRelativeTime = (date) => {
  if (!date) return '-'

  const d = new Date(date)
  if (isNaN(d.getTime())) return '-'

  const now = new Date()
  const diff = now - d
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (days > 30) {
    return formatDate(date, 'YYYY-MM-DD')
  } else if (days > 0) {
    return `${days}天前`
  } else if (hours > 0) {
    return `${hours}小时前`
  } else if (minutes > 0) {
    return `${minutes}分钟前`
  } else {
    return seconds <= 0 ? '刚刚' : `${seconds}秒前`
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
    status.timeMessage = `问卷将于 ${formatDate(startTime)} 开始`
    status.isNotStarted = true
    return status
  }

  // 如果有结束时间且已过期
  if (endTime && now > endTime) {
    status.timeStatus = 'expired'
    status.timeMessage = `问卷已于 ${formatDate(endTime)} 结束`
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
    return `${formatDate(startTime)} 开始，长期有效`
  }


  return `${formatDate(startTime)} 至 ${formatDate(endTime)}`
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