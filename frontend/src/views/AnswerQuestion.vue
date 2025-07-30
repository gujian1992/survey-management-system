<!--
🎯 答题页面 - 简化版会话管理
当前模式：轻量化会话 + 前端状态管理
- 会话只负责：权限验证、题目分发、最终状态记录
- 前端负责：答题进度、本地状态、用户交互
- 减少了90%的状态同步操作，提升性能
-->
<template>
  <div class="answer-question-container">
    <!-- 顶部工具栏 -->
    <div class="toolbar">
      <div class="toolbar-left">
        <span class="exam-title">{{ examTitle }}</span>
      </div>
      <div class="toolbar-right">
        <div class="function-button" @click="togglePause" :title="isPaused ? '继续答题' : '暂停答题'">
          <el-icon><Timer /></el-icon>
        </div>
        <span class="remaining-time">剩余时间：{{ formatTime(remainingTime) }}</span>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="main-content">
      <div class="question-card" v-if="currentQuestion">
        <!-- 题目信息头部 -->
        <div class="question-header">
          <div class="question-info">
            <span class="score-tag">{{ currentQuestion.score }}分</span>
            <span class="question-type">{{ getQuestionTypeName(currentQuestion.type) }}</span>
          </div>
          <div class="progress-info">
            <div class="progress-bar">
              <div class="progress-inner" :style="{ width: `${(currentIndex + 1) / totalQuestions * 100}%` }"></div>
            </div>
            <span class="progress-text">{{ currentIndex + 1 }} / {{ totalQuestions }}</span>
          </div>
        </div>

        <!-- 题目内容区域 -->
        <div class="question-content">
          <div class="question-title">
            <span class="question-number">{{ currentIndex + 1 }}. </span>
            {{ currentQuestion.title }}
          </div>
          <div class="answer-area">
            <!-- 单选题 -->
            <template v-if="currentQuestion.type === 1">
              <el-radio-group v-model="currentAnswer" class="answer-options">
                <el-radio 
                  v-for="(option, index) in currentQuestion.options" 
                  :key="index"
                  :value="String.fromCharCode(65 + index)"
                  class="answer-option"
                >
                  {{ String.fromCharCode(65 + index) }}. {{ option }}
                </el-radio>
              </el-radio-group>
            </template>

            <!-- 多选题 -->
            <template v-else-if="currentQuestion.type === 2">
              <el-checkbox-group v-model="currentAnswer" class="answer-options">
                <el-checkbox 
                  v-for="(option, index) in currentQuestion.options" 
                  :key="index"
                  :value="String.fromCharCode(65 + index)"
                  class="answer-option"
                >
                  {{ String.fromCharCode(65 + index) }}. {{ option }}
                </el-checkbox>
              </el-checkbox-group>
            </template>

            <!-- 填空题、简答题 -->
            <template v-else-if="currentQuestion.type === 3 || currentQuestion.type === 4">
              <el-input
                type="textarea"
                v-model="currentAnswer"
                :rows="8"
                resize="vertical"
                :placeholder="currentQuestion.type === 3 ? '请输入答案...' : '请输入您的答案...'"
                class="answer-textarea"
                @input="handleInput"
              />
              <div class="word-count">{{ currentAnswer.length }} 字</div>
            </template>

            <!-- 评分题 -->
            <template v-else-if="currentQuestion.type === 5">
              <div class="rating-container">
                <el-rate
                  v-model="currentAnswer"
                  :max="10"
                  show-score
                  score-template="{value}分"
                  class="answer-rate"
                  @change="handleInput"
                />
                <div class="rating-description">
                  请为该项打分（1-10分）
                </div>
              </div>
            </template>
          </div>
        </div>

        <!-- 底部操作按钮 -->
        <div class="action-buttons">
          <el-button 
            v-if="!isLastQuestion"
            type="primary" 
            @click="goToNextQuestion"
            class="next-button"
            :loading="loading"
          >
            下一题 <el-icon class="el-icon--right"><ArrowRight /></el-icon>
          </el-button>
          <el-button
            v-else
            type="primary"
            @click="submitFinalAnswer"
            class="submit-button"
            :loading="submitting"
          >
            {{ submitting ? '正在交卷...' : '交卷' }} <el-icon class="el-icon--right"><Check /></el-icon>
          </el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter, onBeforeRouteLeave } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Timer, Check, Warning, InfoFilled, Setting, ArrowRight } from '@element-plus/icons-vue'
