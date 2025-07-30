<template>
  <PageContainer class="start-answer-page">
    <div class="header-banner">
      <div class="icon-wrapper">
        <el-icon><EditPen /></el-icon>
      </div>
      <div class="header-content">
        <h1 class="header-title">开始答题</h1>
        <div class="header-subtitle">配置并开始您的练习</div>
      </div>
    </div>

    <div class="config-panel">
      <div class="config-form">
        <div class="form-content">
          <!-- 题型选择 -->
          <div class="form-group">
            <label class="form-label">题型选择</label>
            <el-select
              v-model="selectedTypes"
              multiple
              placeholder="请选择题型"
              class="type-select"
              :loading="loading"
              :disabled="loading"
            >
              <el-option
                v-for="type in questionTypes"
                :key="type.value"
                :label="type.label"
                :value="type.value"
                :disabled="!type.available"
              >
                <div class="type-option-content">
                  <el-icon><Document /></el-icon>
                  <span>{{ type.label }}</span>
                  <span class="question-count" v-if="type.count > 0">({{ type.count }}题)</span>
                  <span class="question-count unavailable" v-else>(暂无题目)</span>
                </div>
              </el-option>
            </el-select>
            <div class="form-hint">可选择多个题型组合</div>
          </div>

          <!-- 题目数量和考试时长 -->
          <div class="form-row">
            <div class="form-group">
              <label class="form-label">题目数量</label>
              <el-select
                v-model="questionCount"
                placeholder="请选择题目数量"
                class="count-select"
                :disabled="loading || selectedTypes.length === 0"
              >
                <el-option
                  v-for="count in availableQuestionCounts"
                  :key="count"
                  :label="`${count}题`"
                  :value="count"
                />
              </el-select>
            </div>

            <div class="form-group">
              <label class="form-label">考试时长</label>
              <el-select
                v-model="duration"
                placeholder="请选择考试时长"
                class="duration-select"
                :disabled="loading || selectedTypes.length === 0"
              >
                <el-option
                  v-for="time in examDurations"
                  :key="time"
                  :label="`${time}分钟`"
                  :value="time"
                />
              </el-select>
            </div>
          </div>
        </div>

        <!-- 开始按钮区域 -->
        <div class="start-section">
          <el-checkbox 
            v-model="hasReadRules" 
            :disabled="loading"
            class="agreement-checkbox"
          >
            我已了解考试规则并同意开始
          </el-checkbox>
          
          <el-button 
            type="primary" 
            size="large"
            :loading="loading"
            :disabled="!canStart"
            @click="startExam"
            class="start-exam-btn"
          >
            <el-icon v-if="!loading" class="start-icon"><Timer /></el-icon>
            {{ loading ? '正在准备考试...' : '开始考试' }}
          </el-button>
        </div>
      </div>
    </div>
  </PageContainer>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Select, Edit, Document, Star, CaretRight, Grid, Setting, Clock, Timer, EditPen } from '@element-plus/icons-vue'
import PageContainer from '@/components/layout/PageContainer.vue'
import PageHeader from '@/components/base/PageHeader.vue'
import { answerSessionAPI } from '@/api'
import { questionBankAPI } from '@/api'
import { useUserStore } from '@/store/user'
import { 
  QUESTION_TYPES,
  QUESTION_TYPE_OPTIONS,
  QUESTION_TYPE_NAMES
} from '@/constants/questionTypes'
import { ANSWER_COUNT_OPTIONS } from '@/constants/answerSession'
import ConfigCard from '@/components/base/ConfigCard.vue'
import { debounce } from '@/utils/debounce'

// 组件名称
defineOptions({
  name: 'StartAnswer'
})

const router = useRouter()
const userStore = useUserStore()

// 响应式数据
const startLoading = ref(false)
const questionStats = ref(null)
const currentStep = ref(1)

const examNotices = [
  '请确保网络连接稳定，避免考试中断。',
  '请独立完成考试，不得查阅资料或与他人交流。',
  '考试过程中请勿刷新或关闭页面。',
  '系统会自动保存答案，无需手动保存。',
  '如遇系统问题，请及时与监考老师联系。'
]

