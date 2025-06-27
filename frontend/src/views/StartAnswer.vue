<template>
  <PageContainer>
    <PageHeader
      title="开始答题"
      description="选择题型和题目数量，开始您的答题练习"
      icon="Edit"
    />

    <div class="start-answer-content">
      <el-row :gutter="30">
        <!-- 左侧：答题配置 -->
        <el-col :span="14">
          <el-card class="config-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><Edit /></el-icon>
                <span>答题设置</span>
              </div>
            </template>

            <el-form
              ref="answerFormRef"
              :model="answerForm"
              :rules="answerRules"
              label-width="120px"
              size="large"
            >
              <el-form-item label="题型选择" prop="questionType">
                <div class="question-type-grid">
                  <div
                    v-for="option in questionTypeOptions"
                    :key="option.value"
                    class="type-card"
                    :class="{ 'selected': answerForm.questionType === option.value }"
                    @click="selectQuestionType(option.value)"
                  >
                    <div class="type-header">
                      <el-radio
                        :model-value="answerForm.questionType"
                        :label="option.value"
                        @change="handleTypeChange"
                      >
                        {{ option.label }}
                      </el-radio>
                    </div>
                    <div class="type-description">
                      {{ getTypeDescription(option.value) }}
                    </div>
                    <div class="type-stats" v-if="questionStats">
                      <span class="stats-text">
                        可用题目: {{ getTypeAvailableCount(option.value) }}道
                      </span>
                    </div>
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="题目数量" prop="totalCount">
                <div class="count-selection">
                  <el-select 
                    v-model="answerForm.totalCount" 
                    placeholder="请选择答题数量"
                    size="large"
                    class="count-select"
                  >
                    <el-option
                      v-for="option in answerCountOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                      :disabled="option.value > availableCount"
                    />
                  </el-select>
                  <div class="count-hint">
                    <el-icon><InfoFilled /></el-icon>
                    建议新手从5-10题开始
                  </div>
                </div>
              </el-form-item>

              <el-form-item label="答题时间" prop="timeoutMinutes">
                <div class="time-selection">
                  <el-input-number
                    v-model="answerForm.timeoutMinutes"
                    :min="10"
                    :max="180"
                    :step="10"
                    controls-position="right"
                    size="large"
                    class="time-input"
                  />
                  <span class="time-unit">分钟</span>
                  <div class="time-hint">
                    <el-icon><Clock /></el-icon>
                    建议60分钟
                  </div>
                </div>
              </el-form-item>
            </el-form>

            <!-- 题库信息展示 -->
            <div v-if="questionStats" class="question-stats">
              <h4>当前题库情况</h4>
              <el-row :gutter="15">
                <el-col :span="8">
                  <MetricCard
                    title="可用题目"
                    :value="availableCount"
                    suffix="道"
                    color="primary"
                    :trend="availableCount >= answerForm.totalCount ? 'up' : 'down'"
                  />
                </el-col>
                <el-col :span="8">
                  <MetricCard
                    title="题目总数"
                    :value="questionStats.total || 0"
                    suffix="道"
                    color="info"
                  />
                </el-col>
                <el-col :span="8">
                  <MetricCard
                    title="题型数量"
                    :value="(questionStats.typeStats || []).length"
                    suffix="种"
                    color="warning"
                  />
                </el-col>
              </el-row>
            </div>

            <!-- 操作按钮 -->
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="large" 
                :loading="startLoading"
                @click="startAnswer"
                :disabled="!canStart"
                class="start-btn"
              >
                <el-icon><CaretRight /></el-icon>
                开始答题
              </el-button>
              <el-button 
                size="large" 
                @click="previewQuestions"
                class="preview-btn"
              >
                <el-icon><View /></el-icon>
                预览题目
              </el-button>
            </div>
          </el-card>
        </el-col>

        <!-- 右侧：我的答题记录和统计 -->
        <el-col :span="10">
          <!-- 我的统计 -->
          <el-card class="stats-card" shadow="hover">
            <template #header>
              <div class="card-header">
                <el-icon><TrendCharts /></el-icon>
                <span>我的统计</span>
              </div>
            </template>
            <div class="user-stats-grid">
              <MetricCard
                title="总答题次数"
                :value="userStats.totalSessions || 0"
                suffix="次"
                color="primary"
                size="small"
              />
              <MetricCard
                title="完成次数"
                :value="userStats.completedSessions || 0"
                suffix="次"
                color="success"
                size="small"
              />
              <MetricCard
                title="平均分数"
                :value="userStats.averageScore || 0"
                suffix="%"
                color="warning"
                size="small"
              />
            </div>
          </el-card>

          <!-- 我的答题记录 -->
          <el-card class="records-card" shadow="hover" style="margin-top: 20px;">
            <template #header>
              <div class="card-header">
                <el-icon><Clock /></el-icon>
                <span>最近答题记录</span>
                <el-button 
                  text 
                  type="primary" 
                  size="small"
                  @click="$router.push('/my-records')"
                >
                  查看更多
                </el-button>
              </div>
            </template>

            <div v-loading="recordsLoading" class="records-content">
              <div v-if="recentSessions.length === 0" class="empty-records">
                <el-empty description="暂无答题记录" :image-size="80">
                  <el-button type="primary" @click="loadRecentSessions">
                    刷新记录
                  </el-button>
                </el-empty>
              </div>
              <div v-else class="sessions-list">
                <div
                  v-for="session in recentSessions"
                  :key="session.id"
                  class="session-item"
                  @click="viewSession(session)"
                >
                  <div class="session-header">
                    <el-tag 
                      :color="getQuestionTypeColor(session.questionType)" 
                      size="small"
                    >
                      {{ getQuestionTypeName(session.questionType) }}
                    </el-tag>
                    <el-tag 
                      :type="getSessionStatusType(session.status)" 
                      size="small"
                    >
                      {{ getSessionStatusName(session.status) }}
                    </el-tag>
                  </div>
                  <div class="session-content">
                    <div class="session-progress">
                      <div class="progress-info">
                        <span>进度: {{ session.currentCount }}/{{ session.totalCount }}</span>
                        <span>得分: {{ session.currentScore || 0 }}分</span>
                      </div>
                      <el-progress 
                        :percentage="Math.round((session.currentCount || 0) / (session.totalCount || 1) * 100)" 
                        :status="session.status === 2 ? 'success' : session.status === 3 ? 'exception' : ''"
                        size="small"
                      />
                    </div>
                    <div class="session-time">
                      {{ formatTime(session.startTime) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { 
  Edit, 
  CaretRight, 
  View, 
  Clock, 
  TrendCharts,
  InfoFilled
} from '@element-plus/icons-vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/base/PageHeader.vue'
import MetricCard from '@/components/statistics/MetricCard.vue'
import { questionBankApi } from '../api/questionBank'
import { answerSessionApi } from '../api/answerSession'
import { 
  QUESTION_TYPE_OPTIONS,
  QUESTION_TYPE_NAMES,
  QUESTION_TYPE_COLORS
} from '../constants/questionTypes'
import { 
  ANSWER_COUNT_OPTIONS,
  DEFAULT_TIMEOUT_MINUTES
} from '../constants/answerSession'
import { formatDateTime } from '@/utils/time'

// 组件名称
defineOptions({
  name: 'StartAnswer'
})

const router = useRouter()

// 响应式数据
const startLoading = ref(false)
const recordsLoading = ref(false)
const answerFormRef = ref()

// 答题配置表单
const answerForm = reactive({
  questionType: 1, // 默认单选题
  totalCount: 10,  // 默认10题
  timeoutMinutes: DEFAULT_TIMEOUT_MINUTES || 60
})

// 表单验证规则
const answerRules = {
  questionType: [
    { required: true, message: '请选择题型', trigger: 'change' }
  ],
  totalCount: [
    { required: true, message: '请选择题目数量', trigger: 'change' }
  ],
  timeoutMinutes: [
    { required: true, message: '请设置答题时间', trigger: 'blur' }
  ]
}

// 数据
const questionStats = ref(null)
const recentSessions = ref([])
const userStats = ref({
  totalSessions: 0,
  completedSessions: 0,
  averageScore: 0
})

// 计算属性
const questionTypeOptions = computed(() => 
  QUESTION_TYPE_OPTIONS.filter(item => item.value !== 0) // 排除混合题型
)

const answerCountOptions = computed(() => ANSWER_COUNT_OPTIONS || [])

const availableCount = computed(() => {
  if (!questionStats.value || !questionStats.value.typeStats) return 0
  const typeStats = questionStats.value.typeStats
  const selectedType = typeStats.find(item => item.type === answerForm.questionType)
  return selectedType ? selectedType.count : 0
})

const canStart = computed(() => {
  return answerForm.questionType && 
         answerForm.totalCount && 
         answerForm.totalCount > 0 &&
         availableCount.value >= answerForm.totalCount
})

// 工具函数
const getQuestionTypeName = (type) => QUESTION_TYPE_NAMES[type] || '未知'
const getQuestionTypeColor = (type) => QUESTION_TYPE_COLORS[type] || '#909399'

const getTypeDescription = (type) => {
  const descriptions = {
    1: '从多个选项中选择一个正确答案',
    2: '从多个选项中选择多个正确答案', 
    3: '填写空白处的正确内容',
    4: '用文字回答问题',
    5: '对题目进行评分或打分'
  }
  return descriptions[type] || ''
}

const getTypeAvailableCount = (type) => {
  if (!questionStats.value || !questionStats.value.typeStats) return 0
  const typeStats = questionStats.value.typeStats
  const selectedType = typeStats.find(item => item.type === type)
  return selectedType ? selectedType.count : 0
}

const getSessionStatusType = (status) => {
  switch (status) {
    case 1: return '' // 进行中
    case 2: return 'success' // 已完成
    case 3: return 'warning' // 已超时
    case 4: return 'danger' // 已放弃
    default: return 'info'
  }
}

const getSessionStatusName = (status) => {
  const statusMap = {
    1: '进行中',
    2: '已完成',
    3: '已超时',
    4: '已放弃'
  }
  return statusMap[status] || '未知'
}

const formatTime = (time) => {
  if (!time) return '-'
  try {
    return formatDateTime(time)
  } catch (error) {
    console.error('时间格式化失败:', error)
    return '-'
  }
}

// 方法
const loadQuestionStats = async () => {
  try {
    const response = await questionBankApi.getQuestionTypeStats()
    if (response && response.data) {
      questionStats.value = response.data
    }
  } catch (error) {
    console.error('加载题库统计失败:', error)
    ElMessage.error('加载题库统计失败')
  }
}

const loadRecentSessions = async () => {
  try {
    recordsLoading.value = true
    const response = await answerSessionApi.getMySessionList({
      current: 1,
      size: 5
    })
    if (response && response.data) {
      recentSessions.value = response.data.records || []
      
      // 计算用户统计
      const sessions = response.data.records || []
      userStats.value = {
        totalSessions: response.data.total || 0,
        completedSessions: sessions.filter(s => s.status === 2).length,
        averageScore: sessions.length > 0 
          ? Math.round(sessions.reduce((sum, s) => sum + (s.finalScore || s.currentScore || 0), 0) / sessions.length)
          : 0
      }
    }
  } catch (error) {
    console.error('加载答题记录失败:', error)
    ElMessage.error('加载答题记录失败')
  } finally {
    recordsLoading.value = false
  }
}

const selectQuestionType = (type) => {
  answerForm.questionType = type
  handleTypeChange()
}

const handleTypeChange = () => {
  // 题型改变时，检查可用题目数量
  const available = availableCount.value
  if (available < answerForm.totalCount) {
    ElMessage.warning(`该题型只有${available}道题目，请调整答题数量`)
    // 自动调整到最大可用数量
    const maxCount = Math.min(available, 30)
    if (maxCount > 0) {
      answerForm.totalCount = maxCount
    }
  }
}

const startAnswer = async () => {
  try {
    if (!answerFormRef.value) {
      ElMessage.error('表单初始化失败')
      return
    }
    
    await answerFormRef.value.validate()
    
    if (availableCount.value < answerForm.totalCount) {
      ElMessage.error('题库中该题型题目不足，请调整答题数量')
      return
    }

    await ElMessageBox.confirm(
      `确定开始答题吗？\n题型：${getQuestionTypeName(answerForm.questionType)}\n数量：${answerForm.totalCount}题\n时间：${answerForm.timeoutMinutes}分钟`,
      '确认开始答题',
      {
        confirmButtonText: '开始',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    
    startLoading.value = true
    
    const response = await answerSessionApi.startAnswerSession(answerForm)
    if (response && response.data) {
      ElMessage.success('答题会话创建成功')
      // 跳转到答题页面
      router.push(`/answer/${response.data.sessionCode}`)
    }
  } catch (error) {
    if (error !== 'cancel') {
      console.error('开始答题失败:', error)
      ElMessage.error('开始答题失败')
    }
  } finally {
    startLoading.value = false
  }
}

const previewQuestions = async () => {
  try {
    const response = await questionBankApi.getRandomQuestions(
      answerForm.questionType, 
      Math.min(answerForm.totalCount, 5) // 最多预览5题
    )
    if (response && response.data) {
      ElMessage.success(`加载了${response.data.length}道预览题目`)
    }
  } catch (error) {
    console.error('加载预览题目失败:', error)
    ElMessage.error('加载预览失败')
  }
}

const viewSession = (session) => {
  try {
    if (session.status === 1) {
      // 进行中的会话，直接跳转继续答题
      router.push(`/answer/${session.sessionCode}`)
    } else {
      // 已完成的会话，跳转查看详情
      router.push(`/my-records?sessionId=${session.id}`)
    }
  } catch (error) {
    console.error('跳转失败:', error)
    ElMessage.error('跳转失败')
  }
}

// 监听题型变化
watch(() => answerForm.questionType, handleTypeChange)

// 生命周期
onMounted(async () => {
  try {
    await Promise.all([
      loadQuestionStats(),
      loadRecentSessions()
    ])
  } catch (error) {
    console.error('页面初始化失败:', error)
  }
})
</script>

<style scoped>
.start-answer-content {
  max-width: 1200px;
  margin: 0 auto;
}

.config-card,
.records-card,
.stats-card {
  border-radius: var(--border-radius-lg);
  border: none;
  box-shadow: var(--shadow-subtle);
  transition: all var(--transition-base);
}

.config-card:hover,
.records-card:hover,
.stats-card:hover {
  box-shadow: var(--shadow-moderate);
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-text-primary);
}

.question-type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}

.type-card {
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  padding: var(--spacing-lg);
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--color-bg-elevated);
}

.type-card:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-subtle);
  transform: translateY(-2px);
}

