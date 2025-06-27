<template>
  <div class="questionnaire-answer">
    <div v-if="loading" class="loading-container">
      <el-loading />
    </div>

    <div v-else-if="!questionnaire || !canFillQuestionnaire" class="error-container">
      <el-result
        icon="warning"
        :title="!questionnaire ? '问卷不存在' : '问卷无法填写'"
        :sub-title="!questionnaire ? '请检查问卷链接是否正确' : getCannotFillReason"
      >
        <template #extra>
          <el-button type="primary" @click="goBack">返回</el-button>
        </template>
      </el-result>
    </div>

    <div v-else class="answer-container">
      <!-- 问卷标题和描述 -->
      <div class="questionnaire-header">
        <h1>{{ questionnaire.title }}</h1>
        <p v-if="questionnaire.description" class="description">
          {{ questionnaire.description }}
        </p>
        <div class="questionnaire-meta">
          <el-tag type="info" size="small">
            共 {{ questionnaire.questions.length }} 题
          </el-tag>
          <span v-if="questionnaire.timeLimit" class="time-limit">
            <el-icon><Clock /></el-icon>
            限时 {{ questionnaire.timeLimit }} 分钟
          </span>
          <el-tag 
            v-if="timeStatusInfo" 
            :type="timeStatusInfo.timeStatus === 'active' ? 'success' : 'warning'" 
            size="small"
          >
            {{ timeStatusInfo.timeMessage }}
          </el-tag>
        </div>
      </div>

      <!-- 答题表单 -->
      <el-form
        ref="answerFormRef"
        :model="answers"
        :rules="rules"
        label-width="0"
        class="answer-form"
      >
        <div 
          v-for="(question, index) in questionnaire.questions" 
          :key="`q_${question.id}`"
          class="question-card"
        >
          <!-- 问题标题区域 -->
          <div class="question-header">
            <div class="question-number">{{ index + 1 }}</div>
            <div class="question-title-wrapper">
              <div class="title-row">
                <h4 class="question-title">{{ question.title }}</h4>
                <span v-if="question.required" class="required-badge">*</span>
              </div>
            </div>
          </div>
          
          <div v-if="question.description" class="question-description">
            {{ question.description }}
          </div>

          <el-form-item 
            :prop="`question_${question.id}`"
            :rules="question.required ? [{ required: true, message: '此题为必答题' }] : []"
          >
            <!-- 单选题 -->
            <el-radio-group 
              v-if="Number(question.type) === 1"
              v-model="answers[`question_${question.id}`]"
              class="option-group horizontal-options"
            >
              <el-radio 
                v-for="(option, optionIndex) in question.options" 
                :key="`radio_${question.id}_${optionIndex}`"
                :label="option.value"
                class="modern-option"
              >
                <div class="option-content">
                  <span class="option-label">{{ String.fromCharCode(65 + optionIndex) }}</span>
                  <span class="option-text">{{ option.text }}</span>
                </div>
              </el-radio>
            </el-radio-group>

            <!-- 多选题 -->
            <el-checkbox-group 
              v-else-if="Number(question.type) === 2"
              v-model="answers[`question_${question.id}`]"
              class="option-group horizontal-options"
            >
              <el-checkbox 
                v-for="(option, optionIndex) in question.options" 
                :key="`checkbox_${question.id}_${optionIndex}`"
                :label="option.value"
                class="modern-option"
              >
                <div class="option-content">
                  <span class="option-label">{{ String.fromCharCode(65 + optionIndex) }}</span>
                  <span class="option-text">{{ option.text }}</span>
                </div>
              </el-checkbox>
            </el-checkbox-group>

            <!-- 文本题 -->
            <el-input
              v-else-if="Number(question.type) === 3"
              v-model="answers[`question_${question.id}`]"
              type="textarea"
              :rows="4"
              :placeholder="question.placeholder || '请输入您的答案'"
              :maxlength="question.maxLength || 500"
              show-word-limit
              class="modern-textarea"
            />

            <!-- 评分题 -->
            <el-rate
              v-else-if="Number(question.type) === 4"
              v-model="answers[`question_${question.id}`]"
              :max="question.maxRating || 5"
              show-text
              class="modern-rate"
            />

            <!-- 未知题型 -->
            <div v-else class="unknown-question-type">
              <el-alert
                title="未知的题目类型"
                type="error"
                :description="`题目ID: ${question.id}, 类型: ${question.type}`"
                show-icon
              />
            </div>
          </el-form-item>
        </div>
      </el-form>

      <!-- 提交按钮 -->
      <div class="submit-section">
        <el-button 
          type="primary" 
          size="large"
          :loading="submitting"
          :disabled="!canFillQuestionnaire || submitting"
          @click="submitAnswers"
        >
          {{ submitting ? '提交中...' : '提交问卷' }}
        </el-button>
        
        <el-button 
          size="large" 
          @click="goBack"
        >
          返回
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onBeforeUnmount, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Clock } from '@element-plus/icons-vue'
import { questionnaireAPI, answerAPI } from '@/api'
import { formatDateTime, getQuestionnaireTimeStatus } from '@/utils/time'