// 题型选项
const questionTypes = ref([
  { value: 'single', label: '单选题', icon: 'Document', count: 0, available: true },
  { value: 'multiple', label: '多选题', icon: 'Document', count: 0, available: true },
  { value: 'fill', label: '填空题', icon: 'Document', count: 0, available: true },
  { value: 'short', label: '简答题', icon: 'Document', count: 0, available: true },
  { value: 'score', label: '评分题', icon: 'Document', count: 0, available: true }
])

// 题型ID映射
const typeMapping = {
  'single': 1,
  'multiple': 2,
  'fill': 3,
  'short': 4,
  'score': 5
}

// 表单数据
const selectedTypes = ref([])
const questionCount = ref(10)
const duration = ref(60)
const hasReadRules = ref(false)
const loading = ref(false)

// 可选项
const examDurations = [30, 45, 60, 90, 120]

// 计算属性
const maxQuestions = computed(() => {
  if (!selectedTypes.value.length) return 0
  
  // 获取所选题型中题目数量总和
  return selectedTypes.value.reduce((sum, typeId) => {
    const type = questionTypes.value.find(t => t.value === typeId)
    return sum + (type?.count || 0)
  }, 0)
})

const availableQuestionCounts = computed(() => {
  const max = maxQuestions.value
  if (max === 0) return []
  
  const counts = []
  for (let i = 5; i <= max; i += 5) {
    counts.push(i)
  }
  return counts
})

const canStart = computed(() => {
  const hasAvailableTypes = selectedTypes.value.every(type => {
    const typeInfo = questionTypes.value.find(t => t.value === type)
    return typeInfo && typeInfo.available
  })

  return selectedTypes.value.length > 0 && 
         questionCount.value > 0 && 
         questionCount.value <= maxQuestions.value &&
         duration.value >= 15 && 
         duration.value <= 180 &&
         hasReadRules.value &&
         hasAvailableTypes
})

// 方法
const getTypeIconColor = (type) => {
  if (!type.available) return '#C0C4CC'
  if (selectedTypes.value.includes(type.value)) return '#409EFF'
  return '#909399'
}

// 检查登录状态
const checkAuth = async () => {
  if (!userStore.isLoggedIn) {
    ElMessage.warning('请先登录后再开始答题')
    router.push('/login')
    return false
  }
  return true
}

// 加载题库统计
const loadQuestionStats = async () => {
  if (!await checkAuth()) return
  
  loading.value = true
  try {
    const response = await questionBankAPI.getStats()
    console.log('题库统计响应数据:', response)
    const { typeStats } = response.data
    
    // 更新题型数量和可用性
    questionTypes.value = questionTypes.value.map(type => {
      const stat = typeStats.find(s => s.type === typeMapping[type.value])
      return {
        ...type,
        count: stat?.count || 0,
        available: (stat?.count || 0) > 0
      }
    })
    
    console.log('更新后的题型数据:', questionTypes.value)
  } catch (error) {
    console.error('加载题库统计失败:', error)
    ElMessage.error('加载题库统计失败，请稍后重试')
  } finally {
    loading.value = false
  }
}

const toggleQuestionType = (typeId) => {
  const index = selectedTypes.value.indexOf(typeId)
  if (index === -1) {
    selectedTypes.value.push(typeId)
  } else {
    selectedTypes.value.splice(index, 1)
  }
}

// 防抖处理开始考试操作
const debouncedStartExam = debounce(async () => {
  if (startLoading.value) return
  
  try {
    startLoading.value = true
    
    // 在路由切换前进行清理
    await router.push({
      name: 'AnswerQuestion',
      params: {
        types: selectedTypes.value.join(','),
        count: questionCount.value,
        duration: duration.value
      }
    })
  } catch (error) {
    console.error('开始考试失败:', error)
    ElMessage.error('开始考试失败，请重试')
  } finally {
    startLoading.value = false
  }
}, 300)

