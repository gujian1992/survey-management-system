<template>
  <div class="start-answer-page">
    <div class="page-header">
      <h1 class="page-title">开始答题</h1>
      <p class="page-subtitle">选择题型和参数，开始您的学习之旅</p>
    </div>

    <div class="content-container">
      <!-- 题型选择 -->
      <div class="section">
        <h2 class="section-title">选择题型</h2>
        <div class="type-grid">
          <div 
            v-for="type in questionTypes" 
            :key="type.id"
            :class="[
              'type-item',
              { 
                'selected': examConfig.selectedTypes.includes(type.id),
                'disabled': !type.available
              }
            ]"
            @click="type.available && toggleQuestionType(type.id)"
          >
            <div class="type-icon">
              <el-icon :size="20">
                <component :is="type.icon" />
              </el-icon>
            </div>
            <div class="type-content">
              <div class="type-name">{{ type.name }}</div>
              <div class="type-count">{{ type.count }}题</div>
            </div>
            <div class="type-check" v-if="examConfig.selectedTypes.includes(type.id)">
              <el-icon :size="16"><Check /></el-icon>
            </div>
          </div>
        </div>
      </div>

      <!-- 考试设置 -->
      <div class="section">
        <h2 class="section-title">考试设置</h2>
        <div class="settings-row">
          <div class="setting-item">
            <label>题目数量</label>
            <el-select 
              v-model="examConfig.questionCount" 
              placeholder="请选择题目数量"
              :disabled="!examConfig.selectedTypes.length"
              style="width: 100%"
            >
              <el-option
                v-for="count in availableQuestionCounts"
                :key="count"
                :label="`${count}题`"
                :value="count"
              />
            </el-select>
          </div>
          <div class="setting-item">
            <label>考试时长</label>
            <el-input-number 
              v-model="examConfig.duration" 
              :min="15" 
              :max="180"
            />
            <span class="unit">分钟</span>
          </div>
        </div>
      </div>

      <!-- 考试须知 -->
      <!-- <div class="section">
        <h2 class="section-title">考试须知</h2>
        <div class="notice-list">
          <div v-for="(notice, index) in examNotices" :key="index" class="notice-item">
            {{ index + 1 }}. {{ notice }}
          </div>
        </div>
      </div> -->

      <!-- 开始按钮 -->
      <div class="action-section">
        <div class="agreement-container">
          <el-checkbox v-model="examConfig.agreedToRules" class="agreement">
            我已阅读并同意遵守上述考试规则
          </el-checkbox>
        </div>
        <div class="button-container">
          <el-button 
            type="primary" 
            size="large"
            :loading="startLoading"
            :disabled="!canStart"
            @click="startExam"
            class="start-btn"
          >
            {{ startLoading ? '正在准备...' : '开始答题' }}
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Check, Select, Edit, Document, Star, CaretRight } from '@element-plus/icons-vue'
import { answerSessionApi } from '@/api/answerSession'
import { questionBankApi } from '@/api/questionBank'
import { 
  QUESTION_TYPES,
  QUESTION_TYPE_OPTIONS,
  QUESTION_TYPE_NAMES
} from '@/constants/questionTypes'
import { ANSWER_COUNT_OPTIONS } from '@/constants/answerSession'

// 组件名称
defineOptions({
  name: 'StartAnswer'
})

const router = useRouter()

// 响应式数据
const startLoading = ref(false)
const questionStats = ref(null)

const examNotices = [
  '请确保网络连接稳定，避免考试中断。',
  '请独立完成考试，不得查阅资料或与他人交流。',
  '考试过程中请勿刷新或关闭页面。',
  '系统会自动保存答案，无需手动保存。',
  '如遇系统问题，请及时与监考老师联系。'
]

// 题型配置 - 从后端数据动态生成
const questionTypes = ref([
  {
    id: QUESTION_TYPES.SINGLE_CHOICE,
    name: '单选题',
    description: '从多个选项中选择一个正确答案',
    icon: 'Check',
    count: 0,
    available: false
  },
  {
    id: QUESTION_TYPES.MULTIPLE_CHOICE,
    name: '多选题',
    description: '从多个选项中选择多个正确答案',
    icon: 'Select',
    count: 0,
    available: false
  },
  {
    id: QUESTION_TYPES.FILL_BLANK,
    name: '填空题',
    description: '在空白处填写正确答案',
    icon: 'Edit',
    count: 0,
    available: false
  },
  {
    id: QUESTION_TYPES.SHORT_ANSWER,
    name: '简答题',
    description: '根据题目要求作答',
    icon: 'Document',
    count: 0,
    available: false
  },
  {
    id: QUESTION_TYPES.RATING,
    name: '评分题',
    description: '根据评分标准进行评分',
    icon: 'Star',
    count: 0,
    available: false
  }
])

