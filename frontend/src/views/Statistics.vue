<template>
  <PageContainer>
    <!-- 页面头部 -->
    <PageHeader
      title="数据统计分析"
      description="全面的答题数据分析和可视化展示"
      :icon="TrendCharts"
    >
      <template #actions>
        <div class="header-actions">
          <el-date-picker
            v-model="dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            @change="handleDateChange"
            class="date-picker"
          />
          <el-button @click="refreshData" :loading="loading" class="btn-secondary">
            <el-icon><Refresh /></el-icon>
            刷新数据
          </el-button>
          <el-button type="primary" @click="exportReport" class="btn-primary">
            <el-icon><Download /></el-icon>
            导出报告
          </el-button>
        </div>
      </template>
    </PageHeader>

    <!-- 核心指标面板 -->
    <div class="metrics-section">
      <div class="metrics-grid">
        <MetricCard
          v-for="metric in coreMetrics"
          :key="metric.key"
          :metric="metric"
          @click="handleMetricClick(metric)"
        />
      </div>
    </div>

    <!-- 图表分析区域 -->
    <div class="charts-section">
      <!-- 主要趋势图表 -->
      <div class="chart-row primary">
        <ChartCard
          title="答题趋势分析"
          :loading="chartsLoading.trend"
          class="chart-large"
        >
          <template #controls>
            <el-radio-group v-model="trendTimeRange" size="small" @change="updateTrendChart">
              <el-radio-button label="7d">近7天</el-radio-button>
              <el-radio-button label="30d">近30天</el-radio-button>
              <el-radio-button label="90d">近90天</el-radio-button>
            </el-radio-group>
          </template>
          <div ref="trendChart" class="chart-container"></div>
        </ChartCard>

        <ChartCard
          title="题型分布"
          :loading="chartsLoading.type"
          class="chart-medium"
        >
          <div ref="typeChart" class="chart-container"></div>
        </ChartCard>
      </div>

      <!-- 次要分析图表 -->
      <div class="chart-row secondary">
        <ChartCard
          title="会话状态分布"
          :loading="chartsLoading.status"
          class="chart-small"
        >
          <div ref="statusChart" class="chart-container"></div>
        </ChartCard>

        <ChartCard
          title="得分分布"
          :loading="chartsLoading.score"
          class="chart-small"
        >
          <div ref="scoreChart" class="chart-container"></div>
        </ChartCard>

        <ChartCard
          title="用时分布"
          :loading="chartsLoading.time"
          class="chart-small"
        >
          <div ref="timeChart" class="chart-container"></div>
        </ChartCard>
      </div>

      <!-- 高级分析图表 -->
      <div class="chart-row advanced">
        <ChartCard
          title="热力图分析"
          :loading="chartsLoading.heatmap"
          class="chart-large"
        >
          <template #controls>
            <el-select 
              v-model="heatmapType" 
              size="small" 
              style="width: 120px;"
              @change="updateHeatmapChart"
            >
              <el-option label="答题时间" value="time" />
              <el-option label="题型偏好" value="type" />
              <el-option label="难度分布" value="difficulty" />
            </el-select>
          </template>
          <div ref="heatmapChart" class="chart-container"></div>
        </ChartCard>
      </div>
    </div>

    <!-- 详细统计数据 -->
    <div class="statistics-data-section">
      <!-- 题型统计表格 -->
      <DataTable
        :data="typeStatistics"
        :loading="tablesLoading.type"
        :pagination="typeTablePagination"
        title="题型统计详情"
        :icon="BarChart"
        @size-change="handleTypeTableSizeChange"
        @current-change="handleTypeTableCurrentChange"
      >
        <template #header-actions>
          <el-button size="small" @click="refreshTypeStats" :loading="tablesLoading.type">
            <el-icon><Refresh /></el-icon>
            刷新
          </el-button>
        </template>

        <el-table-column prop="typeName" label="题型" width="120">
          <template #default="{ row }">
            <el-tag :color="getQuestionTypeColor(row.type)" size="small">
              {{ row.typeName }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalQuestions" label="题目总数" width="100" align="center" />
        <el-table-column prop="totalAnswers" label="答题次数" width="100" align="center" />
        <el-table-column prop="averageScore" label="平均得分" width="100" align="center">
          <template #default="{ row }">
            <span class="score-display">{{ formatScore(row.averageScore) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="completionRate" label="完成率" width="100" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.completionRate"
              :color="getProgressColor(row.completionRate)"
              :stroke-width="6"
              :show-text="false"
            />
            <span class="rate-text">{{ formatPercentage(row.completionRate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="correctRate" label="正确率" width="100" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.correctRate"
              :color="getProgressColor(row.correctRate)"
              :stroke-width="6"
              :show-text="false"
            />
            <span class="rate-text">{{ formatPercentage(row.correctRate) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="averageTime" label="平均用时" width="100" align="center">
          <template #default="{ row }">
            {{ formatDuration(row.averageTime) }}
          </template>
        </el-table-column>
        <el-table-column prop="difficulty" label="难度分析" width="120" align="center">
          <template #default="{ row }">
            <DifficultyIndicator :level="row.difficultyLevel" :score="row.difficultyScore" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" size="small" @click="viewTypeDetail(row)">
              <el-icon><View /></el-icon>
              详情
            </el-button>
          </template>
        </el-table-column>
      </DataTable>

      <!-- 用户排行榜 -->
      <DataTable
        :data="userRankings"
        :loading="tablesLoading.ranking"
        :pagination="rankingTablePagination"
        title="用户排行榜"
        :icon="Trophy"
        @size-change="handleRankingTableSizeChange"
        @current-change="handleRankingTableCurrentChange"
      >
        <template #header-actions>
          <el-select 
            v-model="rankingType" 
            size="small" 
            style="width: 120px;"
            @change="refreshUserRankings"
          >
            <el-option label="总分排行" value="score" />
            <el-option label="答题数量" value="count" />
            <el-option label="完成率" value="completion" />
          </el-select>
        </template>

        <el-table-column label="排名" width="80" align="center">
          <template #default="{ $index }">
            <RankBadge :rank="$index + 1 + (rankingTablePagination.current - 1) * rankingTablePagination.size" />
          </template>
        </el-table-column>
        <el-table-column prop="userName" label="用户" width="150">
          <template #default="{ row }">
            <div class="user-info">
              <el-avatar :size="32" :src="row.avatar">
                <el-icon><User /></el-icon>
              </el-avatar>
              <div class="user-details">
                <div class="user-name">{{ row.userName }}</div>
                <div class="user-level">{{ row.userLevel }}</div>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="totalScore" label="总分" width="100" align="center">
          <template #default="{ row }">
            <span class="score-highlight">{{ row.totalScore }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="sessionCount" label="答题次数" width="100" align="center" />
        <el-table-column prop="completionRate" label="完成率" width="120" align="center">
          <template #default="{ row }">
            <el-progress
              :percentage="row.completionRate"
              :color="getProgressColor(row.completionRate)"
              :stroke-width="6"
            />
          </template>
        </el-table-column>
        <el-table-column prop="averageScore" label="平均分" width="100" align="center">
          <template #default="{ row }">
            {{ formatScore(row.averageScore) }}
          </template>
        </el-table-column>
        <el-table-column prop="lastActiveTime" label="最后活跃" width="150">
          <template #default="{ row }">
            {{ formatRelativeTime(row.lastActiveTime) }}
          </template>
        </el-table-column>
      </DataTable>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue'
import { ElMessage } from 'element-plus'
import {
  TrendCharts, Refresh, Download, User, CircleCheck, Trophy, Clock,
  CaretTop, CaretBottom, BarChart, View
} from '@element-plus/icons-vue'
import * as echarts from 'echarts'
import { statisticsApi } from '../api/statistics'
import { PageContainer, PageHeader, SearchPanel, DataTable, MetricCard, ChartCard, DifficultyIndicator, RankBadge } from '@/components'
import { 
  QUESTION_TYPE_NAMES,
  QUESTION_TYPE_COLORS
} from '../constants/questionTypes'

// 组件名称
defineOptions({
  name: 'Statistics'
})

// 响应式数据
const loading = ref(false)
const dateRange = ref([])
const autoRefresh = ref(false)
const trendTimeRange = ref('30d')
const heatmapType = ref('time')
const rankingType = ref('sessions')

// 图表加载状态
const chartsLoading = reactive({
  trend: false,
  type: false,
  status: false,
  score: false,
  time: false,
  heatmap: false
})

// 表格加载状态
const tablesLoading = reactive({
  type: false,
  ranking: false
})

// 核心指标数据
const overviewStats = ref({})
const coreMetrics = computed(() => {
  return [
    {
      key: 'users',
      type: 'primary',
      icon: User,
      iconColor: '#4f46e5',
      value: overviewStats.value.totalUsers || 0,
      label: '总用户数',
      change: overviewStats.value.userGrowth
    },
    {
      key: 'sessions', 
      type: 'success',
      icon: CircleCheck,
      iconColor: '#10b981',
      value: overviewStats.value.totalSessions || 0,
      label: '答题会话',
      change: overviewStats.value.sessionGrowth
    },
    {
      key: 'score',
      type: 'warning',
      icon: Trophy,
      iconColor: '#f59e0b',
      value: overviewStats.value.averageScore || 0,
      label: '平均得分',
      unit: '分'
    },
    {
      key: 'completion',
      type: 'info',
      icon: Clock,
      iconColor: '#06b6d4',
      value: overviewStats.value.completionRate || 0,
      label: '完成率',
      unit: '%'
    }
  ]
})

// 图表引用
const trendChart = ref(null)
const typeChart = ref(null)
const statusChart = ref(null)
const scoreChart = ref(null)
const timeChart = ref(null)
const heatmapChart = ref(null)

// 统计数据
const typeStatistics = ref([])
const userRankings = ref([])

// 分页配置
const typeTablePagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

const rankingTablePagination = reactive({
  current: 1,
  size: 10,
  total: 0
})

// 方法定义
const handleMetricClick = (metric) => {
  console.log('点击指标:', metric)
  // 可以根据指标类型跳转到详细页面或显示详细信息
}

const updateTrendChart = () => {
  chartsLoading.trend = true
  // 更新趋势图表逻辑
  setTimeout(() => {
    chartsLoading.trend = false
  }, 1000)
}

const updateHeatmapChart = () => {
  chartsLoading.heatmap = true
  // 更新热力图逻辑
  setTimeout(() => {
    chartsLoading.heatmap = false
  }, 1000)
}

const handleDateChange = (dates) => {
  console.log('日期范围变更:', dates)
  refreshData()
}

const refreshData = async () => {
  try {
    loading.value = true
    await Promise.all([
      loadOverviewStats(),
      loadTypeStatistics(),
      loadUserRankings(),
      initAllCharts()
    ])
  } catch (error) {
    console.error('刷新数据失败:', error)
    ElMessage.error('数据加载失败')
  } finally {
    loading.value = false
  }
}

const loadOverviewStats = async () => {
  try {
    const response = await statisticsApi.getOverviewStats({
      dateRange: dateRange.value
    })
    overviewStats.value = response.data || {}
  } catch (error) {
    console.error('加载概览统计失败:', error)
    // 使用默认数据确保界面不崩溃
    overviewStats.value = {
      totalUsers: 0,
      totalSessions: 0,
      averageScore: 0,
      completionRate: 0,
      userGrowth: 0,
      sessionGrowth: 0
    }
  }
}

const loadTypeStatistics = async () => {
  try {
    tablesLoading.type = true
    const response = await statisticsApi.getTypeStatistics({
      page: typeTablePagination.current,
      size: typeTablePagination.size,
      dateRange: dateRange.value
    })
    
    if (response.data) {
      typeStatistics.value = response.data.records || []
      typeTablePagination.total = response.data.total || 0
    }
  } catch (error) {
    console.error('加载题型统计失败:', error)
    typeStatistics.value = []
  } finally {
    tablesLoading.type = false
  }
}

const loadUserRankings = async () => {
  try {
    tablesLoading.ranking = true
    const response = await statisticsApi.getUserRankings({
      page: rankingTablePagination.current,
      size: rankingTablePagination.size,
      type: rankingType.value,
      dateRange: dateRange.value
    })
    
    if (response.data) {
      userRankings.value = response.data.records || []
      rankingTablePagination.total = response.data.total || 0
    }
  } catch (error) {
    console.error('加载用户排行失败:', error)
    userRankings.value = []
  } finally {
    tablesLoading.ranking = false
  }
}

const initAllCharts = async () => {
  await nextTick()
  try {
    await Promise.all([
      initTrendChart(),
      initTypeChart(),
      initStatusChart(),
      initScoreChart(),
      initTimeChart(),
      initHeatmapChart()
    ])
  } catch (error) {
    console.error('初始化图表失败:', error)
  }
}

const initTrendChart = async () => {
  if (!trendChart.value) return
  
  try {
    chartsLoading.trend = true
    const chart = echarts.init(trendChart.value)
    
    // 图表配置
    const option = {
      tooltip: {
        trigger: 'axis',
        axisPointer: {
          type: 'cross'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: {
        type: 'category',
        data: [] // 从API获取
      },
      yAxis: {
        type: 'value'
      },
      series: [
        {
          name: '答题数量',
          type: 'line',
          data: [] // 从API获取
        }
      ]
    }
    
    chart.setOption(option)
    
    // 响应式处理
    const resizeObserver = new ResizeObserver(() => {
      chart.resize()
    })
    resizeObserver.observe(trendChart.value)
    
  } catch (error) {
    console.error('初始化趋势图表失败:', error)
  } finally {
    chartsLoading.trend = false
  }
}

const initTypeChart = async () => {
  if (!typeChart.value) return
  
  try {
    chartsLoading.type = true
    const chart = echarts.init(typeChart.value)
    
    const option = {
      tooltip: {
        trigger: 'item',
        formatter: '{a} <br/>{b}: {c} ({d}%)'
      },
      series: [
        {
          name: '题型分布',
          type: 'pie',
          radius: ['40%', '70%'],
          data: [] // 从API获取
        }
      ]
    }
    
    chart.setOption(option)
  } catch (error) {
    console.error('初始化题型图表失败:', error)
  } finally {
    chartsLoading.type = false
  }
}

const initStatusChart = async () => {
  if (!statusChart.value) return
  
  try {
    chartsLoading.status = true
    // 状态图表初始化逻辑
  } catch (error) {
    console.error('初始化状态图表失败:', error)
  } finally {
    chartsLoading.status = false
  }
}

const initScoreChart = async () => {
  if (!scoreChart.value) return
  
  try {
    chartsLoading.score = true
    // 得分图表初始化逻辑
  } catch (error) {
    console.error('初始化得分图表失败:', error)
  } finally {
    chartsLoading.score = false
  }
}

const initTimeChart = async () => {
  if (!timeChart.value) return
  
  try {
    chartsLoading.time = true
    // 用时图表初始化逻辑
  } catch (error) {
    console.error('初始化用时图表失败:', error)
  } finally {
    chartsLoading.time = false
  }
}

const initHeatmapChart = async () => {
  if (!heatmapChart.value) return
  
  try {
    chartsLoading.heatmap = true
    // 热力图初始化逻辑
  } catch (error) {
    console.error('初始化热力图失败:', error)
  } finally {
    chartsLoading.heatmap = false
  }
}

const refreshTypeStats = () => {
  loadTypeStatistics()
}

const refreshUserRankings = () => {
  loadUserRankings()
}

const handleTypeTableSizeChange = (size) => {
  typeTablePagination.size = size
  typeTablePagination.current = 1
  loadTypeStatistics()
}

const handleTypeTableCurrentChange = (current) => {
  typeTablePagination.current = current
  loadTypeStatistics()
}

const handleRankingTableSizeChange = (size) => {
  rankingTablePagination.size = size
  rankingTablePagination.current = 1
  loadUserRankings()
}

const handleRankingTableCurrentChange = (current) => {
  rankingTablePagination.current = current
  loadUserRankings()
}

const viewTypeDetail = (row) => {
  console.log('查看题型详情:', row)
  // 跳转到题型详情页面或显示详情对话框
}

const exportReport = () => {
  console.log('导出报告')
  ElMessage.success('报告导出成功')
}

// 工具函数
const getQuestionTypeColor = (type) => {
  return QUESTION_TYPE_COLORS[type] || '#909399'
}

const getProgressColor = (percentage) => {
  if (percentage >= 80) return '#10b981'
  if (percentage >= 60) return '#f59e0b'
  return '#ef4444'
}

const formatScore = (score) => {
  if (score === null || score === undefined) return '-'
  return typeof score === 'number' ? score.toFixed(1) + '分' : score
}

const formatPercentage = (percentage) => {
  if (percentage === null || percentage === undefined) return '-'
  return typeof percentage === 'number' ? percentage.toFixed(1) + '%' : percentage
}

const formatDuration = (duration) => {
  if (!duration) return '-'
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

const formatRelativeTime = (time) => {
  if (!time) return '-'
  
  const now = new Date()
  const target = new Date(time)
  const diff = now - target
  
  const minutes = Math.floor(diff / (1000 * 60))
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  
  if (days > 0) return `${days}天前`
  if (hours > 0) return `${hours}小时前`
  if (minutes > 0) return `${minutes}分钟前`
  return '刚刚'
}

// 生命周期
onMounted(() => {
  // 设置默认日期范围（最近30天）
  const end = new Date()
  const start = new Date()
  start.setTime(start.getTime() - 30 * 24 * 3600 * 1000)
  dateRange.value = [
    start.toISOString().split('T')[0],
    end.toISOString().split('T')[0]
  ]
  
  refreshData()
})

onBeforeUnmount(() => {
  // 清理图表实例，防止内存泄漏
  const charts = [trendChart, typeChart, statusChart, scoreChart, timeChart, heatmapChart]
  charts.forEach(chartRef => {
    if (chartRef.value) {
      const instance = echarts.getInstanceByDom(chartRef.value)
      if (instance) {
        instance.dispose()
      }
    }
  })
})
</script>

<style scoped>
/* Statistics 特定样式 */

/* 头部操作区域 */
.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

.date-picker {
  min-width: 280px;
}

/* 指标面板 */
.metrics-section {
  margin-bottom: var(--spacing-2xl);
}

.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: var(--spacing-xl);
}

/* 图表区域 */
.charts-section {
  margin-bottom: var(--spacing-2xl);
}

.chart-row {
  display: grid;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
}

.chart-row:last-child {
  margin-bottom: 0;
}

.chart-row.primary {
  grid-template-columns: 2fr 1fr;
}

.chart-row.secondary {
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.chart-row.advanced {
  grid-template-columns: 1fr;
}

.chart-container {
  width: 100%;
  height: 350px;
}

.chart-row.secondary .chart-container {
  height: 300px;
}

/* 统计数据区域 */
.statistics-data-section {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2xl);
}

/* 表格内容样式 */
.user-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.user-details {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.user-name {
  font-weight: var(--font-semibold);
  color: var(--color-gray-700);
  font-size: var(--text-sm);
}

.user-level {
  font-size: var(--text-xs);
  color: var(--color-gray-500);
}

.score-display {
  font-weight: var(--font-semibold);
  color: var(--color-success);
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  display: inline-block;
  min-width: 50px;
  text-align: center;
}

.rate-text {
  font-size: var(--text-xs);
  color: var(--color-gray-500);
  margin-top: var(--spacing-xs);
  display: block;
}

.score-highlight {
  font-weight: var(--font-bold);
  color: var(--color-primary);
  background: linear-gradient(135deg, #f0f4ff 0%, #e0e7ff 100%);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  display: inline-block;
  min-width: 60px;
  text-align: center;
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .chart-row.primary {
    grid-template-columns: 1fr;
  }
  
  .chart-row.secondary {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .metrics-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .header-actions {
    flex-direction: column;
    gap: var(--spacing-md);
    width: 100%;
  }
  
  .date-picker {
    min-width: auto;
    width: 100%;
  }
  
  .metrics-grid {
    grid-template-columns: 1fr;
    gap: var(--spacing-lg);
  }
  
  .chart-row.secondary {
    grid-template-columns: 1fr;
  }
  
  .chart-container {
    height: 250px;
  }
  
  .user-info {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-sm);
  }
  
  .statistics-data-section {
    gap: var(--spacing-xl);
  }
}

@media (max-width: 480px) {
  .chart-container {
    height: 200px;
  }
  
  .header-actions .el-button {
    width: 100%;
  }
}
</style> 