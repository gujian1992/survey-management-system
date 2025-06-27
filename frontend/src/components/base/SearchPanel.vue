<template>
  <div class="search-panel">
    <div class="search-container">
      <div v-if="title" class="search-title">
        <el-icon><Search /></el-icon>
        {{ title }}
      </div>
      
      <el-form :model="searchModel" class="search-form">
        <div class="search-form-grid" :style="gridStyle">
          <slot name="search-fields"></slot>
          
          <div class="search-actions">
            <el-button 
              @click="handleSearch" 
              :loading="searching"
              class="search-btn"
              ref="searchBtnRef"
              :style="searchBtnStyle"
              @mouseenter="onSearchBtnHover(true)"
              @mouseleave="onSearchBtnHover(false)"
            >
              <el-icon><Search /></el-icon>
              搜索
            </el-button>
            <el-button 
              @click="handleReset" 
              class="reset-btn"
              ref="resetBtnRef"
              :style="resetBtnStyle"
              @mouseenter="onResetBtnHover(true)"
              @mouseleave="onResetBtnHover(false)"
            >
              <el-icon><RefreshLeft /></el-icon>
              重置
            </el-button>
            <slot name="extra-actions"></slot>
          </div>
        </div>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { computed, toRefs, ref } from 'vue'
import { Search, RefreshLeft } from '@element-plus/icons-vue'

const props = defineProps({
  title: {
    type: String,
    default: '智能筛选'
  },
  searchModel: {
    type: Object,
    required: true
  },
  searching: {
    type: Boolean,
    default: false
  },
  columns: {
    type: Number,
    default: 4,
    validator: (value) => value >= 1 && value <= 6
  }
})

const emit = defineEmits(['search', 'reset'])

const { searchModel } = toRefs(props)
const searchBtnRef = ref(null)
const resetBtnRef = ref(null)

// 🎨 按钮状态管理
const searchBtnHovered = ref(false)
const resetBtnHovered = ref(false)

// 🎨 搜索按钮样式 - 问卷调查系统主题风格
const searchBtnStyle = computed(() => ({
  background: searchBtnHovered.value 
    ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important'
    : 'linear-gradient(135deg, #4f46e5 0%, #667eea 100%) !important',
  border: 'none !important',
  borderRadius: '12px !important',
  color: 'white !important',
  boxShadow: searchBtnHovered.value 
    ? '0 8px 25px rgba(102, 126, 234, 0.4), 0 4px 15px rgba(118, 75, 162, 0.3) !important'
    : '0 4px 15px rgba(79, 70, 229, 0.3), 0 2px 8px rgba(102, 126, 234, 0.2) !important',
  transform: searchBtnHovered.value 
    ? 'translateY(-2px) !important'
    : 'translateY(0) !important',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
  padding: '8px 20px !important',
  height: '32px !important',
  fontWeight: '600 !important',
  letterSpacing: '0.3px !important',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1) !important'
}))

// 🎨 重置按钮样式 - 增强可见性的辅助风格
const resetBtnStyle = computed(() => ({
  background: resetBtnHovered.value 
    ? 'linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%) !important'
    : 'linear-gradient(135deg, #fde047 0%, #facc15 100%) !important',
  border: 'none !important',
  borderRadius: '12px !important',
  color: resetBtnHovered.value ? '#92400e !important' : '#a16207 !important',
  boxShadow: resetBtnHovered.value 
    ? '0 8px 25px rgba(251, 191, 36, 0.4), 0 4px 15px rgba(245, 158, 11, 0.3) !important'
    : '0 4px 15px rgba(253, 224, 71, 0.3), 0 2px 8px rgba(250, 204, 21, 0.2) !important',
  transform: resetBtnHovered.value 
    ? 'translateY(-2px) !important'
    : 'translateY(0) !important',
  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important',
  padding: '8px 20px !important',
  height: '32px !important',
  fontWeight: '600 !important',
  letterSpacing: '0.3px !important',
  textShadow: '0 1px 2px rgba(0, 0, 0, 0.1) !important'
}))

// 🎨 鼠标事件处理
const onSearchBtnHover = (isHover) => {
  searchBtnHovered.value = isHover
}

const onResetBtnHover = (isHover) => {
  resetBtnHovered.value = isHover
}

const gridStyle = computed(() => ({
  '--search-columns': props.columns
}))

const handleSearch = () => {
  emit('search', { ...searchModel.value })
}

const handleReset = () => {
  emit('reset')
}

