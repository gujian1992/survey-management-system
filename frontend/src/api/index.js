import request from '@/utils/request'

// 基础路径常量
const BASE_URLS = {
  QUESTION_BANK: '/question-bank',
  ANSWER_SESSION: '/answer-session',
  ANSWER_RECORD: '/answer-record',
  AUTH: '/auth',
  SCORING: '/scoring',
  STATISTICS: '/statistics'
}

/**
 * 题库相关接口
 */
export const questionBankAPI = {
  // 获取题库列表
  getList: (params) => request.get(`${BASE_URLS.QUESTION_BANK}/page`, { params }),

  // 获取题目详情
  getDetail: (id) => request.get(`${BASE_URLS.QUESTION_BANK}/${id}`),

  // 创建题目
  create: (data) => request.post(BASE_URLS.QUESTION_BANK, data),

  // 更新题目
  update: (id, data) => request.put(`${BASE_URLS.QUESTION_BANK}/${id}`, data),

  // 删除题目
  delete: (id) => request.delete(`${BASE_URLS.QUESTION_BANK}/${id}`),

  // 批量删除题目
  batchDelete: (ids) => request.delete(`${BASE_URLS.QUESTION_BANK}/batch`, { data: ids }),

  // 切换题目状态
  toggleStatus: (id, status) => request.put(`${BASE_URLS.QUESTION_BANK}/${id}/status?status=${status}`),

  // 获取随机题目
  getRandomQuestions: (params) => request.get(`${BASE_URLS.QUESTION_BANK}/random`, { params }),

  // 获取题库统计
  getStats: () => request.get(`${BASE_URLS.QUESTION_BANK}/type-stats`)
}

/**
 * 答题会话相关接口
 */
export const answerSessionAPI = {
  // 开始答题会话
  start: (data) => request.post(`${BASE_URLS.ANSWER_SESSION}/start`, data),

  // 完成答题会话
  finish: (sessionCode) => request.put(`${BASE_URLS.ANSWER_SESSION}/finish/${sessionCode}`),

  // 放弃答题会话
  abandon: (sessionCode) => request.put(`${BASE_URLS.ANSWER_SESSION}/abandon/${sessionCode}`),

  // 获取会话详情
  getDetail: (sessionCode) => request.get(`${BASE_URLS.ANSWER_SESSION}/detail/${sessionCode}`),

  // 获取用户会话列表
  getUserSessions: (params) => request.get(`${BASE_URLS.ANSWER_SESSION}/user-sessions`, { params }),

  // 获取所有会话列表(管理员)
  getAllSessions: (params) => request.get(`${BASE_URLS.ANSWER_SESSION}/admin/sessions`, { params }),

  // 获取用户统计
  getUserStats: (userId) => request.get(`${BASE_URLS.ANSWER_SESSION}/user-stats/${userId}`)
}

/**
 * 答题记录相关接口
 */
export const answerRecordAPI = {
  // 获取答题记录统计数据
  getStatistics: () => request.get(`${BASE_URLS.ANSWER_RECORD}/statistics`),

  // 获取我的答题记录
  getMyRecords: (params) => request.get(`${BASE_URLS.ANSWER_RECORD}/my-records`, { params }),

  // 提交答案
  submit: (data) => request.post(`${BASE_URLS.ANSWER_RECORD}/submit`, data),

  // 获取下一题
  getNextQuestion: (sessionCode) => request.get(`${BASE_URLS.ANSWER_RECORD}/next-question/${sessionCode}`),

  // 获取会话所有答题记录
  getSessionRecords: (sessionId) => request.get(`${BASE_URLS.ANSWER_RECORD}/session/${sessionId}`),

  // 获取需要评分的记录
  getNeedScoring: (params) => request.get(`${BASE_URLS.ANSWER_RECORD}/need-scoring`, { params }),

  // 获取答题记录详情
  getDetail: (recordId) => request.get(`${BASE_URLS.ANSWER_RECORD}/${recordId}`),

  // 批量自动评分
  batchAutoScore: (sessionId) => request.post(`${BASE_URLS.ANSWER_RECORD}/batch-auto-score/${sessionId}`)
}

/**
 * 用户相关接口
 */
export const userAPI = {
  // 登录
  login: (data) => request.post(`${BASE_URLS.AUTH}/login`, data),

  // 获取用户信息
  getUserInfo: () => request.get(`${BASE_URLS.AUTH}/user-info`),

  // 修改密码
  changePassword: (data) => request.put(`${BASE_URLS.AUTH}/change-password`, data),

  // 更新用户信息
  updateUserInfo: (data) => request.put(`${BASE_URLS.AUTH}/update-info`, data)
}

/**
 * 评分相关接口
 */
export const scoringAPI = {
  // 创建评分记录
  create: (data) => request.post(`${BASE_URLS.SCORING}/create`, data),

  // 更新评分记录
  update: (recordId, data) => request.put(`${BASE_URLS.SCORING}/${recordId}`, data),

  // 删除评分记录
  delete: (recordId) => request.delete(`${BASE_URLS.SCORING}/${recordId}`),

  // 批量评分
  batchScoring: (data) => request.post(`${BASE_URLS.SCORING}/batch`, data),

  // 获取评分记录列表
  getRecords: (params) => request.get(`${BASE_URLS.SCORING}/records`, { params }),

  // 获取会话评分记录
  getSessionRecords: (sessionId) => request.get(`${BASE_URLS.SCORING}/session/${sessionId}`),

  // 获取评分记录详情
  getDetail: (recordId) => request.get(`${BASE_URLS.SCORING}/record/${recordId}`),

  // 获取评分统计
  getStatistics: (params) => request.get(`${BASE_URLS.SCORING}/statistics`, { params }),

  // 获取未评分记录
  getUnscoredRecords: (sessionId) => request.get(`${BASE_URLS.SCORING}/unscored/${sessionId}`),

  // 完成会话评分
  completeSessionScoring: (sessionId) => request.post(`${BASE_URLS.SCORING}/complete/${sessionId}`)
}

/**
 * 统计相关接口
 */
export const statisticsAPI = {
  // 获取总体统计数据（仪表盘）
  getDashboardStats: () => request.get(`${BASE_URLS.STATISTICS}/dashboard`),

  // 获取趋势数据
  getTrend: (params) => request.get(`${BASE_URLS.STATISTICS}/trend`, { params }),

  // 获取题目统计数据
  getQuestionStats: (questionId) => request.get(`${BASE_URLS.STATISTICS}/question/${questionId}`),

  // 获取会话统计数据
  getSessionStats: (sessionId) => request.get(`${BASE_URLS.STATISTICS}/session/${sessionId}`)
}

// 导出request实例供特殊场景使用
export default request 