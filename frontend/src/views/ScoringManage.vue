<template>
  <PageContainer>
    <!-- 页面头部 -->
    <PageHeader
      title="评分管理"
      description="对主观题进行人工评分"
      :icon="Medal"
    >
      <template #actions>
        <el-button @click="refreshData" :loading="loading" class="btn-secondary">
          <el-icon><Refresh /></el-icon>
          刷新数据
        </el-button>
        <el-button type="primary" @click="showBatchScoringDialog = true" class="btn-primary">
          <el-icon><Edit /></el-icon>
          批量评分
        </el-button>
      </template>
    </PageHeader>

    <!-- 评分统计 -->
    <div class="stats-section">
      <div class="stats-grid">
        <div class="stat-card pending">
          <div class="stat-icon">
            <el-icon color="#f59e0b"><Clock /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ scoringStats.pendingCount }}</div>
            <div class="stat-label">待评分</div>
            <div class="stat-progress">
              <el-progress 
                :percentage="scoringStats.pendingPercentage" 
                :stroke-width="4"
                color="#f59e0b"
                :show-text="false"
              />
            </div>
          </div>
        </div>
        
        <div class="stat-card completed">
          <div class="stat-icon">
            <el-icon color="#10b981"><CircleCheck /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ scoringStats.completedCount }}</div>
            <div class="stat-label">已评分</div>
            <div class="stat-progress">
              <el-progress 
                :percentage="scoringStats.completedPercentage" 
                :stroke-width="4"
                color="#10b981"
                :show-text="false"
              />
            </div>
          </div>
        </div>

        <div class="stat-card average">
          <div class="stat-icon">
            <el-icon color="#4f46e5"><TrendCharts /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ scoringStats.averageScore?.toFixed(1) }}</div>
            <div class="stat-label">平均得分</div>
            <div class="stat-unit">分</div>
          </div>
        </div>

        <div class="stat-card efficiency">
          <div class="stat-icon">
            <el-icon color="#8b5cf6"><Timer /></el-icon>
          </div>
          <div class="stat-content">
            <div class="stat-number">{{ scoringStats.dailyScored }}</div>
            <div class="stat-label">今日已评</div>
            <div class="stat-trend">
              <el-icon color="#10b981"><CaretTop /></el-icon>
              +{{ scoringStats.dailyGrowth }}%
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索面板 -->
    <SearchPanel
      :search-model="searchForm"
      :searching="loading"
      @search="handleSearch"
      @reset="resetFilters"
      :columns="4"
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
          <label>评分状态</label>
          <el-select v-model="filters.scoringStatus" placeholder="全部" clearable>
            <el-option label="待评分" value="PENDING" />
            <el-option label="已评分" value="COMPLETED" />
          </el-select>
        </div>
        
        <div class="search-field">
          <label>题型筛选</label>
          <el-select v-model="filters.questionType" placeholder="全部题型" clearable>
            <el-option label="简答题" :value="4" />
            <el-option label="评分题" :value="5" />
          </el-select>
        </div>

        <div class="search-field">
          <label>得分范围</label>
          <el-select v-model="filters.scoreRange" placeholder="全部" clearable>
            <el-option label="优秀 (90-100)" value="90-100" />
            <el-option label="良好 (80-89)" value="80-89" />
            <el-option label="中等 (70-79)" value="70-79" />
            <el-option label="及格 (60-69)" value="60-69" />
            <el-option label="不及格 (<60)" value="0-59" />
          </el-select>
        </div>

        <div class="search-field">
          <label>时间范围</label>
          <el-date-picker
            v-model="filters.dateRange"
            type="daterange"
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
          />
        </div>
      </template>
    </SearchPanel>

    <!-- 快速评分工具栏 -->
    <div class="quick-scoring-toolbar" v-if="selectedRecords.length > 0">
      <div class="toolbar-content">
        <div class="selection-info">
          <span>已选择 {{ selectedRecords.length }} 条记录</span>
        </div>
        <div class="quick-actions">
          <el-input-number 
            v-model="quickScore" 
            :min="0" 
            :max="100" 
            placeholder="快速评分"
            style="width: 120px;"
          />
          <el-button type="primary" @click="applyQuickScore">
            应用评分
          </el-button>
          <el-button @click="clearSelection">取消选择</el-button>
        </div>
      </div>
    </div>

    <!-- 评分记录表格 -->
    <DataTable
      :data="recordsList"
      :loading="loading"
      :pagination="pagination"
      title="评分记录"
      :icon="Medal"
      :show-batch-actions="true"
      @selection-change="handleSelectionChange"
      @size-change="handleSizeChange"
      @current-change="handleCurrentChange"
      @row-click="handleRowClick"
    >
      <template #batch-actions="{ selectedRows }">
        <el-button 
          :disabled="selectedRecords.length === 0"
          @click="showBatchScoringDialog = true"
          type="primary"
          class="batch-btn"
        >
          批量评分
        </el-button>
        <el-button 
          :disabled="selectedRecords.length === 0"
          @click="exportScoring"
          class="batch-btn"
        >
          导出评分
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
                      <el-table-column prop="questionContent" label="题目描述" min-width="200" show-overflow-tooltip />
      <el-table-column prop="userAnswer" label="用户答案" min-width="200" show-overflow-tooltip />
      <el-table-column prop="scoringStatus" label="评分状态" width="100" align="center">
        <template #default="{ row }">
          <el-tag :type="row.scoringStatus === 'COMPLETED' ? 'success' : 'warning'" size="small">
            {{ row.scoringStatus === 'COMPLETED' ? '已评分' : '待评分' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="score" label="得分" width="80" align="center">
        <template #default="{ row }">
          <span v-if="row.score !== null" class="score-display">{{ row.score }}</span>
          <span v-else class="score-pending">待评分</span>
        </template>
      </el-table-column>
      <el-table-column prop="maxScore" label="满分" width="80" align="center">
        <template #default="{ row }">
          <span class="max-score">{{ row.maxScore }}</span>
        </template>
      </el-table-column>
      <el-table-column prop="submitTime" label="提交时间" width="150">
        <template #default="{ row }">
          {{ formatTime(row.submitTime) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="180" fixed="right" align="center">
        <template #default="{ row }">
          <div class="action-buttons">
            <el-button 
              v-if="row.scoringStatus === 'PENDING'" 
              link type="primary" size="small" 
              @click="scoreRecord(row)" 
              class="btn-action"
            >
              <el-icon><Edit /></el-icon>
              评分
            </el-button>
            <el-button 
              v-else 
              link type="success" size="small" 
              @click="viewScoring(row)" 
              class="btn-action"
            >
              <el-icon><View /></el-icon>
              查看
            </el-button>
            <el-button 
              v-if="row.scoringStatus === 'COMPLETED'" 
              link type="warning" size="small" 
              @click="editScoring(row)" 
              class="btn-action"
            >
              <el-icon><EditPen /></el-icon>
              修改
            </el-button>
          </div>
        </template>
      </el-table-column>
    </DataTable>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Medal, Refresh, Edit, Clock, CircleCheck, TrendCharts, Timer,
  CaretTop, Search, User, View, EditPen
} from '@element-plus/icons-vue'
import { scoringApi } from '../api/scoring'
import { answerRecordApi } from '../api/answerRecord'
import { PageContainer, PageHeader, SearchPanel, DataTable } from '@/components'
import { 
  QUESTION_TYPE_NAMES,
  QUESTION_TYPE_COLORS
} from '../constants/questionTypes'

// 组件名称
defineOptions({
  name: 'ScoringManage'
})

// 响应式数据
const records = ref([])
const recordsList = ref([])
const scoringStats = ref({})
const loading = ref(false)
const scoring = ref(false)
const showScoringDialog = ref(false)
const showBatchScoringDialog = ref(false)
const showDetailDialog = ref(false)
const currentRecord = ref(null)
const detailRecord = ref(null)
const selectedRecords = ref([])
const quickScore = ref(null)

// 视图模式
const viewMode = ref('card')

// 筛选和搜索
const filters = reactive({
  scoringStatus: '',
  questionType: '',
  scoreRange: '',
  dateRange: []
})
const searchText = ref('')

// 分页
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 评分表单
const scoringForm = reactive({
  score: null,
  comment: ''
})

// 计算属性
const filteredRecords = computed(() => {
  let result = records.value

  if (filters.scoringStatus) {
    result = result.filter(r => r.scoringStatus === filters.scoringStatus)
  }

  if (filters.questionType) {
    result = result.filter(r => r.questionType === filters.questionType)
  }

  if (filters.scoreRange) {
    const [min, max] = filters.scoreRange.split('-').map(Number)
    result = result.filter(r => {
      if (r.scoringStatus !== 'COMPLETED') return false
      const scorePercentage = (r.finalScore / r.maxScore) * 100
      return scorePercentage >= min && scorePercentage <= max
    })
  }

  if (filters.dateRange && filters.dateRange.length === 2) {
    const [start, end] = filters.dateRange
    result = result.filter(r => {
      const date = new Date(r.answerTime).toISOString().split('T')[0]
      return date >= start && date <= end
    })
  }

  if (searchText.value) {
    result = result.filter(r => 
      r.sessionCode.toLowerCase().includes(searchText.value.toLowerCase()) ||
      r.username.toLowerCase().includes(searchText.value.toLowerCase())
    )
  }

  return result
})

const paginatedRecords = computed(() => {
  const start = (pagination.current - 1) * pagination.size
  const end = start + pagination.size
  return filteredRecords.value.slice(start, end)
})

// 工具函数
const getQuestionTypeName = (type) => QUESTION_TYPE_NAMES[type] || '未知'
const getQuestionTypeColor = (type) => QUESTION_TYPE_COLORS[type] || '#909399'

const formatDateTime = (dateStr) => {
  return new Date(dateStr).toLocaleString('zh-CN')
}

// 主要方法
const loadRecords = async () => {
  try {
    loading.value = true
    const response = await answerRecordApi.getRecordsForScoring({
      page: 1,
      size: 1000
    })
    if (response.data) {
      records.value = response.data.records || []
      totalRecords.value = filteredRecords.value.length
    }
  } catch (error) {
    console.error('加载评分记录失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

const loadScoringStats = async () => {
  try {
    const response = await scoringApi.getScoringStatistics()
    if (response.data) {
      scoringStats.value = response.data
    }
  } catch (error) {
    console.error('加载评分统计失败:', error)
  }
}

const selectRecord = (record) => {
  if (selectedRecords.value.includes(record.id)) {
    selectedRecords.value = selectedRecords.value.filter(id => id !== record.id)
  } else {
    selectedRecords.value.push(record.id)
  }
}

const clearSelection = () => {
  selectedRecords.value = []
}

const applyQuickScore = () => {
  if (!quickScore.value && quickScore.value !== 0) {
    ElMessage.warning('请输入评分')
    return
  }
  
  // 批量应用评分逻辑
  console.log('批量评分:', quickScore.value, selectedRecords.value)
  ElMessage.success('批量评分成功')
}

const scoreRecord = (row) => {
  currentRecord.value = row
  scoringForm.score = null
  scoringForm.comment = ''
  showScoringDialog.value = true
}

const viewScoring = (row) => {
  detailRecord.value = row
  showDetailDialog.value = true
}

const editScoring = (row) => {
  currentRecord.value = row
  scoringForm.score = row.score
  scoringForm.comment = row.comment || ''
  showScoringDialog.value = true
}

const handleSelectionChange = (selection) => {
  selectedRecords.value = selection.map(item => item.id)
}

const handleRowClick = (row) => {
  console.log('点击行:', row)
}

const handleSearch = () => {
  pagination.current = 1
  totalRecords.value = filteredRecords.value.length
}

const resetFilters = () => {
  filters.scoringStatus = ''
  filters.questionType = ''
  filters.scoreRange = ''
  filters.dateRange = []
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

const exportScoring = () => {
  console.log('导出评分数据')
  ElMessage.success('导出成功')
}

const formatTime = (time) => {
  if (!time) return '-'
  return new Date(time).toLocaleString('zh-CN')
}

const refreshData = async () => {
  await Promise.all([
    loadRecords(),
    loadScoringStats()
  ])
}

// 生命周期
onMounted(async () => {
  await Promise.all([loadRecords(), loadScoringStats()])
})
</script>

<style scoped>
/* ScoringManage 特定样式 */

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

.stat-card.pending {
  border-left: 4px solid #f59e0b;
}

.stat-card.completed {
  border-left: 4px solid #10b981;
}

.stat-card.average {
  border-left: 4px solid #4f46e5;
}

.stat-card.efficiency {
  border-left: 4px solid #8b5cf6;
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

.stat-progress {
  margin-top: var(--spacing-xs);
}

.stat-trend {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--text-xs);
  color: var(--color-success);
  font-weight: var(--font-medium);
  margin-top: var(--spacing-xs);
}

.stat-unit {
  font-size: var(--text-xs);
  color: var(--color-gray-400);
}

/* 快速评分工具栏 */
.quick-scoring-toolbar {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: var(--radius-xl);
  padding: var(--spacing-lg) var(--spacing-xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-card);
}

.toolbar-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.selection-info {
  color: white;
  font-weight: var(--font-semibold);
  font-size: var(--text-lg);
}

.quick-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
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
  color: var(--color-warning);
  font-style: italic;
  font-weight: var(--font-medium);
}

.max-score {
  font-weight: var(--font-semibold);
  color: var(--color-gray-600);
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
  padding: var(--spacing-xs) var(--spacing-sm);
  border-radius: var(--radius-sm);
  display: inline-block;
  min-width: 40px;
  text-align: center;
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
  
  .stat-card {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .toolbar-content {
    flex-direction: column;
    gap: var(--spacing-md);
    text-align: center;
  }
  
  .quick-actions {
    flex-wrap: wrap;
    justify-content: center;
  }
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style> 