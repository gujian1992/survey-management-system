/**
 * 格式化答题记录状态
 * @param {string} status 状态码
 * @returns {{type: string, label: string}} 格式化后的状态对象
 */
export const formatRecordStatus = (status) => {
    // 处理空值或未定义的状态
    if (!status && status !== 0) {
        return { type: 'info', label: '未知' }
    }

    const statusMap = {
        // 原有的状态
        completed: { type: 'success', label: '已完成' },
        draft: { type: 'warning', label: '草稿' },
        timeout: { type: 'danger', label: '已超时' },
        scoring: { type: 'info', label: '评分中' },

        // 新增数字状态支持
        0: { type: 'info', label: '未开始' },
        1: { type: 'warning', label: '进行中' },
        2: { type: 'success', label: '已完成' },
        3: { type: 'danger', label: '已超时' },
        4: { type: 'info', label: '已放弃' },

        // 新增字符串状态支持
        'IN_PROGRESS': { type: 'warning', label: '进行中' },
        'COMPLETED': { type: 'success', label: '已完成' },
        'TIMEOUT': { type: 'danger', label: '已超时' },
        'ABANDONED': { type: 'info', label: '已放弃' }
    }
    return statusMap[status] || { type: 'info', label: '未知' }
}

/**
 * 格式化成绩等级
 * @param {string} grade 等级
 * @returns {{type: string, label: string}} 格式化后的等级对象
 */
export const formatGrade = (grade) => {
    const gradeMap = {
        A: { type: 'success', label: '优秀' },
        B: { type: 'success', label: '良好' },
        C: { type: 'warning', label: '及格' },
        D: { type: 'danger', label: '不及格' }
    }
    return gradeMap[grade] || { type: 'info', label: grade || '未评分' }
}

/**
 * 格式化答题用时
 * @param {number} duration 用时（秒）
 * @returns {string} 格式化后的用时字符串
 */
export const formatDuration = (duration) => {
    if (!duration && duration !== 0) return '未知'

    const hours = Math.floor(duration / 3600)
    const minutes = Math.floor((duration % 3600) / 60)
    const seconds = duration % 60

    const parts = []
    if (hours > 0) parts.push(`${hours}小时`)
    if (minutes > 0) parts.push(`${minutes}分钟`)
    if (seconds > 0 || parts.length === 0) parts.push(`${seconds}秒`)

    return parts.join('')
}

/**
 * 格式化日期时间
 * @param {string|number|Date} date 日期时间
 * @returns {string} 格式化后的日期时间字符串
 */
export const formatDateTime = (date) => {
    if (!date) return ''
    const d = new Date(date)
    if (isNaN(d.getTime())) return ''

    return d.toLocaleString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    })
} 