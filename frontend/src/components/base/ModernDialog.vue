<template>
  <teleport to="body">
    <transition name="modern-dialog" appear>
      <div v-if="visible" class="modern-dialog-overlay" @click="handleOverlayClick">
        <div class="modern-dialog-container" @click.stop>
          <!-- 装饰性背景 -->
          <div class="dialog-bg-decoration">
            <div class="floating-shapes">
              <div v-for="i in 5" :key="i" class="shape" :style="getShapeStyle(i)"></div>
            </div>
            <div class="gradient-orb"></div>
          </div>
          
          <!-- 主要内容 -->
          <div class="dialog-content">
            <!-- 头部区域 -->
            <div class="dialog-header">
              <div class="dialog-icon" :class="`dialog-icon--${type}`">
                <el-icon :size="32">
                  <component :is="iconComponent" />
                </el-icon>
              </div>
              <h2 class="dialog-title">{{ title }}</h2>
              <button 
                v-if="showClose" 
                @click="handleClose"
                class="dialog-close"
              >
                <el-icon><Close /></el-icon>
              </button>
            </div>
            
            <!-- 内容区域 -->
            <div class="dialog-body">
              <div class="dialog-message">
                <div v-if="typeof message === 'string'" v-html="formatMessage(message)"></div>
                <component v-else :is="message" />
              </div>
              
              <!-- 自定义插槽内容 -->
              <div v-if="$slots.default" class="dialog-slot">
                <slot></slot>
              </div>
            </div>
            
            <!-- 底部操作区 -->
            <div class="dialog-footer">
              <button 
                v-if="showCancel"
                @click="handleCancel"
                class="modern-btn modern-btn--secondary"
              >
                <span class="btn-content">
                  <el-icon v-if="cancelIcon">
                    <component v-if="typeof cancelIcon === 'object'" :is="cancelIcon" />
                    <component v-else :is="cancelIcon" />
                  </el-icon>
                  {{ cancelText }}
                </span>
                <div class="btn-ripple"></div>
              </button>
              
              <button 
                @click="handleConfirm"
                class="modern-btn modern-btn--primary"
                :class="{ 
                  'modern-btn--danger': type === 'error' || type === 'warning',
                  'modern-btn--loading': loading
                }"
                :disabled="loading"
              >
                <span class="btn-content">
                  <el-icon v-if="loading"><Loading /></el-icon>
                  <el-icon v-else-if="confirmIcon">
                    <component v-if="typeof confirmIcon === 'object'" :is="confirmIcon" />
                    <component v-else :is="confirmIcon" />
                  </el-icon>
                  {{ loading ? loadingText : confirmText }}
                </span>
                <div class="btn-ripple"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { 
  InfoFilled, 
  SuccessFilled, 
  WarningFilled, 
  CircleCloseFilled,
  QuestionFilled,
  Close,
  Loading,
  Check,
  ArrowRight
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
    default: '提示'
  },
  message: {
    type: [String, Object],
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
    default: false
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
    type: [String, Object],
    default: null
  },
  cancelIcon: {
    type: [String, Object],
    default: null
  },
  loading: {
    type: Boolean,
    default: false
  },
  loadingText: {
    type: String,
    default: '处理中...'
  },
  width: {
    type: String,
    default: '520px'
  },
  maxWidth: {
    type: String,
    default: '90vw'
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
  return iconMap[props.type] || InfoFilled
})

// 随机形状样式
const getShapeStyle = (index) => {
  const positions = [
    { top: '20%', left: '15%', size: '8px' },
    { top: '60%', left: '85%', size: '6px' },
    { top: '30%', left: '75%', size: '10px' },
    { top: '80%', left: '25%', size: '7px' },
    { top: '45%', left: '10%', size: '9px' }
  ]
  
  const pos = positions[index - 1] || positions[0]
  return {
    top: pos.top,
    left: pos.left,
    width: pos.size,
    height: pos.size,
    animationDelay: `${index * 0.5}s`
  }
}

// 格式化消息文本
const formatMessage = (msg) => {
  if (!msg) return ''
  // 将换行符转换为<br>标签
  return msg.replace(/\n/g, '<br>')
}

