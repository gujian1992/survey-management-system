<template>
  <div v-if="isDevelopment && showMonitor" class="performance-monitor">
    <div class="monitor-header">
      <h4>性能监控</h4>
      <div class="monitor-controls">
        <el-button size="small" @click="toggleDetails">
          {{ showDetails ? '隐藏详情' : '显示详情' }}
        </el-button>
        <el-button size="small" @click="exportData">导出</el-button>
        <el-button size="small" @click="clearData">清理</el-button>
        <el-button size="small" @click="showMonitor = false">关闭</el-button>
      </div>
    </div>

    <div class="monitor-content">
      <!-- 关键指标 -->
      <div class="metrics-summary">
        <div class="metric-item">
          <span class="label">页面加载:</span>
          <span class="value" :class="getPerformanceClass(report.pageLoad.totalTime, 3000)">
            {{ formatTime(report.pageLoad.totalTime) }}
          </span>
        </div>
        <div class="metric-item">
          <span class="label">API平均响应:</span>
          <span class="value" :class="getPerformanceClass(report.apiCalls.avgResponseTime, 2000)">
            {{ formatTime(report.apiCalls.avgResponseTime) }}
          </span>
        </div>
        <div class="metric-item">
          <span class="label">平均帧率:</span>
          <span class="value" :class="getFpsClass(report.rendering.avgFps)">
            {{ Math.round(report.rendering.avgFps) }} FPS
          </span>
        </div>
        <div class="metric-item">
          <span class="label">内存使用:</span>
          <span class="value" :class="getMemoryClass(report.memory.current)">
            {{ formatMemory(report.memory.current) }}
          </span>
        </div>
      </div>

      <!-- 详细信息 -->
      <div v-if="showDetails" class="details-section">
        <el-tabs v-model="activeTab" size="small">
          <el-tab-pane label="API调用" name="api">
            <div class="api-stats">
              <p>总调用次数: {{ report.apiCalls.total }}</p>
              <p>成功率: {{ Math.round(report.apiCalls.successRate) }}%</p>
              <p>慢请求: {{ report.apiCalls.slowCalls.length }}</p>
              
              <div v-if="report.apiCalls.slowCalls.length > 0" class="slow-calls">
                <h5>慢请求列表:</h5>
                <div
                  v-for="(call, index) in report.apiCalls.slowCalls.slice(0, 5)"
                  :key="index"
                  class="slow-call-item"
                >
                  <span class="url">{{ call.url }}</span>
                  <span class="duration">{{ formatTime(call.duration) }}</span>
                </div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="渲染性能" name="rendering">
            <div class="rendering-stats">
              <p>平均帧率: {{ Math.round(report.rendering.avgFps) }} FPS</p>
              <p>掉帧次数: {{ report.rendering.frameDrops }}</p>
              <div class="fps-chart">
                <!-- 简单的FPS图表 -->
                <div
                  v-for="(frame, index) in recentFrames"
                  :key="index"
                  class="fps-bar"
                  :style="{ height: `${frame.fps / 60 * 100}%` }"
                  :class="{ 'low-fps': frame.fps < 30 }"
                ></div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="内存使用" name="memory">
            <div class="memory-stats">
              <p>当前使用: {{ formatMemory(report.memory.current) }}</p>
              <p>峰值使用: {{ formatMemory(report.memory.peak) }}</p>
              <p>使用趋势: {{ getTrendText(report.memory.trend) }}</p>
              
              <div class="memory-chart">
                <!-- 简单的内存使用图表 -->
                <div
                  v-for="(usage, index) in recentMemory"
                  :key="index"
                  class="memory-bar"
                  :style="{ height: `${usage.used / report.memory.peak * 100}%` }"
                  :class="{ 'high-memory': usage.used > 50 }"
                ></div>
              </div>
            </div>
          </el-tab-pane>

          <el-tab-pane label="优化建议" name="suggestions">
            <div class="suggestions">
              <div
                v-for="(suggestion, index) in suggestions"
                :key="index"
                class="suggestion-item"
                :class="`priority-${suggestion.priority}`"
              >
                <div class="suggestion-type">{{ suggestion.type }}</div>
                <div class="suggestion-message">{{ suggestion.message }}</div>
                <div class="suggestion-priority">优先级: {{ suggestion.priority }}</div>
              </div>
              
              <div v-if="suggestions.length === 0" class="no-suggestions">
                <el-icon><SuccessFilled /></el-icon>
                <span>性能良好，暂无优化建议</span>
              </div>
            </div>
          </el-tab-pane>
        </el-tabs>
      </div>
    </div>
  </div>

  <!-- 浮动触发按钮 -->
  <div
    v-if="isDevelopment && !showMonitor"
    class="monitor-trigger"
    @click="showMonitor = true"
  >
    <el-icon><Monitor /></el-icon>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ElMessage } from 'element-plus'