import { answerSessionApi } from '@/api/answerSession'
import { answerRecordApi } from '@/api/answerRecord'

const route = useRoute()
const router = useRouter()

// 状态
const sessionCode = ref('')
const examTitle = ref('')
const currentQuestion = ref({})
const currentIndex = ref(0)
const totalQuestions = ref(0)
const userAnswerList = ref([])
const remainingTime = ref(0)
const timer = ref(null)
const loading = ref(false)
const submitting = ref(false) // 新增：提交状态
const currentAnswer = ref('')
const lastSaved = ref(false)
const isPaused = ref(false)
const isLeavingConfirmed = ref(false)  // 用于跟踪是否已确认离开
const isExamCompleted = ref(false) // 新增：标记是否正常完成答题
let confirmDialogVisible = false  // 用于防止重复显示确认对话框

// 计算属性
const isLastQuestion = computed(() => currentIndex.value === totalQuestions.value - 1)

// 路由离开确认
onBeforeRouteLeave(async (to) => {
  // 如果已经确认过或已完成答题，直接离开
  if (isLeavingConfirmed.value || isExamCompleted.value) {
    return true
  }

  // 如果正在加载或者没有开始答题，直接离开
  if (loading.value || !sessionCode.value) {
    return true
  }

  // 如果确认对话框已经显示，不再重复显示
  if (confirmDialogVisible) {
    return false
  }

  try {
    confirmDialogVisible = true
    await ElMessageBox.confirm(
      '您确定要离开答题页面吗？\n\n离开页面将自动放弃本次答题，答题记录将被标记为"已放弃"。\n\n点击"继续答题"返回答题页面\n点击"放弃答题"结束本次答题',
      '确认离开答题',
      {
        confirmButtonText: '放弃答题',
        cancelButtonText: '继续答题',
        type: 'warning',
        customClass: 'exam-leave-dialog',
        showClose: false,
        closeOnClickModal: false,
        closeOnPressEscape: false,
        distinguishCancelAndClose: true,
        center: true,
        beforeClose: async (action, instance, done) => {
          if (action === 'confirm') {
            try {
              loading.value = true
              // 调用放弃答题接口
              await answerSessionApi.abandonSession(sessionCode.value)
              ElMessage.success('已放弃本次答题')
              isLeavingConfirmed.value = true
              // 清理定时器
              if (timer.value) {
                clearInterval(timer.value)
                timer.value = null
              }
              done()
            } catch (error) {
              console.error('放弃答题失败:', error)
              ElMessage.error('放弃答题失败，请重试')
              loading.value = false
              return false
            } finally {
              loading.value = false
            }
          } else {
            confirmDialogVisible = false
            done()
          }
        }
      }
    )
    return isLeavingConfirmed.value
  } catch {
    // 用户取消离开
    confirmDialogVisible = false
    return false
  }
})

// 获取题型名称
const getQuestionTypeName = (type) => {
  const types = {
    1: '单选题',
    2: '多选题',
    3: '填空题',
    4: '简答题',
    5: '评分题'
  }
  return types[type] || '未知题型'
}

// 格式化时间
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 开始倒计时
const startTimer = () => {
  if (timer.value) {
    clearInterval(timer.value)
  }
  
  timer.value = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
      // 在最后5分钟提醒用户
      if (remainingTime.value === 300) {
        ElMessage.warning('剩余时间不足5分钟，请抓紧时间答题')
      } else if (remainingTime.value === 60) {
        ElMessage.warning('剩余时间不足1分钟！')
      }
    } else {
      clearInterval(timer.value)
      ElMessage.warning('考试时间已到，系统将自动提交')
      finishExam()
    }
  }, 1000)
}

// 组件卸载前清除定时器
onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value)
  }
})

