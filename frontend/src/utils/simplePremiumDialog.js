import { ElMessageBox } from 'element-plus'

// 🎨 无蒙版专业弹窗系统 - 真正的质感设计
const premiumNoMaskDialogCSS = `
  /* 基础弹窗容器 - 卡片悬浮设计 */
  .el-message-box {
    border-radius: 24px !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
    background: #ffffff !important;
    box-shadow: 
      0 20px 60px rgba(0, 0, 0, 0.12),
      0 8px 30px rgba(0, 0, 0, 0.08),
      0 4px 15px rgba(0, 0, 0, 0.04),
      0 0 0 1px rgba(0, 0, 0, 0.04) !important;
    border: none !important;
    overflow: hidden !important;
    max-width: 440px !important;
    min-width: 380px !important;
    margin: 0 auto !important;
    position: relative !important;
    transform: translateZ(0) !important;
  }

  /* 标题区域 - 极简设计 */
  .el-message-box__header {
    padding: 40px 40px 24px !important;
    border-bottom: none !important;
    text-align: center !important;
  }

  .el-message-box__title {
    font-size: 22px !important;
    font-weight: 600 !important;
    color: #1a1a1a !important;
    line-height: 1.3 !important;
    letter-spacing: -0.02em !important;
    margin: 0 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
  }

  /* 内容区域 - 优雅间距 */
  .el-message-box__content {
    padding: 0 40px 32px !important;
    text-align: center !important;
  }

  .el-message-box__message {
    font-size: 16px !important;
    color: #6b7280 !important;
    line-height: 1.5 !important;
    margin: 0 !important;
    font-weight: 400 !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
  }

  /* 按钮区域 - 精致布局 */
  .el-message-box__btns {
    padding: 0 40px 40px !important;
    text-align: center !important;
    gap: 16px !important;
    display: flex !important;
    justify-content: center !important;
    flex-direction: row !important;
  }

  .el-message-box__btns .el-button {
    padding: 14px 32px !important;
    border-radius: 16px !important;
    font-size: 16px !important;
    font-weight: 500 !important;
    min-width: 120px !important;
    height: 48px !important;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1) !important;
    border: none !important;
    cursor: pointer !important;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
    position: relative !important;
    overflow: hidden !important;
  }

  /* 取消按钮 - 高级灰色设计 */
  .el-message-box__btns .el-button--default {
    background: #f8fafc !important;
    color: #64748b !important;
    border: 1px solid #e2e8f0 !important;
    order: 1 !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  }

  .el-message-box__btns .el-button--default:hover {
    background: #f1f5f9 !important;
    color: #475569 !important;
    border-color: #cbd5e1 !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  }

  .el-message-box__btns .el-button--default:active {
    background: #e2e8f0 !important;
    transform: translateY(0) !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  }

  /* 主要按钮 - 高端蓝色 */
  .el-message-box__btns .el-button--primary {
    background: linear-gradient(135deg, #3b82f6 0%, #1e40af 100%) !important;
    color: #ffffff !important;
    order: 2 !important;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3) !important;
    border: 1px solid rgba(59, 130, 246, 0.2) !important;
  }

  .el-message-box__btns .el-button--primary:hover {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%) !important;
    transform: translateY(-2px) !important;
    box-shadow: 0 8px 25px rgba(59, 130, 246, 0.4) !important;
  }

  .el-message-box__btns .el-button--primary:active {
    background: linear-gradient(135deg, #1d4ed8 0%, #1e3a8a 100%) !important;
    transform: translateY(-1px) !important;
    box-shadow: 0 4px 16px rgba(59, 130, 246, 0.3) !important;
  }

  /* 完全移除蒙版 */
  .el-overlay {
    background: transparent !important;
    backdrop-filter: none !important;
    -webkit-backdrop-filter: none !important;
  }

  /* 移除默认图标 */
  .el-message-box__status {
    display: none !important;
  }

  /* 退出登录专用样式 - 优雅的深灰色 */
  .logout-dialog .el-message-box__btns .el-button--primary {
    background: linear-gradient(135deg, #4b5563 0%, #374151 100%) !important;
    box-shadow: 0 4px 16px rgba(75, 85, 99, 0.3) !important;
    border: 1px solid rgba(75, 85, 99, 0.2) !important;
  }

  .logout-dialog .el-message-box__btns .el-button--primary:hover {
    background: linear-gradient(135deg, #374151 0%, #1f2937 100%) !important;
    box-shadow: 0 8px 25px rgba(75, 85, 99, 0.4) !important;
  }

  .logout-dialog .el-message-box__btns .el-button--primary:active {
    background: linear-gradient(135deg, #1f2937 0%, #111827 100%) !important;
  }

  /* 成功操作专用样式 - 自然绿色 */
  .success-dialog .el-message-box__btns .el-button--primary {
    background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
    box-shadow: 0 4px 16px rgba(16, 185, 129, 0.3) !important;
    border: 1px solid rgba(16, 185, 129, 0.2) !important;
  }

  .success-dialog .el-message-box__btns .el-button--primary:hover {
    background: linear-gradient(135deg, #059669 0%, #047857 100%) !important;
    box-shadow: 0 8px 25px rgba(16, 185, 129, 0.4) !important;
  }

  /* 错误操作专用样式 - 温和红色 */
  .error-dialog .el-message-box__btns .el-button--primary {
    background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%) !important;
    box-shadow: 0 4px 16px rgba(239, 68, 68, 0.3) !important;
    border: 1px solid rgba(239, 68, 68, 0.2) !important;
  }

  .error-dialog .el-message-box__btns .el-button--primary:hover {
    background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%) !important;
    box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4) !important;
  }

  /* 高级进入动画 */
  .el-message-box {
    animation: elegantSlideIn 0.4s cubic-bezier(0.23, 1, 0.32, 1) !important;
  }

  @keyframes elegantSlideIn {
    0% {
      opacity: 0;
      transform: scale(0.85) translateY(-30px);
    }
    100% {
      opacity: 1;
      transform: scale(1) translateY(0);
    }
  }

  /* 响应式设计 - 移动端优化 */
  @media (max-width: 480px) {
    .el-message-box {
      max-width: 340px !important;
      min-width: 300px !important;
      margin: 20px !important;
      border-radius: 20px !important;
    }
    
    .el-message-box__header {
      padding: 32px 32px 20px !important;
    }
    
    .el-message-box__title {
      font-size: 20px !important;
    }
    
    .el-message-box__content {
      padding: 0 32px 28px !important;
    }
    
    .el-message-box__message {
      font-size: 15px !important;
    }
    
    .el-message-box__btns {
      padding: 0 32px 32px !important;
      gap: 12px !important;
    }
    
    .el-message-box__btns .el-button {
      min-width: 100px !important;
      height: 44px !important;
      font-size: 15px !important;
      padding: 12px 24px !important;
      border-radius: 14px !important;
    }
  }

  /* 微交互增强 */
  .el-message-box__btns .el-button::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
    opacity: 0;
    transition: opacity 0.3s ease;
    pointer-events: none;
    border-radius: inherit;
  }

  .el-message-box__btns .el-button:hover::before {
    opacity: 1;
  }
`

