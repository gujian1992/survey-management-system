import request from '@/utils/request'

/**
 * 问卷记录相关API
 */
export const recordsApi = {
  /**
   * 获取问卷记录列表
   * @param {Object} params 查询参数
   */
  getRecords(params) {
    return request({
      url: '/records',
      method: 'get',
      params
    })
  },

  /**
   * 获取记录详情
   * @param {Number} id 记录ID
   */
  getRecordDetail(id) {
    return request({
      url: `/records/${id}`,
      method: 'get'
    })
  },

  /**
   * 更新记录状态
   * @param {Number} id 记录ID
   * @param {String} status 新状态
   */
  updateRecordStatus(id, status) {
    return request({
      url: `/records/${id}/status`,
      method: 'put',
      data: { status }
    })
  },

  /**
   * 提交评分
   * @param {Number} id 记录ID
   * @param {Object} scoreData 评分数据
   */
  submitScore(id, scoreData) {
    return request({
      url: `/records/${id}/score`,
      method: 'post',
      data: scoreData
    })
  },

  /**
   * 修改评分
   * @param {Number} id 记录ID
   * @param {Object} scoreData 评分数据
   */
  updateScore(id, scoreData) {
    return request({
      url: `/records/${id}/score`,
      method: 'put',
      data: scoreData
    })
  },

  /**
   * 获取评分历史
   * @param {Number} id 记录ID
   */
  getScoreHistory(id) {
    return request({
      url: `/records/${id}/scores`,
      method: 'get'
    })
  },

  /**
   * 批量操作
   * @param {Object} data 批量操作数据
   */
  batchOperation(data) {
    return request({
      url: '/records/batch',
      method: 'post',
      data
    })
  },

  /**
   * 获取统计数据
   * @param {Number} questionnaireId 问卷ID（可选）
   */
  getStatistics(questionnaireId) {
    return request({
      url: '/records/statistics',
      method: 'get',
      params: questionnaireId ? { questionnaireId } : {}
    })
  },

  /**
   * 导出记录
   * @param {Object} params 导出参数
   */
  exportRecords(params) {
    return request({
      url: '/records/export',
      method: 'get',
      params,
      responseType: 'blob'
    })
  }
} 