import { Monitor, SuccessFilled } from '@element-plus/icons-vue'
import { getPerformanceReport, getOptimizationSuggestions, performanceMonitor } from '@/utils/performanceMonitor'

// 响应式数据
const showMonitor = ref(false)
const showDetails = ref(false)
const activeTab = ref('api')
const report = ref({
  pageLoad: { totalTime: 0 },
  apiCalls: { total: 0, avgResponseTime: 0, successRate: 100, slowCalls: [] },
  rendering: { avgFps: 60, frameDrops: 0 },
  memory: { current: 0, peak: 0, trend: 'stable' }
})
const suggestions = ref([])
const recentFrames = ref([])
const recentMemory = ref([])

// 计算属性
const isDevelopment = computed(() => {
  return process.env.NODE_ENV === 'development' || localStorage.getItem('showPerformanceMonitor') === 'true'
})

// 方法
const updateReport = () => {
  report.value = getPerformanceReport()
  suggestions.value = getOptimizationSuggestions()
  
  // 更新图表数据
  if (performanceMonitor.metrics.renderTime.length > 0) {
    recentFrames.value = performanceMonitor.metrics.renderTime.slice(-20)
  }
  
  if (performanceMonitor.metrics.memoryUsage.length > 0) {
    recentMemory.value = performanceMonitor.metrics.memoryUsage.slice(-20)
  }
}

const formatTime = (ms) => {
  if (ms < 1000) {
    return `${Math.round(ms)}ms`
  }
  return `${(ms / 1000).toFixed(2)}s`
}

const formatMemory = (mb) => {
  return `${Math.round(mb)}MB`
}

const getPerformanceClass = (value, threshold) => {
  if (value > threshold * 1.5) return 'poor'
  if (value > threshold) return 'warning'
  return 'good'
}

const getFpsClass = (fps) => {
  if (fps < 30) return 'poor'
  if (fps < 50) return 'warning'
  return 'good'
}

const getMemoryClass = (memory) => {
  if (memory > 100) return 'poor'
  if (memory > 50) return 'warning'
  return 'good'
}

const getTrendText = (trend) => {
  const trendMap = {
    increasing: '上升',
    decreasing: '下降',
    stable: '稳定'
  }
  return trendMap[trend] || trend
}

const toggleDetails = () => {
  showDetails.value = !showDetails.value
  if (showDetails.value) {
    updateReport()
  }
}

const exportData = () => {
  performanceMonitor.exportData()
  ElMessage.success('性能数据已导出')
}

const clearData = () => {
  performanceMonitor.cleanup()
  updateReport()
  ElMessage.success('性能数据已清理')
}

// 生命周期
let updateTimer = null

onMounted(() => {
  updateReport()
  
  // 定期更新报告
  updateTimer = setInterval(updateReport, 5000)
  
  // 监听性能问题
  window.addEventListener('performanceIssue', (event) => {
    const issue = event.detail
    ElMessage.warning(`性能警告: ${issue.type}`)
  })
})

