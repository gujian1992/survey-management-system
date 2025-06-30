import { createApp, reactive } from 'vue'
import PremiumDialogComponent from '@/components/base/PremiumDialog.vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 全局状态管理
const dialogState = reactive({
  visible: false,
  type: 'info',
  title: '确认操作',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: true,
  showClose: true,
  closeOnClickOutside: true,
  confirmIcon: null,
  cancelIcon: null,
  loading: false,
  loadingText: '处理中...',
  resolve: null,
  reject: null
})

// 创建弹出框实例
let dialogInstance = null
let dialogApp = null

const createDialogInstance = () => {
  if (dialogInstance) return dialogInstance

  const container = document.createElement('div')
  container.id = 'premium-dialog-container'
  document.body.appendChild(container)

  dialogApp = createApp({
    components: { PremiumDialogComponent },
    template: `
      <PremiumDialogComponent 
        :visible="dialogState.visible"
        :type="dialogState.type"
        :title="dialogState.title"
        :message="dialogState.message"
        :confirmText="dialogState.confirmText"
        :cancelText="dialogState.cancelText"
        :showCancel="dialogState.showCancel"
        :showClose="dialogState.showClose"
        :closeOnClickOutside="dialogState.closeOnClickOutside"
        :confirmIcon="dialogState.confirmIcon"
        :cancelIcon="dialogState.cancelIcon"
        :loading="dialogState.loading"
        :loadingText="dialogState.loadingText"
        @confirm="handleConfirm"
        @cancel="handleCancel"
        @close="handleClose"
        @update:visible="updateVisible"
      />
    `,
    setup() {
      const handleConfirm = () => {
        if (dialogState.resolve) {
          dialogState.resolve(true)
        }
        resetState()
      }

      const handleCancel = () => {
        if (dialogState.reject) {
          dialogState.reject('cancel')
        }
        resetState()
      }

      const handleClose = () => {
        if (dialogState.reject) {
          dialogState.reject('close')
        }
        resetState()
      }

      const updateVisible = (visible) => {
        dialogState.visible = visible
        if (!visible && dialogState.reject) {
          dialogState.reject('close')
          resetState()
        }
      }

      const resetState = () => {
        setTimeout(() => {
          dialogState.visible = false
          dialogState.loading = false
          dialogState.resolve = null
          dialogState.reject = null
        }, 100)
      }

      return {
        dialogState,
        handleConfirm,
        handleCancel,
        handleClose,
        updateVisible
      }
    }
  })

  // 注册Element Plus和图标
  dialogApp.use(ElementPlus)
  Object.keys(ElementPlusIconsVue).forEach(key => {
    dialogApp.component(key, ElementPlusIconsVue[key])
  })

  dialogInstance = dialogApp.mount(container)
  return dialogInstance
}

// 基础弹出框方法
const showDialog = (options = {}) => {
  return new Promise((resolve, reject) => {
    // 确保实例存在
    createDialogInstance()

    // 更新状态
    Object.assign(dialogState, {
      visible: true,
      type: 'confirm',
      title: '确认操作',
      message: '',
      confirmText: '确定',
      cancelText: '取消',
      showCancel: true,
      showClose: true,
      closeOnClickOutside: true,
      confirmIcon: null,
      cancelIcon: null,
      loading: false,
      loadingText: '处理中...',
      resolve,
      reject,
      ...options
    })
  })
}

// 🎯 企业级弹出框方法
export const PremiumDialog = {
  // 信息提示
  info(message, title = '信息提示', options = {}) {
    return showDialog({
      type: 'info',
      title,
      message,
      showCancel: false,
      ...options
    })
  },

  // 成功提示
  success(message, title = '操作成功', options = {}) {
    return showDialog({
      type: 'success',
      title,
      message,
      showCancel: false,
      ...options
    })
  },

  // 警告提示
  warning(message, title = '警告', options = {}) {
    return showDialog({
      type: 'warning',
      title,
      message,
      showCancel: false,
      ...options
    })
  },

  // 错误提示
  error(message, title = '错误', options = {}) {
    return showDialog({
      type: 'error',
      title,
      message,
      showCancel: false,
      ...options
    })
  },

  // 确认对话框
  confirm(message, title = '确认操作', options = {}) {
    return showDialog({
      type: 'confirm',
      title,
      message,
      showCancel: true,
      ...options
    })
  },

  // 删除确认
  confirmDelete(message = '此操作不可恢复，确定要删除吗？', title = '⚠️ 确认删除', options = {}) {
    return showDialog({
      type: 'error',
      title,
      message,
      confirmText: '删除',
      cancelText: '取消',
      showCancel: true,
      ...options
    })
  },

  // 开始答题确认
  confirmStartAnswer(message, title = '🚀 确认开始答题', options = {}) {
    return showDialog({
      type: 'confirm',
      title,
      message,
      confirmText: '开始答题',
      cancelText: '取消',
      showCancel: true,
      ...options
    })
  }
}

// 安装插件
export const installPremiumDialog = (app) => {
  app.config.globalProperties.$premiumDialog = PremiumDialog
} 