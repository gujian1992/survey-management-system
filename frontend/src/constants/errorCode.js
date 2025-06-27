/**
 * 错误码常量
 */
export const ErrorCode = {
  // 成功
  SUCCESS: 200,

  // 客户端错误 (400-499)
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  METHOD_NOT_ALLOWED: 405,
  PARAMETER_INVALID: 4001,
  TOKEN_EXPIRED: 4002,
  TOKEN_INVALID: 4003,
  USER_NOT_FOUND: 4004,
  PASSWORD_INCORRECT: 4005,
  DUPLICATE_USERNAME: 4006,

  // 服务端错误 (500-599)
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
  DATABASE_ERROR: 5001,
  CACHE_ERROR: 5002,
  FILE_UPLOAD_ERROR: 5003,

  // 业务错误 (600-699)
  QUESTIONNAIRE_NOT_FOUND: 6001,
  QUESTIONNAIRE_EXPIRED: 6002,
  QUESTIONNAIRE_NOT_PUBLISHED: 6003,
  QUESTIONNAIRE_ALREADY_SUBMITTED: 6004,
  QUESTION_REQUIRED: 6005,
  INVALID_ANSWER_FORMAT: 6006,

  // 第三方服务错误 (700-799)
  THIRD_PARTY_SERVICE_ERROR: 700,
  API_GATEWAY_ERROR: 701,
  RPC_SERVICE_ERROR: 702
}

/**
 * 错误码消息映射
 */
export const ErrorMessage = {
  [ErrorCode.SUCCESS]: '操作成功',
  [ErrorCode.BAD_REQUEST]: '请求参数错误',
  [ErrorCode.UNAUTHORIZED]: '未经授权',
  [ErrorCode.FORBIDDEN]: '访问被禁止',
  [ErrorCode.NOT_FOUND]: '资源不存在',
  [ErrorCode.METHOD_NOT_ALLOWED]: '请求方法不允许',
  [ErrorCode.PARAMETER_INVALID]: '参数验证失败',
  [ErrorCode.TOKEN_EXPIRED]: '令牌已过期',
  [ErrorCode.TOKEN_INVALID]: '令牌无效',
  [ErrorCode.USER_NOT_FOUND]: '用户不存在',
  [ErrorCode.PASSWORD_INCORRECT]: '密码错误',
  [ErrorCode.DUPLICATE_USERNAME]: '用户名已存在',
  [ErrorCode.INTERNAL_SERVER_ERROR]: '服务器内部错误',
  [ErrorCode.SERVICE_UNAVAILABLE]: '服务不可用',
  [ErrorCode.DATABASE_ERROR]: '数据库操作失败',
  [ErrorCode.CACHE_ERROR]: '缓存操作失败',
  [ErrorCode.FILE_UPLOAD_ERROR]: '文件上传失败',
  [ErrorCode.QUESTIONNAIRE_NOT_FOUND]: '问卷不存在',
  [ErrorCode.QUESTIONNAIRE_EXPIRED]: '问卷已过期',
  [ErrorCode.QUESTIONNAIRE_NOT_PUBLISHED]: '问卷未发布',
  [ErrorCode.QUESTIONNAIRE_ALREADY_SUBMITTED]: '问卷已提交',
  [ErrorCode.QUESTION_REQUIRED]: '必填题目未答',
  [ErrorCode.INVALID_ANSWER_FORMAT]: '答案格式错误',
  [ErrorCode.THIRD_PARTY_SERVICE_ERROR]: '第三方服务调用失败',
  [ErrorCode.API_GATEWAY_ERROR]: '网关服务异常',
  [ErrorCode.RPC_SERVICE_ERROR]: 'RPC服务调用失败'
}

/**
 * 获取错误消息
 * @param {number} code 错误码
 * @param {string} defaultMessage 默认消息
 * @returns {string} 错误消息
 */
export const getErrorMessage = (code, defaultMessage) => {
  return ErrorMessage[code] || defaultMessage || '未知错误'
} 