// 🔧 暴露API给父组件
defineExpose({
  searchBtnRef,
  resetBtnRef
})
</script>

<style>
.search-panel {
  background: rgba(255, 255, 255, 0.95) !important;
  backdrop-filter: blur(20px) !important;
  -webkit-backdrop-filter: blur(20px) !important;
  border-radius: 20px !important;
  padding: 32px !important;
  margin-bottom: 24px !important;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08) !important;
  border: 1px solid rgba(255, 255, 255, 0.2) !important;
  position: relative !important;
  z-index: 1050 !important;
  overflow: visible !important;
  animation: slideInDown 0.6s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

@keyframes slideInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-panel::before {
  content: '' !important;
  position: absolute !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%) !important;
  pointer-events: none !important;
  z-index: -1 !important;
}

.search-container {
  width: 100% !important;
  position: relative !important;
  z-index: 1 !important;
}

.search-title {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  font-size: 18px !important;
  font-weight: 700 !important;
  color: #2d3748 !important;
  margin-bottom: 24px !important;
  padding-bottom: 16px !important;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1) !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

.search-title .el-icon {
  color: #667eea !important;
  font-size: 22px !important;
  filter: drop-shadow(0 2px 4px rgba(102, 126, 234, 0.3)) !important;
}

.search-form {
  width: 100%;
}

/* 核心网格布局 - 现代化设计 */
.search-form-grid {
  display: grid !important;
  grid-template-columns: repeat(var(--search-columns), 1fr) auto !important;
  gap: 24px !important;
  align-items: end !important;
  justify-items: stretch !important;
  width: 100% !important;
  padding: 4px 0 !important;
}

/* 搜索操作按钮区域 - 优雅对齐 */
.search-actions {
  display: flex !important;
  gap: 12px !important;
  align-items: flex-end !important;
  justify-content: flex-end !important;
  justify-self: end !important;
  align-self: flex-end !important;
  min-width: 180px !important;
  height: 68px !important;
  padding-bottom: 8px !important;
  box-sizing: border-box !important;
}

/* 🎨 超强优先级按钮样式 - 测试版本（明显颜色变化） */
.search-panel .search-actions .el-button.search-btn,
.search-panel .search-actions .el-button.search-btn.el-button--default {
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.3) !important;
  transform: translateY(0) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  padding: 8px 20px !important;
  height: 32px !important;
  font-weight: 600 !important;
  /* 重置Element Plus变量 */
  --el-button-bg-color: transparent !important;
  --el-button-border-color: transparent !important;
  --el-button-text-color: white !important;
}

.search-panel .search-actions .el-button.search-btn:hover,
.search-panel .search-actions .el-button.search-btn.el-button--default:hover {
  background: linear-gradient(135deg, #ff9ff3 0%, #f368e0 100%) !important;
  transform: translateY(-3px) !important;
  box-shadow: 0 8px 25px rgba(255, 107, 107, 0.5) !important;
  border: none !important;
  color: white !important;
  /* 重置Element Plus悬停变量 */
  --el-button-hover-bg-color: transparent !important;
  --el-button-hover-border-color: transparent !important;
  --el-button-hover-text-color: white !important;
}

.search-panel .search-actions .el-button.search-btn:active,
.search-panel .search-actions .el-button.search-btn.el-button--default:active {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(255, 107, 107, 0.6) !important;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%) !important;
  border: none !important;
  color: white !important;
}

