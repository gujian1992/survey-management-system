import request from './index'

// 评分管理API
export const scoringApi = {
  // 创建评分记录
  createScoringRecord(data) {
    return request.post('/api/scoring/create', data)
  },

  // 更新评分记录
  updateScoringRecord(recordId, data) {
    return request.put(`/api/scoring/${recordId}`, data)
  },

  // 删除评分记录
  deleteScoringRecord(recordId) {
    return request.delete(`/api/scoring/${recordId}`)
  },

  // 获取评分记录分页列表
  getScoringRecordsPage(params) {
    return request.get('/api/scoring/records', { params })
  },

  // 获取会话的所有评分记录
  getSessionScoringRecords(sessionId) {
    return request.get(`/api/scoring/session/${sessionId}`)
  },

  // 获取评分记录详情
  getScoringRecordDetail(recordId) {
    return request.get(`/api/scoring/record/${recordId}`)
  },

  // 获取评分统计
  getScoringStatistics(params) {
    return request.get('/api/scoring/statistics', { params })
  },

  // 批量评分
  batchScoring(data) {
    return request.post('/api/scoring/batch', data)
  },

  // 获取未评分的记录
  getUnscoredRecords(sessionId) {
    return request.get(`/api/scoring/unscored/${sessionId}`)
  },

  // 完成会话评分
  completeSessionScoring(sessionId) {
    return request.post(`/api/scoring/complete/${sessionId}`)
  }
} 