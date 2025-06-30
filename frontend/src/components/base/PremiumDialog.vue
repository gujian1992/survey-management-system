<template>
  <teleport to="body">
    <transition name="premium-dialog" appear>
      <div v-if="visible" class="premium-dialog-overlay" @click="handleOverlayClick">
        <div class="premium-dialog-container" @click.stop>
          <!-- 装饰性背景渐变 -->
          <div class="dialog-bg-glow"></div>
          
          <!-- 主体内容 -->
          <div class="dialog-content">
            <!-- 头部图标区域 -->
            <div class="dialog-icon-wrapper">
              <div class="dialog-icon" :class="`dialog-icon--${type}`">
                <component :is="iconComponent" />
              </div>
              <div class="icon-ripple"></div>
            </div>
            
            <!-- 标题区域 -->
            <h2 class="dialog-title">{{ title }}</h2>
            
            <!-- 内容区域 -->
            <div class="dialog-message">
              <p v-html="formatMessage(message)"></p>
            </div>
            
            <!-- 操作按钮区域 -->
            <div class="dialog-actions">
              <button 
                v-if="showCancel"
                @click="handleCancel"
                class="premium-btn premium-btn--secondary"
                :disabled="loading"
              >
                <span class="btn-content">
                  <component v-if="cancelIcon" :is="cancelIcon" />
                  {{ cancelText }}
                </span>
                <div class="btn-ripple"></div>
              </button>
              
              <button 
                @click="handleConfirm"
                class="premium-btn premium-btn--primary"
                :class="{ 
                  'premium-btn--loading': loading,
                  'premium-btn--danger': type === 'error' || type === 'warning'
                }"
                :disabled="loading"
              >
                <span class="btn-content">
                  <div v-if="loading" class="loading-spinner"></div>
                  <component v-else-if="confirmIcon" :is="confirmIcon" />
                  {{ loading ? loadingText : confirmText }}
                </span>
                <div class="btn-ripple"></div>
              </button>
            </div>
            
            <!-- 关闭按钮 -->
            <button 
              v-if="showClose" 
              @click="handleClose"
              class="dialog-close"
            >
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path d="M18 6L6 18M6 6l12 12" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed } from 'vue'
import { 
  InfoFilled, 
  SuccessFilled, 
  WarningFilled, 
  CircleCloseFilled,
  QuestionFilled
} from '@element-plus/icons-vue'

const props = defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info',
    validator: (value) => ['info', 'success', 'warning', 'error', 'confirm'].includes(value)
  },
  title: {
    type: String,
    default: '确认操作'
  },
  message: {
    type: String,
    default: ''
  },
  confirmText: {
    type: String,
    default: '确定'
  },
  cancelText: {
    type: String,
    default: '取消'
  },
  showCancel: {
    type: Boolean,
    default: true
  },
  showClose: {
    type: Boolean,
    default: true
  },
  closeOnClickOutside: {
    type: Boolean,
    default: true
  },
  confirmIcon: {
    type: Object,
    default: null
  },
  cancelIcon: {
    type: Object,
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: '处理中...'
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close', 'update:visible'])

// 图标映射
const iconComponent = computed(() => {
  const iconMap = {
    info: InfoFilled,
    success: SuccessFilled,
    warning: WarningFilled,
    error: CircleCloseFilled,
    confirm: QuestionFilled
  }
  return iconMap[props.type] || QuestionFilled
})

// 格式化消息文本
const formatMessage = (msg) => {
  if (!msg) return ''
  return msg.replace(/\n/g, '<br>')
}

// 事件处理
const handleConfirm = () => {
  if (!props.loading) {
    emit('confirm')
    emit('update:visible', false)
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('update:visible', false)
}

const handleClose = () => {
  emit('close')
  emit('update:visible', false)
}

const handleOverlayClick = () => {
  if (props.closeOnClickOutside && !props.loading) {
    handleClose()
  }
}
</script>

<style scoped>
/* 🎨 现代化弹出框样式 - 企业级设计 */
.premium-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0, 0, 0, 0.4) 0%, rgba(0, 0, 0, 0.7) 100%);
  backdrop-filter: blur(20px) saturate(120%);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.premium-dialog-container {
  position: relative;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(40px);
  border-radius: 24px;
  width: 100%;
  max-width: 480px;
  box-shadow: 
    0 32px 64px rgba(0, 0, 0, 0.12),
    0 0 0 1px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  overflow: hidden;
  transform-origin: center;
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* 🌟 装饰性背景光晕 */
.dialog-bg-glow {
  position: absolute;
  top: -50%;
  left: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(
    circle at 30% 20%, 
    rgba(99, 102, 241, 0.08) 0%, 
    rgba(168, 85, 247, 0.06) 35%,
    transparent 70%
  );
  animation: rotate 20s linear infinite;
  pointer-events: none;
}

/* 📱 内容区域 */
.dialog-content {
  position: relative;
  z-index: 1;
  padding: 40px 32px 32px;
  text-align: center;
}

/* 🎯 图标区域 */
.dialog-icon-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 24px;
}