const route = useRoute()
const router = useRouter()
const userStore = useUserStore()

const loading = ref(true)
const submitting = ref(false)
const questionnaire = ref(null)
const answerFormRef = ref()
const answers = reactive({})
const rules = reactive({})

// 时间状态检查
const timeStatusInfo = computed(() => {
  if (!questionnaire.value) return null
  return getQuestionnaireTimeStatus(questionnaire.value)
})

// 是否可以填写问卷
const canFillQuestionnaire = computed(() => {
  if (!questionnaire.value) return false
  
  // 必须是已发布状态
  if (questionnaire.value.status !== 1) return false
  
  // 检查时间状态
  const timeStatus = timeStatusInfo.value
  return timeStatus && timeStatus.canFill
})

// 获取无法填写的原因
const getCannotFillReason = computed(() => {
  if (!questionnaire.value) return '问卷不存在'
  
  if (questionnaire.value.status !== 1) {
    const statusMap = { 0: '问卷未发布', 2: '问卷已结束' }
    return statusMap[questionnaire.value.status] || '问卷状态异常'
  }
  
  const timeStatus = timeStatusInfo.value
  if (timeStatus && !timeStatus.canFill) {
    return timeStatus.timeMessage
  }
  
  return '问卷暂时无法填写'
})

// 获取问卷详情
const loadQuestionnaire = async () => {
  try {
    const id = route.params.id
    const res = await questionnaireAPI.getDetail(id)
    
    if (res.code === 200 && res.data) {
      // 确保questions数组的唯一性和正确格式
      const uniqueQuestions = res.data.questions ? [...new Map(
        res.data.questions.map(q => [q.id, q])
      ).values()] : []
      
      // 处理问题选项格式
      const processedData = {
        ...res.data,
        questions: uniqueQuestions.map((question, qIndex) => ({
          ...question,
          id: question.id || `q_${qIndex}`, // 确保每个问题都有唯一ID
          options: Array.isArray(question.options) 
            ? question.options.map((text, index) => ({
                id: `q${question.id}_opt${index}`,
                value: String(index + 1),
                text: text
              }))
            : []
        }))
      }
      
      questionnaire.value = processedData
      initializeAnswers()
    } else {
      questionnaire.value = null
    }
  } catch (error) {
    console.error('获取问卷详情失败:', error)
    ElMessage.error('获取问卷详情失败')
    questionnaire.value = null
  } finally {
    loading.value = false
  }
}

// 初始化答案对象
const initializeAnswers = () => {
  if (!questionnaire.value?.questions) return
  
  // 清空现有答案
  Object.keys(answers).forEach(key => delete answers[key])
  
  // 重新初始化
  questionnaire.value.questions.forEach(question => {
    const key = `question_${question.id}`
    // 根据题目类型初始化答案
    switch (Number(question.type)) {
      case 1: // 单选题
        answers[key] = ''
        break
      case 2: // 多选题
        answers[key] = []
        break
      case 3: // 文本题
        answers[key] = ''
        break
      case 4: // 评分题
        answers[key] = 0
        break
      default:
        answers[key] = ''
    }
  })
}

// 提交答案
const submitAnswers = async () => {
  if (!answerFormRef.value) return
  
  // 再次检查是否可以填写
  if (!canFillQuestionnaire.value) {
    ElMessage.error(getCannotFillReason.value)
    return
  }
  
  try {
    // 验证表单
    await answerFormRef.value.validate()
    
    // 确认提交
    await ElMessageBox.confirm(
      '确定要提交问卷吗？提交后将无法修改。',
      '确认提交',
      {
        confirmButtonText: '确定提交',
        cancelButtonText: '取消',
        type: 'warning',
      }
    )

    submitting.value = true
    
    // 构造提交数据
    const submitData = {
      questionnaireId: questionnaire.value.id,
      answers: Object.entries(answers).map(([key, value]) => ({
        questionId: parseInt(key.replace('question_', '')),
        answerContent: Array.isArray(value) ? value.join(',') : value?.toString() || ''
      }))
    }
    
    const res = await answerAPI.submit(submitData)
    if (res.code === 200) {
      ElMessage.success('提交成功！感谢您的参与。')
      
      // 触发全局数据刷新事件（提交答案会影响统计数据）
      window.dispatchEvent(new CustomEvent('questionnaireDataChanged'))
      
      // 根据用户角色返回到对应页面
      if (userStore.isAdmin) {
        router.push('/questionnaire')
      } else {
        router.push('/questionnaire-fill')
      }
    } else {
      throw new Error(res.message || '提交失败')
    }
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error(error.message || '提交失败，请重试')
      console.error('提交答案失败:', error)
    }
  } finally {
    submitting.value = false
  }
}