// 组件挂载时添加路由守卫
let removeRouteGuard
onMounted(() => {
  removeRouteGuard = router.beforeEach((to, from, next) => {
    if (from.name === 'StartAnswer' && startLoading.value) {
      next(false)
      return
    }
    next()
  })
  loadQuestionStats()
})

// 组件卸载时清理
onBeforeUnmount(() => {
  if (removeRouteGuard) {
    removeRouteGuard()
  }
})

// 新增方法
const getTypeName = (typeId) => {
  const type = questionTypes.value.find(t => t.value === typeId)
  return type ? type.label : ''
}

// 监听选中题型变化，更新步骤
watch(() => selectedTypes.value.length, (newLength) => {
  if (newLength > 0) {
    currentStep.value = Math.max(currentStep.value, 2)
  } else {
    currentStep.value = 1
  }
})

// 监听配置变化，更新步骤
watch(() => [questionCount.value, duration.value], () => {
  if (selectedTypes.value.length > 0) {
    currentStep.value = Math.max(currentStep.value, 3)
  }
})

// 监听选中题型变化，更新题目数量
watch(selectedTypes, (newTypes) => {
  if (newTypes.length === 0) {
    // 如果没有选择题型，重置题目数量
    questionCount.value = 10
    return
  }
  
  const max = maxQuestions.value
  // 如果当前选择的题目数量超过了新的最大值，调整为最接近的合法值
  if (questionCount.value > max) {
    const validCounts = availableQuestionCounts.value
    if (validCounts.length > 0) {
      questionCount.value = validCounts[validCounts.length - 1]
    } else {
      questionCount.value = 10 // 默认值
    }
  }
}, { immediate: true })

