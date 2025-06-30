// 会话错误处理器

// 会话相关错误码
const SESSION_ERROR_CODES = {
  SESSION_NOT_FOUND: 6201,
  SESSION_PERMISSION_DENIED: 6202,
  SESSION_ALREADY_FINISHED: 6203,
  SESSION_TIMEOUT: 6204,
  SESSION_IN_PROGRESS: 6205,
  SESSION_INSUFFICIENT_QUESTIONS: 6206,
  ANSWER_SESSION_NOT_FOUND: 6207,
  SESSION_CANNOT_RESUME: 4006
}

// 错误信息配置
const ERROR_MESSAGES = {
  [SESSION_ERROR_CODES.SESSION_NOT_FOUND]: {
    title: "会话不存在",
    message: "未找到考试会话",
    subMessage: "该考试会话可能已被删除或不存在，请重新开始考试"
  },
  [SESSION_ERROR_CODES.SESSION_PERMISSION_DENIED]: {
    title: "无权限",
    message: "您没有权限访问此考试会话",
    subMessage: "请确认是否使用了正确的账号登录"
  },
  [SESSION_ERROR_CODES.SESSION_ALREADY_FINISHED]: {
    title: "会话已结束",
    message: "考试会话已结束",
    subMessage: "该考试已完成，无法继续答题"
  },
  [SESSION_ERROR_CODES.SESSION_TIMEOUT]: {
    title: "会话超时",
    message: "考试会话已超时",
    subMessage: "由于超时且未保存，考试会话已失效，请重新开始考试"
  },
  [SESSION_ERROR_CODES.SESSION_IN_PROGRESS]: {
    title: "会话进行中",
    message: "您还有正在进行的考试",
    subMessage: "请完成当前考试，或等待会话自动结束后再开始新的考试"
  },
  [SESSION_ERROR_CODES.SESSION_INSUFFICIENT_QUESTIONS]: {
    title: "题目不足",
    message: "可用的考试题目不足",
    subMessage: "请联系管理员检查配置"
  },
  [SESSION_ERROR_CODES.ANSWER_SESSION_NOT_FOUND]: {
    title: "会话不存在",
    message: "答题会话不存在",
    subMessage: "该考试会话可能已被删除或不存在，请重新开始考试"
  },
  [SESSION_ERROR_CODES.SESSION_CANNOT_RESUME]: {
    title: "无法恢复会话",
    message: "当前会话状态无法恢复",
    subMessage: "请重新开始考试"
  }
}

/**
 * 判断是否为会话相关错误
 * @param {Error} error 错误对象
 * @returns {boolean}
 */
export const isSessionError = (error) => {
  const errorCode = error?.response?.data?.code
  return Object.values(SESSION_ERROR_CODES).includes(errorCode)
}

/**
 * 获取错误信息配置
 * @param {Error} error 错误对象
 * @returns {Object} 错误信息配置
 */
export const getErrorConfig = (error) => {
  const errorCode = error?.response?.data?.code
  return ERROR_MESSAGES[errorCode] || {
    title: "会话错误",
    message: "考试会话出现错误",
    subMessage: "请尝试重新开始考试，或联系管理员"
  }
}

export {
  SESSION_ERROR_CODES,
  ERROR_MESSAGES
}
