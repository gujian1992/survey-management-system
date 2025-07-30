import request from '@/utils/request'

/**
 * 答题记录相关接口
 */
export const answerRecordApi = {
  /**
   * 获取会话详情
   * @param {string} sessionCode 会话编码
   * @returns {Promise} 会话详情
   */
  getSessionDetail(sessionCode) {
    return request({
      url: `/answer-session/detail/${sessionCode}`,
      method: 'get'
    })
  },

  /**
   * 获取答题记录详情
   * @param {string} sessionCode 会话编码
   * @returns {Promise} 答题记录详情
   */
  getRecordDetail(sessionCode) {
    return request({
      url: `/answer-session/${sessionCode}/answers`,
      method: 'get'
    })
  },

  /**
   * 获取答题记录评语
   * @param {string} recordId 记录ID
   * @returns {Promise} 评语信息
   */
  getRecordFeedback(recordId) {
    return request({
      url: `/answer-record/${recordId}/feedback`,
      method: 'get'
    })
  },

  // 获取答题记录统计数据
  getStatistics() {
    return request.get('/answer-record/statistics')
  },

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

  // 获取需要评分的记录（管理员）
  getNeedScoringRecords(params) {
    return request.get('/answer-record/need-scoring', { params })
  },

  // 批量自动评分（管理员）
  batchAutoScore(sessionId) {
    return request.post(`/answer-record/batch-auto-score/${sessionId}`)
  },

  /**
   * 获取会话答题统计
   * @param {number} sessionId 会话ID（数字类型，不是会话编码）
   * @returns {Promise} 统计信息
   */
  getSessionAnswerStats(sessionId) {
    if (!sessionId || isNaN(sessionId)) {
      console.error('无效的会话ID:', sessionId)
      return Promise.reject(new Error('无效的会话ID'))
    }
    return request.get(`/answer-record/session/${sessionId}/stats`)
  },

  // 保存答案草稿
  saveDraft(data) {
    return request.post('/answer-record/draft', data)
  },

  // 获取评分管理界面用的评分记录（管理员）
  getRecordsForScoring(params) {
    return request.get('/answer-record/for-scoring', { params })
  }
} 