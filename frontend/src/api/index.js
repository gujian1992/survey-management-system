import request from '@/utils/request'

/**
 * 题库相关接口
 */
export const questionBankAPI = {
  // 获取题库列表
  getList: (params) => request.get('/question-bank/page', { params }),
  
  // 获取题目详情
  getDetail: (id) => request.get(`/question-bank/${id}`),
  
  // 创建题目
  create: (data) => request.post('/question-bank', data),
  
  // 更新题目
  update: (id, data) => request.put(`/question-bank/${id}`, data),
  
  // 删除题目
  delete: (id) => request.delete(`/question-bank/${id}`),
  
  // 批量删除题目
  batchDelete: (ids) => request.delete('/question-bank/batch', { data: ids }),
  
  // 切换题目状态
  toggleStatus: (id, status) => request.put(`/question-bank/${id}/status?status=${status}`),
  
  // 获取随机题目
  getRandomQuestions: (params) => request.get('/question-bank/random', { params }),
  
  // 获取题库统计
  getStats: () => request.get('/question-bank/stats')
}

/**
 * 答题会话相关接口
 */
export const answerSessionAPI = {
  // 开始答题会话
  start: (data) => request.post('/answer-session/start', data),
  
  // 完成答题会话
  finish: (sessionCode) => request.put(`/answer-session/finish/${sessionCode}`),
  
  // 放弃答题会话
  abandon: (sessionCode) => request.put(`/answer-session/abandon/${sessionCode}`),
  
  // 获取会话详情
  getDetail: (sessionCode) => request.get(`/answer-session/${sessionCode}`),
  
  // 获取用户会话列表
  getUserSessions: (params) => request.get('/answer-session/user-sessions', { params }),
  
  // 获取所有会话列表(管理员)
  getAllSessions: (params) => request.get('/answer-session/admin/sessions', { params }),
  
  // 获取用户统计
  getUserStats: (userId) => request.get(`/answer-session/user-stats/${userId}`)
}

/**
 * 答题记录相关接口
 */
export const answerRecordAPI = {
  // 提交答案
  submit: (data) => request.post('/answer-record/submit', data),
  
  // 获取下一题
  getNextQuestion: (sessionCode) => request.get(`/answer-record/next-question/${sessionCode}`),
  
  // 获取会话所有答题记录
  getSessionRecords: (sessionId) => request.get(`/answer-record/session/${sessionId}`),
  
  // 获取需要评分的记录
  getNeedScoring: (params) => request.get('/answer-record/need-scoring', { params }),
  
  // 获取答题记录详情
  getDetail: (recordId) => request.get(`/answer-record/${recordId}`),
  
  // 批量自动评分
  batchAutoScore: (sessionId) => request.post(`/answer-record/batch-auto-score/${sessionId}`)
}

/**
 * 用户相关接口
 */
export const userAPI = {
  // 登录
  login: (data) => request.post('/auth/login', data),
  
  // 获取用户信息
  getUserInfo: () => request.get('/auth/user-info'),
  
  // 修改密码
  changePassword: (data) => request.put('/auth/change-password', data),
  
  // 更新用户信息
  updateUserInfo: (data) => request.put('/auth/update-info', data)
}

/**
 * 评分相关接口
 */
export const scoringAPI = {
  // 创建评分记录
  create: (data) => request.post('/scoring/create', data),
  
  // 更新评分记录
  update: (recordId, data) => request.put(`/scoring/${recordId}`, data),
  
  // 删除评分记录
  delete: (recordId) => request.delete(`/scoring/${recordId}`),
  
  // 批量评分
  batchScoring: (data) => request.post('/scoring/batch', data),
  
  // 获取评分记录列表
  getRecords: (params) => request.get('/scoring/records', { params }),
  
  // 获取会话评分记录
  getSessionRecords: (sessionId) => request.get(`/scoring/session/${sessionId}`),
  
  // 获取评分记录详情
  getDetail: (recordId) => request.get(`/scoring/record/${recordId}`),
  
  // 获取评分统计
  getStatistics: (params) => request.get('/scoring/statistics', { params }),
  
  // 获取未评分记录
  getUnscoredRecords: (sessionId) => request.get(`/scoring/unscored/${sessionId}`),
  
  // 完成会话评分
  completeSessionScoring: (sessionId) => request.post(`/scoring/complete/${sessionId}`)
}

/**
 * 统计相关接口
 */
export const statisticsAPI = {
  // 获取总体统计数据（仪表盘）
  getDashboardStats: () => request.get('/statistics/dashboard'),
  
  // 获取趋势数据
  getTrend: (params) => request.get('/statistics/trend', { params }),
  
  // 获取题目统计数据
  getQuestionStats: (questionId) => request.get(`/statistics/question/${questionId}`),
  
  // 获取会话统计数据
  getSessionStats: (sessionId) => request.get(`/statistics/session/${sessionId}`)
}

// 导出request实例供特殊场景使用
export default request 