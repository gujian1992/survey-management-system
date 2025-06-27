<template>
  <div class="button-showcase">
    <!-- 顶部标题区域 -->
    <div class="showcase-header">
      <h1 class="showcase-title">
        <el-icon><Star /></el-icon>
        高级按钮增强系统展示
      </h1>
      <p class="showcase-subtitle">
        企业级按钮增强解决方案 - 基于Element Plus深度优化
      </p>
    </div>

    <!-- 控制面板 -->
    <div class="control-panel">
      <el-card shadow="hover" class="control-card">
        <template #header>
          <div class="card-header">
            <el-icon><Setting /></el-icon>
            <span>系统控制台</span>
          </div>
        </template>
        
        <div class="control-grid">
          <div class="control-item">
            <label>增强策略</label>
            <el-select v-model="selectedStrategy" @change="updateStrategy">
              <el-option
                v-for="strategy in strategies"
                :key="strategy.value"
                :label="strategy.label"
                :value="strategy.value"
              />
            </el-select>
          </div>
          
          <div class="control-item">
            <label>调试模式</label>
            <el-switch v-model="debugMode" @change="updateDebugMode" />
          </div>
          
          <div class="control-item">
            <label>动画效果</label>
            <el-switch v-model="enableAnimation" @change="updateAnimation" />
          </div>
          
          <div class="control-item">
            <label>涟漪效果</label>
            <el-switch v-model="enableRipple" />
          </div>
        </div>
        
        <div class="stats-section">
          <h4>系统统计</h4>
          <div class="stats-grid">
            <div class="stat-item">
              <span class="stat-label">增强按钮:</span>
              <span class="stat-value">{{ stats.enhancedButtons }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">注册主题:</span>
              <span class="stat-value">{{ stats.registeredThemes }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">活跃状态:</span>
              <span class="stat-value">{{ stats.activeStates }}</span>
            </div>
            <div class="stat-item">
              <span class="stat-label">事件监听:</span>
              <span class="stat-value">{{ stats.eventListeners }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 预设主题展示 -->
    <div class="theme-showcase">
      <el-card shadow="hover" class="theme-card">
        <template #header>
          <div class="card-header">
            <el-icon><Palette /></el-icon>
            <span>预设主题展示</span>
          </div>
        </template>
        
        <div class="theme-grid">
          <div v-for="theme in presetThemes" :key="theme.name" class="theme-item">
            <div class="theme-info">
              <h4>{{ theme.label }}</h4>
              <p>{{ theme.description }}</p>
            </div>
            <EnhancedButton
              :enhance-theme="theme.name"
              :enable-animation="enableAnimation"
              :ripple-effect="enableRipple"
              :enhancement-strategy="selectedStrategy"
              :debug-mode="debugMode"
              :text="theme.label"
              :icon="theme.icon"
              @click="handleThemeButtonClick(theme.name)"
              @enhance-ready="handleEnhanceReady"
              @enhance-error="handleEnhanceError"
            />
          </div>
        </div>
      </el-card>
    </div>

    <!-- SearchPanel 集成展示 -->
    <div class="search-panel-showcase">
      <el-card shadow="hover" class="search-card">
        <template #header>
          <div class="card-header">
            <el-icon><Search /></el-icon>
            <span>SearchPanel 集成展示</span>
          </div>
        </template>
        
        <SearchPanel
          title="智能搜索演示"
          :search-model="searchModel"
          :searching="searching"
          :columns="3"
          @search="handleSearch"
          @reset="handleReset"
          ref="searchPanelRef"
        >
          <template #search-fields>
            <div class="search-field">
              <label>关键词</label>
              <el-input
                v-model="searchModel.keyword"
                placeholder="输入搜索关键词"
                clearable
              />
            </div>
            
            <div class="search-field">
              <label>分类</label>
              <el-select
                v-model="searchModel.category"
                placeholder="选择分类"
                clearable
              >
                <el-option label="全部" value="" />
                <el-option label="技术" value="tech" />
                <el-option label="设计" value="design" />
                <el-option label="产品" value="product" />
              </el-select>
            </div>
            
            <div class="search-field">
              <label>状态</label>
              <el-select
                v-model="searchModel.status"
                placeholder="选择状态"
                clearable
              >
                <el-option label="全部" value="" />
                <el-option label="激活" value="active" />
                <el-option label="禁用" value="disabled" />
              </el-select>
            </div>
          </template>
        </SearchPanel>
      </el-card>
    </div>

    <!-- 自定义样式编辑器 -->
    <div class="custom-editor">
      <el-card shadow="hover" class="editor-card">
        <template #header>
          <div class="card-header">
            <el-icon><Edit /></el-icon>
            <span>自定义样式编辑器</span>
          </div>
        </template>
        
        <div class="editor-content">
          <div class="editor-controls">
            <el-select v-model="selectedCustomTheme" placeholder="选择要编辑的主题">
              <el-option
                v-for="theme in presetThemes"
                :key="theme.name"
                :label="theme.label"
                :value="theme.name"
              />
            </el-select>
            
            <el-button type="primary" @click="applyCustomStyles">
              应用自定义样式
            </el-button>
            
            <el-button @click="resetCustomStyles">
              重置样式
            </el-button>
          </div>
          
          <div class="style-editor">
            <div class="style-section">
              <h4>默认状态</h4>
              <el-input
                v-model="customStyles.default.background"
                placeholder="背景颜色/渐变"
              />
              <el-input
                v-model="customStyles.default.color"
                placeholder="文字颜色"
              />
              <el-input
                v-model="customStyles.default.borderRadius"
                placeholder="圆角大小"
              />
            </div>
            
            <div class="style-section">
              <h4>悬停状态</h4>
              <el-input
                v-model="customStyles.hover.background"
                placeholder="背景颜色/渐变"
              />
              <el-input
                v-model="customStyles.hover.transform"
                placeholder="变换效果"
              />
              <el-input
                v-model="customStyles.hover.boxShadow"
                placeholder="阴影效果"
              />
            </div>
            
            <div class="preview-section">
              <h4>预览效果</h4>
              <EnhancedButton
                v-if="selectedCustomTheme"
                :enhance-theme="selectedCustomTheme"
                :custom-styles="customStyles"
                :enable-animation="enableAnimation"
                :ripple-effect="enableRipple"
                :enhancement-strategy="selectedStrategy"
                :debug-mode="debugMode"
                text="自定义预览"
                @click="handleCustomPreviewClick"
                ref="customPreviewRef"
              />
            </div>
          </div>
        </div>
      </el-card>
    </div>

    <!-- 事件日志 -->
    <div class="event-log">
      <el-card shadow="hover" class="log-card">
        <template #header>
          <div class="card-header">
            <el-icon><Monitor /></el-icon>
            <span>事件日志</span>
            <el-button size="small" @click="clearLogs">清空日志</el-button>
          </div>
        </template>
        
        <div class="log-content">
          <div
            v-for="(log, index) in eventLogs"
            :key="index"
            :class="['log-item', `log-${log.type}`]"
          >
            <span class="log-time">{{ log.time }}</span>
            <span class="log-type">{{ log.type.toUpperCase() }}</span>
            <span class="log-message">{{ log.message }}</span>
          </div>
          
          <div v-if="eventLogs.length === 0" class="log-empty">
            暂无事件日志
          </div>
        </div>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { Star, Setting, Palette, Search, Edit, Monitor } from '@element-plus/icons-vue'
import EnhancedButton from '@/components/base/EnhancedButton.vue'
import SearchPanel from '@/components/base/SearchPanel.vue'
import { useAdvancedButtonEnhancer, ENHANCEMENT_STRATEGIES, PRESET_THEMES } from '@/plugins/AdvancedButtonEnhancer.js'

// 🚀 高级增强系统
const { enhancer } = useAdvancedButtonEnhancer({
  debugMode: true,
  strategy: ENHANCEMENT_STRATEGIES.HYBRID
})

// 响应式状态
const selectedStrategy = ref(ENHANCEMENT_STRATEGIES.HYBRID)
const debugMode = ref(true)
const enableAnimation = ref(true)
const enableRipple = ref(false)
const searching = ref(false)
const stats = ref({
  enhancedButtons: 0,
  registeredThemes: 0,
  activeStates: 0,
  eventListeners: 0
})

// 事件日志
const eventLogs = ref([])

// 策略选项
const strategies = [
  { value: ENHANCEMENT_STRATEGIES.INLINE_STYLE, label: '内联样式策略' },
  { value: ENHANCEMENT_STRATEGIES.CSS_OVERRIDE, label: 'CSS覆盖策略' },
  { value: ENHANCEMENT_STRATEGIES.DOM_MANIPULATION, label: 'DOM操作策略' },
  { value: ENHANCEMENT_STRATEGIES.HYBRID, label: '混合策略（推荐）' }
]

// 预设主题
const presetThemes = [
  {
    name: 'search',
    label: '搜索按钮',
    description: '蓝紫渐变，适用于搜索功能',
    icon: 'Search'
  },
  {
    name: 'reset',
    label: '重置按钮',
    description: '简洁白色，适用于重置功能',
    icon: 'RefreshLeft'
  },
  {
    name: 'primary',
    label: '主要按钮',
    description: '蓝色主题，用于主要操作',
    icon: 'Star'
  },
  {
    name: 'secondary',
    label: '次要按钮',
    description: '灰色主题，用于次要操作',
    icon: 'More'
  },
  {
    name: 'success',
    label: '成功按钮',
    description: '绿色主题，表示成功状态',
    icon: 'Check'
  },
  {
    name: 'danger',
    label: '危险按钮',
    description: '红色主题，用于危险操作',
    icon: 'Delete'
  },
  {
    name: 'warning',
    label: '警告按钮',
    description: '橙色主题，用于警告提示',
    icon: 'Warning'
  }
]

// SearchPanel 配置
const searchModel = reactive({
  keyword: '',
  category: '',
  status: ''
})

const searchButtonThemes = reactive({
  search: 'search',
  reset: 'reset'
})

const searchCustomStyles = reactive({})

// 自定义样式编辑器
const selectedCustomTheme = ref('primary')
const customStyles = reactive({
  default: {
    background: '',
    color: '',
    borderRadius: ''
  },
  hover: {
    background: '',
    transform: '',
    boxShadow: ''
  }
})

// 引用
const searchPanelRef = ref(null)
const customPreviewRef = ref(null)

// 🎯 事件处理
const handleThemeButtonClick = (themeName) => {
  addLog('info', `点击了 ${themeName} 主题按钮`)
}

const handleEnhanceReady = (enhancement) => {
  addLog('success', `按钮增强成功: ${enhancement.theme}`)
  updateStats()
}

const handleEnhanceError = (error) => {
  addLog('error', `按钮增强失败: ${error.message}`)
}

const handleSearch = (searchData) => {
  searching.value = true
  addLog('info', `执行搜索: ${JSON.stringify(searchData)}`)
  
  setTimeout(() => {
    searching.value = false
    addLog('success', '搜索完成')
  }, 2000)
}

const handleReset = () => {
  Object.keys(searchModel).forEach(key => {
    searchModel[key] = ''
  })
  addLog('info', '重置搜索条件')
}

const updateStrategy = () => {
  addLog('info', `切换增强策略: ${selectedStrategy.value}`)
  updateStats()
}

const updateDebugMode = () => {
  addLog('info', `${debugMode.value ? '启用' : '禁用'}调试模式`)
}

const updateAnimation = () => {
  addLog('info', `${enableAnimation.value ? '启用' : '禁用'}动画效果`)
}

const applyCustomStyles = () => {
  if (customPreviewRef.value) {
    customPreviewRef.value.enhance()
    addLog('info', '应用自定义样式')
  }
}

const resetCustomStyles = () => {
  Object.keys(customStyles.default).forEach(key => {
    customStyles.default[key] = ''
  })
  Object.keys(customStyles.hover).forEach(key => {
    customStyles.hover[key] = ''
  })
  addLog('info', '重置自定义样式')
}

const handleCustomPreviewClick = () => {
  addLog('info', '点击自定义预览按钮')
}

const clearLogs = () => {
  eventLogs.value = []
}

// 🔧 工具方法
const addLog = (type, message) => {
  const now = new Date()
  const time = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`
  
  eventLogs.value.unshift({
    type,
    message,
    time
  })
  
  // 限制日志数量
  if (eventLogs.value.length > 100) {
    eventLogs.value = eventLogs.value.slice(0, 100)
  }
}

const updateStats = () => {
  if (enhancer) {
    stats.value = enhancer.getStats()
  }
}

// 🎨 生命周期
onMounted(() => {
  addLog('success', '高级按钮增强系统展示页面已加载')
  updateStats()
  
  // 定期更新统计信息
  setInterval(updateStats, 3000)
})
</script>

<style scoped>
/* 🎨 页面布局 */
.button-showcase {
  padding: 24px;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  min-height: 100vh;
}

/* 📖 顶部标题 */
.showcase-header {
  text-align: center;
  margin-bottom: 32px;
  animation: fadeInDown 0.6s ease-out;
}

.showcase-title {
  font-size: 32px;
  font-weight: 700;
  color: #2d3748;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 0 0 16px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.showcase-subtitle {
  font-size: 16px;
  color: #718096;
  margin: 0;
  font-weight: 400;
}

/* 🎛️ 控制面板 */
.control-panel {
  margin-bottom: 32px;
  animation: fadeInLeft 0.6s ease-out 0.1s both;
}

.control-card {
  border-radius: 16px;
  overflow: hidden;
}

.card-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  color: #2d3748;
}

.control-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
}

.control-item {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.control-item label {
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
}

.stats-section {
  border-top: 1px solid #e2e8f0;
  padding-top: 20px;
}

.stats-section h4 {
  margin: 0 0 16px 0;
  color: #2d3748;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border-left: 3px solid #667eea;
}

.stat-label {
  font-weight: 500;
  color: #4a5568;
}

.stat-value {
  font-weight: 700;
  color: #667eea;
  font-size: 18px;
}

/* 🎨 主题展示 */
.theme-showcase {
  margin-bottom: 32px;
  animation: fadeInRight 0.6s ease-out 0.2s both;
}

.theme-card {
  border-radius: 16px;
  overflow: hidden;
}

.theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
}

.theme-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background: rgba(255, 255, 255, 0.7);
  border-radius: 12px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  transition: all 0.3s ease;
}

.theme-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(102, 126, 234, 0.15);
}

.theme-info h4 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-weight: 600;
}

.theme-info p {
  margin: 0;
  color: #718096;
  font-size: 14px;
}

/* 🔍 SearchPanel 展示 */
.search-panel-showcase {
  margin-bottom: 32px;
  animation: fadeInUp 0.6s ease-out 0.3s both;
}

.search-card {
  border-radius: 16px;
  overflow: hidden;
}

/* ✏️ 自定义编辑器 */
.custom-editor {
  margin-bottom: 32px;
  animation: fadeInLeft 0.6s ease-out 0.4s both;
}

.editor-card {
  border-radius: 16px;
  overflow: hidden;
}

.editor-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.editor-controls {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

.style-editor {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 24px;
  align-items: start;
}

.style-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.style-section h4 {
  margin: 0;
  color: #2d3748;
  font-weight: 600;
  border-bottom: 2px solid #667eea;
  padding-bottom: 8px;
}

.preview-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 24px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  border: 2px dashed #667eea;
}

/* 📋 事件日志 */
.event-log {
  animation: fadeInRight 0.6s ease-out 0.5s both;
}

.log-card {
  border-radius: 16px;
  overflow: hidden;
}

.log-content {
  max-height: 400px;
  overflow-y: auto;
  background: #1a202c;
  border-radius: 8px;
  padding: 16px;
}

.log-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  margin-bottom: 4px;
  font-family: 'Consolas', monospace;
  font-size: 13px;
}

.log-time {
  color: #718096;
  min-width: 60px;
}

.log-type {
  font-weight: 600;
  min-width: 60px;
  text-align: center;
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
}

.log-message {
  color: #e2e8f0;
  flex: 1;
}

.log-info .log-type {
  background: #3182ce;
  color: white;
}

.log-success .log-type {
  background: #38a169;
  color: white;
}

.log-error .log-type {
  background: #e53e3e;
  color: white;
}

.log-empty {
  text-align: center;
  color: #718096;
  padding: 40px;
  font-style: italic;
}

/* 📱 响应式设计 */
@media (max-width: 1024px) {
  .style-editor {
    grid-template-columns: 1fr;
  }
  
  .theme-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .button-showcase {
    padding: 16px;
  }
  
  .showcase-title {
    font-size: 24px;
  }
  
  .control-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .editor-controls {
    flex-direction: column;
    align-items: stretch;
  }
}

/* 🎭 动画定义 */
@keyframes fadeInDown {
  from {
    opacity: 0;
    transform: translateY(-20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeInLeft {
  from {
    opacity: 0;
    transform: translateX(-20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInRight {
  from {
    opacity: 0;
    transform: translateX(20px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style> 