<template>
  <teleport to="body">
    <transition name="tech-alert" appear>
      <div v-if="visible" class="tech-alert-overlay" @click="handleOverlayClick">
        <div class="tech-alert-container" @click.stop>
          <!-- 科技感背景装饰 -->
          <div class="tech-bg-decoration">
            <div class="tech-grid"></div>
            <div class="tech-particles">
              <span v-for="i in 6" :key="i" class="particle"></span>
            </div>
          </div>
          
          <!-- 内容区域 -->
          <div class="tech-alert-content">
            <!-- 图标区域 -->
            <div class="tech-alert-icon" :class="`tech-alert-icon--${type}`">
              <el-icon :size="24">
                <component :is="iconComponent" />
              </el-icon>
            </div>
            
            <!-- 标题 -->
            <h3 class="tech-alert-title">{{ title }}</h3>
            
            <!-- 消息内容 -->
            <div class="tech-alert-message">
              <p>{{ message }}</p>
            </div>
            
            <!-- 操作按钮 -->
            <div class="tech-alert-actions">
              <button 
                v-if="showCancel"
                @click="handleCancel"
                class="tech-btn tech-btn--secondary"
              >
                <span class="tech-btn-text">{{ cancelText }}</span>
                <div class="tech-btn-bg"></div>
              </button>
              
              <button 
                @click="handleConfirm"
                class="tech-btn tech-btn--primary"
                :class="{ 'tech-btn--danger': type === 'error' }"
              >
                <span class="tech-btn-text">{{ confirmText }}</span>
                <div class="tech-btn-bg"></div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </teleport>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
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
    default: '系统提示'
  },
  message: {
    type: String,
    required: true
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
  closeOnClickOutside: {
    type: Boolean,
    default: true
  }
})

const emit = defineEmits(['confirm', 'cancel', 'close'])

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

// 事件处理
const handleConfirm = () => {
  emit('confirm')
  emit('close')
}

const handleCancel = () => {
  emit('cancel')
  emit('close')
}

const handleOverlayClick = () => {
  if (props.closeOnClickOutside) {
    emit('close')
  }
}

// 键盘事件处理
const handleKeydown = (event) => {
  if (event.key === 'Escape') {
    emit('close')
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleKeydown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
/* 🌌 科技感提示框样式 */
.tech-alert-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  padding: 20px;
}

.tech-alert-container {
  position: relative;
  background: linear-gradient(135deg, #1a1d29 0%, #2d3748 100%);
  border: 1px solid rgba(102, 126, 234, 0.3);
  border-radius: 16px;
  padding: 32px;
  max-width: 480px;
  min-width: 360px;
  box-shadow: 
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 0 1px rgba(255, 255, 255, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  overflow: hidden;
}

/* 🎨 科技感背景装饰 */
.tech-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;
  overflow: hidden;
}

.tech-grid {
  position: absolute;
  top: -50%;
  left: -50%;
  right: -50%;
  bottom: -50%;
  background: 
    linear-gradient(rgba(102, 126, 234, 0.1) 1px, transparent 1px),
    linear-gradient(90deg, rgba(102, 126, 234, 0.1) 1px, transparent 1px);
  background-size: 20px 20px;
  animation: grid-move 20s linear infinite;
}

.tech-particles {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.particle {
  position: absolute;
  width: 2px;
  height: 2px;
  background: #667eea;
  border-radius: 50%;
  opacity: 0;
  animation: particle-float 3s infinite ease-in-out;
}

.particle:nth-child(1) { top: 20%; left: 20%; animation-delay: 0s; }
.particle:nth-child(2) { top: 80%; left: 30%; animation-delay: 0.5s; }
.particle:nth-child(3) { top: 60%; left: 70%; animation-delay: 1s; }
.particle:nth-child(4) { top: 30%; left: 80%; animation-delay: 1.5s; }
.particle:nth-child(5) { top: 70%; left: 15%; animation-delay: 2s; }
.particle:nth-child(6) { top: 40%; left: 60%; animation-delay: 2.5s; }

/* 📱 内容区域 */
.tech-alert-content {
  position: relative;
  z-index: 1;
  text-align: center;
  color: #fff;
}

.tech-alert-icon {
  width: 64px;
  height: 64px;
  margin: 0 auto 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
}

.tech-alert-icon::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  padding: 2px;
  background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.3));
  mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
  mask-composite: exclude;
}

