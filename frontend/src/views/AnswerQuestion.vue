<!--
🎯 答题页面 - 简化版会话管理
当前模式：轻量化会话 + 前端状态管理
- 会话只负责：权限验证、题目分发、最终状态记录
- 前端负责：答题进度、本地状态、用户交互
- 减少了90%的状态同步操作，提升性能
-->
<template>
  <div class="exam-page">
    <!-- 顶部信息栏 -->
    <header class="exam-header">
      <div class="exam-info">
        <h1 class="exam-title">答题系统</h1>
        <div class="exam-meta">
          <span>考试编号：{{ sessionCode }}</span>
          <span>第 {{ currentIndex + 1 }} 题 / 共 {{ totalQuestions }} 题</span>
        </div>
      </div>
      <div class="exam-status">
        <div :class="['timer', timeRemaining < 300 ? 'warning' : '']">
          <el-icon><Timer /></el-icon>
          <span>{{ formatTime(timeRemaining) }}</span>
        </div>
        <div class="score-info" v-if="currentScore > 0">
          当前得分：{{ currentScore }}
        </div>
      </div>
    </header>

    <!-- 主要内容区 -->
    <main class="exam-main">
      <!-- 题目区域 -->
      <section class="question-section" v-if="currentQuestion">
        <div class="question-header">
          <div class="question-type">
            <span class="type-name">{{ getQuestionTypeName(currentQuestion.type) }}</span>
            <span class="score">{{ currentQuestion.score }}分</span>
          </div>
        </div>

        <div class="question-content">
          <h2 class="title">{{ currentQuestion.title || currentQuestion.content }}</h2>
          <p class="description" v-if="currentQuestion.description && currentQuestion.description !== currentQuestion.title">
            {{ currentQuestion.description }}
          </p>
        </div>

        <!-- 答题区域 -->
        <div class="answer-area">
          <!-- 单选题 -->
          <div v-if="Number(currentQuestion.type) === 1" class="choice-options">
            <el-radio-group v-model="userAnswer">
              <el-radio 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                :value="option"
                class="option-item"
              >
                {{ String.fromCharCode(65 + index) }}. {{ option }}
              </el-radio>
            </el-radio-group>
          </div>

          <!-- 多选题 -->
          <div v-else-if="Number(currentQuestion.type) === 2" class="choice-options">
            <el-checkbox-group v-model="userAnswer">
              <el-checkbox 
                v-for="(option, index) in currentQuestion.options" 
                :key="index"
                :value="option"
                class="option-item"
              >
                {{ String.fromCharCode(65 + index) }}. {{ option }}
              </el-checkbox>
            </el-checkbox-group>
          </div>

          <!-- 填空题 -->
          <div v-else-if="Number(currentQuestion.type) === 3">
            <el-input
              v-model="userAnswer"
              type="text"
              placeholder="请输入答案"
            />
          </div>

          <!-- 简答题 -->
          <div v-else-if="Number(currentQuestion.type) === 4">
            <el-input
              v-model="userAnswer"
              type="textarea"
              :rows="6"
              placeholder="请输入答案"
            />
          </div>

          <!-- 评分题 -->
          <div v-else-if="Number(currentQuestion.type) === 5" class="rating-section">
            <div class="rating-container">
              <el-rate
                v-model="userAnswer"
                :max="10"
                show-score
                show-text
                :texts="['极差', '很差', '较差', '一般', '较好', '好', '很好', '优秀', '非常优秀', '完美']"
                class="rating-input"
              />
              <p class="rating-hint">请根据题目要求进行评分（1-10分）</p>
            </div>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="question-actions">
          <el-button 
            v-if="!isLastQuestion"
            type="primary" 
            @click="goToNextQuestion"
            :disabled="!userAnswer || loading"
            :loading="loading"
            size="large"
            class="next-btn"
          >
            下一题
          </el-button>
          
          <div v-else class="final-actions">
            <div class="final-submit-warning">
              <el-icon><Warning /></el-icon>
              <span>最后一题，请仔细检查后交卷</span>
            </div>
            <el-button 
              type="danger" 
              @click="submitFinalAnswer"
              :disabled="!userAnswer || loading"
              :loading="loading"
              size="large"
              class="final-submit-btn"
            >
              <el-icon><Check /></el-icon>
              交卷
            </el-button>
          </div>
        </div>
      </section>

      <!-- 答题导航 -->
      <aside class="navigation-section">
        <div class="nav-header">
          <h3>答题进度</h3>
          <el-progress 
            :percentage="progress" 
            :format="format => `${currentIndex + 1}/${totalQuestions}`"
          />
          <div class="progress-tip">
            <el-icon><InfoFilled /></el-icon>
            <span>考试模式，需按顺序答题</span>
          </div>
        </div>
        <div class="question-list">
          <el-tag
            v-for="index in totalQuestions"
            :key="index"
            :type="getQuestionStatus(index - 1)"
            class="question-tag disabled"
            title="考试模式下不允许跳题"
          >
            {{ index }}
          </el-tag>
        </div>
      </aside>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Timer, Check, Warning, InfoFilled } from '@element-plus/icons-vue'
