<template>
  <div class="questionnaire-preview">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="8" animated />
    </div>

    <!-- 错误状态 -->
    <div v-else-if="!questionnaire" class="error-container">
      <el-result
        icon="warning"
        title="问卷不存在或已过期"
        sub-title="请检查问卷链接是否正确"
      >
        <template #extra>
          <el-button type="primary" @click="$router.back()">返回</el-button>
        </template>
      </el-result>
    </div>

    <!-- 主要内容 -->
    <div v-else class="preview-container">

      <!-- 问卷头部信息 -->
      <div class="questionnaire-header">
        <h1 class="questionnaire-title">{{ questionnaire.title }}</h1>
        <p v-if="questionnaire.description" class="questionnaire-description">
          {{ questionnaire.description }}
        </p>
        
        <!-- 状态和时间信息 -->
        <div class="meta-info">
          <div class="status-tags">
            <el-tag v-if="questionnaire.status === 0" type="info">草稿</el-tag>
            <el-tag v-else-if="questionnaire.status === 1" type="success">已发布</el-tag>
            <el-tag v-else-if="questionnaire.status === 2" type="warning">已结束</el-tag>
            
            <el-tag 
              v-if="timeStatus.timeStatus !== 'unknown'" 
              :type="getTimeStatusTagType(timeStatus.timeStatus)"
              class="time-status-tag"
            >
              {{ timeStatus.timeMessage }}
            </el-tag>
          </div>
          
          <div v-if="questionnaire.startTime || questionnaire.endTime" class="time-info">
            <div v-if="questionnaire.startTime" class="time-item">
              <el-icon class="time-icon"><Clock /></el-icon>
              <span class="time-label">开始时间</span>
              <span class="time-value">{{ formatDateTime(questionnaire.startTime, 'short') }}</span>
            </div>
            <div v-if="questionnaire.endTime" class="time-item">
              <el-icon class="time-icon"><Clock /></el-icon>
              <span class="time-label">结束时间</span>
              <span class="time-value">{{ formatDateTime(questionnaire.endTime, 'short') }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 问题列表 -->
      <div class="questions-container">
        <div 
          v-for="(question, index) in questionnaire.questions" 
          :key="question.id" 
          class="question-card"
        >
          <div class="question-header">
            <div class="question-number-wrapper">
              <div class="question-number">{{ index + 1 }}</div>
            </div>
            <div class="question-title-wrapper">
              <div class="title-row">
                <h4 class="question-title">{{ question.title }}</h4>
                <span v-if="question.required" class="required-badge">*</span>
              </div>
            </div>
          </div>

          <div class="question-content">
            <!-- 单选题 -->
            <div v-if="question.type === 1" class="question-options">
              <el-radio-group v-model="answers[question.id]" disabled class="preview-option-group">
                <el-radio 
                  v-for="(option, optionIndex) in getQuestionOptions(question)" 
                  :key="optionIndex"
                  :label="optionIndex"
                  class="preview-option preview-radio"
                >
                  <div class="option-content">
                    <span class="option-label">{{ String.fromCharCode(65 + optionIndex) }}</span>
                    <span class="option-text">{{ option }}</span>
                  </div>
                </el-radio>
              </el-radio-group>
            </div>

            <!-- 多选题 -->
            <div v-if="question.type === 2" class="question-options">
              <el-checkbox-group v-model="answers[question.id]" disabled class="preview-option-group">
                <el-checkbox 
                  v-for="(option, optionIndex) in getQuestionOptions(question)" 
                  :key="optionIndex"
                  :label="optionIndex"
                  class="preview-option preview-checkbox"
                >
                  <div class="option-content">
                    <span class="option-label">{{ String.fromCharCode(65 + optionIndex) }}</span>
                    <span class="option-text">{{ option }}</span>
                  </div>
                </el-checkbox>
              </el-checkbox-group>
            </div>

            <!-- 填空题 -->
            <div v-if="question.type === 3" class="question-options">
              <el-input
                v-model="answers[question.id]"
                type="textarea"
                :rows="3"
                placeholder="请输入您的答案"
                disabled
                class="textarea-input"
              />
            </div>

            <!-- 下拉选择 -->
            <div v-if="question.type === 4" class="question-options">
              <el-select 
                v-model="answers[question.id]" 
                placeholder="请选择" 
                disabled
                class="select-input"
              >
                <el-option
                  v-for="(option, optionIndex) in getQuestionOptions(question)"
                  :key="optionIndex"
                  :label="getOptionDisplay(question, optionIndex)"
                  :value="option"
                />
              </el-select>
            </div>

            <!-- 评分题 -->
            <div v-if="question.type === 5" class="question-options">
              <el-rate
                v-model="answers[question.id]"
                :max="question.scoreRange === '1-10' ? 10 : 5"
                show-score
                disabled
                class="rate-input"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- 底部操作按钮 -->
      <div class="bottom-actions">
        <el-button 
          type="default" 
          size="large" 
          @click="$router.back()" 
          class="back-btn"
        >
          <el-icon><ArrowLeft /></el-icon>
          返回
        </el-button>
      </div>
    </div>


  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Clock, Star } from '@element-plus/icons-vue'
