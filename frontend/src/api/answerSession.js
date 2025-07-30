import request from '@/utils/request'

// 基础路径
const BASE_URL = '/answer-session'

/**
 * 答题会话相关接口
 */
export const answerSessionApi = {
  /**
   * 开始答题会话
   * @param {Object} data 开始答题参数
   * @returns {Promise}
   */
  startAnswerSession(data) {
    return request({
      url: `${BASE_URL}/start`,
      method: 'post',
      data
    })
  },

  /**
   * 获取会话状态
   * @param {string} sessionCode 会话代码
   * @returns {Promise}
   */
  getSessionStatus(sessionCode) {
    return request({
      url: `${BASE_URL}/${sessionCode}/status`,
      method: 'get'
    })
  },

  /**
   * 检查系统连接状态
   * @returns {Promise}
   */
  checkConnection() {
    return request({
      url: `${BASE_URL}/check-connection`,
      method: 'get'
    })
  },

  /**
   * 获取当前活动会话
   * @returns {Promise}
   */
  getCurrentSession() {
    return request({
      url: `${BASE_URL}/current`,
      method: 'get'
    })
  },

  /**
   * 保存当前状态
   * @param {Object} data 当前状态数据
   * @returns {Promise}
   */
  saveCurrentState(data) {
    return request({
      url: `${BASE_URL}/save-state`,
      method: 'post',
      data
    })
  },

  // 移除心跳检测，简化状态管理
  // /**
  //  * 心跳检测
  //  * @param {string} sessionCode 会话代码
  //  * @returns {Promise}
  //  */
  // heartbeat(sessionCode) {
  //   return request({
  //     url: `${BASE_URL}/heartbeat`,
  //     method: 'post',
  //     data: { sessionCode }
  //   })
  // },

  /**
   * 检查连接状态
   * @returns {Promise}
   */
  checkConnection() {
    return request({
      url: `${BASE_URL}/check-connection`,
      method: 'get'
    })
  },

  /**
   * 放弃答题会话
   * @param {string} sessionCode 会话代码
   * @returns {Promise}
   */
  abandonSession(sessionCode) {
    return request({
      url: `${BASE_URL}/${sessionCode}/abandon`,
      method: 'post'
    })
  },

  /**
   * 恢复答题会话
   * @param {string} sessionCode 会话代码
   * @returns {Promise}
   */
  resumeSession(sessionCode) {
    return request({
      url: `${BASE_URL}/resume`,
      method: 'post',
      data: { sessionCode }
    })
  },

  /**
   * 获取会话详情
   * @param {string} sessionCode 会话代码
   * @returns {Promise}
   */
  getSessionDetail(sessionCode) {
    return request({
      url: `${BASE_URL}/${sessionCode}/status`,
      method: 'get'
    })
  },

  /**
   * 更新会话状态
   * @param {string} sessionCode 会话代码
   * @param {number} status 状态码
   * @returns {Promise}
   */
  updateSessionStatus(sessionCode, status) {
    return request({
      url: `${BASE_URL}/status`,
      method: 'put',
      data: { sessionCode, status }
    })
  },

  // 获取我的答题会话列表
  getMySessionList(params) {
    return request.get(`${BASE_URL}/my-sessions`, { params })
  },

  // 获取所有会话列表（管理员）
  getAllSessionList(params) {
    return request.get(`${BASE_URL}/admin/sessions`, { params })
  },

  // 结束答题会话
  finishSession(sessionCode) {
    return request.post(`${BASE_URL}/${sessionCode}/finish`)
  },

  // 检查会话超时
  checkSessionTimeout(sessionCode) {
    return request.get(`${BASE_URL}/${sessionCode}/timeout-check`)
  },

  // 移除复杂的状态管理接口
  // // 更新会话进度 - 改为前端计算
  // updateSessionProgress(sessionId) {
  //   return request.post(`${BASE_URL}/${sessionId}/update-progress`)
  // },

  // 获取会话统计
  getSessionStats(sessionId) {
    return request.get(`${BASE_URL}/${sessionId}/stats`)
  },

  // 获取会话答题记录
  getSessionAnswers(sessionCode) {
    return request.get(`${BASE_URL}/${sessionCode}/answers`)
  },

  // 续期会话（延长超时时间）
  extendSession(sessionCode, minutes) {
    return request.post(`${BASE_URL}/${sessionCode}/extend`, { minutes })
  },

  // 强制完成会话（管理员）
  forceCompleteSession(sessionCode) {
    return request.post(`${BASE_URL}/${sessionCode}/force-complete`)
  },

  // 获取我的答题统计
  getMyStats() {
    return request.get(`${BASE_URL}/my-stats`)
  },

  // 发送心跳保活
  sendHeartbeat(sessionId, data) {
    return request.post(`${BASE_URL}/${sessionId}/heartbeat`, data)
  },

  // 标记会话异常退出
  markAbnormalExit(sessionId, data) {
    return request.post(`${BASE_URL}/${sessionId}/mark-abnormal-exit`, data)
  },

  /**
   * 获取当前题目
   * @param {string} sessionCode 会话代码
   * @returns {Promise}
   */
  getCurrentQuestion(sessionCode) {
    return request({
      url: `${BASE_URL}/questions/${sessionCode}`,
      method: 'get'
    })
  },

  /**
   * 保存答案
   * @param {string} sessionCode 会话代码
   * @param {object} data 答案数据
   * @returns {Promise}
   */
  saveAnswer(sessionCode, data) {
    return request({
      url: `${BASE_URL}/answer/${sessionCode}`,
      method: 'post',
      data
    })
  },

  /**
   * 提交答案
   * @param {Object} data 答案数据
   * @returns {Promise}
   */
  submitAnswer(data) {
    return request({
      url: '/answer-record/submit',
      method: 'post',
      data
    })
  },

  /**
   * 获取下一题
   * @param {string} sessionCode 会话代码
   * @returns {Promise}
   */
  getNextQuestion(sessionCode) {
    return request({
      url: `/answer-record/next-question/${sessionCode}`,
      method: 'get'
    })
  },

  /**
   * 获取指定题目
   * @param {string} sessionCode 会话代码
   * @param {number} index 题目索引
   * @returns {Promise}
   */
  getQuestion(sessionCode, index) {
    return request({
      url: `${BASE_URL}/${sessionCode}/question/${index}`,
      method: 'get'
    })
  }
}

export function getSession(sessionCode) {
  return request({
    url: `/answer-session/get/${sessionCode}`,
    method: 'get'
  })
}

export function getCurrentQuestion(sessionCode) {
  // ...
} 