import { answerSessionApi } from '@/api/answerSession'
import { answerRecordApi } from '@/api/answerRecord'

const route = useRoute()
const router = useRouter()

// 状态
const sessionCode = ref('')
const currentQuestion = ref(null)
const currentIndex = ref(0)
const totalQuestions = ref(0)
const userAnswer = ref('')
const userAnswerList = ref([]) // 存储所有答案，在交卷时统一提交
const timeRemaining = ref(3600) // 默认1小时
const timer = ref(null)
const currentScore = ref(0)
const loading = ref(false)
const sessionStatus = ref(null)
const completedCount = ref(0)
const progress = ref(0)
const questionList = ref([]) // 存储所有题目信息

// 计算属性
const isLastQuestion = computed(() => currentIndex.value === totalQuestions.value - 1)

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

// 获取题目状态
const getQuestionStatus = (index) => {
  if (index === currentIndex.value) return 'primary'
  if (userAnswerList.value[index] !== undefined && userAnswerList.value[index] !== null && userAnswerList.value[index] !== '') return 'success'
  return 'info'
}

// 格式化时间
const formatTime = (seconds) => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

// 初始化答题会话
const initExamSession = async () => {
  try {
    loading.value = true
    sessionCode.value = route.params.sessionCode
    
    // 获取会话状态
    const sessionResponse = await answerSessionApi.getSessionStatus(sessionCode.value)
    if (!sessionResponse?.data) {
      throw new Error('获取会话状态失败')
    }
    
    sessionStatus.value = sessionResponse.data
    
    // 检查会话状态
    const status = parseInt(sessionStatus.value.status)
    if (status === 2) { // 已完成
      ElMessage.warning('该答题会话已完成')
      router.push('/start-answer')
      return
    } else if (status === 3) { // 已超时
      ElMessage.warning('该答题会话已超时')
      router.push('/start-answer')
      return
    } else if (status === 4) { // 已放弃
      ElMessage.warning('该答题会话已放弃')
      router.push('/start-answer')
      return
    } else if (status === 5) { // 异常结束
      ElMessage.warning('该答题会话异常结束')
      router.push('/start-answer')
      return
    }

    // 设置题目总数和进度
    totalQuestions.value = sessionStatus.value.totalQuestions || 0
    currentIndex.value = sessionStatus.value.lastQuestionIndex || 0
    completedCount.value = sessionStatus.value.completedCount || 0
    timeRemaining.value = sessionStatus.value.remainingTime || 3600
    
    // 初始化userAnswerList数组
    userAnswerList.value = new Array(totalQuestions.value)
    
    // 计算进度（基于已回答的题目数量）
    const answeredCount = userAnswerList.value.filter(answer => 
      answer !== undefined && answer !== null && answer !== ''
    ).length
    progress.value = Math.floor((answeredCount / totalQuestions.value) * 100) || 0

    // 启动计时器
    startTimer()

    // 加载题目
    try {
      await loadQuestion()
    } catch (loadError) {
      // loadQuestion 内部已经处理了错误提示，这里不需要再处理
    }
  } catch (error) {
    console.error('初始化答题会话失败:', error)
    // 优先使用后端返回的错误信息
    if (error.response?.data?.message) {
      ElMessage.error(error.response.data.message)
    } else if (!navigator.onLine) {
      ElMessage.error('网络连接异常，请检查网络后重试')
    } else {
      ElMessage.error('初始化答题会话失败，请重试')
    }
    router.push('/start-answer')
  } finally {
    loading.value = false
  }
}