.dialog-icon {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 32px;
  position: relative;
  z-index: 2;
  animation: iconPulse 2s ease-in-out infinite;
}

.dialog-icon--info {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.4);
}

.dialog-icon--success {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.4);
}

.dialog-icon--warning,
.dialog-icon--confirm {
  background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.4);
}

.dialog-icon--error {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.4);
}

.icon-ripple {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 72px;
  height: 72px;
  border-radius: 50%;
  border: 2px solid currentColor;
  opacity: 0.3;
  transform: translate(-50%, -50%);
  animation: ripple 2s ease-out infinite;
}

/* 📝 标题样式 */
.dialog-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

/* 📄 消息内容 */
.dialog-message {
  margin-bottom: 32px;
}

.dialog-message p {
  font-size: 16px;
  color: #6b7280;
  line-height: 1.6;
  margin: 0;
  max-width: 360px;
  margin-left: auto;
  margin-right: auto;
}

/* 🎮 操作按钮区域 */
.dialog-actions {
  display: flex;
  gap: 12px;
  justify-content: center;
  flex-wrap: wrap;
}

.premium-btn {
  position: relative;
  padding: 14px 28px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  min-width: 120px;
  transform: translateY(0);
}

.premium-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.premium-btn--primary {
  background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.premium-btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.4);
}

.premium-btn--primary.premium-btn--danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3);
}

.premium-btn--primary.premium-btn--danger:hover:not(:disabled) {
  background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
  box-shadow: 0 8px 24px rgba(239, 68, 68, 0.4);
}

.premium-btn--secondary {
  background: rgba(107, 114, 128, 0.1);
  color: #374151;
  border: 1px solid rgba(107, 114, 128, 0.2);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.premium-btn--secondary:hover:not(:disabled) {
  background: rgba(107, 114, 128, 0.15);
  border-color: rgba(107, 114, 128, 0.3);
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.btn-content {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  position: relative;
  z-index: 1;
}

.btn-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle, rgba(255, 255, 255, 0.3) 0%, transparent 70%);
  opacity: 0;
  transform: scale(0);
  transition: all 0.6s ease;
}

.premium-btn:active .btn-ripple {
  opacity: 1;
  transform: scale(1);
}

/* 🔄 加载动画 */
.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top: 2px solid white;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

/* ❌ 关闭按钮 */
.dialog-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  transition: all 0.3s ease;
}

.dialog-close:hover {
  background: rgba(107, 114, 128, 0.2);
  color: #374151;
  transform: scale(1.1);
}

/* 🎬 动画效果 */
.premium-dialog-enter-active {
  transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.premium-dialog-leave-active {
  transition: all 0.3s cubic-bezier(0.55, 0.055, 0.675, 0.19);
}

.premium-dialog-enter-from {
  opacity: 0;
  transform: scale(0.7) translateY(-20px);
}

.premium-dialog-leave-to {
  opacity: 0;
  transform: scale(0.9) translateY(10px);
}

@keyframes iconPulse {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
}

@keyframes ripple {
  0% {
    transform: translate(-50%, -50%) scale(1);
    opacity: 0.3;
  }
  100% {
    transform: translate(-50%, -50%) scale(2);
    opacity: 0;
  }
}

@keyframes rotate {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* 📱 响应式设计 */
@media (max-width: 480px) {
  .premium-dialog-container {
    margin: 20px;
    max-width: none;
  }
  
  .dialog-content {
    padding: 32px 24px 24px;
  }
  
  .dialog-actions {
    flex-direction: column;
  }
  
  .premium-btn {
    width: 100%;
  }
}
</style> 