.tech-alert-icon--info {
  background: linear-gradient(135deg, #4299e1, #667eea);
  box-shadow: 0 0 30px rgba(102, 126, 234, 0.4);
}

.tech-alert-icon--success {
  background: linear-gradient(135deg, #48bb78, #38a169);
  box-shadow: 0 0 30px rgba(72, 187, 120, 0.4);
}

.tech-alert-icon--warning {
  background: linear-gradient(135deg, #ed8936, #dd6b20);
  box-shadow: 0 0 30px rgba(237, 137, 54, 0.4);
}

.tech-alert-icon--error,
.tech-alert-icon--confirm {
  background: linear-gradient(135deg, #f56565, #e53e3e);
  box-shadow: 0 0 30px rgba(245, 101, 101, 0.4);
}

.tech-alert-title {
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 16px 0;
  color: #fff;
  text-shadow: 0 0 10px rgba(255, 255, 255, 0.3);
}

.tech-alert-message {
  margin-bottom: 32px;
}

.tech-alert-message p {
  font-size: 16px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  margin: 0;
}

/* 🔘 科技感按钮 */
.tech-alert-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
}

.tech-btn {
  position: relative;
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  overflow: hidden;
  min-width: 88px;
  outline: none;
}

.tech-btn-text {
  position: relative;
  z-index: 2;
  transition: all 0.3s ease;
}

.tech-btn-bg {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  transition: all 0.3s ease;
  border-radius: 8px;
}

.tech-btn--primary {
  color: #fff;
}

.tech-btn--primary .tech-btn-bg {
  background: linear-gradient(135deg, #667eea, #764ba2);
  box-shadow: 0 4px 15px rgba(102, 126, 234, 0.3);
}

.tech-btn--primary:hover .tech-btn-bg {
  background: linear-gradient(135deg, #7c3aed, #667eea);
  box-shadow: 0 6px 20px rgba(102, 126, 234, 0.4);
  transform: translateY(-1px);
}

.tech-btn--danger .tech-btn-bg {
  background: linear-gradient(135deg, #f56565, #e53e3e) !important;
  box-shadow: 0 4px 15px rgba(245, 101, 101, 0.3) !important;
}

.tech-btn--danger:hover .tech-btn-bg {
  background: linear-gradient(135deg, #fc8181, #f56565) !important;
  box-shadow: 0 6px 20px rgba(245, 101, 101, 0.4) !important;
}

.tech-btn--secondary {
  color: rgba(255, 255, 255, 0.8);
}

.tech-btn--secondary .tech-btn-bg {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.tech-btn--secondary:hover {
  color: #fff;
}

.tech-btn--secondary:hover .tech-btn-bg {
  background: rgba(255, 255, 255, 0.2);
  border-color: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

/* 🎬 动画效果 */
@keyframes grid-move {
  0% { transform: translate(0, 0); }
  100% { transform: translate(20px, 20px); }
}

@keyframes particle-float {
  0%, 100% { opacity: 0; transform: translateY(0) scale(0); }
  50% { opacity: 1; transform: translateY(-10px) scale(1); }
}

.tech-alert-enter-active,
.tech-alert-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.tech-alert-enter-from,
.tech-alert-leave-to {
  opacity: 0;
}

.tech-alert-enter-from .tech-alert-container,
.tech-alert-leave-to .tech-alert-container {
  transform: scale(0.8) translateY(20px);
  opacity: 0;
}

/* 📱 响应式设计 */
@media (max-width: 768px) {
  .tech-alert-container {
    margin: 20px;
    min-width: auto;
    max-width: none;
    padding: 24px;
  }
  
  .tech-alert-actions {
    flex-direction: column;
  }
  
  .tech-btn {
    width: 100%;
  }
}
</style> 