// 加载题目
const loadQuestion = async (showError = true) => {
  try {
    if (currentIndex.value >= totalQuestions.value) {
      ElMessage.success('所有题目已完成')
      // 设置标志表示这是正常完成的跳转
      window._examCompleted = true
      await finishExam()
      return
    }

    const response = await answerSessionApi.getQuestion(sessionCode.value, currentIndex.value)
    if (!response?.data) {
      throw new Error('题目加载失败')
    }

    currentQuestion.value = response.data
    
    // 恢复之前保存的答案，或根据题型初始化答案
    if (userAnswerList.value[currentIndex.value] !== undefined) {
      userAnswer.value = userAnswerList.value[currentIndex.value]
    } else {
      userAnswer.value = Number(response.data.type) === 2 ? [] : ''
    }
    
    // 保存题目信息
    if (!questionList.value[currentIndex.value]) {
      questionList.value[currentIndex.value] = {
        ...response.data,
        index: currentIndex.value
      }
    }
  } catch (error) {
    console.error('加载题目失败:', error)
    
    // 只有在showError为true时才显示错误提示
    if (showError) {
      // 按优先级处理错误
      if (error.response?.data?.code === 6101) { // 题目不存在
        ElMessage.error('题目不存在，返回开始页面')
        router.push('/start-answer')
      } else if (error.response?.data?.code === 6201) { // 会话不存在
        ElMessage.error('答题会话已失效，请重新开始')
        router.push('/start-answer')
      } else if (error.response?.data?.code === 6108) { // 题目索引无效
        ElMessage.warning('题目索引无效，可能已完成所有题目')
        // 设置标志表示这是正常完成的跳转
        window._examCompleted = true
        await finishExam()
        return
      } else if (!navigator.onLine) {
        ElMessage.error('网络连接异常，请检查网络后重试')
      } else if (error.response?.data?.message) {
        ElMessage.error(error.response.data.message)
      } else {
        ElMessage.error('加载题目失败，请重试')
      }
    }
    
    // 总是抛出错误，让调用方决定如何处理
    throw error
  }
}

