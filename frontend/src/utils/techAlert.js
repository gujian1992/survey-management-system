import { createApp, reactive } from 'vue'
import TechAlertComponent from '@/components/base/TechAlert.vue'
import ElementPlus from 'element-plus'

// 全局状态管理
const alertState = reactive({
  visible: false,
  type: 'info',
  title: '系统提示',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: false,
  closeOnClickOutside: true,
  resolve: null,
  reject: null
})

// 创建提示框实例
let alertInstance = null
let alertApp = null

const createAlertInstance = () => {
  if (alertInstance) return alertInstance

  const container = document.createElement('div')
  container.id = 'tech-alert-container'
  document.body.appendChild(container)

  alertApp = createApp({
    components: { TechAlertComponent },
    template: `
      <TechAlertComponent 
        :visible="alertState.visible"
        :type="alertState.type"
        :title="alertState.title"
        :message="alertState.message"
        :confirmText="alertState.confirmText"
        :cancelText="alertState.cancelText"
        :showCancel="alertState.showCancel"
        :closeOnClickOutside="alertState.closeOnClickOutside"
        @confirm="handleConfirm"
        @cancel="handleCancel"
        @close="handleClose"
      />
    `,
    setup() {
      const handleConfirm = () => {
        alertState.visible = false
        if (alertState.resolve) {
          alertState.resolve(true)
        }
        resetState()
      }

      const handleCancel = () => {
        alertState.visible = false
        if (alertState.reject) {
          alertState.reject(false)
        }
        resetState()
      }

      const handleClose = () => {
        alertState.visible = false
        if (alertState.reject) {
          alertState.reject(false)
        }
        resetState()
      }

      const resetState = () => {
        setTimeout(() => {
          alertState.resolve = null
          alertState.reject = null
        }, 100)
      }

      return {
        alertState,
        handleConfirm,
        handleCancel,
        handleClose
      }
    }
  })

  alertApp.use(ElementPlus)
  alertInstance = alertApp.mount(container)
  return alertInstance
}

// 基础提示方法
const showAlert = (options = {}) => {
  return new Promise((resolve, reject) => {
    // 确保实例存在
    createAlertInstance()

    // 更新状态
    Object.assign(alertState, {
      visible: true,
      type: 'info',
      title: '系统提示',
      message: '',
      confirmText: '确定',
      cancelText: '取消',
      showCancel: false,
      closeOnClickOutside: true,
      resolve,
      reject,
      ...options
    })
  })
}

// 🎯 预设的提示方法
export const TechAlert = {
  // 信息提示
  info(message, title = '信息', options = {}) {
    return showAlert({
      type: 'info',
      title,
      message,
      showCancel: false,
      ...options
    })
  },

  // 成功提示
  success(message, title = '成功', options = {}) {
    return showAlert({
      type: 'success',
      title,
      message,
      showCancel: false,
      ...options
    })
  },

  // 警告提示
  warning(message, title = '警告', options = {}) {
    return showAlert({
      type: 'warning',
      title,
      message,
      showCancel: false,
      ...options
    })
  },

  // 错误提示
  error(message, title = '错误', options = {}) {
    return showAlert({
      type: 'error',
      title,
      message,
      showCancel: false,
      ...options
    })
  },

  // 确认对话框
  confirm(message, title = '确认操作', options = {}) {
    return showAlert({
      type: 'confirm',
      title,
      message,
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消',
      ...options
    })
  },

  // 自定义提示
  custom(options) {
    return showAlert(options)
  },

  // 快速确认（适用于题型选择场景）
  quickConfirm(message, confirmText = '确定', cancelText = '取消') {
    return showAlert({
      type: 'confirm',
      title: '请确认',
      message,
      showCancel: true,
      confirmText,
      cancelText,
      closeOnClickOutside: false
    })
  }
}

// 🎨 主题预设
export const AlertThemes = {
  // 科技蓝
  tech: {
    type: 'info',
    confirmText: 'CONFIRM',
    cancelText: 'CANCEL'
  },
  
  // 成功绿
  success: {
    type: 'success',
    confirmText: 'GOT IT',
    cancelText: 'DISMISS'
  },
  
  // 警告橙
  warning: {
    type: 'warning',
    confirmText: 'UNDERSTOOD',
    cancelText: 'IGNORE'
  },
  
  // 危险红
  danger: {
    type: 'error',
    confirmText: 'DELETE',
    cancelText: 'KEEP'
  }
}

// 全局安装方法
export const installTechAlert = (app) => {
  app.config.globalProperties.$techAlert = TechAlert
  app.provide('techAlert', TechAlert)
}

export default TechAlert 