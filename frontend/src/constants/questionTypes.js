// 题型常量定义
export const QUESTION_TYPES = {
  SINGLE_CHOICE: 1,    // 单选题
  MULTIPLE_CHOICE: 2,  // 多选题
  FILL_BLANK: 3,       // 填空题
  SHORT_ANSWER: 4,     // 简答题
  RATING: 5,           // 评分题
  MIXED: 0             // 混合题型
}

// 题型名称映射
export const QUESTION_TYPE_NAMES = {
  [QUESTION_TYPES.SINGLE_CHOICE]: '单选题',
  [QUESTION_TYPES.MULTIPLE_CHOICE]: '多选题', 
  [QUESTION_TYPES.FILL_BLANK]: '填空题',
  [QUESTION_TYPES.SHORT_ANSWER]: '简答题',
  [QUESTION_TYPES.RATING]: '评分题',
  [QUESTION_TYPES.MIXED]: '混合题型'
}

// 题型选项（用于下拉框）
export const QUESTION_TYPE_OPTIONS = [
  { value: QUESTION_TYPES.SINGLE_CHOICE, label: '单选题' },
  { value: QUESTION_TYPES.MULTIPLE_CHOICE, label: '多选题' },
  { value: QUESTION_TYPES.FILL_BLANK, label: '填空题' },
  { value: QUESTION_TYPES.SHORT_ANSWER, label: '简答题' },
  { value: QUESTION_TYPES.RATING, label: '评分题' },
  { value: QUESTION_TYPES.MIXED, label: '混合题型' }
]

// 题型颜色（用于UI展示）
export const QUESTION_TYPE_COLORS = {
  [QUESTION_TYPES.SINGLE_CHOICE]: '#409EFF',
  [QUESTION_TYPES.MULTIPLE_CHOICE]: '#67C23A',
  [QUESTION_TYPES.FILL_BLANK]: '#E6A23C',
  [QUESTION_TYPES.SHORT_ANSWER]: '#F56C6C',
  [QUESTION_TYPES.RATING]: '#909399',
  [QUESTION_TYPES.MIXED]: '#606266'
}

// 优先级常量
export const PRIORITY_LEVELS = {
  LOW: 1,      // 低优先级
  MEDIUM: 2,   // 中优先级  
  HIGH: 3      // 高优先级
}

// 优先级名称映射
export const PRIORITY_NAMES = {
  [PRIORITY_LEVELS.LOW]: '低',
  [PRIORITY_LEVELS.MEDIUM]: '中',
  [PRIORITY_LEVELS.HIGH]: '高'
}

// 题目状态
export const QUESTION_STATUS = {
  DISABLED: 0,  // 禁用
  ENABLED: 1    // 启用
}

// 题目状态名称
export const QUESTION_STATUS_NAMES = {
  [QUESTION_STATUS.DISABLED]: '禁用',
  [QUESTION_STATUS.ENABLED]: '启用'
} 