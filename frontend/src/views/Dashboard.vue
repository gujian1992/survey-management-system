<template>
  <PageContainer>
    <!-- 页面头部 -->
    <PageHeader
      title="数据概览"
      description="管理后台数据概览与统计分析"
      :icon="DataBoard"
    />

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
            <v-chart class="chart" :option="trendOption" />
          </div>
        </div>
        
        <div class="chart-card">
          <div class="chart-header">
            <h3>问卷状态分布</h3>
          </div>
          <div class="chart-container">
            <v-chart class="chart" :option="statusOption" />
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
        @row-click="handleRowClick"
      >
        <el-table-column prop="title" label="问卷标题" min-width="120" show-overflow-tooltip />
        <el-table-column prop="status" label="状态" width="80">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="totalCount" label="回复数" width="80">
          <template #default="{ row }">
            {{ row.totalCount || 0 }}
          </template>
        </el-table-column>
        <el-table-column label="浏览量" width="80">
          <template #default>
            -
          </template>
        </el-table-column>
        <el-table-column prop="createTime" label="创建时间" width="150">
          <template #default="{ row }">
            {{ formatTime(row.createTime) }}
          </template>
        </el-table-column>
      </DataTable>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, onMounted, onActivated, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { answerSessionAPI, statisticsAPI } from '../api'
import { ElMessage } from 'element-plus'
import { formatDateTime } from '@/utils/time'
import { PageContainer, PageHeader, DataTable } from '@/components'
import { DataBoard, Document, CircleCheck, ChatLineSquare, User } from '@element-plus/icons-vue'

// 组件名称，用于keep-alive
defineOptions({
  name: 'Dashboard'
})

const router = useRouter()

const stats = ref({
  totalQuestionnaires: 0,
  publishedQuestionnaires: 0,
  totalResponses: 0,
  totalViews: 0
})
const recentQuestionnaires = ref([])
const loading = ref(false)
const lastLoadTime = ref(0)
const cacheTimeout = 5 * 60 * 1000 // 5分钟缓存

const trendOption = ref({
  title: {
    text: '创建趋势'
  },
  tooltip: {
    trigger: 'axis'
  },
  xAxis: {
    type: 'category',
    data: []
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [],
    type: 'line',
    smooth: true
  }]
})

const statusOption = ref({
  title: {
    text: '状态分布'
  },
  tooltip: {
    trigger: 'item'
  },
  legend: {
    bottom: '0%'
  },
  series: [{
    type: 'pie',
    radius: ['30%', '70%'],
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

const formatTime = (dateTime) => {
  return formatDateTime(dateTime, 'short')
}

const loadData = async (force = false) => {
  // 检查缓存
  if (!force && Date.now() - lastLoadTime.value < cacheTimeout) {
    return
  }

  loading.value = true
  try {
    // 加载仪表盘统计数据
    const statsResponse = await statisticsAPI.getDashboardStats()
    if (statsResponse.data) {
      stats.value = statsResponse.data
      
      // 更新状态分布图表
      statusOption.value.series[0].data = [
        { value: statsResponse.data.draftCount || 0, name: '草稿' },
        { value: statsResponse.data.publishedCount || 0, name: '已发布' },
        { value: statsResponse.data.endedCount || 0, name: '已结束' }
      ]
    }
    
    // 加载趋势数据
    const trendResponse = await statisticsAPI.getTrend({ days: 7 })
    if (trendResponse.data) {
      const { dates, counts } = trendResponse.data
      trendOption.value.xAxis.data = dates
      trendOption.value.series[0].data = counts
    }
    
    // 加载最近会话 (可选，失败不影响主要功能)
    try {
      const listResponse = await answerSessionAPI.getAllSessions({ current: 1, size: 5 })
      if (listResponse && listResponse.data && listResponse.data.records) {
        recentQuestionnaires.value = listResponse.data.records
      } else {
        recentQuestionnaires.value = []
      }
    } catch (sessionError) {
      console.warn('加载会话列表失败，但不影响其他数据:', sessionError.message || sessionError)
      recentQuestionnaires.value = [] // 设置为空数组
    }

    lastLoadTime.value = Date.now()
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const handleRowClick = (row) => {
  router.push('/answer-sessions')
}

onMounted(() => {
  loadData()
  // 监听全局数据变化事件
  window.addEventListener('questionnaireDataChanged', () => {
    console.log('仪表盘收到数据变化通知，刷新数据')
    loadData(true) // 强制刷新
  })
})

// 组件激活时检查是否需要刷新数据
onActivated(() => {
  loadData()
})

// 清理事件监听
onBeforeUnmount(() => {
  window.removeEventListener('questionnaireDataChanged', loadData)
})
</script>

<style scoped>
/* Dashboard 特定样式 */
.stats-section {
  margin-bottom: var(--spacing-2xl);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-xl);
}

.stat-card {
  background: var(--color-white);
  border-radius: var(--radius-xl);
  padding: var(--spacing-xl);
  box-shadow: var(--shadow-card);
  transition: var(--transition-normal);
  height: 120px;
}

.stat-card:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
}

.stat-item {
  display: flex;
  align-items: center;
  height: 100%;
}

.stat-icon {
  width: 60px;
  height: 60px;
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-white);
  margin-right: var(--spacing-lg);
  flex-shrink: 0;
}

.stat-icon.total {
  background: var(--gradient-primary);
}

.stat-icon.published {
  background: var(--gradient-success);
}

.stat-icon.responses {
  background: var(--gradient-info);
}

.stat-icon.views {
  background: var(--gradient-warning);
}

.stat-content {
  flex: 1;
  min-width: 0;
}

.stat-number {
  font-size: var(--text-3xl);
  font-weight: var(--font-bold);
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-xs);
  line-height: 1;
}

.stat-label {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  font-weight: var(--font-medium);
}

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

.chart {
  height: 100%;
  width: 100%;
}

.recent-section {
  margin-bottom: var(--spacing-2xl);
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
    height: auto;
    padding: var(--spacing-lg);
  }
  
  .stat-item {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .stat-icon {
    margin-right: 0;
  }
  
  .chart-container {
    height: 250px;
  }
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}
</style> 