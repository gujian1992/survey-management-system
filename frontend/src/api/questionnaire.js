import request from '@/utils/request'

/**
 * 问卷相关API
 */
export const questionnaireApi = {
  /**
   * 获取问卷列表
   * @param {Object} params 查询参数
   */
  getList(params) {
    return request({
      url: '/questionnaire',
      method: 'get',
      params
    })
  },

  /**
   * 获取问卷详情
   * @param {Number} id 问卷ID
   */
  getDetail(id) {
    return request({
      url: `/questionnaire/${id}`,
      method: 'get'
    })
  },

  /**
   * 创建问卷
   * @param {Object} data 问卷数据
   */
  create(data) {
    return request({
      url: '/questionnaire',
      method: 'post',
      data
    })
  },

  /**
   * 更新问卷
   * @param {Number} id 问卷ID
   * @param {Object} data 问卷数据
   */
  update(id, data) {
    return request({
      url: `/questionnaire/${id}`,
      method: 'put',
      data
    })
  },

  /**
   * 删除问卷
   * @param {Number} id 问卷ID
   */
  delete(id) {
    return request({
      url: `/questionnaire/${id}`,
      method: 'delete'
    })
  },

  /**
   * 发布问卷
   * @param {Number} id 问卷ID
   */
  publish(id) {
    return request({
      url: `/questionnaire/${id}/publish`,
      method: 'put'
    })
  },

  /**
   * 停止问卷
   * @param {Number} id 问卷ID
   */
  stop(id) {
    return request({
      url: `/questionnaire/${id}/stop`,
      method: 'put'
    })
  },

  /**
   * 获取问卷统计
   * @param {Number} id 问卷ID
   */
  getStatistics(id) {
    return request({
      url: `/questionnaire/${id}/statistics`,
      method: 'get'
    })
  },

  /**
   * 获取问卷回答
   * @param {Number} id 问卷ID
   */
  getAnswers(id) {
    return request({
      url: `/questionnaire/${id}/answers`,
      method: 'get'
    })
  },

  /**
   * 复制问卷
   * @param {Number} id 问卷ID
   */
  copy(id) {
    return request({
      url: `/questionnaire/${id}/copy`,
      method: 'post'
    })
  }
} 