// 初始化考试
const initExam = async () => {
  try {
    loading.value = true
    sessionCode.value = route.params.sessionCode
    
    // 获取会话状态
    const statusResponse = await answerSessionApi.getSessionDetail(sessionCode.value)
    if (!statusResponse?.data) {
      throw new Error('获取会话状态失败')
    }
    
    const sessionDetail = statusResponse.data
    // 检查会话状态
    if (sessionDetail.status === 2) {
      ElMessage.warning('该答题会话已完成')
      router.push('/start-answer')
      return
    }
    
    examTitle.value = sessionDetail.title
    totalQuestions.value = sessionDetail.totalQuestions
    remainingTime.value = sessionDetail.remainingTime || 3600 // 默认1小时
    
    // 初始化答案列表
    userAnswerList.value = new Array(totalQuestions.value).fill('')
    
    // 启动计时器
    startTimer()
    
    // 加载第一题
    await loadQuestion(0)
  } catch (error) {
    console.error('初始化考试失败:', error)
    ElMessage.error(error.message || '初始化考试失败')
    router.push('/start-answer')
  } finally {
    loading.value = false
  }
}

// 加载题目
const loadQuestion = async (index) => {
  try {
    const response = await answerSessionApi.getQuestion(sessionCode.value, index)
    if (!response?.data) {
      throw new Error('题目加载失败')
    }
    
    currentQuestion.value = {
      ...response.data,
      type: Number(response.data.type)
    }
    
    // 根据题型初始化答案
    const questionType = Number(response.data.type)
    if (questionType === 2) { // 多选题
      currentAnswer.value = userAnswerList.value[index] || []
    } else if (questionType === 5) { // 评分题
      currentAnswer.value = userAnswerList.value[index] || 0
    } else { // 其他题型
      currentAnswer.value = userAnswerList.value[index] || ''
    }
  } catch (error) {
    ElMessage.error(error.message || '加载题目失败')
  }
}

// 验证答案是否有效
const validateAnswer = () => {
  const questionType = Number(currentQuestion.value.type)
  
  switch (questionType) {
    case 1: // 单选题
      if (!currentAnswer.value || currentAnswer.value === '') {
        ElMessage.warning('请选择一个答案')
        return false
      }
      break
    case 2: // 多选题
      if (!currentAnswer.value || !Array.isArray(currentAnswer.value) || currentAnswer.value.length === 0) {
        ElMessage.warning('请至少选择一个答案')
        return false
      }
      break
    case 3: // 填空题
      if (!currentAnswer.value || currentAnswer.value.trim() === '') {
        ElMessage.warning('请填写答案')
        return false
      }
      break
    case 4: // 简答题
      if (!currentAnswer.value || currentAnswer.value.trim() === '') {
        ElMessage.warning('请输入答案')
        return false
      }
      break
    case 5: // 评分题
      if (!currentAnswer.value || currentAnswer.value === 0) {
        ElMessage.warning('请进行评分')
        return false
      }
      break
    default:
      ElMessage.warning('未知题型')
      return false
  }
  return true
}

// 保存当前答案
const saveCurrentAnswer = () => {
  if (currentQuestion.value && currentAnswer.value !== undefined) {
    userAnswerList.value[currentIndex.value] = currentAnswer.value
    lastSaved.value = true
    // 3秒后重置保存状态
    setTimeout(() => {
      lastSaved.value = false
    }, 3000)
  }
}

// 下一题
const goToNextQuestion = async () => {
  try {
    if (currentIndex.value < totalQuestions.value - 1) {
      // 保存当前答案
      saveCurrentAnswer()
      // 切换到下一题
      currentIndex.value++
      await loadQuestion(currentIndex.value)
    } else {
      // 如果是最后一题，提示用户是否要交卷
      const confirmed = await ElMessageBox.confirm(
        '恭喜！您已完成所有题目。\n\n是否现在提交答卷？\n\n您也可以选择继续检查答案。',
        '完成答题',
        {
          confirmButtonText: '立即交卷',
          cancelButtonText: '继续检查',
          type: 'success',
          customClass: 'exam-complete-dialog',
          center: true,
          distinguishCancelAndClose: true
        }
      ).catch(() => false)

      if (confirmed) {
        await submitFinalAnswer()
      }
    }
  } catch (error) {
    console.error('切换题目失败:', error)
    ElMessage.error('切换题目失败，请重试')
  }
}

