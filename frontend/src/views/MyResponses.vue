<template>
  <div class="my-responses">
    <div class="page-header">
      <h2>我的答题记录</h2>
      <p>查看您已完成的问卷答题记录</p>
    </div>

    <div v-if="loading" class="loading-container" v-loading="loading">
      <div style="height: 200px;"></div>
    </div>

    <div v-else-if="responses.length === 0" class="empty-container">
      <el-empty description="暂无答题记录" />
    </div>

    <div v-else class="responses-list">
      <el-card 
        v-for="response in responses" 
        :key="response.id"
        class="response-card"
        shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <span class="questionnaire-title">{{ response.questionnaireTitle }}</span>
            <el-tag 
              :type="getStatusType(response.status)"
              size="small"
            >
              {{ getStatusText(response.status) }}
            </el-tag>
          </div>
        </template>

        <div class="response-content">
          <div class="response-info">
            <div class="info-row">
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>提交时间：{{ formatDate(response.submitTime) }}</span>
              </div>
              
              <div class="info-item">
                <el-icon><Document /></el-icon>
                <span>答题数量：{{ response.answerCount }} 题</span>
              </div>
            </div>
            
            <div class="info-row">
              <div class="info-item">
                <el-icon><Clock /></el-icon>
                <span>用时：{{ response.durationText || response.duration || '未知' }}</span>
              </div>
              
              <div v-if="response.totalScore !== null" class="info-item">
                <el-icon><Star /></el-icon>
                <span>得分：{{ response.totalScore }} 分</span>
              </div>
            </div>

            <div v-if="response.totalScore !== null" class="info-row">
              <div class="info-item">
                <el-icon><Medal /></el-icon>
                <span>等级：</span>
                <el-tag 
                  :type="getGradeType(response.grade)"
                  size="small">
                  {{ response.grade }} - {{ getGradeName(response.grade) }}
                </el-tag>
              </div>
              
              <div class="info-item">
                <el-icon><Check /></el-icon>
                <span>结果：</span>
                <el-tag 
                  :type="response.isPassed ? 'success' : 'danger'"
                  size="small">
                  {{ response.isPassed ? '通过' : '未通过' }}
                </el-tag>
              </div>
            </div>
          </div>

          <div v-if="response.note" class="response-note">
            <p><strong>备注：</strong>{{ response.note }}</p>
          </div>
        </div>

        <template #footer>
          <div class="card-footer">
            <el-button 
              type="primary" 
              size="small"
              @click="viewDetail(response.id)"
            >
              <el-icon><View /></el-icon>
              查看详情
            </el-button>
            
            <el-button 
              v-if="response.feedback"
              type="info" 
              size="small"
              @click="viewFeedback(response)"
            >
              <el-icon><ChatDotRound /></el-icon>
              查看评语
            </el-button>
            
            <el-button 
              v-if="response.canResubmit"
              type="warning" 
              size="small"
              @click="resubmit(response.questionnaireId)"
            >
              <el-icon><Edit /></el-icon>
              重新填写
            </el-button>
          </div>
        </template>
      </el-card>
    </div>

    <!-- 分页 -->
    <div v-if="total > pageSize" class="pagination">
      <el-pagination
        v-model:current-page="currentPage"
        v-model:page-size="pageSize"
        :page-sizes="[10, 20, 50]"
        :total="total"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>

    <!-- 评语弹窗 -->
    <el-dialog
      v-model="feedbackDialog.visible"
      title="评语反馈"
      width="500px">
      
      <div class="feedback-content">
        <div class="score-info">
          <h4>评分信息</h4>
          <el-row :gutter="20">
            <el-col :span="8">
              <div class="score-item">
                <label>总分</label>
                <div class="score-value">{{ feedbackDialog.data.totalScore }}分</div>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="score-item">
                <label>等级</label>
                <el-tag :type="getGradeType(feedbackDialog.data.grade)">
                  {{ feedbackDialog.data.grade }}
                </el-tag>
              </div>
            </el-col>
            <el-col :span="8">
              <div class="score-item">
                <label>结果</label>
                <el-tag :type="feedbackDialog.data.isPassed ? 'success' : 'danger'">
                  {{ feedbackDialog.data.isPassed ? '通过' : '未通过' }}
                </el-tag>
              </div>
            </el-col>
          </el-row>
        </div>

        <div v-if="feedbackDialog.data.subScores" class="sub-scores">
          <h4>分项评分</h4>
          <div class="sub-score-list">
            <div v-if="feedbackDialog.data.subScores.completeness" class="sub-score-item">
              <span>完整性：{{ feedbackDialog.data.subScores.completeness }}分</span>
            </div>
            <div v-if="feedbackDialog.data.subScores.accuracy" class="sub-score-item">
              <span>准确性：{{ feedbackDialog.data.subScores.accuracy }}分</span>
            </div>
            <div v-if="feedbackDialog.data.subScores.quality" class="sub-score-item">
              <span>质量：{{ feedbackDialog.data.subScores.quality }}分</span>
            </div>
          </div>
        </div>

        <div class="feedback-text">
          <h4>评语反馈</h4>
          <div class="feedback-message">
            {{ feedbackDialog.data.feedback }}
          </div>
        </div>

        <div v-if="feedbackDialog.data.scorerName" class="scorer-info">
          <p class="text-muted">
            评分者：{{ feedbackDialog.data.scorerName }} | 
            评分时间：{{ formatDate(feedbackDialog.data.scoreTime) }}
          </p>
        </div>
      </div>

      <template #footer>
        <el-button @click="feedbackDialog.visible = false">关闭</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { recordsApi } from '@/api/records'

