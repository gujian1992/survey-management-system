import request from './index'

// 答题记录API
export const answerRecordApi = {
  // 提交答案
  submitAnswer(data) {
    return request.post('/answer-record/submit', data)
  },

  // 批量提交答案
  batchSubmit(data) {
    return request.post('/answer-record/batch-submit', data)
  },

  // 获取下一题
  getNextQuestion(sessionCode) {
    return request.get(`/answer-record/next-question/${sessionCode}`)
  },

  // 获取会话的所有答题记录
  getSessionRecords(sessionId) {
    return request.get(`/answer-record/session/${sessionId}`)
  },

  // 获取答题记录详情
  getRecordDetail(recordId) {
    return request.get(`/answer-record/${recordId}`)
  },

  // 获取需要评分的记录（管理员）
  getNeedScoringRecords(params) {
    return request.get('/answer-record/need-scoring', { params })
  },

  // 批量自动评分（管理员）
  batchAutoScore(sessionId) {
    return request.post(`/answer-record/batch-auto-score/${sessionId}`)
  },

  // 获取会话答题统计
  getSessionAnswerStats(sessionId) {
    return request.get(`/answer-record/session/${sessionId}/stats`)
  },

  // 保存答案草稿
  saveDraft(data) {
    return request.post('/answer-record/draft', data)
  }
} 