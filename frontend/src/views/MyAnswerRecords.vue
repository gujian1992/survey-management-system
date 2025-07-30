<template>
  <div class="my-answer-records">
    <!-- 1. 顶部标题 -->
    <div class="page-header">
      <h1>我的答题记录</h1>
    </div>

    <!-- 2. 统计卡片 -->
    <div class="stat-cards">
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Document /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.total }}</div>
          <div class="stat-label">总答题次数</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><CircleCheck /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.completed }}</div>
          <div class="stat-label">已完成</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Star /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.averageScore }}</div>
          <div class="stat-label">平均得分</div>
          <div class="stat-trend">↑ 0%</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <el-icon><Timer /></el-icon>
        </div>
        <div class="stat-info">
          <div class="stat-value">{{ statistics.totalDuration }}分钟</div>
          <div class="stat-label">总用时</div>
        </div>
      </div>
    </div>

    <!-- 3. 筛选器 -->
    <div class="filter-section">
      <div class="filter-header">
        <h2>智能筛选</h2>
      </div>
      <div class="filter-content">
        <div class="filter-row">
          <div class="filter-item">
            <span class="filter-label">状态</span>
            <el-select v-model="filter.status" placeholder="全部状态" clearable>
              <el-option label="全部状态" value="" />
              <el-option label="未开始" value="0" />
              <el-option label="进行中" value="1" />
              <el-option label="已完成" value="2" />
              <el-option label="已超时" value="3" />
              <el-option label="已放弃" value="4" />
            </el-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">题型</span>
            <el-select v-model="filter.type" placeholder="全部题型" clearable>
              <el-option label="全部题型" value="" />
              <el-option
                v-for="type in questionTypeOptions"
                :key="type.value"
                :label="type.label"
                :value="type.value"
              />
            </el-select>
          </div>
          <div class="filter-item">
            <span class="filter-label">时间范围</span>
            <el-date-picker
              v-model="filter.dateRange"
              type="daterange"
              range-separator="至"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              style="width: 320px"
            />
          </div>
          <div class="filter-actions">
            <el-button type="primary" @click="handleSearch">搜索</el-button>
            <el-button @click="handleReset">重置</el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 4. 数据表格 -->
    <div class="table-section">
      <div class="table-header">
        <h2>数据列表</h2>
        <span class="total-count">共 {{ pagination.total }} 条记录</span>
      </div>
      <el-table
        v-loading="loading"
        :data="records"
        style="width: 100%"
      >
        <el-table-column prop="sessionCode" label="会话编码" min-width="180" show-overflow-tooltip />
        <el-table-column prop="questionType" label="题型" width="120">
          <template #default="{ row }">
            {{ row.questionTypeName }}
          </template>
        </el-table-column>
        <el-table-column prop="duration" label="答题用时" width="120">
          <template #default="{ row }">
            {{ formatDuration(row.duration) }}
          </template>
        </el-table-column>
        <el-table-column prop="score" label="得分" width="100">
          <template #default="{ row }">
            {{ row.score || 0 }}分
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="getStatusType(row.status)">
              {{ getStatusText(row.status) }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="startTime" label="开始时间" width="180">
          <template #default="{ row }">
            {{ formatDateTime(row.startTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" fixed="right">
          <template #default="{ row }">
            <el-button
              type="primary"
              link
              @click="viewDetail(row)"
            >
              详情
            </el-button>
          </template>
        </el-table-column>
      </el-table>
      
      <!-- 分页器 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.current"
          v-model:page-size="pagination.size"
          :total="pagination.total"
          :page-sizes="[10, 20, 50, 100]"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { List, Document, CircleCheck, Star, Timer } from '@element-plus/icons-vue'
import { answerSessionApi } from '@/api/answerSession'
import { formatDateTime } from '@/utils/format'

const loading = ref(false)
const statistics = ref({
  total: 0,
  completed: 0,
  averageScore: 0,
  totalDuration: 0
})
const filter = ref({
  type: '',
  status: '',
  dateRange: []
})
const questionTypeOptions = ref([
  { value: '混合', label: '混合' },
  { value: '单选题', label: '单选题' },
  { value: '多选题', label: '多选题' },
  { value: '填空题', label: '填空题' },
  { value: '简答题', label: '简答题' },
  { value: '评分题', label: '评分题' }
])
const records = ref([])
const pagination = ref({
  current: 1,
  size: 10,
  total: 0
})

const router = useRouter()

onMounted(() => {
  loadData()
})

// 加载数据
async function loadData() {
  try {
    loading.value = true
    // 1. 加载统计数据
    const statsRes = await answerSessionApi.getMyStats()
    if (statsRes?.data) {
      statistics.value = {
        total: statsRes.data.totalSessions || 0,
        completed: statsRes.data.completedSessions || 0,
        averageScore: statsRes.data.averageScore || 0,
        totalDuration: Math.floor((statsRes.data.totalDuration || 0) / 60)
      }
    }

    // 2. 加载答题记录
    const params = {
      current: pagination.value.current,
      size: pagination.value.size,
      ...getFilterParams()
    }
    const res = await answerSessionApi.getMySessionList(params)
    if (res?.data) {
      records.value = res.data.records || []
      pagination.value.total = res.data.total || 0
    }
  } catch (error) {
    console.error('加载数据失败:', error)
    ElMessage.error('加载数据失败')
  } finally {
    loading.value = false
  }
}

// 获取筛选参数
function getFilterParams() {
  const params = {}
  if (filter.value.status) {
    params.status = filter.value.status
  }
  if (filter.value.type) {
    params.questionType = filter.value.type
  }
  if (filter.value.dateRange && filter.value.dateRange.length === 2) {
    params.startTime = filter.value.dateRange[0]
    params.endTime = filter.value.dateRange[1]
  }
  return params
}

// 处理搜索
function handleSearch() {
  pagination.value.current = 1
  loadData()
}

// 处理重置
function handleReset() {
  filter.value = {
    status: '',
    type: '',
    dateRange: null
  }
  pagination.value.current = 1
  loadData()
}

function getQuestionTypeName(type) {
  const types = {
    1: '单选题',
    2: '多选题',
    3: '填空题',
    4: '简答题',
    5: '评分题'
  }
  return types[type] || '未知题型'
}

function getStatusType(status) {
  const types = {
    0: 'info',
    1: 'warning',
    2: 'success',
    3: 'danger',
    4: 'info'
  }
  return types[status] || 'info'
}

function getStatusText(status) {
  const texts = {
    0: '未开始',
    1: '进行中',
    2: '已完成',
    3: '已超时',
    4: '已放弃'
  }
  return texts[status] || '未知状态'
}

function formatDuration(duration) {
  if (!duration) return '0秒'
  if (duration < 60) {
    return `${duration}秒`
  }
  const minutes = Math.floor(duration / 60)
  const seconds = duration % 60
  return `${minutes}分${seconds}秒`
}

function viewDetail(row) {
  router.push({
    path: `/answer-records/${row.sessionCode}`,
  })
}

// 处理页码变化
function handleCurrentChange(page) {
  pagination.value.current = page
  loadData()
}

// 处理每页条数变化
function handleSizeChange(size) {
  pagination.value.size = size
  pagination.value.current = 1
  loadData()
}
</script>

<style scoped>
.my-answer-records {
  padding: 20px;
  background: #f5f7fa;
}

.page-header {
  background: linear-gradient(135deg, #6c5ce7 0%, #a363d9 100%);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.page-header h1 {
  color: white;
  font-size: 24px;
  margin: 0;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: rgba(108, 92, 231, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 16px;
}

.stat-icon .el-icon {
  font-size: 24px;
  color: #6c5ce7;
}

.stat-info {
  flex: 1;
}

.stat-value {
  font-size: 24px;
  font-weight: 600;
  color: #2d3436;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 14px;
  color: #636e72;
}

.stat-trend {
  font-size: 12px;
  color: #00b894;
  margin-top: 4px;
}

.filter-section {
  background: white;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.filter-header {
  margin-bottom: 24px;
}

.filter-header h2 {
  font-size: 18px;
  color: #2c3e50;
  margin: 0;
}

.filter-content {
  padding: 0 12px;
}

.filter-row {
  display: flex;
  align-items: flex-start;
  flex-wrap: wrap;
  margin: 0 -12px;
}

.filter-item {
  padding: 0 12px;
  margin-bottom: 16px;
  min-width: 200px;
}

.filter-label {
  display: block;
  font-size: 14px;
  color: #606266;
  margin-bottom: 8px;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-left: auto;
  padding-top: 22px;
}

.table-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
}

.table-header h2 {
  font-size: 18px;
  color: #2d3436;
  margin: 0;
}

.total-count {
  color: #636e72;
  font-size: 14px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}

@media (max-width: 1200px) {
  .stat-cards {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .my-answer-records {
    padding: 16px;
  }

  .stat-cards {
    grid-template-columns: 1fr;
  }

  .filter-section {
    padding: 20px;
  }

  .filter-content {
    padding: 0;
  }

  .filter-row {
    margin: 0;
    flex-direction: column;
  }

  .filter-item {
    width: 100%;
    padding: 0;
    margin-bottom: 16px;
  }

  .filter-actions {
    width: 100%;
    justify-content: flex-end;
    padding-top: 0;
  }
}
</style> 