// 样式注入函数
const injectPremiumStyle = () => {
  // 移除所有旧样式
  const oldStyles = ['apple-dialog-style', 'professional-dialog-style', 'commercial-dialog-style']
  oldStyles.forEach(id => {
    const element = document.getElementById(id)
    if (element) element.remove()
  })
  
  // 注入新样式
  const style = document.createElement('style')
  style.id = 'premium-no-mask-dialog-style'
  style.textContent = premiumNoMaskDialogCSS
  document.head.appendChild(style)
}

// 🏆 真正专业级弹窗系统
export const SimplePremiumDialog = {
  // 通用确认对话框
  async confirm(message, title = '确认操作', options = {}) {
    injectPremiumStyle()
    
    return ElMessageBox.confirm(message, title, {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      customClass: 'premium-no-mask-dialog',
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: true,
      center: true,
      ...options
    })
  },

  // 成功提示
  async success(message, title = '操作成功', options = {}) {
    injectPremiumStyle()
    
    return ElMessageBox.alert(message, title, {
      confirmButtonText: '好的',
      customClass: 'success-dialog',
      showClose: false,
      center: true,
      ...options
    })
  },

  // 错误提示
  async error(message, title = '操作失败', options = {}) {
    injectPremiumStyle()
    
    return ElMessageBox.alert(message, title, {
      confirmButtonText: '我知道了',
      customClass: 'error-dialog',
      showClose: false,
      center: true,
      ...options
    })
  },

  // 信息提示
  async info(message, title = '温馨提示', options = {}) {
    injectPremiumStyle()
    
    return ElMessageBox.alert(message, title, {
      confirmButtonText: '好的',
      customClass: 'premium-no-mask-dialog',
      showClose: false,
      center: true,
      ...options
    })
  },

  // 🎯 优雅的退出确认
  async confirmLogout(options = {}) {
    injectPremiumStyle()
    
    return ElMessageBox.confirm(
      '退出后需要重新登录才能继续使用系统',
      '确认退出登录',
      {
        confirmButtonText: '退出登录',
        cancelButtonText: '取消',
        customClass: 'logout-dialog',
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: true,
        center: true,
        ...options
      }
    )
  },

  // 开始答题确认
  async confirmStartAnswer(message, title = '开始答题', options = {}) {
    injectPremiumStyle()
    
    return ElMessageBox.confirm(message, title, {
      confirmButtonText: '开始答题',
      cancelButtonText: '稍后再说',
      customClass: 'premium-no-mask-dialog',
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: true,
      center: true,
      ...options
    })
  },

  // 危险操作确认
  async confirmDanger(message, title = '危险操作', options = {}) {
    injectPremiumStyle()
    
    return ElMessageBox.confirm(message, title, {
      confirmButtonText: '确认删除',
      cancelButtonText: '取消',
      customClass: 'error-dialog',
      showClose: false,
      closeOnClickModal: false,
      closeOnPressEscape: true,
      center: true,
      ...options
    })
  }
}

// 默认导出
export default SimplePremiumDialog 