const examConfig = ref({
  selectedTypes: [], // 选中的题型
  questionCount: 5,
  duration: 60,
  agreedToRules: false
})

// 计算属性
const maxQuestions = computed(() => {
  if (!examConfig.value.selectedTypes.length) return 0
  return examConfig.value.selectedTypes.reduce((sum, typeId) => {
    const type = questionTypes.value.find(t => t.id === typeId)
    return sum + (type?.count || 0)
  }, 0)
})

const availableQuestionCounts = computed(() => {
  const max = maxQuestions.value
  if (max === 0) return []
  
  const counts = []
  for (let i = 5; i <= Math.min(max, 50); i += 5) {
    counts.push(i)
  }
  return counts
})

const canStart = computed(() => {
  return examConfig.value.selectedTypes.length > 0 && 
         examConfig.value.questionCount > 0 && 
         examConfig.value.questionCount <= maxQuestions.value &&
         examConfig.value.duration >= 15 && 
         examConfig.value.duration <= 180 &&
         examConfig.value.agreedToRules
})

// 方法
const getTypeIconColor = (type) => {
  if (!type.available) return '#C0C4CC'
  if (examConfig.value.selectedTypes.includes(type.id)) return '#409EFF'
  return '#909399'
}

const loadQuestionStats = async () => {
  try {
    const response = await questionBankApi.getQuestionTypeStats()
    if (response && response.data && response.data.typeStats) {
      // 更新题型统计数据
      questionTypes.value.forEach(type => {
        const stat = response.data.typeStats.find(s => Number(s.type) === type.id)
        if (stat) {
          type.count = stat.count
          type.available = stat.count > 0
        }
      })
    }
  } catch (error) {
    console.error('加载题库统计失败:', error)
    ElMessage.error('加载题库统计失败')
  }
}

const toggleQuestionType = (typeId) => {
  const index = examConfig.value.selectedTypes.indexOf(typeId)
  if (index === -1) {
    examConfig.value.selectedTypes.push(typeId)
  } else {
    examConfig.value.selectedTypes.splice(index, 1)
  }
}

const startExam = async () => {
  if (!canStart.value) {
    ElMessage.warning('请完善考试配置')
    return
  }

  try {
    startLoading.value = true
    
    const response = await answerSessionApi.startAnswerSession({
      questionTypes: examConfig.value.selectedTypes,
      questionCount: examConfig.value.questionCount,
      timeoutMinutes: examConfig.value.duration
    })
    
    if (response && response.data) {
      ElMessage.success('考试开始')
      router.push(`/answer-session/${response.data.sessionCode}`)
    }
  } catch (error) {
    console.error('开始考试失败:', error)
    
    // 处理现有会话冲突
    if (error.response?.data?.code === 6202) { // 存在进行中的会话
      try {
        await ElMessageBox.confirm(
          '检测到您有正在进行的答题会话，是否要放弃当前会话并开始新的答题？',
          '发现进行中的会话',
          {
            confirmButtonText: '放弃并重新开始',
            cancelButtonText: '继续之前的答题',
            type: 'warning'
          }
        )
        
        // 用户选择重新开始，后端会自动处理旧会话
        const retryResponse = await answerSessionApi.startAnswerSession({
          questionTypes: examConfig.value.selectedTypes,
          questionCount: examConfig.value.questionCount,
          timeoutMinutes: examConfig.value.duration
        })
        
        if (retryResponse && retryResponse.data) {
          ElMessage.success('新的考试已开始')
          router.push(`/answer-session/${retryResponse.data.sessionCode}`)
        }
      } catch (confirmError) {
        if (confirmError === 'cancel') {
          // 用户选择继续之前的答题，跳转到记录页面让用户选择
          router.push('/my-records')
        }
      }
      return
    }
    
    // 题库不足错误
    if (error.response?.data?.code === 6203) {
      ElMessage.error('选择的题型中可用题目不足，请调整题目数量或选择其他题型')
      return
    }
    
    // 网络错误
    if (!navigator.onLine) {
      ElMessage.error('网络连接异常，请检查网络后重试')
      return
    }
    
    // 其他错误
    const errorMessage = error.response?.data?.message || '开始考试失败，请稍后重试'
    ElMessage.error(errorMessage)
  } finally {
    startLoading.value = false
  }
}

