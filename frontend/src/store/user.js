import { defineStore } from 'pinia'
import { login, getUserInfo } from '@/api/auth'

export const useUserStore = defineStore('user', {
  state: () => ({
    token: localStorage.getItem('token') || '',
    userInfo: null,
    role: null
  }),

  getters: {
    // 是否为管理员
    isAdmin: (state) => state.role === 'ADMIN',
    // 是否已登录
    isLoggedIn: (state) => !!state.token,
    // 用户名
    username: (state) => state.userInfo?.username || '',
    // 真实姓名
    realName: (state) => state.userInfo?.realName || ''
  },

  actions: {
    /**
     * 用户登录
     */
    async login(credentials) {
      try {
        const response = await login(credentials)
        // 后端现在返回Result格式，需要从data中获取实际数据
        const loginData = response.data
        this.token = loginData.token
        this.userInfo = loginData.userInfo
        this.role = loginData.userInfo.role
        localStorage.setItem('token', this.token)
        return loginData
      } catch (error) {
        throw error
      }
    },

    /**
     * 用户登出
     */
    async logout() {
      this.token = ''
      this.userInfo = null
      this.role = null
      localStorage.removeItem('token')
    },

    /**
     * 获取用户信息
     */
    async fetchUserInfo() {
      try {
        if (this.token) {
          const response = await getUserInfo()
          // 后端现在返回Result格式，需要从data中获取实际数据
          const userInfo = response.data
          this.userInfo = userInfo
          this.role = userInfo.role
          return userInfo
        }
      } catch (error) {
        // 如果获取用户信息失败，清除token
        this.logout()
        throw error
      }
    },

    /**
     * 初始化用户状态（页面刷新时调用）
     */
    async initUserState() {
      if (this.token && !this.userInfo) {
        try {
          await this.fetchUserInfo()
        } catch (error) {
          console.error('初始化用户状态失败:', error)
        }
      }
    }
  }
}) 