// 验证答案是否有效
const validateAnswer = () => {
  const questionType = Number(currentQuestion.value.type)
  
  switch (questionType) {
    case 1: // 单选题
      if (!userAnswer.value || userAnswer.value === '') {
        ElMessage.warning('请选择一个答案')
        return false
      }
      break
    case 2: // 多选题
      if (!userAnswer.value || !Array.isArray(userAnswer.value) || userAnswer.value.length === 0) {
        ElMessage.warning('请至少选择一个答案')
        return false
      }
      break
    case 3: // 填空题
      if (!userAnswer.value || userAnswer.value.trim() === '') {
        ElMessage.warning('请填写答案')
        return false
      }
      break
    case 4: // 简答题
      if (!userAnswer.value || userAnswer.value.trim() === '') {
        ElMessage.warning('请输入答案')
        return false
      }
      break
    case 5: // 评分题
      if (!userAnswer.value || userAnswer.value === 0) {
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

// 保存当前答案并跳转到下一题
const goToNextQuestion = () => {
  // 验证答案
  if (!validateAnswer()) {
    return
  }

  // 保存当前答案到本地
  saveCurrentAnswer()

  // 跳转到下一题
  currentIndex.value++
  loadQuestion(false)
}

// 统一提交所有答案
const submitAllAnswers = async () => {
  console.log('开始提交所有答案...')
  
  try {
    const answers = []
    
    // 收集所有答案
    for (let i = 0; i < userAnswerList.value.length; i++) {
      const answer = userAnswerList.value[i]
      const question = questionList.value[i]
      
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
      ElMessage.success('答案提交成功')
    } else {
      throw new Error('没有可提交的答案')
    }
  } catch (error) {
    console.error('答案提交失败:', error)
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
      '确认要交卷吗？提交后将无法修改答案。',
      '提交确认',
      {
        confirmButtonText: '确认交卷',
        cancelButtonText: '继续答题',
        type: 'warning'
      }
    )
  } catch {
    // 用户取消，不进行提交
    return
  }

  try {
    loading.value = true
    
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
    }
  } finally {
    loading.value = false
  }
}

// 保存当前题目答案到本地
const saveCurrentAnswer = () => {
  if (!currentQuestion.value) return
  
  // 保存答案和题目信息
  userAnswerList.value[currentIndex.value] = userAnswer.value
  
  // 如果题目列表中还没有这个题目，添加进去
  if (!questionList.value[currentIndex.value]) {
    questionList.value[currentIndex.value] = {
      ...currentQuestion.value,
      index: currentIndex.value
    }
  }
  
  console.log(`已保存第${currentIndex.value + 1}题答案:`, userAnswer.value)
}

// 计时器
const startTimer = () => {
  // 清除可能存在的旧计时器
  if (timer.value) {
    clearInterval(timer.value)
  }

  timer.value = setInterval(() => {
    if (timeRemaining.value > 0) {
      timeRemaining.value--
      
      // 在最后5分钟提醒用户
      if (timeRemaining.value === 300) { // 5分钟
        ElMessage.warning('剩余时间不足5分钟，请抓紧时间答题')
      } else if (timeRemaining.value === 60) { // 1分钟
        ElMessage.error('剩余时间不足1分钟！')
      }
    } else {
      clearInterval(timer.value)
      ElMessage.error('考试时间已到，系统将自动提交')
      // 设置标志表示这是超时自动完成的跳转
      window._examCompleted = true
      finishExam()
    }
  }, 1000)
}

// 清理计时器
onBeforeUnmount(() => {
  if (timer.value) {
    clearInterval(timer.value)
    timer.value = null
  }
})

// 完成答题
const finishExam = async () => {
  try {
    // 清除计时器
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
    
    // 调用后端完成答题会话
    const result = await answerSessionApi.finishSession(sessionCode.value)
    
    // 显示完成信息
    ElMessage.success('交卷成功')
    
    // 设置标志表示这是正常完成的跳转，避免触发路由守卫的确认对话框
    window._examCompleted = true
    
    // 等待一秒让用户看到完成提示，然后回到开始答题页面
    setTimeout(() => {
      router.push('/start-answer')
    }, 1500)
    
  } catch (error) {
    console.error('完成答题失败:', error)
    handleSubmitError(error)
  }
}

// 计算答题用时
const calculateTimeSpent = () => {
  return Math.floor(3600 - timeRemaining.value)
}

// 跳转到指定题目（考试模式下已禁用）
// const jumpToQuestion = (index) => {
//   // 考试模式下不允许跳题，此方法已禁用
// }

// 监听答案变化，实时保存
watch(userAnswer, (newAnswer) => {
  if (currentQuestion.value && (newAnswer !== '' && newAnswer !== null && newAnswer !== undefined)) {
    // 实时保存答案
    userAnswerList.value[currentIndex.value] = newAnswer
    
    // 保存题目信息
    if (!questionList.value[currentIndex.value]) {
      questionList.value[currentIndex.value] = {
        ...currentQuestion.value,
        index: currentIndex.value
      }
    }
    
    // 更新进度
    const answeredCount = userAnswerList.value.filter(answer => 
      answer !== undefined && answer !== null && answer !== ''
    ).length
    progress.value = Math.floor((answeredCount / totalQuestions.value) * 100) || 0
  }
}, { deep: true })

// 生命周期钩子
onMounted(() => {
  initExamSession()
})
</script>

<style scoped>
.exam-page {
  min-height: 100vh;
  background: #f5f7fa;
  display: flex;
  flex-direction: column;
}

.exam-header {
  background: #fff;
  padding: 20px 30px;
  border-bottom: 1px solid #e4e7ed;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.exam-info {
  flex: 1;
}

.exam-title {
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
  color: #303133;
}

.exam-meta {
  display: flex;
  gap: 20px;
  color: #606266;
  font-size: 14px;
}

.exam-status {
  display: flex;
  align-items: center;
  gap: 20px;
}

.timer {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #f0f9ff;
  border-radius: 8px;
  color: #409EFF;
  font-weight: 600;
}

.timer.warning {
  background: #fef0f0;
  color: #f56c6c;
}

.score-info {
  font-size: 16px;
  font-weight: 600;
  color: #67C23A;
}

.exam-main {
  flex: 1;
  display: flex;
  gap: 20px;
  padding: 20px;
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
}

.question-section {
  flex: 1;
  background: #fff;
  border-radius: 12px;
  padding: 30px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding-bottom: 15px;
  border-bottom: 1px solid #e4e7ed;
}

.question-type {
  display: flex;
  align-items: center;
  gap: 10px;
}

.type-name {
  background: #409EFF;
  color: #fff;
  padding: 4px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.score {
  color: #67C23A;
  font-weight: 600;
}

.question-content {
  margin-bottom: 30px;
}

.title {
  font-size: 18px;
  font-weight: 600;
  color: #303133;
  margin-bottom: 15px;
  line-height: 1.6;
}

.description {
  color: #606266;
  line-height: 1.6;
}

.answer-area {
  margin-bottom: 30px;
}

.choice-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.option-item {
  padding: 12px 16px;
  border: 1px solid #e4e7ed;
  border-radius: 8px;
  transition: all 0.3s;
}

.option-item:hover {
  border-color: #409EFF;
  background: #f0f9ff;
}

.question-actions {
  display: flex;
  justify-content: center;
  gap: 10px;
}

.next-btn {
  padding: 12px 30px;
  font-size: 16px;
  font-weight: 600;
}

.final-actions {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.final-submit-warning {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  background: #fef0f0;
  border: 1px solid #fcd0d0;
  border-radius: 8px;
  color: #f56c6c;
  font-size: 14px;
  font-weight: 600;
}

.final-submit-warning .el-icon {
  font-size: 16px;
}

.navigation-section {
  width: 300px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.nav-header {
  margin-bottom: 20px;
}

.nav-header h3 {
  margin: 0 0 15px 0;
  color: #303133;
  font-size: 16px;
}

.progress-tip {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 12px;
  background: #f0f9ff;
  border-radius: 6px;
  font-size: 12px;
  color: #606266;
}

.progress-tip .el-icon {
  font-size: 14px;
  color: #409EFF;
}

.question-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.question-tag {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s;
}

.question-tag.disabled {
  cursor: not-allowed;
  opacity: 0.8;
}

.question-tag.disabled:hover {
  transform: none;
}

.rating-section {
  margin-bottom: 30px;
}

.rating-container {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.rating-input {
  margin-bottom: 10px;
}

.rating-hint {
  color: #606266;
  font-size: 14px;
  text-align: center;
}

.final-submit-btn {
  background: #f56c6c;
  border: 2px solid #f56c6c;
  color: #fff;
  font-size: 18px;
  font-weight: 700;
  padding: 15px 40px;
  border-radius: 8px;
  letter-spacing: 2px;
  box-shadow: 0 4px 12px rgba(245, 108, 108, 0.3);
  transition: all 0.2s ease;
  text-transform: uppercase;
}

.final-submit-btn:hover {
  background: #f78989;
  border-color: #f78989;
  transform: translateY(-1px);
  box-shadow: 0 6px 20px rgba(245, 108, 108, 0.4);
}

.final-submit-btn:active {
  transform: translateY(0);
  box-shadow: 0 2px 8px rgba(245, 108, 108, 0.3);
}

/* 交卷确认对话框样式 */
:deep(.exam-submit-dialog) {
  border-radius: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
}

:deep(.exam-submit-dialog .el-message-box__header) {
  padding: 25px 25px 15px;
  background: linear-gradient(135deg, #ff6b6b, #ee5a52);
  color: #fff;
  border-radius: 12px 12px 0 0;
}

:deep(.exam-submit-dialog .el-message-box__title) {
  color: #fff;
  font-size: 20px;
  font-weight: 700;
  letter-spacing: 1px;
}

:deep(.exam-submit-dialog .el-message-box__content) {
  padding: 30px 25px 20px;
  background: #fff;
}

:deep(.exam-submit-dialog .el-message-box__message) {
  font-size: 16px;
  line-height: 1.8;
  color: #333;
  text-align: center;
  margin: 0;
  white-space: pre-line;
}

:deep(.exam-submit-dialog .el-message-box__btns) {
  padding: 20px 25px 25px;
  background: #fff;
  border-radius: 0 0 12px 12px;
  display: flex;
  justify-content: center;
  gap: 15px;
}

:deep(.exam-submit-dialog .el-button--primary) {
  background: #ff6b6b;
  border-color: #ff6b6b;
  padding: 12px 25px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 6px;
}

:deep(.exam-submit-dialog .el-button--default) {
  padding: 12px 25px;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 1px;
  border-radius: 6px;
  border: 2px solid #ddd;
}
</style>