// 组件名称，用于keep-alive
defineOptions({
  name: 'MyResponses'
})

const router = useRouter()

const loading = ref(true)
const responses = ref([])
const currentPage = ref(1)
const pageSize = ref(10)
const total = ref(0)

// 评语弹窗
const feedbackDialog = reactive({
  visible: false,
  data: {}
})

onMounted(async () => {
  await loadResponses()
  
  // 监听全局状态清理事件
  window.addEventListener('pageStateCleanup', handlePageCleanup)
  window.addEventListener('routeStateCleanup', handleRouteCleanup)
})

// 组件激活时刷新数据（从其他页面返回时）
onActivated(async () => {
  // 重新加载数据，确保状态是最新的
  await loadResponses()
})

// 组件销毁前清理状态和事件监听
onBeforeUnmount(() => {
  loading.value = false
  responses.value = []
  feedbackDialog.visible = false
  
  // 移除事件监听
  window.removeEventListener('pageStateCleanup', handlePageCleanup)
  window.removeEventListener('routeStateCleanup', handleRouteCleanup)
})

// 处理页面状态清理
const handlePageCleanup = (event) => {
  if (event.detail?.route === 'MyResponses') {
    // 清理当前页面状态
    feedbackDialog.visible = false
    loading.value = false
  }
}

// 处理路由状态清理
const handleRouteCleanup = (event) => {
  // 如果有冲突的路由切换，清理状态
  if (event.detail?.from === 'MyResponses') {
    feedbackDialog.visible = false
  }
}

const loadResponses = async () => {
  try {
    loading.value = true
    const response = await recordsApi.getRecords({
      page: currentPage.value,
      size: pageSize.value
    })
    
    responses.value = response.data.records || []
    total.value = response.data.total || 0
    
  } catch (error) {
    ElMessage.error('获取答题记录失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const statusMap = {
    completed: 'success',
    draft: 'warning',
    timeout: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    completed: '已完成',
    draft: '草稿',
    timeout: '超时'
  }
  return statusMap[status] || '未知'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const viewDetail = (responseId) => {
  router.push(`/response/detail/${responseId}`)
}

const resubmit = (questionnaireId) => {
  router.push(`/questionnaire/fill/${questionnaireId}`)
}

const handleSizeChange = (newSize) => {
  pageSize.value = newSize
  currentPage.value = 1
  loadResponses()
}

const handleCurrentChange = (newPage) => {
  currentPage.value = newPage
  loadResponses()
}

// 查看评语
const viewFeedback = (response) => {
  feedbackDialog.data = response
  feedbackDialog.visible = true
}

// 获取等级类型
const getGradeType = (grade) => {
  const typeMap = {
    'A': 'success',
    'B': 'success',
    'C': 'warning',
    'D': 'danger'
  }
  return typeMap[grade] || ''
}

// 获取等级名称
const getGradeName = (grade) => {
  const nameMap = {
    'A': '优秀',
    'B': '良好',
    'C': '及格',
    'D': '不及格'
  }
  return nameMap[grade] || grade
}
</script>

<style scoped>
.my-responses {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  color: #303133;
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.loading-container {
  height: 300px;
  position: relative;
}

.empty-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.responses-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.response-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
}

.response-card:hover {
  transform: translateY(-2px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.questionnaire-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.response-content {
  padding: 0 0 20px 0;
}

.response-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 14px;
}

.info-item .el-icon {
  font-size: 16px;
}

.response-note {
  margin-top: 15px;
  padding: 12px;
  background-color: #f5f7fa;
  border-radius: 6px;
  border-left: 3px solid #409EFF;
}

.response-note p {
  margin: 0;
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
}

.card-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}

.feedback-content {
  max-height: 500px;
  overflow-y: auto;
}

.feedback-content h4 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.score-info {
  margin-bottom: 20px;
}

.score-item {
  text-align: center;
}

.score-item label {
  display: block;
  margin-bottom: 5px;
  color: #909399;
  font-size: 12px;
}

.score-value {
  font-size: 18px;
  font-weight: bold;
  color: #409eff;
}

.sub-scores {
  margin-bottom: 20px;
  padding: 15px;
  background: #f5f7fa;
  border-radius: 6px;
}

.sub-score-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.sub-score-item {
  padding: 8px 12px;
  background: white;
  border-radius: 4px;
  border-left: 3px solid #409eff;
}

.feedback-text {
  margin-bottom: 20px;
}

.feedback-message {
  padding: 15px;
  background: #f9f9f9;
  border-radius: 6px;
  line-height: 1.6;
  color: #606266;
  min-height: 60px;
}

.scorer-info {
  padding-top: 15px;
  border-top: 1px solid #ebeef5;
}

.scorer-info .text-muted {
  margin: 0;
  color: #909399;
  font-size: 12px;
  text-align: center;
}
</style> 