// 监听选中题型变化，自动调整题目数量
watch(() => examConfig.value.selectedTypes, () => {
  const max = maxQuestions.value
  if (examConfig.value.questionCount > max && max > 0) {
    examConfig.value.questionCount = Math.min(max, 20)
  }
}, { deep: true })

// 生命周期
onMounted(() => {
  loadQuestionStats()
})
</script>

<style scoped>
.start-answer-page {
  max-width: 900px;
  margin: 0 auto;
  padding: 30px 24px 60px;
  background: #fafbfc;
  min-height: 100vh;
}

.page-header {
  text-align: center;
  margin-bottom: 40px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e1e5e9;
}

.page-title {
  font-size: 28px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 8px;
  letter-spacing: -0.5px;
}

.page-subtitle {
  font-size: 15px;
  color: #6c757d;
  font-weight: 400;
}

.content-container {
  background: #ffffff;
  border-radius: 12px;
  padding: 35px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #e1e5e9;
}

.section {
  margin-bottom: 35px;
}

.section:last-child {
  margin-bottom: 0;
}

.section-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 20px;
  position: relative;
}

.type-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
  gap: 16px;
  margin-bottom: 0;
}

.type-item {
  display: flex;
  align-items: center;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: #ffffff;
  min-height: 70px;
}

.type-item:hover:not(.disabled) {
  border-color: #007bff;
  background: #f8f9ff;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 123, 255, 0.1);
}

.type-item.selected {
  border-color: #007bff;
  background: #f8f9ff;
  box-shadow: 0 0 0 1px #007bff;
}

.type-item.disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: #f8f9fa;
}

.type-icon {
  margin-right: 14px;
  color: #6c757d;
  font-size: 18px;
}

.type-item.selected .type-icon {
  color: #007bff;
}

.type-content {
  flex: 1;
}

.type-name {
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 3px;
}

.type-count {
  font-size: 13px;
  color: #6c757d;
}

.type-check {
  color: #007bff;
  font-size: 16px;
}

.settings-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 0;
}

.setting-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
  border: 2px solid #e9ecef;
  border-radius: 8px;
  background: #ffffff;
  transition: all 0.2s ease;
  min-height: 100px;
  justify-content: center;
}

.setting-item:hover {
  border-color: #007bff;
  background: #f8f9ff;
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 123, 255, 0.1);
}

.setting-item label {
  display: block;
  font-size: 15px;
  font-weight: 600;
  color: #1a1a1a;
  margin-bottom: 12px;
  text-align: center;
}

.unit {
  margin-left: 8px;
  font-size: 13px;
  color: #6c757d;
  font-weight: 500;
}

.setting-item .el-select,
.setting-item .el-input-number {
  margin-top: 6px;
}

.setting-item .el-input-number {
  display: flex;
  justify-content: center;
  align-items: center;
}

.action-section {
  margin-top: 40px !important;
  padding-top: 30px !important;
  border-top: 2px solid #f8f9fa;
  text-align: center;
}

.agreement-container {
  margin-bottom: 25px !important;
  padding: 18px !important;
  background: #f8f9ff;
  border-radius: 8px;
  border: 1px solid #e3f2fd;
}

.agreement {
  font-size: 14px !important;
  color: #495057;
  font-weight: 500;
}

.button-container {
  margin-top: 15px !important;
}

.start-btn {
  min-width: 180px !important;
  height: 46px !important;
  font-size: 16px !important;
  font-weight: 600;
  border-radius: 8px;
  background: #007bff;
  border: 2px solid #007bff;
  color: white;
  transition: all 0.2s ease;
  box-shadow: 0 3px 10px rgba(0, 123, 255, 0.2) !important;
}

.start-btn:hover:not(:disabled) {
  background: #0056b3;
  border-color: #0056b3;
  transform: translateY(-2px);
  box-shadow: 0 5px 14px rgba(0, 123, 255, 0.3) !important;
}

.start-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  background: #6c757d;
  border-color: #6c757d;
  transform: none;
  box-shadow: none;
}

/* Element Plus 组件样式覆盖 */
:deep(.el-input-number) {
  width: 100%;
  max-width: 160px;
  margin: 0 auto;
}

:deep(.el-input-number .el-input__inner) {
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  border: 1px solid #ddd;
  border-radius: 6px;
  height: 40px;
  background: #ffffff;
}

