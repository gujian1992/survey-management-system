import request from './index'

// 答题记录API
export const answerRecordApi = {
  // 提交答案
  submitAnswer(data) {
    return request.post('/api/answer-record/submit', data)
  },

  // 获取下一题
  getNextQuestion(sessionCode) {
    return request.get(`/api/answer-record/next-question/${sessionCode}`)
  },

  // 获取会话的所有答题记录
  getSessionRecords(sessionId) {
    return request.get(`/api/answer-record/session/${sessionId}`)
  },

  // 获取答题记录详情
  getRecordDetail(recordId) {
    return request.get(`/api/answer-record/${recordId}`)
  },

  // 获取需要评分的记录（管理员）
  getNeedScoringRecords(params) {
    return request.get('/api/answer-record/need-scoring', { params })
  },

  // 批量自动评分（管理员）
  batchAutoScore(sessionId) {
    return request.post(`/api/answer-record/batch-auto-score/${sessionId}`)
  },

  // 获取会话答题统计
  getSessionAnswerStats(sessionId) {
    return request.get(`/api/answer-record/session/${sessionId}/stats`)
  }
} 