import { createApp, reactive } from 'vue'
import ModernDialogComponent from '@/components/base/ModernDialog.vue'
import ElementPlus from 'element-plus'
import * as ElementPlusIconsVue from '@element-plus/icons-vue'

// 全局状态管理
const dialogState = reactive({
  visible: false,
  type: 'info',
  title: '提示',
  message: '',
  confirmText: '确定',
  cancelText: '取消',
  showCancel: false,
  showClose: true,
  closeOnClickOutside: true,
  confirmIcon: null,
  cancelIcon: null,
  loading: false,
  loadingText: '处理中...',
  width: '520px',
  maxWidth: '90vw',
  resolve: null,
  reject: null
})

// 创建弹出框实例
let dialogInstance = null
let dialogApp = null

const createDialogInstance = () => {
  if (dialogInstance) return dialogInstance

  const container = document.createElement('div')
  container.id = 'modern-dialog-container'
  document.body.appendChild(container)

  dialogApp = createApp({
    components: { ModernDialogComponent },
    template: `
      <ModernDialogComponent 
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
        :width="dialogState.width"
        :maxWidth="dialogState.maxWidth"
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
          dialogState.reject(false)
        }
        resetState()
      }

      const handleClose = () => {
        if (dialogState.reject) {
          dialogState.reject(false)
        }
        resetState()
      }

      const updateVisible = (visible) => {
        dialogState.visible = visible
        if (!visible) {
          handleClose()
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
  
  // 注册Element Plus图标
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
      type: 'info',
      title: '提示',
      message: '',
      confirmText: '确定',
      cancelText: '取消',
      showCancel: false,
      showClose: true,
      closeOnClickOutside: true,
      confirmIcon: null,
      cancelIcon: null,
      loading: false,
      loadingText: '处理中...',
      width: '520px',
      maxWidth: '90vw',
      resolve,
      reject,
      ...options
    })
  })
}

// 🎯 预设的弹出框方法
export const ModernDialog = {
  // 信息提示
  info(message, title = '信息', options = {}) {
    return showDialog({
      type: 'info',
      title,
      message,
      showCancel: false,
      ...options
    })
  },

  // 成功提示
  success(message, title = '成功', options = {}) {
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
      confirmText: '确定',
      cancelText: '取消',
      ...options
    })
  },

  // 删除确认框
  confirmDelete(message = '此操作不可恢复，确定要删除吗？', title = '确认删除', options = {}) {
    return showDialog({
      type: 'error',
      title,
      message,
      showCancel: true,
      confirmText: '删除',
      cancelText: '取消',
      closeOnClickOutside: false,
      ...options
    })
  },

  // 批量操作确认
  confirmBatch(count, action = '操作', title = '批量操作确认', options = {}) {
    return showDialog({
      type: 'warning',
      title,
      message: `确定要对选中的 ${count} 项执行${action}吗？`,
      showCancel: true,
      confirmText: '确定',
      cancelText: '取消',
      ...options
    })
  },

  // 数据刷新确认
  confirmRefresh(message = '确定要刷新数据吗？未保存的更改将丢失。', title = '刷新确认', options = {}) {
    return showDialog({
      type: 'info',
      title,
      message,
      showCancel: true,
      confirmText: '刷新',
      cancelText: '取消',
      ...options
    })
  },

  // 导出数据确认
  confirmExport(message = '确定要导出当前数据吗？', title = '导出确认', options = {}) {
    return showDialog({
      type: 'info',
      title,
      message,
      showCancel: true,
      confirmText: '导出',
      cancelText: '取消',
      confirmIcon: 'Download',
      ...options
    })
  },

  // 自定义弹出框
  custom(options) {
    return showDialog(options)
  },

  // 异步操作确认（带加载状态）
  async confirmAsync(message, action, title = '确认操作', options = {}) {
    try {
      const confirmed = await showDialog({
        type: 'confirm',
        title,
        message,
        showCancel: true,
        confirmText: '确定',
        cancelText: '取消',
        ...options
      })

      if (confirmed && typeof action === 'function') {
        // 更新为加载状态
        dialogState.loading = true
        dialogState.loadingText = options.loadingText || '处理中...'
        
        try {
          const result = await action()
          dialogState.visible = false
          return result
        } catch (error) {
          dialogState.loading = false
          throw error
        }
      }

      return confirmed
    } catch (error) {
      dialogState.loading = false
      throw error
    }
  }
}

// 🎨 预设主题样式
export const DialogThemes = {
  // 管理操作主题
  admin: {
    type: 'warning',
    showCancel: true,
    confirmText: '执行',
    cancelText: '取消',
    closeOnClickOutside: false
  },

  // 危险操作主题
  danger: {
    type: 'error',
    showCancel: true,
    confirmText: '删除',
    cancelText: '保留',
    closeOnClickOutside: false
  },

  // 数据操作主题
  data: {
    type: 'info',
    showCancel: true,
    confirmText: '继续',
    cancelText: '取消'
  },

  // 成功反馈主题
  success: {
    type: 'success',
    showCancel: false,
    confirmText: '知道了'
  }
}

// 全局安装方法
export const installModernDialog = (app) => {
  app.config.globalProperties.$modernDialog = ModernDialog
  app.provide('modernDialog', ModernDialog)
}

export default ModernDialog 