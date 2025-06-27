import request from './index'

// 答题会话API
export const answerSessionApi = {
  // 开始答题会话
  startAnswerSession(data) {
    return request.post('/api/answer-session/start', data)
  },

  // 获取会话详情
  getSessionDetail(sessionCode) {
    return request.get(`/api/answer-session/${sessionCode}`)
  },

  // 获取我的答题会话列表
  getMySessionList(params) {
    return request.get('/api/answer-session/my-sessions', { params })
  },

  // 获取所有会话列表（管理员）
  getAllSessionList(params) {
    return request.get('/api/answer-session/all-sessions', { params })
  },

  // 结束答题会话
  finishSession(sessionCode) {
    return request.post(`/api/answer-session/${sessionCode}/finish`)
  },

  // 放弃答题会话
  abandonSession(sessionCode) {
    return request.post(`/api/answer-session/${sessionCode}/abandon`)
  },

  // 检查会话超时
  checkSessionTimeout(sessionCode) {
    return request.get(`/api/answer-session/${sessionCode}/timeout-check`)
  },

  // 更新会话进度
  updateSessionProgress(sessionId) {
    return request.post(`/api/answer-session/${sessionId}/update-progress`)
  },

  // 获取会话统计
  getSessionStats(sessionId) {
    return request.get(`/api/answer-session/${sessionId}/stats`)
  },

  // 获取会话答题记录
  getSessionAnswers(sessionId) {
    return request.get(`/api/answer-session/${sessionId}/answers`)
  },

  // 续期会话（延长超时时间）
  extendSession(sessionCode, minutes) {
    return request.post(`/api/answer-session/${sessionCode}/extend`, { minutes })
  }
} 