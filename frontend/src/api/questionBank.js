import request from './index'

// 题库管理API
export const questionBankApi = {
  // 获取题库列表
  getQuestionList(params) {
    return request.get('/question-bank/page', { params })
  },

  // 获取题目详情
  getQuestionDetail(id) {
    return request.get(`/question-bank/${id}`)
  },

  // 创建题目
  createQuestion(data) {
    return request.post('/question-bank', data)
  },

  // 更新题目
  updateQuestion(id, data) {
    return request.put(`/question-bank/${id}`, data)
  },

  // 删除题目
  deleteQuestion(id) {
    return request.delete(`/question-bank/${id}`)
  },

  // 批量删除题目
  batchDeleteQuestions(ids) {
    return request.delete('/question-bank/batch', { data: ids })
  },

  // 启用/禁用题目
  toggleQuestionStatus(id, status) {
    return request.put(`/question-bank/${id}/status`, null, { params: { status } })
  },

  // 获取随机题目（用于测试）
  getRandomQuestions(type, count) {
    return request.get('/question-bank/random', {
      params: { type, count }
    })
  },

  // 获取题型统计
  getQuestionTypeStats() {
    return request.get('/question-bank/type-stats')
  },

  // 导入题目（批量）
  importQuestions(data) {
    return request.post('/question-bank/import', data)
  },

  // 导出题目
  exportQuestions(params) {
    return request.get('/question-bank/export', { 
      params,
      responseType: 'blob'
    })
  }
} 