// 统一提交所有答案
const submitAllAnswers = async () => {
  console.log('开始提交所有答案...')
  
  try {
    const answers = []
    
    // 显示提交中的加载提示
    ElMessage({
      type: 'info',
      message: '正在提交答案，请稍候...',
      duration: 0,
      showClose: true
    })
    
    // 收集所有答案
    for (let i = 0; i < userAnswerList.value.length; i++) {
      const answer = userAnswerList.value[i]
      // 获取当前题目
      const response = await answerSessionApi.getQuestion(sessionCode.value, i)
      if (!response?.data) continue
      
      const question = response.data
      
      if (answer !== undefined && answer !== null && answer !== '' && question) {
        let processedAnswer
        
        // 根据题型处理答案
        if (Number(question.type) === 2) {
          // 多选题：确保答案是数组并且不为空
          if (!Array.isArray(answer) || answer.length === 0) {
            continue
          }
          processedAnswer = answer.join(',')
        } else {
          // 单选题、填空题、简答题、评分题：确保答案是非空字符串
          processedAnswer = String(answer || '').trim()
          if (!processedAnswer) {
            continue
          }
        }
        
        // 添加到答案列表
        answers.push({
          questionId: question.id,
          userAnswer: processedAnswer,
          timeSpentSeconds: calculateTimeSpent()
        })
      }
    }
    
    // 批量提交所有答案
    if (answers.length > 0) {
      await answerRecordApi.batchSubmit({
        sessionCode: sessionCode.value,
        answers
      })
      console.log('所有答案提交成功')
      // 关闭提交中提示
      ElMessage.closeAll()
      ElMessage.success({
        message: `答案提交成功，共提交${answers.length}道题目`,
        duration: 2000
      })
    } else {
      throw new Error('没有可提交的答案')
    }
  } catch (error) {
    console.error('答案提交失败:', error)
    // 关闭提交中提示
    ElMessage.closeAll()
    throw error
  }
}

// 统一的错误处理方法
const handleSubmitError = (error) => {
  const errorMessage = error.response?.data?.message || error.message || '提交失败，请重试'
  
  // 如果是重复提交的错误，不显示错误提示，继续完成考试
  if (errorMessage.includes('重复提交')) {
    console.log('检测到重复提交，继续完成考试流程')
    return true
  }
  
  // 显示错误提示
  ElMessage.error({
    message: errorMessage,
    duration: 5000,
    showClose: true
  })
  
  return false
}

// 提交最终答案
const submitFinalAnswer = async () => {
  try {
    // 确认提交
    await ElMessageBox.confirm(
      '确认要交卷吗？\n\n提交后将无法修改答案，系统将自动评分并生成答题记录。\n\n请确认您已完成所有题目的作答。',
      '提交确认',
      {
        confirmButtonText: '确认交卷',
        cancelButtonText: '继续答题',
        type: 'info',
        customClass: 'exam-submit-dialog',
        center: true,
        distinguishCancelAndClose: true
      }
    )
  } catch {
    // 用户取消，不进行提交
    return
  }

  try {
    submitting.value = true
    
    // 保存最后一题答案
    saveCurrentAnswer()
    
    // 统一提交所有答案
    await submitAllAnswers()
    
    // 完成考试
    await finishExam()
  } catch (error) {
    console.error('交卷失败:', error)
    // 如果是重复提交错误，继续完成考试流程
    if (handleSubmitError(error)) {
      await finishExam()
    } else {
      // 显示错误提示，允许用户重试
      ElMessageBox.alert(
        '提交答案失败，请检查网络连接后重试。\n\n您的答案已保存，可以继续尝试提交。',
        '提交失败',
        {
          confirmButtonText: '知道了',
          type: 'error',
          center: true,
          showClose: false
        }
      )
    }
  } finally {
    submitting.value = false
  }
}

// 完成答题
const finishExam = async () => {
  try {
    // 清除计时器
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
    
    // 调用后端完成答题会话
    await answerSessionApi.finishSession(sessionCode.value)
    
    // 标记为已完成
    isExamCompleted.value = true
    
    // 显示完成信息
    ElMessage.success({
      message: '交卷成功！',
      duration: 1500
    })
    
    // 直接跳转到开始答题页面
    router.push('/start-answer')
    
  } catch (error) {
    console.error('完成答题失败:', error)
    // 显示错误提示，但保持在当前页面
    ElMessage.error({
      message: error.message || '完成答题失败，请重试',
      duration: 3000
    })
    // 重新启动计时器，因为还没完成
    startTimer()
  }
}

// 计算答题用时
const calculateTimeSpent = () => {
  return Math.floor(3600 - remainingTime.value)
}