.search-panel .search-actions .el-button.reset-btn,
.search-panel .search-actions .el-button.reset-btn.el-button--default {
  background: linear-gradient(135deg, #00b894 0%, #00a085 100%) !important;
  border: none !important;
  border-radius: 12px !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(0, 184, 148, 0.3) !important;
  transform: translateY(0) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  padding: 8px 20px !important;
  height: 32px !important;
  font-weight: 600 !important;
  /* 重置Element Plus变量 */
  --el-button-bg-color: transparent !important;
  --el-button-border-color: transparent !important;
  --el-button-text-color: white !important;
}

.search-panel .search-actions .el-button.reset-btn:hover,
.search-panel .search-actions .el-button.reset-btn.el-button--default:hover {
  background: linear-gradient(135deg, #55efc4 0%, #00b894 100%) !important;
  transform: translateY(-3px) !important;
  box-shadow: 0 8px 25px rgba(0, 184, 148, 0.5) !important;
  border: none !important;
  color: white !important;
  /* 重置Element Plus悬停变量 */
  --el-button-hover-bg-color: transparent !important;
  --el-button-hover-border-color: transparent !important;
  --el-button-hover-text-color: white !important;
}

.search-panel .search-actions .el-button.reset-btn:active,
.search-panel .search-actions .el-button.reset-btn.el-button--default:active {
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(0, 184, 148, 0.6) !important;
  background: linear-gradient(135deg, #00b894 0%, #00a085 100%) !important;
  border: none !important;
  color: white !important;
}

/* 全局搜索字段样式 - 精美设计 */
.search-field {
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-start !important;
  align-items: stretch !important;
  height: 68px !important;
  min-height: 68px !important;
  max-height: 68px !important;
  padding: 8px 0 !important;
  box-sizing: border-box !important;
  width: 100% !important;
  margin: 0 !important;
  position: relative !important;
  animation: fadeInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1) !important;
  animation-fill-mode: both !important;
}

.search-field:nth-child(1) { animation-delay: 0.1s !important; }
.search-field:nth-child(2) { animation-delay: 0.2s !important; }
.search-field:nth-child(3) { animation-delay: 0.3s !important; }
.search-field:nth-child(4) { animation-delay: 0.4s !important; }

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.search-field label {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: #4a5568 !important;
  line-height: 1.2 !important;
  margin: 0 0 8px 0 !important;
  padding: 0 4px !important;
  display: block !important;
  width: 100% !important;
  text-align: left !important;
  flex-shrink: 0 !important;
  height: 16px !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  -webkit-background-clip: text !important;
  -webkit-text-fill-color: transparent !important;
  background-clip: text !important;
}

.search-field .el-input,
.search-field .el-select {
  height: 40px !important;
  width: 100% !important;
  flex: 1 !important;
  min-height: 40px !important;
}

.search-field .el-input__wrapper,
.search-field .el-select__wrapper {
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(10px) !important;
  border: 1px solid rgba(102, 126, 234, 0.2) !important;
  border-radius: 12px !important;
  box-shadow: 
    0 2px 8px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.8) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

.search-field .el-input__wrapper:hover,
.search-field .el-select__wrapper:hover {
  border-color: rgba(102, 126, 234, 0.4) !important;
  box-shadow: 
    0 4px 12px rgba(102, 126, 234, 0.15),
    inset 0 1px 0 rgba(255, 255, 255, 0.9) !important;
  transform: translateY(-1px) !important;
}

.search-field .el-input__wrapper.is-focus,
.search-field .el-select__wrapper.is-focus {
  border-color: #667eea !important;
  box-shadow: 
    0 0 0 3px rgba(102, 126, 234, 0.1),
    0 4px 16px rgba(102, 126, 234, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 1) !important;
  transform: translateY(-2px) !important;
}

.search-field .el-input__inner {
  height: 28px !important;
  line-height: 28px !important;
  font-size: 14px !important;
  color: #171923 !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
}

.search-field .el-select__placeholder {
  color: #a0aec0 !important;
  font-size: 14px !important;
}

.search-field .el-select__selected-item {
  font-size: 14px !important;
  color: #171923 !important;
}

/* 下拉箭头样式 */
.search-field .el-select__caret {
  color: #718096 !important;
  font-size: 14px !important;
  transition: transform 0.3s ease !important;
}

.search-field .el-select__wrapper:hover .el-select__caret {
  color: #667eea !important;
}

/* 清除按钮样式 */
.search-field .el-input__clear,
.search-field .el-select__clear {
  color: #a0aec0 !important;
  transition: color 0.3s ease !important;
}

.search-field .el-input__clear:hover,
.search-field .el-select__clear:hover {
  color: #667eea !important;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .search-form-grid {
    grid-template-columns: repeat(3, 1fr) auto !important;
  }
}

@media (max-width: 992px) {
  .search-form-grid {
    grid-template-columns: repeat(2, 1fr) auto !important;
    gap: 20px !important;
  }
  
  .search-panel {
    padding: 24px !important;
  }
}

@media (max-width: 768px) {
  .search-form-grid {
    grid-template-columns: 1fr !important;
    gap: 16px !important;
  }
  
  .search-actions {
    justify-self: stretch !important;
    min-width: unset !important;
    justify-content: center !important;
  }
  
  .search-panel {
    padding: 20px !important;
    border-radius: 16px !important;
  }
}

@media (max-width: 480px) {
  .search-actions {
    flex-direction: column !important;
    gap: 8px !important;
    height: auto !important;
    padding-bottom: 0 !important;
  }
  
  .search-actions .el-button {
    width: 100% !important;
    margin: 0 !important;
  }
}
</style> 