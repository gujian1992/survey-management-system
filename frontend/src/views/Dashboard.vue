<template>
  <PageContainer>
    <!-- 页面头部 -->
    <PageHeader
      title="数据概览"
      description="管理后台数据概览与统计分析"
      :icon="DataBoard"
    >
      <template #actions>
        <el-button size="large" @click="loadData" class="btn-primary">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
      </template>
    </PageHeader>

    <!-- 统计卡片 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-item">
            <div class="stat-icon total">
              <el-icon size="30"><Document /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalQuestions || 0 }}</div>
              <div class="stat-label">题库总数</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-item">
            <div class="stat-icon published">
              <el-icon size="30"><CircleCheck /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.enabledQuestions || 0 }}</div>
              <div class="stat-label">启用题目</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-item">
            <div class="stat-icon responses">
              <el-icon size="30"><ChatLineSquare /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.totalSessions || 0 }}</div>
              <div class="stat-label">答题会话</div>
            </div>
          </div>
        </div>
        
        <div class="stat-card">
          <div class="stat-item">
            <div class="stat-icon views">
              <el-icon size="30"><User /></el-icon>
            </div>
            <div class="stat-content">
              <div class="stat-number">{{ stats.activeUsers || 0 }}</div>
              <div class="stat-label">活跃用户</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 图表区域 -->
    <div class="charts-section">
      <div class="charts-grid">
        <div class="chart-card">
          <div class="chart-header">
            <h3>最近问卷创建趋势</h3>
          </div>
          <div class="chart-container">
            <v-chart class="chart" :option="trendOption" autoresize />
          </div>
        </div>
        
        <div class="chart-card">
          <div class="chart-header">
            <h3>问卷状态分布</h3>
          </div>
          <div class="chart-container">
            <v-chart class="chart" :option="statusOption" autoresize />
          </div>
        </div>
      </div>
    </div>

    <!-- 最近活动 -->
    <div class="recent-section">
      <DataTable
        :data="recentQuestionnaires"
        :loading="loading"
        title="最近创建的问卷"
        :icon="Document"
        :show-pagination="false"
        class="clean-data-table"
        @row-click="handleRowClick"
      >
        <el-table-column prop="title" label="问卷标题" min-width="450" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="title-cell">
              <div class="title-text">{{ row.title }}</div>
              <div class="title-meta">
                <el-icon><Clock /></el-icon>
                <span>{{ formatDateTime(row.createTime, 'YYYY-MM-DD HH:mm') }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)" size="small">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalCount" label="回复数" width="100" align="center">
          <template #default="{ row }">
            <div class="count-cell">{{ row.totalCount || 0 }}</div>
          </template>
        </el-table-column>
        <el-table-column label="浏览量" width="100" align="center">
          <template #default="{ row }">
            <div class="count-cell">{{ row.viewCount || 0 }}</div>
          </template>
        </el-table-column>
      </DataTable>
    </div>
  </PageContainer>
</template>

<style scoped>
.stats-section {
  margin-bottom: var(--spacing-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--spacing-lg);
}

.stat-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-sm);
  transition: var(--transition-normal);
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
}

.stat-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
}

.stat-icon.total {
  background: linear-gradient(135deg, #36d1dc, #5b86e5);
}

.stat-icon.published {
  background: linear-gradient(135deg, #11998e, #38ef7d);
}

.stat-icon.responses {
  background: linear-gradient(135deg, #fc4a1a, #f7b733);
}

.stat-icon.views {
  background: linear-gradient(135deg, #8e2de2, #4a00e0);
}

.stat-content {
  flex: 1;
}

.stat-number {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-gray-900);
  line-height: 1.2;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  margin-top: var(--spacing-xs);
}

.charts-section {
  margin-bottom: var(--spacing-lg);
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--spacing-lg);
}

.chart-card {
  background: var(--color-white);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  box-shadow: var(--shadow-sm);
}

.chart-header {
  padding: var(--spacing-md) var(--spacing-lg);
  border-bottom: 1px solid var(--color-gray-100);
}

.chart-header h3 {
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-gray-900);
  margin: 0;
}

.chart-container {
  height: 300px;
  padding: var(--spacing-lg);
}

.chart {
  width: 100%;
  height: 100%;
}

.recent-section {
  margin-bottom: var(--spacing-lg);
}

.title-cell {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-xs);
}

.title-text {
  font-weight: var(--font-medium);
  color: var(--color-gray-900);
}

.title-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-sm);
  color: var(--color-gray-500);
}

.count-cell {
  font-family: var(--font-mono);
  font-weight: var(--font-medium);
  color: var(--color-gray-700);
}

:deep(.clean-data-table) {
  .el-table {
    box-shadow: var(--shadow-sm);
    border-radius: var(--radius-lg);
    overflow: hidden;
  }

  .el-table th {
    background: var(--color-gray-50);
    font-weight: var(--font-semibold);
  }

  .el-table tr:hover > td {
    background: var(--color-primary-50);
  }
}