// 检查题目是否已回答
const isQuestionAnswered = (index) => {
  return userAnswerList.value[index] !== undefined && 
         userAnswerList.value[index] !== null && 
         userAnswerList.value[index] !== ''
}

// 跳转到指定题目
const jumpToQuestion = async (index) => {
  if (index === currentIndex.value) return
  
  // 保存当前答案
  saveCurrentAnswer()
  
  // 更新索引并加载新题目
  currentIndex.value = index
  await loadQuestion(index)
}

// 处理输入
const handleInput = () => {
  // 自动保存
  saveCurrentAnswer()
}

// 监听答案变化，实时保存
watch(currentAnswer, (newAnswer) => {
  if (currentQuestion.value && newAnswer !== undefined) {
    userAnswerList.value[currentIndex.value] = newAnswer
  }
}, { deep: true })

// 生命周期钩子
onMounted(() => {
  initExam()
})

// 暂停/继续答题
const togglePause = () => {
  isPaused.value = !isPaused.value
  if (isPaused.value) {
    clearInterval(timer.value)
    ElMessage.info('已暂停计时')
  } else {
    startTimer()
    ElMessage.success('已继续计时')
  }
}
</script>

<style scoped>
.answer-question-container {
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: var(--el-fill-color-blank);
}

.toolbar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  padding: 0 20px;
  background-color: #fff;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
  display: flex;
  align-items: center;
  justify-content: space-between;
  z-index: 100;
}

.toolbar-left {
  display: flex;
  align-items: center;
}

.exam-title {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

.toolbar-right {
  display: flex;
  align-items: center;
  gap: 16px;
}

.function-button {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: var(--el-color-primary-light-9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
}

.function-button:hover {
  background: var(--el-color-primary-light-7);
  transform: translateY(-1px);
}

.remaining-time {
  font-size: 14px;
  color: var(--el-color-danger);
  font-weight: 500;
}

.question-number {
  font-weight: 500;
  margin-right: 8px;
}

.main-content {
  flex: 1;
  padding: 80px 0 24px;
  overflow-y: auto;
  background-color: var(--el-fill-color-light);
}

.question-card {
  max-width: 800px;
  margin: 0 auto;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.question-header {
  padding: 16px 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.question-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.score-tag {
  background-color: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 13px;
}

.question-type {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.progress-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.progress-bar {
  width: 120px;
  height: 4px;
  background-color: var(--el-fill-color-light);
  border-radius: 2px;
  overflow: hidden;
}

.progress-inner {
  height: 100%;
  background-color: var(--el-color-primary);
  border-radius: 2px;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
  min-width: 45px;
  text-align: right;
}

.question-content {
  padding: 20px;
}

.question-title {
  font-size: 15px;
  color: var(--el-text-color-primary);
  margin-bottom: 24px;
  line-height: 1.6;
}

.answer-area {
  padding: 0;
}

.answer-options {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 12px;
}

.answer-option {
  margin: 0;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: var(--el-fill-color-light);
  transition: all 0.3s;
  height: auto;
  display: flex;
  align-items: center;
  cursor: pointer;
}

.answer-option:hover {
  background-color: var(--el-fill-color-dark);
}

:deep(.el-radio) {
  width: 100%;
  margin-right: 0;
  margin-bottom: 0;
  height: auto;
}

:deep(.el-radio__label) {
  padding-left: 12px;
  font-size: 14px;
  color: var(--el-text-color-primary);
}

:deep(.el-radio__input) {
  position: absolute;
  right: 16px;
}

.word-count {
  text-align: right;
  color: var(--el-text-color-secondary);
  font-size: 13px;
  padding-right: 4px;
}

.action-buttons {
  padding: 20px;
  display: flex;
  justify-content: center;
  gap: 16px;
  border-top: 1px solid var(--el-border-color-light);
}

.next-button,
.submit-button {
  min-width: 120px;
}

:deep(.el-icon) {
  font-size: 16px;
}

.rating-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
}

.answer-rate {
  font-size: 24px;
}

.rating-description {
  color: var(--el-text-color-secondary);
  font-size: 14px;
}

:deep(.el-rate__text) {
  font-size: 16px;
  color: var(--el-color-primary);
  margin-left: 10px;
}
</style>