import { questionnaireAPI } from '../api'
import { formatDateTime, getQuestionnaireTimeStatus, getTimeStatusTagType } from '@/utils/time'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

const questionnaire = ref(null)
const answers = reactive({})

// 计算时间状态
const timeStatus = computed(() => {
  if (!questionnaire.value) {
    return { timeStatus: 'unknown', timeMessage: '', canFill: false }
  }
  return getQuestionnaireTimeStatus(questionnaire.value)
})

// 处理选项数据，兼容新旧格式
const getQuestionOptions = (question) => {
  // 优先使用新格式的选项数据
  if (question.optionList && Array.isArray(question.optionList) && question.optionList.length > 0) {
    return question.optionList.map(option => option.text)
  }
  
  // 如果没有新格式，使用旧格式
  if (question.options && Array.isArray(question.options) && question.options.length > 0) {
    if (typeof question.options[0] === 'string') {
      return question.options
    }
    
    // 如果是对象数组（新格式），提取text字段
    if (typeof question.options[0] === 'object' && question.options[0].text) {
      return question.options.map(option => option.text)
    }
  }
  
  return []
}

// 获取选项的显示文本（带序号）
const getOptionDisplay = (question, index) => {
  // 优先使用新格式的标签
  if (question.optionList && question.optionList[index]) {
    const option = question.optionList[index]
    return `${option.label}. ${option.text}`
  }
  
  // 如果没有新格式，使用旧格式生成标签
  const options = getQuestionOptions(question)
  if (options && options[index]) {
    const label = String.fromCharCode(65 + index) // A, B, C, D...
    return `${label}. ${options[index]}`
  }
  
  return ''
}

const loadQuestionnaire = async () => {
  loading.value = true
  try {
    const id = route.params.id
    const res = await questionnaireAPI.getDetail(id)
    
    if (res.code === 200 && res.data) {
      questionnaire.value = res.data
    } else {
      questionnaire.value = null
      ElMessage.warning('问卷不存在或已过期')
    }
  } catch (error) {
    console.error('获取问卷详情失败:', error)
    ElMessage.error('获取问卷详情失败')
    questionnaire.value = null
  } finally {
    loading.value = false
  }
}



onMounted(() => {
  loadQuestionnaire()
})
</script>

<style scoped>
.questionnaire-preview {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.loading-container, .error-container {
  padding: 60px 20px;
  max-width: 800px;
  margin: 0 auto;
}

.preview-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
}

/* 问卷头部 */
.questionnaire-header {
  background: white;
  border-radius: 12px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.questionnaire-title {
  font-size: 28px;
  font-weight: 600;
  color: #303133;
  margin: 0 0 16px 0;
  line-height: 1.4;
}

.questionnaire-description {
  font-size: 16px;
  color: #606266;
  line-height: 1.6;
  margin: 0 0 24px 0;
  white-space: pre-wrap;
}

.meta-info {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.status-tags {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.time-status-tag {
  font-weight: 500;
}

.time-info {
  display: flex;
  gap: 24px;
  flex-wrap: wrap;
}

.time-item {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.time-icon {
  color: #909399;
}

.time-label {
  color: #606266;
  font-size: 14px;
  font-weight: 500;
}

.time-value {
  color: #303133;
  font-size: 14px;
  font-family: 'Roboto Mono', monospace;
}

/* 问题容器 */
.questions-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  margin-bottom: 32px;
}

.question-card {
  background: white;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.question-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
}

.question-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 24px;
  gap: 0;
}

.question-number-wrapper {
  position: relative;
  margin-right: 20px;
  flex-shrink: 0;
}

.question-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%);
  color: white;
  font-weight: 600;
  font-size: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(79, 70, 229, 0.2);
  position: relative;
  z-index: 1;
}

