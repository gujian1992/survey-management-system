<template>
  <PageContainer>
    <!-- 页面头部 -->
    <PageHeader
      title="答题会话管理"
      description="实时监控和管理所有答题会话"
      :icon="Monitor"
    >
      <template #actions>
        <el-button @click="refreshData" :loading="loading" class="btn-secondary">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button type="primary" @click="showBatchDialog = true" class="btn-primary">
          <el-icon><Operation /></el-icon>
          批量操作
        </el-button>
      </template>
    </PageHeader>

    <!-- 实时统计面板 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card active">
          <div class="stat-icon">
            <el-icon color="#4f46e5"><User /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ realTimeStats.activeUsers }}</div>
            <div class="stat-label">在线答题</div>
            <div class="stat-trend">
              <el-icon color="#10b981"><CaretTop /></el-icon>
              {{ realTimeStats.userGrowth }}%
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#10b981"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ realTimeStats.todayCompleted }}</div>
            <div class="stat-label">今日完成</div>
            <div class="stat-trend">
              <el-icon color="#10b981"><CaretTop /></el-icon>
              {{ realTimeStats.completionGrowth }}%
            </div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#f59e0b"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ realTimeStats.avgDuration }}</div>
            <div class="stat-label">平均用时</div>
            <div class="stat-unit">分钟</div>
          </div>
        </div>

        <div class="stat-card">
          <div class="stat-icon">
            <el-icon color="#ef4444"><Warning /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ realTimeStats.timeoutSessions }}</div>
            <div class="stat-label">超时会话</div>
            <div class="stat-action">
              <el-button text type="danger" size="small" @click="handleTimeoutSessions">
                处理
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表展示 -->
    <div class="charts-section">
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <h3>会话状态分布</h3>
            <el-radio-group v-model="chartTimeRange" size="small">
              <el-radio-button label="today">今日</el-radio-button>
              <el-radio-button label="week">本周</el-radio-button>
              <el-radio-button label="month">本月</el-radio-button>
            </el-radio-group>
          </div>
          <div class="chart-container" ref="statusChart"></div>
        </div>
        
        <div class="chart-card">
          <div class="chart-header">
            <h3>答题趋势</h3>
            <el-select v-model="trendMetric" size="small" style="width: 120px;">
              <el-option label="会话数" value="sessions" />
              <el-option label="完成率" value="completion" />
              <el-option label="平均分" value="score" />
            </el-select>
          </div>
          <div class="chart-container" ref="trendChart"></div>
        </div>
      </div>
    </div>

    <!-- 搜索面板 -->
    <SearchPanel
      :search-model="searchForm"
      :searching="loading"
      @search="handleSearch"
      @reset="resetFilters"
      :columns="5"
    >
      <template #search-fields>
        <div class="search-field">
          <label>搜索</label>
          <el-input
            v-model="searchText"
            placeholder="搜索用户名或会话编码..."
            clearable
            class="search-input"
          />
        </div>
        
        <div class="search-field">
          <label>状态筛选</label>
          <el-select v-model="filters.status" placeholder="全部状态" clearable>
            <el-option label="进行中" value="IN_PROGRESS" />
            <el-option label="已完成" value="COMPLETED" />
            <el-option label="已超时" value="TIMEOUT" />
            <el-option label="已放弃" value="ABANDONED" />
          </el-select>
        </div>
        
        <div class="search-field">
          <label>题型筛选</label>
          <el-select v-model="filters.questionType" placeholder="全部题型" clearable>
            <el-option 
              v-for="(name, type) in QUESTION_TYPE_NAMES"
              :key="type"
              :label="name"
              :value="parseInt(type)"
            />
          </el-select>
        </div>

        <div class="search-field">
          <label>时间范围</label>
          <el-date-picker
            v-model="filters.dateRange"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="YYYY-MM-DD HH:mm"
            value-format="YYYY-MM-DD HH:mm:ss"
          />
        </div>

        <div class="search-field">
          <label>评分状态</label>
          <el-select v-model="filters.scoringStatus" placeholder="全部" clearable>
            <el-option label="待评分" value="PENDING" />
            <el-option label="已评分" value="COMPLETED" />
          </el-select>
        </div>
      </template>
    </SearchPanel>

    <!-- 数据表格 -->
    <DataTable
      :data="sessionsList"
      :loading="loading"
      :pagination="pagination"
      title="会话列表"
      :icon="Monitor"
      :show-batch-actions="true"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @row-click="handleRowClick"
    >
      <template #batch-actions="{ selectedRows }">
        <el-button 
          :disabled="selectedSessions.length === 0"
          @click="batchUpdateStatus('COMPLETED')"
          class="batch-btn"
        >
          批量完成
        </el-button>
        <el-button 
          :disabled="selectedSessions.length === 0"
          @click="batchUpdateStatus('TIMEOUT')"
          type="warning"
          class="batch-btn"
        >
          批量超时
        </el-button>
        <el-button 
          :disabled="selectedSessions.length === 0"
          @click="batchDelete"
          type="danger"
          class="batch-btn"
        >
          批量删除
        </el-button>
      </template>

      <el-table-column type="selection" width="50" />
      <el-table-column prop="sessionCode" label="会话编码" width="150" show-overflow-tooltip />
      <el-table-column prop="userName" label="用户" width="120">
        <template #default="{ row }">
          <div class="user-info">
            <el-avatar :size="28" :src="row.userAvatar">
              <el-icon><User /></el-icon>
            </el-avatar>
            <span class="user-name">{{ row.userName }}</span>
          </div>
        </template>
      </el-table-column>
      <el-table-column prop="status" label="状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="progress" label="进度" width="120" align="center">
        <template #default="{ row }">
          <el-progress
            :percentage="row.progress"
            :color="getProgressColor(row.progress)"
            :show-text="false"
            :stroke-width="6"
          />
          <span class="progress-text">{{ row.currentQuestion }}/{{ row.totalQuestions }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="得分" width="80" align="center">
        <template #default="{ row }">
          <span v-if="row.score !== null" class="score-display">{{ row.score }}</span>
          <span v-else class="score-pending">-</span>
        </template>
      </el-table-column>
      <el-table-column prop="duration" label="用时" width="80" align="center">
        <template #default="{ row }">
          {{ formatDuration(row.duration) }}
        </template>
      </el-table-column>
      <el-table-column prop="startTime" label="开始时间" width="150">
        <template #default="{ row }">
          {{ formatTime(row.startTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button link type="primary" size="small" @click="viewSession(row)" class="btn-action">
              <el-icon><View /></el-icon>
            </el-button>
            <el-button 
              v-if="row.status === 'COMPLETED' && !row.score" 
              link type="success" size="small" 
              @click="scoreSession(row)" 
              class="btn-action"
            >
              <el-icon><EditPen /></el-icon>
            </el-button>
            <el-button 
              link type="warning" size="small" 
              @click="updateSessionStatus(row)" 
              class="btn-action"
            >
              <el-icon><Operation /></el-icon>
            </el-button>
            <el-button link type="danger" size="small" @click="deleteSession(row)" class="btn-action">
              <el-icon><Delete /></el-icon>
            </el-button>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 会话详情对话框 -->
    <el-dialog 
      v-model="showDetailDialog" 
      :title="`会话详情 - ${selectedSession?.sessionCode}`"
      width="900px"
      top="5vh"
    >
      <div v-if="selectedSession" class="session-detail">
        <!-- 详情内容... -->
      </div>
    </el-dialog>

    <!-- 实时监控对话框 -->
    <el-dialog 
      v-model="showMonitorDialog" 
      title="实时监控"
      width="800px"
    >
      <div class="monitor-content">
        <!-- 监控内容... -->
      </div>
    </el-dialog>

    <!-- 批量操作对话框 -->
    <el-dialog 
      v-model="showBatchDialog" 
      title="批量操作"
      width="600px"
    >
      <div class="batch-content">
        <!-- 批量操作内容... -->
      </div>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SimplePremiumDialog } from '@/utils/simplePremiumDialog.js'
import {
  Monitor, Refresh, Operation, User, CircleCheck, Clock, Warning,
  CaretTop, Search, ArrowDown, View, EditPen, Delete
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { answerSessionApi } from '../api/answerSession'
import { PageContainer, PageHeader, SearchPanel, DataTable } from '@/components'
import { 
  QUESTION_TYPE_NAMES,
  QUESTION_TYPE_COLORS
} from '../constants/questionTypes'

// 组件名称 (使用更兼容的方式)
// defineOptions({
//   name: 'AnswerSessionManage'
// })

// 响应式数据
const sessions = ref([])
const realTimeStats = ref({})
const loading = ref(false)
const showDetailDialog = ref(false)
const showMonitorDialog = ref(false)
const showBatchDialog = ref(false)
const selectedSession = ref(null)
const selectedSessions = ref([])
const selectAll = ref(false)

// 图表相关
const statusChart = ref(null)
const trendChart = ref(null)
const chartTimeRange = ref('today')
const trendMetric = ref('sessions')

// 筛选和搜索
const filters = reactive({
  status: '',
  questionType: '',
  dateRange: [],
  scoringStatus: ''
})
const searchText = ref('')
const searchForm = reactive({
  keyword: ''
})

// 分页
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 会话列表数据
const sessionsList = ref([])
const totalSessions = ref(0)

// 计算属性
const filteredSessions = computed(() => {
  let result = sessions.value

  if (filters.status) {
    result = result.filter(s => s.status === filters.status)
  }

  if (filters.questionType) {
    result = result.filter(s => s.questionType === filters.questionType)
  }

  if (filters.scoringStatus) {
    result = result.filter(s => s.scoringStatus === filters.scoringStatus)
  }

  if (filters.dateRange && filters.dateRange.length === 2) {
    const [start, end] = filters.dateRange
    result = result.filter(s => {
      const startTime = new Date(s.startTime)
      return startTime >= new Date(start) && startTime <= new Date(end)
    })
  }

  if (searchText.value) {
    result = result.filter(s => 
      s.sessionCode.toLowerCase().includes(searchText.value.toLowerCase()) ||
      s.userName.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  return result
})

const paginatedSessions = computed(() => {
  const start = (pagination.current - 1) * pagination.size
  const end = start + pagination.size
  return filteredSessions.value.slice(start, end)
})

// 工具函数
const getQuestionTypeName = (type) => QUESTION_TYPE_NAMES[type] || '未知'
const getQuestionTypeColor = (type) => QUESTION_TYPE_COLORS[type] || '#909399'

const getStatusText = (status) => {
  const statusMap = {
    'IN_PROGRESS': '进行中',
    'COMPLETED': '已完成',
    'TIMEOUT': '已超时',
    'ABANDONED': '已放弃'
  }
  return statusMap[status] || status
}

const getStatusType = (status) => {
  const typeMap = {
    'IN_PROGRESS': 'warning',
    'COMPLETED': 'success',
    'TIMEOUT': 'danger',
    'ABANDONED': 'info'
  }
  return typeMap[status] || 'info'
}

const getScoringStatusText = (status) => {
  const statusMap = {
    'PENDING': '待评分',
    'COMPLETED': '已评分'
  }
  return statusMap[status] || status
}

const getProgressColor = (progress) => {
  if (progress === 'COMPLETED') return '#10b981'
  if (progress === 'TIMEOUT') return '#ef4444'
  return '#4f46e5'
}

const getTimeClass = (remainingTime) => {
  if (remainingTime <= 300) return 'danger'
  if (remainingTime <= 900) return 'warning'
  return 'normal'
}

import { formatDateTime } from '@/utils/format'

const formatRemainingTime = (seconds) => {
  if (seconds <= 0) return '已超时'
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.floor((seconds % 3600) / 60)
  const secs = seconds % 60
  
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  } else {
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  }
}

// 主要方法
const loadSessions = async () => {
  try {
    loading.value = true
    const response = await answerSessionApi.getAllSessionList({
      current: 1,
      size: 1000
    })
    if (response.data) {
      sessions.value = response.data.records || []
      sessionsList.value = response.data.records || []
      totalSessions.value = response.data.total || 0
      pagination.total = response.data.total || 0
    }
  } catch (error) {
    console.error('加载会话列表失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadRealTimeStats = async () => {
  try {
    // 临时使用模拟数据，后续可连接真实API
    realTimeStats.value = {
      activeUsers: sessions.value.filter(s => s.status === 1).length,
      todayCompleted: sessions.value.filter(s => s.status === 2).length,
      avgDuration: 45,
      timeoutSessions: sessions.value.filter(s => s.status === 3).length,
      userGrowth: 12,
      completionGrowth: 8
    }
  } catch (error) {
    console.error('加载实时统计失败:', error)
  }
}

const initCharts = async () => {
  await nextTick()
  initStatusChart()
  initTrendChart()
}

const initStatusChart = () => {
  if (!statusChart.value) return
  
  const chart = echarts.init(statusChart.value)
  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{a} <br/>{b}: {c} ({d}%)'
    },
    legend: {
      orient: 'vertical',
      left: 'left'
    },
    series: [
      {
        name: '会话状态',
        type: 'pie',
        radius: '50%',
        data: [
          { value: 35, name: '进行中' },
          { value: 45, name: '已完成' },
          { value: 15, name: '已超时' },
          { value: 5, name: '已放弃' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  }
  chart.setOption(option)
}

const initTrendChart = () => {
  if (!trendChart.value) return
  
  const chart = echarts.init(trendChart.value)
  const option = {
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [120, 200, 150, 80, 70, 110, 130],
        type: 'line',
        smooth: true
      }
    ]
  }
  chart.setOption(option)
}

const viewSessionDetail = (session) => {
  selectedSession.value = session
  showDetailDialog.value = true
}

const handleAction = (command, row) => {
  switch (command) {
    case 'monitor':
      monitorSession(row)
      break
    case 'extend':
      extendTime(row)
      break
    case 'force-complete':
      forceComplete(row)
      break
    case 'reset':
      resetSession(row)
      break
    case 'export':
      exportSession(row)
      break
    case 'delete':
      deleteSession(row)
      break
  }
}

const monitorSession = (session) => {
  selectedSession.value = session
  showMonitorDialog.value = true
}

const extendTime = async (session) => {
  try {
    const { value } = await ElMessageBox.prompt('请输入延长的分钟数', '延长答题时间', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      inputType: 'number',
      inputValidator: (value) => {
        if (!value || value <= 0) {
          return '请输入有效的分钟数'
        }
        return true
      }
    })
    
    await answerSessionApi.extendSession(session.sessionCode, parseInt(value))
    ElMessage.success('时间延长成功')
    await loadSessions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('延长时间失败')
    }
  }
}

const forceComplete = async (session) => {
  try {
    await SimplePremiumDialog.confirm(
      `即将强制完成会话 ${session.sessionCode}\n\n⚠️ 此操作将立即结束用户的答题过程`,
      '⚠️ 强制完成会话',
      {
        confirmButtonText: '强制完成',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    // TODO: 实现强制完成API
    // await answerSessionApi.forceComplete(session.sessionCode)
    ElMessage.success('会话已强制完成')
    await loadSessions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('操作失败')
    }
  }
}

const resetSession = async (session) => {
  try {
    await SimplePremiumDialog.confirm(
      `确定要重置会话 ${session.sessionCode} 吗？\n\n⚠️ 这将清除所有答题记录，此操作不可恢复！`,
      '🔄 重置会话',
      {
        confirmButtonText: '确认重置',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // TODO: 实现重置会话API
    // await answerSessionApi.resetSession(session.sessionCode)
    ElMessage.success('会话已重置')
    await loadSessions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('重置失败')
    }
  }
}

const exportSession = (session) => {
  ElMessage.info('导出功能开发中...')
}

const deleteSession = async (session) => {
  try {
    await SimplePremiumDialog.confirm(
      `确定要删除会话 ${session.sessionCode} 吗？\n\n🗑️ 此操作不可恢复，所有相关数据将被永久删除！`,
      '🗑️ 确认删除会话',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    // TODO: 实现删除会话API
    // await answerSessionApi.deleteAnswerSession(session.sessionCode)
    ElMessage.success('删除成功')
    await loadSessions()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('删除失败')
    }
  }
}

const handleSelectionChange = (selection) => {
  selectedSessions.value = selection
}

const handleSelectAll = (checked) => {
  // 实现全选逻辑
}

const batchUpdateStatus = async (status) => {
  if (selectedSessions.value.length === 0) return
  
  try {
    await SimplePremiumDialog.confirm(
      `确定要批量更新 ${selectedSessions.value.length} 个会话的状态吗？\n\n📊 此操作将同时影响多个会话`,
      '📊 批量更新状态',
      {
        confirmButtonText: '确认更新',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    const sessionCodes = selectedSessions.value.map(s => s.sessionCode)
    // TODO: 实现批量更新状态API
    // await answerSessionApi.batchUpdateStatus(sessionCodes, status)
    ElMessage.success('批量操作成功')
    await loadSessions()
    selectedSessions.value = []
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量操作失败')
    }
  }
}

const batchDelete = async () => {
  if (selectedSessions.value.length === 0) return
  
  try {
    await SimplePremiumDialog.confirm(
      `确定要删除 ${selectedSessions.value.length} 个会话吗？\n\n🗑️ 此操作不可恢复，所有相关数据将被永久删除！`,
      '🗑️ 批量删除会话',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    const sessionCodes = selectedSessions.value.map(s => s.sessionCode)
    // TODO: 实现批量删除API
    // await answerSessionApi.batchDelete(sessionCodes)
    ElMessage.success('批量删除成功')
    await loadSessions()
    selectedSessions.value = []
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量删除失败')
    }
  }
}

const handleTimeoutSessions = () => {
  // 处理超时会话
  ElMessage.info('正在处理超时会话...')
}

const handleSearch = () => {
  pagination.current = 1
  totalSessions.value = filteredSessions.value.length
}

const resetFilters = () => {
  filters.status = ''
  filters.questionType = ''
  filters.dateRange = []
  filters.scoringStatus = ''
  searchText.value = ''
  pagination.current = 1
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
}

const handleCurrentChange = (page) => {
  pagination.current = page
}

const refreshData = async () => {
  await Promise.all([loadSessions(), loadRealTimeStats()])
  ElMessage.success('数据已刷新')
}

// 定时刷新
let refreshTimer = null

const startAutoRefresh = () => {
  refreshTimer = setInterval(() => {
    loadRealTimeStats()
  }, 30000) // 30秒刷新一次
}

const stopAutoRefresh = () => {
  if (refreshTimer) {
    clearInterval(refreshTimer)
    refreshTimer = null
  }
}

// 生命周期
onMounted(async () => {
  await Promise.all([loadSessions(), loadRealTimeStats()])
  await initCharts()
  startAutoRefresh()
})

onBeforeUnmount(() => {
  stopAutoRefresh()
})

const handleRowClick = (row) => {
  // 行点击事件
  console.log('点击行:', row)
}

const viewSession = (row) => {
  selectedSession.value = row
  showDetailDialog.value = true
}

const scoreSession = (row) => {
  // 跳转到评分页面或显示评分对话框
  console.log('评分会话:', row)
}

const updateSessionStatus = (row) => {
  // 更新会话状态
  console.log('更新会话状态:', row)
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const formatDuration = (duration) => {
  if (!duration) return '-'
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}
</script>

<style scoped>
/* AnswerSessionManage 特定样式 */

/* 统计面板 */
.stats-section {
  margin-bottom: var(--spacing-2xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-xl);
}

.stat-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-card);
  transition: var(--transition-normal);
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-card.active {
  border-left: 4px solid var(--color-primary);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-number {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-xs);
  line-height: 1;
}

.stat-label {
  color: var(--color-gray-500);
  font-size: var(--text-sm);
  font-weight: var(--font-medium);
  margin-bottom: var(--spacing-xs);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--color-success);
  font-weight: var(--font-medium);
}

.stat-unit {
  font-size: var(--text-xs);
  color: var(--color-gray-400);
}

.stat-action {
  margin-top: var(--spacing-sm);
}

/* 图表区域 */
.charts-section {
  margin-bottom: var(--spacing-2xl);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: var(--spacing-xl);
}

.chart-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  overflow: hidden;
  transition: var(--transition-normal);
}

.chart-card:hover {
  box-shadow: var(--shadow-lg);
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) var(--spacing-xl) var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-100);
}

.chart-header h3 {
  margin: 0;
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-gray-800);
}

.chart-container {
  height: 300px;
  padding: var(--spacing-lg);
}

/* 表格内容样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-name {
  font-weight: var(--font-medium);
  color: var(--color-gray-700);
}

.progress-text {
  font-size: var(--text-xs);
  color: var(--color-gray-500);
  margin-top: var(--spacing-xs);
  display: block;
}

.score-display {
  font-weight: var(--font-semibold);
  color: var(--color-success);
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  display: inline-block;
  min-width: 40px;
  text-align: center;
}

.score-pending {
  color: var(--color-gray-400);
  font-style: italic;
}

.action-buttons {
  display: flex;
  gap: var(--spacing-xs);
  justify-content: center;
}

.batch-btn {
  border-radius: var(--radius-md);
  font-weight: var(--font-medium);
  padding: var(--spacing-sm) var(--spacing-md);
  height: 32px;
  font-size: var(--text-xs);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .stats-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .charts-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .chart-container {
    height: 250px;
  }
  
  .chart-header {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 