.btn-primary {
  background: var(--gradient-primary);
  border: none;
  color: var(--color-white);
  font-weight: var(--font-medium);
  
  &:hover {
    transform: translateY(-1px);
    box-shadow: var(--shadow-md);
  }
}
</style>

<script setup>
import { ref, onMounted, onActivated, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { answerSessionAPI, statisticsAPI } from '../api'
import { ElMessage } from 'element-plus'
import { formatDateTime } from '@/utils/format'
import { PageContainer, PageHeader, DataTable } from '@/components'
import { DataBoard, Document, CircleCheck, ChatLineSquare, User, Refresh, Clock } from '@element-plus/icons-vue'
import 'echarts'

// 组件名称，用于keep-alive
defineOptions({
  name: 'Dashboard'
})

const router = useRouter()

const stats = ref({
  totalQuestions: 0,
  enabledQuestions: 0,
  totalSessions: 0,
  activeUsers: 0
})

const recentQuestionnaires = ref([])
const loading = ref(false)
const lastLoadTime = ref(0)
const cacheTimeout = 5 * 60 * 1000 // 5分钟缓存

const trendOption = ref({
  title: {
    text: '创建趋势',
    textStyle: {
      fontSize: 16,
      fontWeight: 'normal'
    }
  },
  tooltip: {
    trigger: 'axis',
    axisPointer: {
      type: 'shadow'
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
    data: [],
    axisLine: {
      lineStyle: {
        color: '#ddd'
      }
    }
  },
  yAxis: {
    type: 'value',
    axisLine: {
      show: false
    },
    splitLine: {
      lineStyle: {
        color: '#eee'
      }
    }
  },
  series: [{
    data: [],
    type: 'line',
    smooth: true,
    symbolSize: 8,
    itemStyle: {
      color: '#409EFF'
    },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0,
        y: 0,
        x2: 0,
        y2: 1,
        colorStops: [{
          offset: 0,
          color: 'rgba(64,158,255,0.2)'
        }, {
          offset: 1,
          color: 'rgba(64,158,255,0)'
        }]
      }
    }
  }]
})

const statusOption = ref({
  title: {
    text: '状态分布',
    textStyle: {
      fontSize: 16,
      fontWeight: 'normal'
    }
  },
  tooltip: {
    trigger: 'item',
    formatter: '{b}: {c} ({d}%)'
  },
  legend: {
    bottom: '0%',
    left: 'center'
  },
  series: [{
    type: 'pie',
    radius: ['40%', '70%'],
    avoidLabelOverlap: false,
    itemStyle: {
      borderRadius: 10,
      borderColor: '#fff',
      borderWidth: 2
    },
    label: {
      show: false,
      position: 'center'
    },
    emphasis: {
      label: {
        show: true,
        fontSize: 20,
        fontWeight: 'bold'
      }
    },
    labelLine: {
      show: false
    },
    data: []
  }]
})

const getStatusType = (status) => {
  const types = { 
    0: 'info',       // 草稿 - 中性灰色
    1: 'success',    // 已发布 - 成功绿色  
    2: 'warning'     // 已结束 - 警告橙色
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 
    0: '草稿', 
    1: '已发布', 
    2: '已结束'
  }
  return texts[status] || '未知'
}

const handleRowClick = (row) => {
  router.push(`/questionnaire/${row.id}`)
}

const loadData = async () => {
  if (loading.value) return
  
  try {
    loading.value = true
    const now = Date.now()
    
    // 如果距离上次加载时间不到5分钟，直接返回
    if (now - lastLoadTime.value < cacheTimeout) {
      return
    }

    // 加载统计数据
    const statsData = await statisticsAPI.getDashboardStats()
    stats.value = statsData

    // 加载最近问卷
    const { records } = await answerSessionAPI.getRecentQuestionnaires()
    recentQuestionnaires.value = records

    // 更新图表数据
    updateCharts(statsData)
    
    lastLoadTime.value = now
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const updateCharts = (data) => {
  // 更新趋势图数据
  if (data.trend) {
    trendOption.value.xAxis.data = data.trend.map(item => item.date)
    trendOption.value.series[0].data = data.trend.map(item => item.count)
  }

  // 更新状态分布图数据
  if (data.statusDistribution) {
    statusOption.value.series[0].data = Object.entries(data.statusDistribution).map(([status, count]) => ({
      name: getStatusText(parseInt(status)),
      value: count
    }))
  }
}

// 生命周期钩子
onMounted(() => {
  loadData()
})

onActivated(() => {
  loadData()
})

// 清理定时器
onBeforeUnmount(() => {
  lastLoadTime.value = 0
})
</script> 