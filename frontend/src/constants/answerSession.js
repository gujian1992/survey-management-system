// 答题会话状态常量
export const SESSION_STATUS = {
  IN_PROGRESS: 1,  // 进行中
  COMPLETED: 2,    // 已完成
  TIMEOUT: 3,      // 已超时
  ABANDONED: 4     // 已放弃
}

// 会话状态名称映射
export const SESSION_STATUS_NAMES = {
  [SESSION_STATUS.IN_PROGRESS]: '进行中',
  [SESSION_STATUS.COMPLETED]: '已完成',
  [SESSION_STATUS.TIMEOUT]: '已超时',
  [SESSION_STATUS.ABANDONED]: '已放弃'
}

// 会话状态颜色
export const SESSION_STATUS_COLORS = {
  [SESSION_STATUS.IN_PROGRESS]: '#409EFF',
  [SESSION_STATUS.COMPLETED]: '#67C23A',
  [SESSION_STATUS.TIMEOUT]: '#E6A23C',
  [SESSION_STATUS.ABANDONED]: '#F56C6C'
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