// 返回上一页
const goBack = () => {
  // 清理当前页面状态
  loading.value = true
  
  // 根据用户角色智能返回到对应页面
  if (userStore.isAdmin) {
    router.push('/questionnaire')
  } else {
    router.push('/questionnaire-fill')
  }
}

// 页面加载时获取问卷详情
onMounted(() => {
  loadQuestionnaire()
})

// 组件销毁前清理状态，避免缓存问题
onBeforeUnmount(() => {
  // 清理状态，避免页面重叠问题
  loading.value = true
  submitting.value = false
  questionnaire.value = null
  
  // 清空答案数据
  Object.keys(answers).forEach(key => {
    delete answers[key]
  })
  
  // 清空规则
  Object.keys(rules).forEach(key => {
    delete rules[key]
  })
})
</script>

<style scoped>
.questionnaire-answer {
  min-height: calc(100vh - 80px);
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  padding: 0;
}

.loading-container {
  height: 60vh;
  position: relative;
}

.error-container {
  height: 60vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.questionnaire-header {
  background: white;
  padding: 30px;
  border-radius: 12px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.questionnaire-header h1 {
  color: #303133;
  margin: 0 0 15px 0;
  font-size: 28px;
  font-weight: 600;
}

.description {
  color: #606266;
  font-size: 16px;
  line-height: 1.6;
  margin: 0 0 20px 0;
}

.questionnaire-meta {
  display: flex;
  align-items: center;
  gap: 15px;
}

.time-limit {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #f56c6c;
  font-size: 14px;
}

.answer-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.question-card {
  background: white;
  padding: 32px;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  margin-bottom: 20px;
  border: 1px solid rgba(226, 232, 240, 0.8);
  transition: box-shadow 0.3s ease;
}

.question-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.question-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
}

.question-number {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.3);
  flex-shrink: 0;
}

.question-title-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 32px;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 8px;
}

.question-title {
  color: #1f2937;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
}

.required-badge {
  color: #ef4444;
  font-size: 20px;
  font-weight: 700;
  line-height: 1;
  margin-left: 2px;
}

.question-description {
  color: #909399;
  font-size: 14px;
  margin-bottom: 15px;
  line-height: 1.5;
}

/* 横向选项布局 */
.horizontal-options {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
}

.modern-option {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 12px 16px;
  background: #ffffff;
  transition: border-color 0.2s ease;
  cursor: pointer;
  margin: 0;
  min-width: fit-content;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.modern-option:hover {
  border-color: #9ca3af;
}

.modern-option.is-checked {
  border-color: #3b82f6;
  background: #eff6ff;
}

.option-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 18px;
  background: #6b7280;
  color: white;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.modern-option.is-checked .option-label {
  background: #3b82f6;
}

.option-text {
  font-size: 16px;
  color: #1f2937;
  line-height: 1.5;
}

.modern-option.is-checked .option-text {
  font-weight: 500;
}

/* 隐藏Element Plus默认控件 */
.modern-option :deep(.el-radio__input),
.modern-option :deep(.el-checkbox__input) {
  display: none;
}

.modern-option :deep(.el-radio__label),
.modern-option :deep(.el-checkbox__label) {
  padding: 0;
  margin: 0;
}

/* 文本域和评分样式 */
.modern-textarea :deep(.el-textarea__inner) {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 16px;
  transition: all 0.3s ease;
}

.modern-textarea :deep(.el-textarea__inner):focus {
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.modern-rate {
  margin-top: 16px;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  background: #ffffff;
}

.submit-section {
  text-align: center;
  padding: 30px 0;
  display: flex;
  gap: 16px;
  justify-content: center;
}

.unknown-question-type {
  margin-top: 16px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .horizontal-options {
    flex-direction: column;
  }
  
  .modern-option {
    width: 100%;
  }
}
</style> 