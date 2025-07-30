/**
 * 答题会话状态
 */
export const SESSION_STATUS = {
  NOT_STARTED: 'NOT_STARTED',  // 未开始
  ONGOING: 'ONGOING',          // 进行中
  FINISHED: 'FINISHED',        // 已完成
  TIMEOUT: 'TIMEOUT',          // 已超时
  ABANDONED: 'ABANDONED',      // 已放弃
  ERROR: 'ERROR'              // 异常结束
}

/**
 * 答题会话状态文本
 */
export const SESSION_STATUS_TEXT = {
  [SESSION_STATUS.NOT_STARTED]: '未开始',
  [SESSION_STATUS.ONGOING]: '进行中',
  [SESSION_STATUS.FINISHED]: '已完成',
  [SESSION_STATUS.TIMEOUT]: '已超时',
  [SESSION_STATUS.ABANDONED]: '已放弃',
  [SESSION_STATUS.ERROR]: '异常结束'
}

/**
 * 答题会话状态类型
 */
export const SESSION_STATUS_TYPE = {
  [SESSION_STATUS.NOT_STARTED]: 'info',
  [SESSION_STATUS.ONGOING]: 'primary',
  [SESSION_STATUS.FINISHED]: 'success',
  [SESSION_STATUS.TIMEOUT]: 'warning',
  [SESSION_STATUS.ABANDONED]: 'danger',
  [SESSION_STATUS.ERROR]: 'danger'
}

/**
 * 答题会话状态名称
 */
export const SESSION_STATUS_NAMES = {
  [SESSION_STATUS.NOT_STARTED]: '未开始',
  [SESSION_STATUS.ONGOING]: '进行中',
  [SESSION_STATUS.FINISHED]: '已完成',
  [SESSION_STATUS.TIMEOUT]: '已超时',
  [SESSION_STATUS.ABANDONED]: '已放弃',
  [SESSION_STATUS.ERROR]: '异常结束'
}

/**
 * 答题会话状态颜色
 */
export const SESSION_STATUS_COLORS = {
  [SESSION_STATUS.NOT_STARTED]: '#909399',
  [SESSION_STATUS.ONGOING]: '#409EFF',
  [SESSION_STATUS.FINISHED]: '#67C23A',
  [SESSION_STATUS.TIMEOUT]: '#E6A23C',
  [SESSION_STATUS.ABANDONED]: '#F56C6C',
  [SESSION_STATUS.ERROR]: '#F56C6C'
}

/**
 * 答题流程步骤
 */
export const EXAM_STEPS = {
  INIT: 'init',           // 初始化
  LOAD_QUESTIONS: 'load_questions',  // 加载题目
  ANSWERING: 'answering',  // 答题中
  SUBMITTING: 'submitting', // 提交中
  COMPLETED: 'completed',   // 已完成
  ERROR: 'error'           // 错误状态
}

/**
 * 错误码定义
 */
export const EXAM_ERROR_CODES = {
  SESSION_NOT_FOUND: 4001,      // 会话不存在
  SESSION_EXPIRED: 4002,        // 会话已过期
  SESSION_COMPLETED: 4003,      // 会话已完成
  SESSION_TIMEOUT: 4004,        // 会话已超时
  SESSION_ABANDONED: 4005,      // 会话已放弃
  QUESTIONS_LOAD_FAILED: 4006,  // 题目加载失败
  SUBMIT_FAILED: 4007,          // 提交失败
  NETWORK_ERROR: 4008,          // 网络错误
  SYSTEM_ERROR: 4009            // 系统错误
}

/**
 * 错误信息映射
 */
export const EXAM_ERROR_MESSAGES = {
  [EXAM_ERROR_CODES.SESSION_NOT_FOUND]: '考试会话不存在或已失效',
  [EXAM_ERROR_CODES.SESSION_EXPIRED]: '考试会话已过期',
  [EXAM_ERROR_CODES.SESSION_COMPLETED]: '考试已完成，无法继续答题',
  [EXAM_ERROR_CODES.SESSION_TIMEOUT]: '考试时间已到，无法继续答题',
  [EXAM_ERROR_CODES.SESSION_ABANDONED]: '考试已放弃，无法继续答题',
  [EXAM_ERROR_CODES.QUESTIONS_LOAD_FAILED]: '题目加载失败，请刷新页面重试',
  [EXAM_ERROR_CODES.SUBMIT_FAILED]: '提交失败，请检查网络后重试',
  [EXAM_ERROR_CODES.NETWORK_ERROR]: '网络连接异常，请检查网络后重试',
  [EXAM_ERROR_CODES.SYSTEM_ERROR]: '系统异常，请联系管理员'
}

/**
 * 答题配置
 */
export const EXAM_CONFIG = {
  // 自动保存间隔（秒）
  AUTO_SAVE_INTERVAL: 30,
  // 心跳检测间隔（秒）
  HEARTBEAT_INTERVAL: 60,
  // 页面离开确认
  ENABLE_LEAVE_CONFIRMATION: true,
  // 自动提交剩余时间（秒）
  AUTO_SUBMIT_REMAINING_TIME: 300,
  // 最大重试次数
  MAX_RETRY_TIMES: 3,
  // 重试延迟（毫秒）
  RETRY_DELAY: 2000
}

// 评分状态常量
export const SCORING_STATUS = {
  UNSCORED: 0,      // 未评分
  PARTIAL: 1,       // 部分评分
  COMPLETED: 2      // 已完成评分
}

// 评分状态名称映射
export const SCORING_STATUS_NAMES = {
  [SCORING_STATUS.UNSCORED]: '未评分',
  [SCORING_STATUS.PARTIAL]: '部分评分',
  [SCORING_STATUS.COMPLETED]: '已完成评分'
}

// 评分状态颜色
export const SCORING_STATUS_COLORS = {
  [SCORING_STATUS.UNSCORED]: '#909399',
  [SCORING_STATUS.PARTIAL]: '#E6A23C',
  [SCORING_STATUS.COMPLETED]: '#67C23A'
}

// 默认超时时间（分钟）
export const DEFAULT_TIMEOUT_MINUTES = 60

// 答题数量选项
export const ANSWER_COUNT_OPTIONS = [
  { value: 5, label: '5题' },
  { value: 10, label: '10题' },
  { value: 15, label: '15题' },
  { value: 20, label: '20题' },
  { value: 25, label: '25题' },
  { value: 30, label: '30题' }
] 