:deep(.el-input-number .el-input__inner:focus) {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

:deep(.el-input-number .el-input-number__decrease),
:deep(.el-input-number .el-input-number__increase) {
  background: #ffffff;
  border: 1px solid #ddd;
  color: #495057;
  border-radius: 4px;
  width: 28px;
  height: 28px;
  margin: 6px;
}

:deep(.el-input-number .el-input-number__decrease:hover),
:deep(.el-input-number .el-input-number__increase:hover) {
  background: #f8f9ff;
  border-color: #007bff;
  color: #007bff;
}

:deep(.el-select) {
  width: 100%;
  max-width: 160px;
  margin: 0 auto;
}

:deep(.el-select .el-input__inner) {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a1a;
  border: 1px solid #ddd;
  border-radius: 6px;
  height: 40px;
  text-align: center;
  background: #ffffff;
}

:deep(.el-select .el-input__inner:focus) {
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1);
}

:deep(.el-select-dropdown__item) {
  font-size: 16px;
  color: #1a1a1a;
  text-align: center;
  font-weight: 500;
}

:deep(.el-select-dropdown__item.selected) {
  color: #007bff;
  background-color: #f8f9ff;
  font-weight: 600;
}

:deep(.el-checkbox__label) {
  font-size: 15px;
  color: #495057;
  font-weight: 500;
}

:deep(.el-checkbox__inner) {
  width: 18px;
  height: 18px;
  border: 2px solid #dee2e6;
  border-radius: 4px;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner) {
  background-color: #007bff;
  border-color: #007bff;
}

:deep(.el-checkbox__input.is-checked .el-checkbox__inner::after) {
  border-color: #ffffff;
}

/* 改善设置项的输入框样式 */
.setting-item :deep(.el-input-number .el-input__inner) {
  border: 1px solid #ddd !important;
  height: 40px !important;
  background: #ffffff !important;
}

.setting-item :deep(.el-input-number .el-input__inner:focus) {
  border-color: #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1) !important;
}

.setting-item :deep(.el-select .el-input__inner) {
  border: 1px solid #ddd !important;
  height: 40px !important;
  background: #ffffff !important;
}

.setting-item :deep(.el-select .el-input__inner:focus) {
  border-color: #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1) !important;
}

.setting-item :deep(.el-input-number .el-input-number__decrease),
.setting-item :deep(.el-input-number .el-input-number__increase) {
  background: #ffffff !important;
  border: 1px solid #ddd !important;
  width: 28px !important;
  height: 28px !important;
  margin: 6px !important;
  border-radius: 4px !important;
}

.setting-item :deep(.el-input-number .el-input-number__decrease:hover),
.setting-item :deep(.el-input-number .el-input-number__increase:hover) {
  background: #f8f9ff !important;
  border-color: #007bff !important;
  color: #007bff !important;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .start-answer-page {
    padding: 25px 16px 50px;
  }

  .content-container {
    padding: 25px 20px;
  }

  .page-title {
    font-size: 24px;
  }

  .page-header {
    margin-bottom: 30px;
  }

  .type-grid {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .settings-row {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .setting-item {
    padding: 18px;
    min-height: 90px;
  }

  .start-btn {
    width: 100%;
    max-width: 280px;
  }

  .section {
    margin-bottom: 30px;
  }

  .action-section {
    margin-top: 35px !important;
  }
}

@media (max-width: 480px) {
  .page-title {
    font-size: 22px;
  }
  
  .content-container {
    padding: 20px 16px;
  }

  .section-title {
    font-size: 16px;
  }

  .type-item {
    padding: 16px;
    min-height: 60px;
  }

  .setting-item {
    padding: 16px;
    min-height: 80px;
  }
}

/* 设置项样式优化 */
.setting-item :deep(.el-input-number .el-input__inner) {
  border: 1px solid #ddd !important;
  height: 40px !important;
  background: #ffffff !important;
  box-shadow: none !important;
}

.setting-item :deep(.el-input-number .el-input__inner:focus) {
  border-color: #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1) !important;
}

.setting-item :deep(.el-select .el-input__inner) {
  border: 1px solid #ddd !important;
  height: 40px !important;
  background: #ffffff !important;
  box-shadow: none !important;
}

.setting-item :deep(.el-select .el-input__inner:focus) {
  border-color: #007bff !important;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.1) !important;
}

.setting-item :deep(.el-input-number .el-input-number__decrease),
.setting-item :deep(.el-input-number .el-input-number__increase) {
  background: #ffffff !important;
  border: 1px solid #ddd !important;
  width: 28px !important;
  height: 28px !important;
  margin: 6px !important;
  border-radius: 4px !important;
}

.setting-item :deep(.el-input-number .el-input-number__decrease:hover),
.setting-item :deep(.el-input-number .el-input-number__increase:hover) {
  background: #f8f9ff !important;
  border-color: #007bff !important;
  color: #007bff !important;
}
</style>