.question-number::after {
  content: '';
  position: absolute;
  top: 50%;
  left: 100%;
  transform: translateY(-50%);
  width: 12px;
  height: 1px;
  background: #d1d5db;
  margin-left: 8px;
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
  font-size: 16px;
  font-weight: 600;
  line-height: 1.5;
  margin: 0;
  letter-spacing: 0.1px;
}

.required-badge {
  color: #ef4444;
  font-size: 18px;
  font-weight: 700;
  line-height: 1;
  margin-left: 2px;
}

.question-content {
  margin-left: 52px;
  position: relative;
  margin-top: 4px;
}

.question-content::before {
  content: '';
  position: absolute;
  top: -12px;
  left: -32px;
  width: 1px;
  height: calc(100% + 24px);
  background: linear-gradient(to bottom, #d1d5db 0%, transparent 100%);
}

/* 选项布局 */
.question-options {
  margin-top: 20px;
}

/* 预览选项横向布局 */
.preview-option-group.el-radio-group,
.preview-option-group.el-checkbox-group {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  gap: 12px;
  align-items: flex-start;
}

.preview-option-group .preview-option.el-radio,
.preview-option-group .preview-option.el-checkbox {
  display: flex;
  align-items: center;
  flex: 0 0 auto;
  margin: 0;
  border: 2px solid #e5e7eb;
  border-radius: 16px;
  padding: 16px 20px;
  background: #f8f9fa;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  cursor: not-allowed;
  opacity: 0.8;
  min-width: fit-content;
}

/* 预览选项隐藏默认显示 */
.preview-option-group .preview-option.el-radio :deep(.el-radio__input),
.preview-option-group .preview-option.el-checkbox :deep(.el-checkbox__input) {
  display: none;
}

.preview-option-group .preview-option.el-radio :deep(.el-radio__label),
.preview-option-group .preview-option.el-checkbox :deep(.el-checkbox__label) {
  padding: 0;
  margin: 0;
  font-size: inherit;
  color: inherit;
}

/* 选项内容 */
.option-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.option-label {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 20px;
  background: #6b7280;
  color: white;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  flex-shrink: 0;
}

.option-text {
  font-size: 16px;
  color: #1f2937;
  line-height: 1.5;
}

/* 输入框样式 */
.textarea-input :deep(.el-textarea__inner) {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 16px;
  background: #f8f9fa;
  color: #6b7280;
}

.select-input {
  width: 100%;
}

.select-input :deep(.el-input__inner) {
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px 20px;
  font-size: 16px;
  background: #f8f9fa;
  color: #6b7280;
}

.rate-input {
  background: white;
  padding: 16px;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
}

/* 底部操作 */
.bottom-actions {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 24px 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.back-btn {
  padding: 12px 24px;
  font-size: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .preview-option-group.el-radio-group,
  .preview-option-group.el-checkbox-group {
    flex-direction: column;
  }
  
  .preview-option-group .preview-option.el-radio,
  .preview-option-group .preview-option.el-checkbox {
    width: 100%;
    margin-bottom: 8px;
  }
  
  .time-info {
    flex-direction: column;
    gap: 12px;
  }
  
  .time-item {
    width: 100%;
  }
  
  .preview-container {
    padding: 12px;
  }
  
  .questionnaire-header {
    padding: 20px;
  }
  
  .question-card {
    padding: 16px;
  }
  
  .question-content {
    margin-left: 0;
    margin-top: 16px;
  }
  
  .question-content::before {
    display: none;
  }
  
  .question-number::after {
    display: none;
  }
  
  .question-header {
    flex-direction: column;
    gap: 12px;
  }
  
  .question-number-wrapper {
    margin-right: 0;
  }
}
</style> 