onUnmounted(() => {
  if (updateTimer) {
    clearInterval(updateTimer)
  }
})
</script>

<style lang="scss" scoped>
.performance-monitor {
  position: fixed;
  top: 20px;
  right: 20px;
  width: 400px;
  max-height: 600px;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #dcdfe6;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  z-index: 9999;
  font-size: 12px;
  overflow: hidden;
  backdrop-filter: blur(10px);

  .monitor-header {
    padding: 12px 16px;
    background: #f5f7fa;
    border-bottom: 1px solid #ebeef5;
    display: flex;
    justify-content: space-between;
    align-items: center;

    h4 {
      margin: 0;
      font-size: 14px;
      color: #303133;
    }

    .monitor-controls {
      display: flex;
      gap: 8px;
    }
  }

  .monitor-content {
    padding: 16px;
    max-height: 500px;
    overflow-y: auto;
  }

  .metrics-summary {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin-bottom: 16px;

    .metric-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 12px;
      background: #f8f9fa;
      border-radius: 4px;

      .label {
        color: #606266;
        font-size: 11px;
      }

      .value {
        font-weight: 600;
        font-size: 12px;

        &.good { color: #67c23a; }
        &.warning { color: #e6a23c; }
        &.poor { color: #f56c6c; }
      }
    }
  }

  .details-section {
    border-top: 1px solid #ebeef5;
    padding-top: 16px;

    :deep(.el-tabs__header) {
      margin: 0 0 12px 0;
    }

    :deep(.el-tabs__content) {
      padding: 0;
    }
  }

  .api-stats,
  .rendering-stats,
  .memory-stats {
    p {
      margin: 8px 0;
      color: #606266;
    }
  }

  .slow-calls {
    margin-top: 12px;

    h5 {
      margin: 0 0 8px 0;
      font-size: 12px;
      color: #303133;
    }

    .slow-call-item {
      display: flex;
      justify-content: space-between;
      padding: 4px 0;
      border-bottom: 1px solid #f0f0f0;

      .url {
        flex: 1;
        color: #606266;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .duration {
        color: #f56c6c;
        font-weight: 600;
      }
    }
  }

  .fps-chart,
  .memory-chart {
    height: 60px;
    display: flex;
    align-items: end;
    gap: 2px;
    margin-top: 12px;
    padding: 8px;
    background: #f8f9fa;
    border-radius: 4px;
  }

  .fps-bar,
  .memory-bar {
    flex: 1;
    background: #67c23a;
    border-radius: 1px;
    min-height: 2px;
    transition: all 0.3s;

    &.low-fps {
      background: #f56c6c;
    }

    &.high-memory {
      background: #e6a23c;
    }
  }

  .suggestions {
    .suggestion-item {
      padding: 12px;
      margin-bottom: 8px;
      border-radius: 4px;
      border-left: 4px solid;

      &.priority-high {
        background: #fef0f0;
        border-left-color: #f56c6c;
      }

      &.priority-medium {
        background: #fdf6ec;
        border-left-color: #e6a23c;
      }

      &.priority-low {
        background: #f0f9eb;
        border-left-color: #67c23a;
      }

      .suggestion-type {
        font-weight: 600;
        font-size: 11px;
        color: #303133;
        margin-bottom: 4px;
      }

      .suggestion-message {
        color: #606266;
        line-height: 1.4;
        margin-bottom: 4px;
      }

      .suggestion-priority {
        font-size: 10px;
        color: #909399;
      }
    }

    .no-suggestions {
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 24px;
      color: #67c23a;

      .el-icon {
        font-size: 18px;
      }
    }
  }
}

.monitor-trigger {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 48px;
  height: 48px;
  background: #409eff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  z-index: 9998;
  transition: all 0.3s;

  &:hover {
    background: #66b1ff;
    transform: scale(1.1);
  }

  .el-icon {
    font-size: 20px;
  }
}
</style> 