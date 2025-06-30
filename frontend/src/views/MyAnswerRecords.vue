<template>
  <PageContainer>
    <PageHeader 
      title="我的答题记录"
      subtitle="查看您的答题历史和成绩统计"
    >
      <template #extra>
        <div class="header-actions">
          <SafeRouterLink to="/start-answer" tag="el-button" class="el-button el-button--primary">
            <el-icon><Edit /></el-icon>
            开始新的答题
          </SafeRouterLink>
        </div>
      </template>
    </PageHeader>

    <!-- 🎯 统计面板 -->
    <div class="stats-section">
      <div class="stats-grid">
        <MetricCard
          :metric="{
            type: 'primary',
            value: userStats.totalSessions,
            label: '总答题次数',
            icon: 'Document',
            iconColor: '#409eff'
          }"
        />
        <MetricCard
          :metric="{
            type: 'success',
            value: userStats.completedSessions,
            label: '已完成',
            icon: 'CircleCheck',
            iconColor: '#67c23a',
            progress: userStats.completionRate
          }"
        />
        <MetricCard
          :metric="{
            type: 'warning',
            value: userStats.averageScore,
            label: '平均得分',
            icon: 'Star',
            iconColor: '#e6a23c',
            unit: '分',
            change: userStats.scoreImprovement
          }"
        />
        <MetricCard
          :metric="{
            type: 'info',
            value: userStats.totalTimeSpent,
            label: '总用时',
            icon: 'Clock',
            iconColor: '#909399'
          }"
        />
      </div>
    </div>

    <!-- 🎯 筛选面板 -->
    <SearchPanel
      :search-model="searchForm"
      @search="loadSessions"
      @reset="resetSearch"
    >
      <template #search-fields>
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable style="width: 150px">
            <el-option label="全部状态" :value="0" />
            <el-option label="进行中" :value="1" />
            <el-option label="已完成" :value="2" />
            <el-option label="已超时" :value="3" />
            <el-option label="已放弃" :value="4" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="题型">
          <el-select v-model="searchForm.questionType" placeholder="全部题型" clearable style="width: 150px">
            <el-option label="全部题型" :value="0" />
            <el-option label="单选题" :value="1" />
            <el-option label="多选题" :value="2" />
            <el-option label="填空题" :value="3" />
            <el-option label="简答题" :value="4" />
            <el-option label="评分题" :value="5" />
          </el-select>
        </el-form-item>
        
        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            style="width: 240px"
            :shortcuts="timeShortcuts"
          />
        </el-form-item>
      </template>
    </SearchPanel>

    <!-- 🎯 数据表格 -->
    <DataTable
      :loading="loading"
      :data="sessionsList"
      :pagination="{
        current: pagination.current,
        size: pagination.size,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true
      }"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
    >
      <!-- 会话编码 -->
      <el-table-column prop="sessionCode" label="会话编码" min-width="180" align="center">
        <template #default="{ row }">
          <el-link 
            type="primary" 
            @click="viewDetail(row)"
            class="session-link"
          >
            {{ row.sessionCode }}
          </el-link>
        </template>
      </el-table-column>
      
      <!-- 题型 -->
      <el-table-column prop="questionType" label="题型" min-width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="getQuestionTypeTag(row.questionType)" size="small">
            {{ getQuestionTypeName(row.questionType) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <!-- 答题用时 -->
      <el-table-column label="答题用时" min-width="120" align="center">
        <template #default="{ row }">
          <div class="time-cell">
            {{ formatTimeSpent(calculateTimeSpent(row)) }}
          </div>
        </template>
      </el-table-column>
      
      <!-- 得分 -->
      <el-table-column prop="finalScore" label="得分" min-width="80" align="center">
        <template #default="{ row }">
          <div class="score-cell">
            {{ row.finalScore || 0 }}分
          </div>
        </template>
      </el-table-column>
      
      <!-- 状态 -->
      <el-table-column prop="status" label="状态" min-width="90" align="center">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)" size="small">
            {{ getStatusText(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      
      <!-- 开始时间 -->
      <el-table-column prop="startTime" label="开始时间" min-width="160" align="center">
        <template #default="{ row }">
          <div class="time-cell">
            <el-icon><Clock /></el-icon>
            <span>{{ formatDateTime(row.startTime) }}</span>
          </div>
        </template>
      </el-table-column>
      
      <!-- 操作 -->
      <el-table-column label="操作" width="200" fixed="right" align="center">
        <template #default="{ row }">
          <div class="action-buttons-group">
            <el-button 
              type="primary" 
              size="small" 
              @click="viewDetail(row)"
              plain
              class="action-button"
            >
              <el-icon><View /></el-icon>
              详情
            </el-button>
            
            <el-button 
              v-if="row.status === 1" 
              type="success"
              size="small" 
              @click="continueAnswer(row)"
              plain
              class="action-button"
            >
              <el-icon><CaretRight /></el-icon>
              继续
            </el-button>
            
            <el-button 
              v-if="row.status === 1" 
              type="danger"
              size="small" 
              @click="abandonAnswer(row)"
              plain
              class="action-button"
            >
              <el-icon><Close /></el-icon>
              放弃
            </el-button>
            
            <el-button 
              v-if="row.status === 2 && row.finalScore > 0" 
              type="warning"
              size="small" 
              @click="viewReport(row)"
              plain
              class="action-button"
            >
              <el-icon><DataBoard /></el-icon>
              报告
            </el-button>
          </div>
        </template>
      </el-table-column>
    </DataTable>

    <!-- 详情对话框 -->
    <el-dialog v-model="detailVisible" title="答题详情" width="800px">
      <div v-if="selectedSession" class="detail-content">
        <el-descriptions :column="2" border>
          <el-descriptions-item label="会话编码">{{ selectedSession.sessionCode }}</el-descriptions-item>
          <el-descriptions-item label="题型">{{ getQuestionTypeName(selectedSession.questionType) }}</el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="getStatusType(selectedSession.status)">
              {{ getStatusText(selectedSession.status) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="答题用时">{{ formatTimeSpent(calculateTimeSpent(selectedSession)) }}</el-descriptions-item>
          <el-descriptions-item label="得分">{{ selectedSession.finalScore || 0 }}分</el-descriptions-item>
          <el-descriptions-item label="总分">{{ selectedSession.totalScore || 0 }}分</el-descriptions-item>
          <el-descriptions-item label="开始时间">{{ formatDateTime(selectedSession.startTime) }}</el-descriptions-item>
          <el-descriptions-item label="结束时间">{{ formatDateTime(selectedSession.endTime) }}</el-descriptions-item>
        </el-descriptions>
      </div>
      
      <template #footer>
        <el-button @click="detailVisible = false">关闭</el-button>
        <el-button 
          v-if="selectedSession && selectedSession.status === 1"
          type="primary" 
          @click="continueAnswer(selectedSession)"
        >
          继续答题
        </el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Edit, Search, Refresh, View, CaretRight, DataBoard, Clock,
  Document, CircleCheck, Star, Close
} from '@element-plus/icons-vue'
import { answerSessionApi } from '@/api/answerSession'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/base/PageHeader.vue'
import SearchPanel from '@/components/base/SearchPanel.vue'
import DataTable from '@/components/base/DataTable.vue'
import MetricCard from '@/components/statistics/MetricCard.vue'
import SafeRouterLink from '@/components/SafeRouterLink.vue'
import { scrollbarDebugger } from '@/utils/scrollbarDebugger.js'

// 组件名称
defineOptions({
  name: 'MyAnswerRecords'
})

const router = useRouter()

// 响应式数据
const loading = ref(false)
const sessionsList = ref([])
const detailVisible = ref(false)
const selectedSession = ref(null)

// 用户统计数据
const userStats = ref({
  totalSessions: 0,
  completedSessions: 0,
  averageScore: 0,
  completionRate: 0,
  scoreImprovement: 0,
  totalTimeSpent: '0小时'
})

// 搜索表单
const searchForm = reactive({
  status: 0,
  questionType: 0,
  dateRange: []
})

// 分页
const pagination = reactive({
  current: 1,
  size: 10,
  total: 0,
  pages: 1
})

// 时间快捷选项
const timeShortcuts = [
  {
    text: '最近一周',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 7)
      return [start, end]
    }
  },
  {
    text: '最近一个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 30)
      return [start, end]
    }
  },
  {
    text: '最近三个月',
    value: () => {
      const end = new Date()
      const start = new Date()
      start.setDate(start.getDate() - 90)
      return [start, end]
    }
  }
]

// 工具方法
const getQuestionTypeName = (type) => {
  const names = {
    0: '混合题型',
    1: '单选题',
    2: '多选题', 
    3: '填空题',
    4: '简答题',
    5: '评分题'
  }
  return names[type] || '未知'
}

const getQuestionTypeTag = (type) => {
  const tags = {
    0: 'info',
    1: 'primary',
    2: 'success',
    3: 'warning',
    4: 'danger',
    5: 'info'
  }
  return tags[type] || 'info'
}

const getStatusText = (status) => {
  const texts = {
    1: '进行中',
    2: '已完成',
    3: '已超时',
    4: '已放弃'
  }
  return texts[status] || '未知'
}

const getStatusType = (status) => {
  const types = {
    1: 'warning',
    2: 'success',
    3: 'danger',
    4: 'info'
  }
  return types[status] || 'info'
}

const calculateTimeSpent = (session) => {
  if (!session.startTime || !session.endTime) return 0
  const start = new Date(session.startTime)
  const end = new Date(session.endTime)
  return Math.floor((end - start) / 1000) // 转换为秒
}

const formatTimeSpent = (seconds) => {
  if (seconds < 60) {
    return `${seconds}秒`
  }
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) {
    const remainingSeconds = seconds % 60
    return remainingSeconds > 0 ? `${minutes}分${remainingSeconds}秒` : `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分` : `${hours}小时`
}

const formatDateTime = (dateStr) => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 主要方法
const loadSessions = async () => {
  try {
    loading.value = true
    const params = {
      current: pagination.current,
      size: pagination.size,
      status: searchForm.status === 0 ? null : searchForm.status,
      questionType: searchForm.questionType === 0 ? null : searchForm.questionType,
      startTime: searchForm.dateRange?.[0],
      endTime: searchForm.dateRange?.[1]
    }
    
    const response = await answerSessionApi.getMySessionList(params)
    if (response.data) {
      // 确保 records 是数组
      const records = Array.isArray(response.data.records) ? response.data.records : []
      console.log('加载的答题记录:', records) // 添加日志
      sessionsList.value = records
      pagination.total = response.data.total || 0
      console.log('分页信息:', pagination) // 添加日志
    }
  } catch (error) {
    console.error('加载答题记录失败:', error)
    ElMessage.error('加载答题记录失败')
  } finally {
    loading.value = false
  }
}

const loadUserStats = async () => {
  try {
    const response = await answerSessionApi.getMyStats()
    if (response && response.data) {
      userStats.value = {
        totalSessions: response.data.totalSessions || 0,
        completedSessions: response.data.completedSessions || 0,
        averageScore: response.data.averageScore || 0,
        completionRate: response.data.completionRate || 0,
        scoreImprovement: response.data.scoreImprovement || 0,
        totalTimeSpent: formatMinutes(response.data.totalTimeSpent || 0)
      }
    }
  } catch (error) {
    console.error('加载用户统计数据失败:', error)
    ElMessage.error('加载统计数据失败')
  }
}

// 将分钟转换为更友好的时间格式
const formatMinutes = (minutes) => {
  if (minutes < 60) {
    return `${minutes}分钟`
  }
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60
  return remainingMinutes > 0 ? `${hours}小时${remainingMinutes}分钟` : `${hours}小时`
}

const resetSearch = () => {
  searchForm.status = 0
  searchForm.questionType = 0
  searchForm.dateRange = []
  loadSessions()
}

const viewDetail = (row) => {
  selectedSession.value = row
  detailVisible.value = true
}

const continueAnswer = async (session) => {
  try {
    // 直接跳转到答题页面继续答题
    ElMessage.success('继续答题')
    router.push(`/answer-session/${session.sessionCode}`)
  } catch (error) {
    console.error('继续答题失败:', error)
    ElMessage.error('继续答题失败，请稍后重试')
  }
}

const abandonAnswer = async (session) => {
  try {
    await ElMessageBox.confirm(
      '确定要放弃这次答题吗？放弃后无法恢复。',
      '确认放弃',
      {
        confirmButtonText: '确定放弃',
        cancelButtonText: '取消',
        type: 'warning'
      }
    )
    
    await answerSessionApi.abandonSession(session.sessionCode)
    ElMessage.success('已放弃答题')
    loadSessions() // 刷新列表
  } catch (error) {
    if (error !== 'cancel') {
      console.error('放弃答题失败:', error)
      ElMessage.error('操作失败，请稍后重试')
    }
  }
}

const viewReport = (row) => {
  ElMessage.info('成绩报告功能开发中...')
}

const handleSizeChange = (size) => {
  console.log('改变每页显示数量:', size)
  pagination.size = size
  pagination.current = 1
  loadSessions()
}

const handleCurrentChange = (page) => {
  console.log('改变当前页码:', page)
  pagination.current = page
  loadSessions()
}

// 生命周期
onMounted(async () => {
  await Promise.all([
    loadUserStats(),
    loadSessions()
  ])
  
  // 延迟检测表格滚动条
  setTimeout(() => {
    const tableElement = document.querySelector('.data-table-container .el-table')
    if (tableElement) {
      console.log('🔍 开始分析表格滚动条...')
      const analysis = scrollbarDebugger.analyzeTable(tableElement)
      
      if (analysis?.recommendations?.length > 0) {
        console.log('⚠️ 发现滚动条问题，尝试应用修复...')
        scrollbarDebugger.applyQuickFix(tableElement)
        
        // 再次检测修复效果
        setTimeout(() => {
          const fixAnalysis = scrollbarDebugger.analyzeTable(tableElement)
          const summary = scrollbarDebugger.generateSummary()
          console.log('✅ 修复效果分析:', summary)
        }, 500)
      }
    }
  }, 1000)
})
</script>

<style scoped>
/* 🎯 统计面板样式 */
.stats-section {
  margin-bottom: 24px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
}

/* 🎯 表格样式 */
.session-link {
  font-weight: 500;
  text-decoration: none;
}

.session-link:hover {
  text-decoration: underline;
}

.progress-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.progress-text {
  font-size: 12px;
  color: #718096;
  white-space: nowrap;
  font-weight: 500;
}

.score-cell {
  font-weight: 600;
  color: #38a169;
  font-size: 14px;
}

.time-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #4a5568;
}

.time-cell .el-icon {
  color: #718096;
}

/* 表格容器样式 */
:deep(.el-table) {
  width: 100% !important;
  border-radius: 8px;
  overflow: hidden;
}

:deep(.el-table__body-wrapper) {
  overflow-y: auto;
  min-height: 200px;
  max-height: calc(100vh - 400px);
}

/* 🎯 操作按钮组样式 */
.action-buttons-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}

.action-button {
  min-width: 64px;
  height: 32px;
  padding: 6px 12px;
  font-size: 12px;
  border-radius: 6px;
  border: 1px solid;
  transition: all 0.2s ease;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.action-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0,0,0,0.15);
}

.action-button .el-icon {
  font-size: 14px;
}

/* 🎯 详情内容样式 */
.detail-content {
  padding: 16px 0;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}
</style> 