// 开始考试
const startExam = async () => {
  if (!canStart.value) return
  
  try {
    loading.value = true
    
    // 转换题型格式
    const mappedTypes = selectedTypes.value.map(type => typeMapping[type])
    console.log('转换后的题型:', mappedTypes)
    
    // 开始答题会话
    const response = await answerSessionAPI.start({
      questionTypes: mappedTypes,
      questionCount: questionCount.value,
      timeoutMinutes: duration.value
    })
    
    if (!response?.data?.sessionCode) {
      throw new Error('创建答题会话失败')
    }
    
    // 跳转到答题页面
    router.push(`/answer-session/${response.data.sessionCode}`)
  } catch (error) {
    console.error('开始答题失败:', error)
    ElMessage.error(error.message || '开始答题失败，请重试')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.start-answer-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(135deg, #f5f7fa 0%, #e4e7eb 100%);
  padding: 24px;
  position: relative;
  z-index: 1;
  isolation: isolate;
}

.config-panel {
  flex: 1;
  width: 100%;
  max-width: 960px;
  margin: 16px auto 0;
  position: relative;
  z-index: 2;
}

.config-form {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  padding: 40px;
  transform: translateZ(0);
  will-change: transform;
}

/* 顶部标题区域样式 */
.header-banner {
  background: linear-gradient(135deg, #7c8aec 0%, #9d7bea 100%);
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-wrapper {
  width: 48px;
  height: 48px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon-wrapper .el-icon {
  font-size: 24px;
  color: white;
}

.header-content {
  flex: 1;
}

.header-title {
  font-size: 20px;
  font-weight: 600;
  color: white;
  margin-bottom: 4px;
}

.header-subtitle {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.8);
}

.form-content {
  max-width: 800px;
  margin: 0 auto;
}

.form-group {
  margin-bottom: 32px;
}

.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 8px;
}

.form-hint {
  font-size: 13px;
  color: #64748b;
  margin-top: 8px;
}

.form-select {
  width: 100%;
}

/* 题型选择样式 */
.type-select {
  width: 100%;
}

.type-option-content {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.type-option-content .el-icon {
  font-size: 16px;
  color: #7c8aec;
}

.question-count {
  font-size: 13px;
  color: #64748b;
  margin-left: 4px;
}

.question-count.unavailable {
  color: #ef4444;
}

:deep(.el-select-dropdown__item) {
  padding: 8px 12px;
}

:deep(.el-select-dropdown__item.is-disabled) {
  opacity: 0.6;
}

:deep(.el-select .el-select__tags) {
  padding: 4px;
  gap: 4px;
}

:deep(.el-select .el-select__tags-text) {
  font-size: 14px;
  color: #1f2937;
}

:deep(.el-select .el-tag) {
  margin: 2px;
  background-color: #f3f4ff;
  border-color: #e5e7ff;
  color: #7c8aec;
  height: 28px;
  padding: 0 8px;
  font-size: 14px;
  line-height: 26px;
}

:deep(.el-select .el-tag .el-tag__close) {
  color: #7c8aec;
  background-color: transparent;
  font-size: 14px;
  margin-left: 4px;
}

:deep(.el-select .el-tag .el-tag__close:hover) {
  background-color: rgba(124, 138, 236, 0.1);
  color: #7c8aec;
}

/* 下拉选择框样式 */
:deep(.el-select .el-input__wrapper) {
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
  height: 48px;
  padding: 0 16px;
  transition: all 0.2s ease;
}

:deep(.el-select .el-input__wrapper:hover) {
  border-color: #7c8aec;
  background-color: #ffffff;
}

:deep(.el-select .el-input__wrapper.is-focus) {
  border-color: #7c8aec;
  background-color: #ffffff;
  box-shadow: 0 0 0 2px rgba(124, 138, 236, 0.1) !important;
}

:deep(.el-select .el-input__inner) {
  font-size: 14px;
  color: #1f2937;
  height: 48px;
}

:deep(.el-select .el-input__suffix) {
  color: #7c8aec;
  font-size: 16px;
}

/* 开始考试按钮样式 */
.start-exam-btn {
  width: 200px;
  height: 48px;
  background: linear-gradient(135deg, #7c8aec 0%, #9d7bea 100%);
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 500;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(124, 138, 236, 0.1);
}

.start-exam-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(124, 138, 236, 0.2);
  background: linear-gradient(135deg, #6576e8 0%, #8b69e6 100%);
}

.start-exam-btn:active {
  transform: translateY(1px);
  box-shadow: 0 2px 4px rgba(124, 138, 236, 0.1);
}

.start-exam-btn .el-icon {
  font-size: 18px;
  margin-right: 4px;
}

/* 复选框样式 */
:deep(.el-checkbox) {
  --el-checkbox-checked-bg-color: #7c8aec;
  --el-checkbox-checked-border-color: #7c8aec;
  --el-checkbox-checked-text-color: #1f2937;
}

:deep(.el-checkbox__inner) {
  width: 16px;
  height: 16px;
  border-radius: 4px;
  border-color: #d1d5db;
}

:deep(.el-checkbox__inner:hover) {
  border-color: #7c8aec;
}

:deep(.el-checkbox__label) {
  font-size: 14px;
  color: #1f2937;
}

/* 表单布局优化 */
.form-row {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 32px;
}

.form-group {
  margin-bottom: 24px;
}

.form-label {
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
  margin-bottom: 8px;
  display: block;
}

.form-hint {
  font-size: 13px;
  color: #64748b;
  margin-top: 6px;
}

.start-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  margin-top: 24px;
  padding-top: 32px;
  border-top: 1px solid #e2e8f0;
}

.agreement-checkbox {
  font-size: 14px;
}

.start-icon {
  font-size: 18px;
}

@media (max-width: 768px) {
  .config-panel {
    margin-top: 12px;
    padding: 0 16px;
  }

  .config-form {
    padding: 24px;
    border-radius: 12px;
  }

  .form-row {
    grid-template-columns: 1fr;
    gap: 24px;
  }

  .form-group {
    margin-bottom: 24px;
  }

  .start-exam-btn {
    width: 100%;
  }
}

/* 添加页面头部样式 */
:deep(.page-header) {
  margin-bottom: 24px;
}

:deep(.page-header .icon-wrapper) {
  background: rgba(124, 138, 236, 0.1);
  border-radius: 12px;
  padding: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}

:deep(.page-header .header-subtitle) {
  color: #64748b;
  margin-top: 4px;
}
</style>