.type-card.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  box-shadow: var(--shadow-moderate);
}

.type-header {
  margin-bottom: var(--spacing-sm);
}

.type-description {
  font-size: var(--font-size-sm);
  color: var(--color-text-secondary);
  margin-bottom: var(--spacing-sm);
  line-height: 1.5;
}

.type-stats {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.count-selection,
.time-selection {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
}

.count-select,
.time-input {
  flex-shrink: 0;
}

.time-unit {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.count-hint,
.time-hint {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
}

.question-stats {
  margin: var(--spacing-xl) 0;
  padding: var(--spacing-lg);
  background: var(--color-bg-subtle);
  border-radius: var(--border-radius-md);
}

.question-stats h4 {
  margin: 0 0 var(--spacing-md) 0;
  color: var(--color-text-primary);
  font-weight: var(--font-weight-medium);
}

.action-buttons {
  margin-top: var(--spacing-xl);
  text-align: center;
  display: flex;
  gap: var(--spacing-md);
  justify-content: center;
}

.start-btn,
.preview-btn {
  padding: var(--spacing-md) var(--spacing-xl);
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
}

.start-btn {
  background: linear-gradient(135deg, var(--color-primary), var(--color-primary-dark));
  border: none;
}

.user-stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: var(--spacing-sm);
}

.records-content {
  min-height: 200px;
}

.empty-records {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 200px;
}

.sessions-list {
  max-height: 300px;
  overflow-y: auto;
}

.session-item {
  padding: var(--spacing-lg);
  border: 1px solid var(--color-border);
  border-radius: var(--border-radius-md);
  margin-bottom: var(--spacing-md);
  cursor: pointer;
  transition: all var(--transition-base);
  background: var(--color-bg-elevated);
}

.session-item:hover {
  border-color: var(--color-primary);
  box-shadow: var(--shadow-subtle);
  transform: translateY(-1px);
}

.session-item:last-child {
  margin-bottom: 0;
}

.session-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-sm);
}

.session-content {
  margin-top: var(--spacing-md);
}

.session-progress {
  margin-bottom: var(--spacing-sm);
}

.progress-info {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-xs);
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.session-time {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  text-align: right;
}

@media (max-width: 768px) {
  .start-answer-content .el-col {
    margin-bottom: var(--spacing-lg);
  }
  
  .question-type-grid {
    grid-template-columns: 1fr;
  }
  
  .count-selection,
  .time-selection {
    flex-direction: column;
    align-items: flex-start;
  }
  
  .action-buttons {
    flex-direction: column;
  }
  
  .user-stats-grid {
    grid-template-columns: 1fr;
  }
}
</style> 