// 事件处理
const handleConfirm = () => {
  emit('confirm')
  if (!props.loading) {
    emit('close')
    emit('update:visible', false)
  }
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
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

// 键盘事件处理
const handleKeydown = (event) => {
  if (event.key === 'Escape' && !props.loading) {
    handleClose()
  }
  if (event.key === 'Enter' && !props.loading) {
    handleConfirm()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
  document.body.style.overflow = 'hidden'
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
  document.body.style.overflow = ''
})
</script>

<style scoped>
/* 🎨 现代化弹出框样式 */
.modern-dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.75);
  backdrop-filter: blur(12px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.modern-dialog-container {
  position: relative;
  background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
  border-radius: 24px;
  width: v-bind(width);
  max-width: v-bind(maxWidth);
  box-shadow: 
    0 25px 50px rgba(0, 0, 0, 0.15),
    0 0 0 1px rgba(255, 255, 255, 0.8),
    inset 0 1px 0 rgba(255, 255, 255, 0.9);
  overflow: hidden;
  transform-origin: center;
}

/* 🌟 装饰性背景 */
.dialog-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.floating-shapes {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.shape {
  position: absolute;
  background: linear-gradient(45deg, rgba(99, 102, 241, 0.1), rgba(168, 85, 247, 0.1));
  border-radius: 50%;
  animation: float 6s ease-in-out infinite;
}

.gradient-orb {
  position: absolute;
  top: -50%;
  right: -50%;
  width: 200%;
  height: 200%;
  background: radial-gradient(circle at 30% 30%, rgba(99, 102, 241, 0.05) 0%, transparent 50%);
  animation: rotate 20s linear infinite;
}

/* 📱 内容区域 */
.dialog-content {
  position: relative;
  z-index: 1;
  padding: 0;
}

.dialog-header {
  padding: 32px 32px 24px;
  text-align: center;
  position: relative;
  border-bottom: 1px solid rgba(0, 0, 0, 0.06);
}

.dialog-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.dialog-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: inherit;
  filter: blur(20px);
  opacity: 0.3;
  transform: scale(1.2);
}

.dialog-icon--info {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.3);
}

.dialog-icon--success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
  box-shadow: 0 8px 32px rgba(16, 185, 129, 0.3);
}

.dialog-icon--warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 8px 32px rgba(245, 158, 11, 0.3);
}

.dialog-icon--error,
.dialog-icon--confirm {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
  box-shadow: 0 8px 32px rgba(239, 68, 68, 0.3);
}

.dialog-title {
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  line-height: 1.3;
  letter-spacing: -0.025em;
}

.dialog-close {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 32px;
  height: 32px;
  border: none;
  background: rgba(107, 114, 128, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.2s ease;
}

.dialog-close:hover {
  background: rgba(239, 68, 68, 0.1);
  color: #ef4444;
  transform: scale(1.1);
}

.dialog-body {
  padding: 0 32px 32px;
}

.dialog-message {
  font-size: 16px;
  line-height: 1.6;
  color: #4b5563;
  text-align: center;
  margin-bottom: 24px;
}

.dialog-slot {
  margin-top: 20px;
}

.dialog-footer {
  padding: 24px 32px 32px;
  display: flex;
  gap: 16px;
  justify-content: center;
}

/* 🔘 现代化按钮 */
.modern-btn {
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
  outline: none;
  display: flex;
  align-items: center;
  justify-content: center;
}

.modern-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-content {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.3s ease;
}

.btn-ripple {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: inherit;
  transition: all 0.3s ease;
}

.modern-btn--primary {
  background: linear-gradient(135deg, #3b82f6, #1d4ed8);
  color: white;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
}

.modern-btn--primary:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(59, 130, 246, 0.35);
}

.modern-btn--primary .btn-ripple {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0.05));
}

.modern-btn--danger {
  background: linear-gradient(135deg, #ef4444, #dc2626) !important;
  box-shadow: 0 4px 16px rgba(239, 68, 68, 0.25) !important;
}

.modern-btn--danger:hover:not(:disabled) {
  box-shadow: 0 8px 25px rgba(239, 68, 68, 0.35) !important;
}

.modern-btn--secondary {
  background: #f8fafc;
  color: #4b5563;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.modern-btn--secondary:hover:not(:disabled) {
  background: #f1f5f9;
  border-color: #d1d5db;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.modern-btn--loading {
  pointer-events: none;
}

/* 🎬 动画效果 */
@keyframes float {
  0%, 100% { 
    transform: translateY(0) rotate(0deg); 
    opacity: 0.3;
  }
  50% { 
    transform: translateY(-10px) rotate(180deg); 
    opacity: 0.6;
  }
}

@keyframes rotate {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.modern-dialog-enter-active,
.modern-dialog-leave-active {
  transition: all 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.modern-dialog-enter-from,
.modern-dialog-leave-to {
  opacity: 0;
}

.modern-dialog-enter-from .modern-dialog-container,
.modern-dialog-leave-to .modern-dialog-container {
  transform: scale(0.7) translateY(50px);
  opacity: 0;
}

/* 📱 响应式设计 */
@media (max-width: 768px) {
  .modern-dialog-container {
    width: 95vw;
    max-width: 95vw;
    margin: 20px;
  }
  
  .dialog-header,
  .dialog-body,
  .dialog-footer {
    padding-left: 20px;
    padding-right: 20px;
  }
  
  .dialog-footer {
    flex-direction: column;
  }
  
  .modern-btn {
    width: 100%;
    justify-content: center;
  }
  
  .dialog-icon {
    width: 64px;
    height: 64px;
  }
  
  .dialog-title {
    font-size: 20px;
  }
}
</style> 