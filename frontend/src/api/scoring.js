import request from './index'

// 评分管理API
export const scoringApi = {
  // 创建评分记录
  createScoringRecord(data) {
    return request.post('/scoring/create', data)
  },

  // 更新评分记录
  updateScoringRecord(recordId, data) {
    return request.put(`/scoring/${recordId}`, data)
  },

  // 删除评分记录
  deleteScoringRecord(recordId) {
    return request.delete(`/scoring/${recordId}`)
  },

  // 获取评分记录分页列表
  getScoringRecordsPage(params) {
    return request.get('/scoring/records', { params })
  },

  // 获取会话的所有评分记录
  getSessionScoringRecords(sessionId) {
    return request.get(`/scoring/session/${sessionId}`)
  },

  // 获取评分记录详情
  getScoringRecordDetail(recordId) {
    return request.get(`/scoring/record/${recordId}`)
  },

  // 获取评分统计
  getScoringStatistics(params) {
    return request.get('/scoring/statistics', { params })
  },

  // 批量评分
  batchScoring(data) {
    return request.post('/scoring/batch', data)
  },

  // 获取未评分的记录
  getUnscoredRecords(sessionId) {
    return request.get(`/scoring/unscored/${sessionId}`)
  },

  // 完成会话评分
  completeSessionScoring(sessionId) {
    return request.post(`/scoring/complete/${sessionId}`)
  }
} 