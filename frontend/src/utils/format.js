import dayjs from 'dayjs'
import duration from 'dayjs/plugin/duration'
import { SESSION_STATUS } from '@/constants/answerSession'

dayjs.extend(duration)

/**
 * 格式化日期时间
 * @param {string|number|Date} date 日期时间
 * @param {string} format 格式化模板
 * @returns {string} 格式化后的日期时间
 */
export function formatDateTime(date, format = 'YYYY-MM-DD HH:mm:ss') {
    if (!date) return '-'
    return dayjs(date).format(format)
}

/**
 * 格式化时长
 * @param {number} milliseconds 毫秒数
 * @returns {string} 格式化后的时长
 */
export function formatDuration(milliseconds) {
    if (!milliseconds) return '-'
    const duration = dayjs.duration(milliseconds)
    const hours = duration.hours()
    const minutes = duration.minutes()
    const seconds = duration.seconds()

    if (hours > 0) {
        return `${hours}小时${minutes}分钟`
    }
    if (minutes > 0) {
        return `${minutes}分钟${seconds}秒`
    }
    return `${seconds}秒`
}

/**
 * 格式化答题记录状态
 * @param {string} status 状态码
 * @returns {Object} 格式化后的状态对象
 */
export function formatRecordStatus(status) {
    const statusMap = {
        [SESSION_STATUS.NOT_STARTED]: {
            label: '未开始',
            type: 'info'
        },
        [SESSION_STATUS.ONGOING]: {
            label: '进行中',
            type: 'warning'
        },
        [SESSION_STATUS.FINISHED]: {
            label: '已完成',
            type: 'success'
        },
        [SESSION_STATUS.TIMEOUT]: {
            label: '已超时',
            type: 'danger'
        },
        [SESSION_STATUS.ABANDONED]: {
            label: '已放弃',
            type: 'danger'
        }
    }
    return statusMap[status] || { label: '未知', type: 'info' }
}

/**
 * 格式化成绩等级
 * @param {string} grade 等级
 * @returns {Object} 格式化后的等级对象
 */
export function formatGrade(grade) {
    const gradeMap = {
        'A': {
            label: '优秀',
            type: 'success'
        },
        'B': {
            label: '良好',
            type: 'success'
        },
        'C': {
            label: '及格',
            type: 'warning'
        },
        'D': {
            label: '不及格',
            type: 'danger'
        }
    }
    return gradeMap[grade] || { label: '未知', type: 'info' }
} 