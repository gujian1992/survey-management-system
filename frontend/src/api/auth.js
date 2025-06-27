import request from '@/utils/request'

/**
 * 用户登录
 */
export const login = (credentials) => {
  return request.post('/auth/login', credentials)
}

/**
 * 获取当前用户信息
 */
export const getUserInfo = () => {
  return request.get('/auth/userinfo')
}

export default {
  login,
  getUserInfo
} 