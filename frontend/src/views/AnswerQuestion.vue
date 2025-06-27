<template>
  <div class="answer-question" :class="{ 'dark-mode': isDarkMode }">
    <!-- 顶部进度栏 -->
    <div class="top-progress-bar">
      <div class="progress-container">
        <div class="session-info">
          <div class="session-meta">
            <el-tag 
              v-if="sessionData.questionType"
              :color="getQuestionTypeColor(sessionData.questionType)" 
              size="small"
            >
              {{ getQuestionTypeName(sessionData.questionType) }}
            </el-tag>
            <span class="session-code">{{ sessionData.sessionCode || '--' }}</span>
          </div>
          <div class="progress-text">
            题目 {{ (sessionData.currentCount || 0) + 1 }} / {{ sessionData.totalCount || 0 }}
          </div>
        </div>
        
        <div class="progress-bar-wrapper">
          <el-progress 
            :percentage="progressPercentage" 
            :stroke-width="6"
            color="var(--color-primary)"
            :show-text="false"
            class="main-progress"
          />
          <div class="progress-labels">
            <span class="current-progress">{{ sessionData.currentCount || 0 }}/{{ sessionData.totalCount || 0 }}</span>
            <span class="score-display">当前得分: {{ sessionData.currentScore || 0 }}分</span>
          </div>
        </div>

        <div class="timer-section">
          <div class="timer-container" :class="{ 'warning': timeWarning, 'danger': timeDanger }">
            <el-icon class="timer-icon"><Timer /></el-icon>
            <span class="timer-text">{{ formatTime(remainingTime) }}</span>
          </div>
          <el-button 
            text 
            type="primary" 
            size="small" 
            @click="showSettings = true"
            class="settings-btn"
          >
            <el-icon><Setting /></el-icon>
          </el-button>
        </div>
      </div>
    </div>

    <!-- 主答题区域 -->
    <div class="main-content">
      <div class="question-container" v-if="currentQuestion">
        <!-- 题目卡片 -->
        <div class="question-card">
          <div class="question-header">
            <div class="question-meta">
              <div class="question-number">
                <span class="number">{{ (sessionData.currentCount || 0) + 1 }}</span>
                <span class="total">/ {{ sessionData.totalCount || 0 }}</span>
              </div>
              <div class="question-info">
                <el-tag 
                  v-if="currentQuestion.type"
                  :color="getQuestionTypeColor(currentQuestion.type)" 
                  size="large"
                >
                  {{ getQuestionTypeName(currentQuestion.type) }}
                </el-tag>
                <div class="question-score">
                  <el-icon><Star /></el-icon>
                  {{ currentQuestion.score || 0 }}分
                </div>
              </div>
            </div>
            <div class="question-actions">
              <el-button text @click="markQuestion" :type="isMarked ? 'warning' : 'info'">
                <el-icon><Flag /></el-icon>
                {{ isMarked ? '已标记' : '标记' }}
              </el-button>
            </div>
          </div>

          <div class="question-content">
            <h2 class="question-title">{{ currentQuestion.title || '题目加载中...' }}</h2>
            <div class="question-description" v-if="currentQuestion.content">
              {{ currentQuestion.content }}
            </div>
          </div>

          <!-- 答题区域 -->
          <div class="answer-section">
            <!-- 单选题 -->
            <div v-if="currentQuestion.type === 1" class="single-choice">
              <el-radio-group 
                v-model="userAnswer.singleChoice" 
                size="large"
                @change="handleAnswerChange"
              >
                <div 
                  v-for="(option, index) in (currentQuestion.optionList || [])"
                  :key="index"
                  class="option-item"
                  :class="{ 'selected': userAnswer.singleChoice === getOptionLabel(index) }"
                >
                  <el-radio :label="getOptionLabel(index)" class="option-radio">
                    <div class="option-content">
                      <span class="option-label">{{ getOptionLabel(index) }}</span>
                      <span class="option-text">{{ option }}</span>
                    </div>
                  </el-radio>
                </div>
              </el-radio-group>
            </div>

            <!-- 多选题 -->
            <div v-else-if="currentQuestion.type === 2" class="multiple-choice">
              <el-checkbox-group 
                v-model="userAnswer.multipleChoice" 
                size="large"
                @change="handleAnswerChange"
              >
                <div 
                  v-for="(option, index) in (currentQuestion.optionList || [])"
                  :key="index"
                  class="option-item"
                  :class="{ 'selected': userAnswer.multipleChoice.includes(getOptionLabel(index)) }"
                >
                  <el-checkbox :label="getOptionLabel(index)" class="option-checkbox">
                    <div class="option-content">
                      <span class="option-label">{{ getOptionLabel(index) }}</span>
                      <span class="option-text">{{ option }}</span>
                    </div>
                  </el-checkbox>
                </div>
              </el-checkbox-group>
            </div>

            <!-- 填空题 -->
            <div v-else-if="currentQuestion.type === 3" class="fill-blank">
              <div class="input-container">
                <el-input
                  v-model="userAnswer.fillBlank"
                  placeholder="请输入您的答案"
                  size="large"
                  clearable
                  @input="handleAnswerChange"
                  class="fill-input"
                />
                <div class="input-hint">
                  <el-icon><Edit /></el-icon>
                  请输入准确的答案
                </div>
              </div>
            </div>

            <!-- 简答题 -->
            <div v-else-if="currentQuestion.type === 4" class="short-answer">
              <div class="textarea-container">
                <el-input
                  v-model="userAnswer.shortAnswer"
                  type="textarea"
                  :rows="6"
                  placeholder="请详细阐述您的观点和答案..."
                  size="large"
                  show-word-limit
                  maxlength="1000"
                  @input="handleAnswerChange"
                  class="answer-textarea"
                />
                <div class="textarea-hint">
                  <el-icon><Document /></el-icon>
                  简答题需要人工评分，请详细作答
                </div>
              </div>
            </div>

            <!-- 评分题 -->
            <div v-else-if="currentQuestion.type === 5" class="rating">
              <div class="rating-container">
                <div class="rating-scale">
                  <el-rate
                    v-model="userAnswer.rating"
                    :max="10"
                    size="large"
                    allow-half
                    show-score
                    score-template="{value}分"
                    @change="handleAnswerChange"
                  />
                </div>
                <div class="rating-hint">
                  <el-icon><Star /></el-icon>
                  请根据题目要求进行评分（1-10分）
                </div>
              </div>
            </div>
          </div>

          <!-- 答题提示 -->
          <div class="answer-tips" v-if="currentQuestion.explanation">
            <el-collapse>
              <el-collapse-item title="查看解析" name="explanation">
                <div class="explanation-content">
                  {{ currentQuestion.explanation }}
                </div>
              </el-collapse-item>
            </el-collapse>
          </div>
        </div>

        <!-- 操作按钮 -->
        <div class="action-buttons">
          <div class="left-actions">
            <el-button 
              size="large" 
              @click="previousQuestion"
              :disabled="(sessionData.currentCount || 0) === 0"
            >
              <el-icon><ArrowLeft /></el-icon>
              上一题
            </el-button>
          </div>
          
          <div class="center-actions">
            <el-button size="large" @click="saveAsDraft" :loading="saving">
              <el-icon><Document /></el-icon>
              保存草稿
            </el-button>
            <el-button size="large" type="warning" @click="skipQuestion">
              <el-icon><DArrowRight /></el-icon>
              跳过
            </el-button>
          </div>

          <div class="right-actions">
            <el-button 
              v-if="(sessionData.currentCount || 0) < (sessionData.totalCount || 1) - 1"
              type="primary" 
              size="large" 
              @click="submitAnswer"
              :loading="submitting"
              :disabled="!hasAnswer"
            >
              提交并下一题
              <el-icon><ArrowRight /></el-icon>
            </el-button>
            <el-button 
              v-else
              type="success" 
              size="large" 
              @click="finishSession"
              :loading="submitting"
            >
              <el-icon><Check /></el-icon>
              完成答题
            </el-button>
          </div>
        </div>
      </div>

      <!-- 加载状态 -->
      <div v-else class="loading-container">
        <el-skeleton :rows="8" animated />
      </div>
    </div>

    <!-- 侧边栏（题目导航） -->
    <div class="sidebar" :class="{ 'collapsed': sidebarCollapsed }">
      <div class="sidebar-header">
        <h3 v-if="!sidebarCollapsed">题目导航</h3>
        <el-button 
          text 
          @click="sidebarCollapsed = !sidebarCollapsed"
          class="collapse-btn"
        >
          <el-icon><Fold v-if="!sidebarCollapsed" /><Expand v-else /></el-icon>
        </el-button>
      </div>
      
      <div class="sidebar-content" v-if="!sidebarCollapsed">
        <div class="question-grid">
          <div
            v-for="n in (sessionData.totalCount || 0)"
            :key="n"
            class="question-nav-item"
            :class="{
              'current': n - 1 === (sessionData.currentCount || 0),
              'answered': answeredQuestions.includes(n - 1),
              'marked': markedQuestions.includes(n - 1)
            }"
            @click="jumpToQuestion(n - 1)"
          >
            <span class="question-nav-number">{{ n }}</span>
            <el-icon v-if="markedQuestions.includes(n - 1)" class="mark-icon">
              <Flag />
            </el-icon>
          </div>
        </div>
        
        <div class="sidebar-stats">
          <div class="stat-item">
            <span class="stat-label">已答题：</span>
            <span class="stat-value">{{ answeredQuestions.length || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">已标记：</span>
            <span class="stat-value">{{ markedQuestions.length || 0 }}</span>
          </div>
          <div class="stat-item">
            <span class="stat-label">剩余：</span>
            <span class="stat-value">{{ (sessionData.totalCount || 0) - (answeredQuestions.length || 0) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- 设置面板 -->
    <el-drawer v-model="showSettings" title="答题设置" size="300px">
      <div class="settings-content">
        <div class="setting-item">
          <label>暗黑模式</label>
          <el-switch v-model="isDarkMode" />
        </div>
        <div class="setting-item">
          <label>自动保存</label>
          <el-switch v-model="autoSave" />
        </div>
        <div class="setting-item">
          <label>答题提示音</label>
          <el-switch v-model="soundEnabled" />
        </div>
        <div class="setting-item">
          <label>字体大小</label>
          <el-slider v-model="fontSize" :min="12" :max="20" />
        </div>
      </div>
    </el-drawer>

    <!-- 完成确认对话框 -->
    <el-dialog v-model="showFinishDialog" title="完成答题" width="500px" :before-close="handleClose">
      <div class="finish-summary">
        <div class="summary-stats">
          <div class="stat-card">
            <div class="stat-number">{{ sessionData.totalCount || 0 }}</div>
            <div class="stat-label">总题数</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ answeredQuestions.length || 0 }}</div>
            <div class="stat-label">已答题</div>
          </div>
          <div class="stat-card">
            <div class="stat-number">{{ sessionData.currentScore || 0 }}</div>
            <div class="stat-label">当前得分</div>
          </div>
        </div>
        <div class="unanswered-warning" v-if="unansweredCount > 0">
          <el-alert
            :title="`还有 ${unansweredCount} 道题未作答`"
            type="warning"
            show-icon
            :closable="false"
          />
        </div>
      </div>
      <template #footer>
        <el-button @click="showFinishDialog = false">继续答题</el-button>
        <el-button type="primary" @click="confirmFinish" :loading="finishing">
          确认提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Timer, Setting, Star, Flag, Edit, Document, Check,
  ArrowLeft, ArrowRight, DArrowRight, Fold, Expand
} from '@element-plus/icons-vue'
import { answerSessionApi } from '../api/answerSession'
import { answerRecordApi } from '../api/answerRecord'
import { 
  QUESTION_TYPE_NAMES,
  QUESTION_TYPE_COLORS
} from '../constants/questionTypes'

// 组件名称
defineOptions({
  name: 'AnswerQuestion'
})

const route = useRoute()
const router = useRouter()

// 响应式数据
const sessionCode = route.params.sessionCode
const sessionData = ref({
  sessionCode: '',
  questionType: null,
  currentCount: 0,
  totalCount: 0,
  currentScore: 0,
  timeoutMinutes: 60
})
const currentQuestion = ref(null)
const submitting = ref(false)
const saving = ref(false)
const finishing = ref(false)
const loading = ref(true)

// UI 控制
const showSettings = ref(false)
const showFinishDialog = ref(false)
const sidebarCollapsed = ref(false)
const isDarkMode = ref(false)
const autoSave = ref(true)
const soundEnabled = ref(true)
const fontSize = ref(16)

// 答题状态
const userAnswer = reactive({
  singleChoice: '',
  multipleChoice: [],
  fillBlank: '',
  shortAnswer: '',
  rating: 0
})
const answeredQuestions = ref([])
const markedQuestions = ref([])
const isMarked = ref(false)

// 计时器
const remainingTime = ref(0)
const questionStartTime = ref(Date.now())
let timer = null

// 计算属性
const progressPercentage = computed(() => {
  const current = sessionData.value.currentCount || 0
  const total = sessionData.value.totalCount || 1
  return Math.round((current / total) * 100)
})

const hasAnswer = computed(() => {
  if (!currentQuestion.value) return false
  
  try {
    switch (currentQuestion.value.type) {
      case 1: return !!userAnswer.singleChoice
      case 2: return userAnswer.multipleChoice.length > 0
      case 3: return !!userAnswer.fillBlank?.trim()
      case 4: return !!userAnswer.shortAnswer?.trim()
      case 5: return userAnswer.rating > 0
      default: return false
    }
  } catch (error) {
    console.error('检查答案状态失败:', error)
    return false
  }
})

const timeWarning = computed(() => remainingTime.value <= 300) // 5分钟警告
const timeDanger = computed(() => remainingTime.value <= 60)   // 1分钟危险

const unansweredCount = computed(() => {
  const total = sessionData.value.totalCount || 0
  const answered = answeredQuestions.value.length || 0
  return Math.max(0, total - answered)
})

// 工具函数
const getQuestionTypeName = (type) => {
  try {
    return QUESTION_TYPE_NAMES[type] || '未知题型'
  } catch (error) {
    console.error('获取题型名称失败:', error)
    return '未知题型'
  }
}

const getQuestionTypeColor = (type) => {
  try {
    return QUESTION_TYPE_COLORS[type] || '#909399'
  } catch (error) {
    console.error('获取题型颜色失败:', error)
    return '#909399'
  }
}

const getOptionLabel = (index) => {
  try {
    return String.fromCharCode(65 + index) // A, B, C, D...
  } catch (error) {
    console.error('生成选项标签失败:', error)
    return `选项${index + 1}`
  }
}

const formatTime = (seconds) => {
  try {
    if (!seconds || seconds < 0) return '00:00'
    
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`
  } catch (error) {
    console.error('格式化时间失败:', error)
    return '00:00'
  }
}

// 方法
const loadSessionData = async () => {
  try {
    loading.value = true
    
    if (!sessionCode) {
      throw new Error('会话代码无效')
    }
    
    const response = await answerSessionApi.getSessionDetail(sessionCode)
    if (response && response.data) {
      sessionData.value = { ...sessionData.value, ...response.data }
      remainingTime.value = calculateRemainingTime(response.data)
      startTimer()
    } else {
      throw new Error('会话数据为空')
    }
  } catch (error) {
    console.error('加载会话数据失败:', error)
    ElMessage.error('加载会话失败，请重试')
    router.push('/start-answer')
  } finally {
    loading.value = false
  }
}

const loadCurrentQuestion = async () => {
  try {
    if (!sessionCode) {
      throw new Error('会话代码无效')
    }
    
    const response = await answerRecordApi.getNextQuestion(sessionCode)
    if (response && response.data) {
      currentQuestion.value = response.data
      
      // 重置答案
      resetUserAnswer()
      
      // 检查是否已标记
      isMarked.value = markedQuestions.value.includes(sessionData.value.currentCount || 0)
      
      // 记录开始时间
      questionStartTime.value = Date.now()
    } else {
      throw new Error('题目数据为空')
    }
  } catch (error) {
    console.error('加载题目失败:', error)
    ElMessage.error('加载题目失败，请重试')
  }
}

const resetUserAnswer = () => {
  try {
    userAnswer.singleChoice = ''
    userAnswer.multipleChoice = []
    userAnswer.fillBlank = ''
    userAnswer.shortAnswer = ''
    userAnswer.rating = 0
  } catch (error) {
    console.error('重置答案失败:', error)
  }
}

const handleAnswerChange = () => {
  try {
    // 自动保存功能
    if (autoSave.value) {
      saveAsDraft()
    }
    
    // 提示音
    if (soundEnabled.value) {
      playNotificationSound()
    }
  } catch (error) {
    console.error('处理答案变化失败:', error)
  }
}

const playNotificationSound = () => {
  try {
    // 创建简单的提示音
    if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
      const audioContext = new (window.AudioContext || window.webkitAudioContext)()
      const oscillator = audioContext.createOscillator()
      const gainNode = audioContext.createGain()
      
      oscillator.connect(gainNode)
      gainNode.connect(audioContext.destination)
      
      oscillator.frequency.value = 800
      gainNode.gain.value = 0.1
      
      oscillator.start()
      setTimeout(() => oscillator.stop(), 100)
    }
  } catch (error) {
    console.error('播放提示音失败:', error)
  }
}

const saveAsDraft = async () => {
  try {
    saving.value = true
    
    if (!currentQuestion.value || !currentQuestion.value.id) {
      console.warn('当前题目信息无效，跳过保存草稿')
      return
    }
    
    const answer = getCurrentAnswer()
    if (!answer.trim()) {
      console.warn('答案为空，跳过保存草稿')
      return
    }
    
    await answerRecordApi.saveDraft({
      sessionCode,
      questionId: currentQuestion.value.id,
      answer,
      timeUsed: Math.floor((Date.now() - questionStartTime.value) / 1000)
    })
    
    ElMessage.success('草稿已保存')
  } catch (error) {
    console.error('保存草稿失败:', error)
    // 草稿保存失败不应该阻止用户继续答题
  } finally {
    saving.value = false
  }
}

const getCurrentAnswer = () => {
  try {
    if (!currentQuestion.value) return ''
    
    switch (currentQuestion.value.type) {
      case 1: return userAnswer.singleChoice || ''
      case 2: return (userAnswer.multipleChoice || []).join(',')
      case 3: return userAnswer.fillBlank || ''
      case 4: return userAnswer.shortAnswer || ''
      case 5: return (userAnswer.rating || 0).toString()
      default: return ''
    }
  } catch (error) {
    console.error('获取当前答案失败:', error)
    return ''
  }
}

const submitAnswer = async () => {
  try {
    if (!hasAnswer.value) {
      ElMessage.warning('请先回答问题')
      return
    }
    
    submitting.value = true
    
    if (!currentQuestion.value || !currentQuestion.value.id) {
      throw new Error('当前题目信息无效')
    }
    
    const submitData = {
      sessionCode: sessionCode,
      questionId: currentQuestion.value.id,
      timeSpentSeconds: Math.floor((Date.now() - questionStartTime.value) / 1000)
    }

    // 根据题型设置答案
    switch (currentQuestion.value.type) {
      case 1:
        submitData.userAnswer = userAnswer.singleChoice
        break
      case 2:
        submitData.userAnswerList = userAnswer.multipleChoice
        break
      case 3:
        submitData.userAnswer = userAnswer.fillBlank
        break
      case 4:
        submitData.userAnswer = userAnswer.shortAnswer
        break
      case 5:
        submitData.userAnswer = userAnswer.rating.toString()
        break
    }

    const response = await answerRecordApi.submitAnswer(submitData)
    if (response && response.data) {
      ElMessage.success('答案已提交')
      
      // 更新已答题列表
      const currentIndex = sessionData.value.currentCount || 0
      if (!answeredQuestions.value.includes(currentIndex)) {
        answeredQuestions.value.push(currentIndex)
      }
      
      // 更新得分
      sessionData.value.currentScore = (sessionData.value.currentScore || 0) + (response.data.finalScore || 0)
      
      // 下一题
      sessionData.value.currentCount = (sessionData.value.currentCount || 0) + 1
      
      if (sessionData.value.currentCount < sessionData.value.totalCount) {
        await loadCurrentQuestion()
      } else {
        showFinishDialog.value = true
      }
    }
  } catch (error) {
    console.error('提交答案失败:', error)
    ElMessage.error('提交答案失败，请重试')
  } finally {
    submitting.value = false
  }
}

const skipQuestion = async () => {
  try {
    await ElMessageBox.confirm('确定跳过这道题吗？跳过的题目可以稍后回答。', '确认跳过', {
      confirmButtonText: '跳过',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    sessionData.value.currentCount = (sessionData.value.currentCount || 0) + 1
    
    if (sessionData.value.currentCount < sessionData.value.totalCount) {
      await loadCurrentQuestion()
    } else {
      showFinishDialog.value = true
    }
    
    ElMessage.info('已跳过当前题目')
  } catch (error) {
    if (error !== 'cancel') {
      console.error('跳过题目失败:', error)
      ElMessage.error('操作失败，请重试')
    }
  }
}

const previousQuestion = () => {
  try {
    if ((sessionData.value.currentCount || 0) > 0) {
      sessionData.value.currentCount = (sessionData.value.currentCount || 1) - 1
      loadCurrentQuestion()
    }
  } catch (error) {
    console.error('跳转上一题失败:', error)
    ElMessage.error('跳转失败，请重试')
  }
}

const jumpToQuestion = (index) => {
  try {
    if (index >= 0 && index < (sessionData.value.totalCount || 0)) {
      sessionData.value.currentCount = index
      loadCurrentQuestion()
    }
  } catch (error) {
    console.error('跳转题目失败:', error)
    ElMessage.error('跳转失败，请重试')
  }
}

const markQuestion = () => {
  try {
    const currentIndex = sessionData.value.currentCount || 0
    if (markedQuestions.value.includes(currentIndex)) {
      markedQuestions.value = markedQuestions.value.filter(i => i !== currentIndex)
      isMarked.value = false
      ElMessage.info('已取消标记')
    } else {
      markedQuestions.value.push(currentIndex)
      isMarked.value = true
      ElMessage.info('已标记题目')
    }
  } catch (error) {
    console.error('标记题目失败:', error)
    ElMessage.error('标记失败，请重试')
  }
}

const finishSession = () => {
  showFinishDialog.value = true
}

const confirmFinish = async () => {
  try {
    finishing.value = true
    
    const response = await answerSessionApi.finishSession(sessionCode)
    if (response) {
      ElMessage.success('答题完成！')
      router.push('/my-records')
    }
  } catch (error) {
    console.error('完成答题失败:', error)
    ElMessage.error('完成失败，请重试')
  } finally {
    finishing.value = false
  }
}

const handleClose = (done) => {
  ElMessageBox.confirm('确定要关闭吗？未保存的答案将丢失', '确认关闭', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    done()
  }).catch(() => {
    // 用户取消关闭
  })
}

const calculateRemainingTime = (session) => {
  try {
    if (!session || !session.timeoutMinutes || !session.startTime) return 0
    
    const timeoutMs = session.timeoutMinutes * 60 * 1000
    const elapsedMs = Date.now() - new Date(session.startTime).getTime()
    return Math.max(0, Math.floor((timeoutMs - elapsedMs) / 1000))
  } catch (error) {
    console.error('计算剩余时间失败:', error)
    return 0
  }
}

const startTimer = () => {
  if (timer) {
    clearInterval(timer)
  }
  
  timer = setInterval(() => {
    if (remainingTime.value > 0) {
      remainingTime.value--
    } else {
      clearInterval(timer)
      ElMessage.error('答题时间已到！')
      router.push('/my-records')
    }
  }, 1000)
}

// 生命周期
onMounted(async () => {
  try {
    await loadSessionData()
    await loadCurrentQuestion()
  } catch (error) {
    console.error('页面初始化失败:', error)
  }
})

onBeforeUnmount(() => {
  if (timer) {
    clearInterval(timer)
  }
})

// 监听字体大小变化
watch(fontSize, (newSize) => {
  try {
    document.documentElement.style.setProperty('--font-size', `${newSize}px`)
  } catch (error) {
    console.error('设置字体大小失败:', error)
  }
})
</script>

<style scoped>
.answer-question {
  min-height: 100vh;
  background: linear-gradient(135deg, var(--color-primary) 0%, var(--color-primary-dark) 100%);
  position: relative;
  font-size: var(--font-size, var(--font-size-base));
  transition: all var(--transition-base);
  color: var(--color-text-primary);
}

.dark-mode {
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
  color: #e2e8f0;
}

/* 顶部进度栏 */
.top-progress-bar {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(10px);
  z-index: 1000;
  border-bottom: 1px solid var(--color-border);
}

.dark-mode .top-progress-bar {
  background: rgba(45, 55, 72, 0.95);
  border-bottom-color: rgba(255, 255, 255, 0.1);
}

.progress-container {
  display: flex;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-xl);
  max-width: 1400px;
  margin: 0 auto;
  gap: var(--spacing-xl);
}

.session-info {
  flex-shrink: 0;
}

.session-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xs);
}

.session-code {
  font-size: var(--font-size-xs);
  color: var(--color-text-tertiary);
  font-family: monospace;
}

.progress-text {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.dark-mode .progress-text {
  color: #e2e8f0;
}

.progress-bar-wrapper {
  flex: 1;
  margin: 0 var(--spacing-xl);
}

.main-progress {
  margin-bottom: var(--spacing-sm);
}

.progress-labels {
  display: flex;
  justify-content: space-between;
  font-size: var(--font-size-xs);
  color: var(--color-text-secondary);
}

.timer-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
}

.timer-container {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  padding: var(--spacing-sm) var(--spacing-lg);
  background: var(--color-bg-subtle);
  border-radius: var(--border-radius-full);
  transition: all var(--transition-base);
}

.timer-container.warning {
  background: var(--color-warning-light);
  color: var(--color-warning-dark);
}

.timer-container.danger {
  background: var(--color-error-light);
  color: var(--color-error-dark);
  animation: pulse 1s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}

.timer-text {
  font-family: monospace;
  font-weight: var(--font-weight-bold);
  font-size: var(--font-size-lg);
}

/* 主内容区域 */
.main-content {
  padding: 100px var(--spacing-xl) var(--spacing-xl);
  margin-right: 320px;
  transition: margin-right var(--transition-base);
}

.sidebar.collapsed + .main-content {
  margin-right: 60px;
}

.question-container {
  max-width: 900px;
  margin: 0 auto;
}

/* 题目卡片 */
.question-card {
  background: var(--color-bg-elevated);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
  margin-bottom: var(--spacing-xl);
  box-shadow: var(--shadow-elevated);
  transition: all var(--transition-base);
}

.dark-mode .question-card {
  background: #2d3748;
  color: #e2e8f0;
}

.question-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
  padding-bottom: var(--spacing-lg);
  border-bottom: 2px solid var(--color-border);
}

.dark-mode .question-header {
  border-bottom-color: #4a5568;
}

.question-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-xl);
}

.question-number {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-xs);
}

.question-number .number {
  font-size: var(--font-size-4xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
}

.question-number .total {
  font-size: var(--font-size-xl);
  color: var(--color-text-secondary);
}

.question-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.question-score {
  display: flex;
  align-items: center;
  gap: var(--spacing-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-warning);
}

.question-content {
  margin-bottom: var(--spacing-xl);
}

.question-title {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
  margin-bottom: var(--spacing-lg);
  line-height: var(--line-height-relaxed);
}

.dark-mode .question-title {
  color: #f7fafc;
}

.question-description {
  color: var(--color-text-secondary);
  line-height: var(--line-height-relaxed);
  font-size: var(--font-size-lg);
}

.dark-mode .question-description {
  color: #a0aec0;
}

/* 答题区域样式 */
.answer-section {
  margin-bottom: var(--spacing-xl);
}

.option-item {
  margin-bottom: var(--spacing-lg);
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-lg);
  transition: all var(--transition-base);
  cursor: pointer;
  background: var(--color-bg-elevated);
}

.option-item:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  transform: translateY(-1px);
  box-shadow: var(--shadow-subtle);
}

.option-item.selected {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  box-shadow: var(--shadow-moderate);
}

.dark-mode .option-item {
  border-color: #4a5568;
  background: transparent;
}

.dark-mode .option-item:hover {
  border-color: var(--color-primary);
  background: #2d3748;
}

.dark-mode .option-item.selected {
  border-color: var(--color-primary);
  background: #2d3748;
}

.option-content {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
}

.option-label {
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  font-size: var(--font-size-lg);
  min-width: 30px;
  flex-shrink: 0;
}

.option-text {
  flex: 1;
  font-size: var(--font-size-base);
  line-height: var(--line-height-relaxed);
}

.fill-input,
.answer-textarea {
  margin-bottom: var(--spacing-sm);
}

.input-hint,
.textarea-hint,
.rating-hint {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.rating-container {
  text-align: center;
  padding: var(--spacing-xl);
}

.rating-scale {
  margin-bottom: var(--spacing-lg);
}

/* 操作按钮 */
.action-buttons {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-xl) 0;
  gap: var(--spacing-lg);
}

.left-actions,
.center-actions,
.right-actions {
  display: flex;
  gap: var(--spacing-lg);
}

.action-buttons .el-button {
  padding: var(--spacing-md) var(--spacing-xl);
  font-size: var(--font-size-base);
  border-radius: var(--border-radius-md);
  font-weight: var(--font-weight-medium);
}

/* 侧边栏 */
.sidebar {
  position: fixed;
  top: 80px;
  right: 0;
  width: 300px;
  height: calc(100vh - 80px);
  background: var(--color-bg-elevated);
  border-left: 1px solid var(--color-border);
  padding: var(--spacing-xl);
  overflow-y: auto;
  transition: all var(--transition-base);
  box-shadow: var(--shadow-subtle);
}

.sidebar.collapsed {
  width: 60px;
}

.dark-mode .sidebar {
  background: #2d3748;
  border-left-color: #4a5568;
}

.sidebar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.sidebar-header h3 {
  margin: 0;
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-medium);
}

.question-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--spacing-sm);
  margin-bottom: var(--spacing-xl);
}

.question-nav-item {
  position: relative;
  width: 40px;
  height: 40px;
  border: 2px solid var(--color-border);
  border-radius: var(--border-radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all var(--transition-base);
  font-weight: var(--font-weight-medium);
}

.question-nav-item:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-light);
  transform: scale(1.05);
}

.question-nav-item.current {
  border-color: var(--color-primary);
  background: var(--color-primary);
  color: white;
}

.question-nav-item.answered {
  border-color: var(--color-success);
  background: var(--color-success);
  color: white;
}

.question-nav-item.marked {
  border-color: var(--color-warning);
}

.question-nav-item.marked::after {
  content: '';
  position: absolute;
  top: -2px;
  right: -2px;
  width: 8px;
  height: 8px;
  background: var(--color-warning);
  border-radius: 50%;
}

.sidebar-stats {
  border-top: 1px solid var(--color-border);
  padding-top: var(--spacing-lg);
}

.dark-mode .sidebar-stats {
  border-top-color: #4a5568;
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--spacing-sm);
}

.stat-label {
  color: var(--color-text-secondary);
}

.stat-value {
  font-weight: var(--font-weight-semibold);
  color: var(--color-text-primary);
}

.dark-mode .stat-value {
  color: #f7fafc;
}

/* 设置面板 */
.settings-content {
  padding: var(--spacing-xl) 0;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-xl);
}

.setting-item label {
  font-weight: var(--font-weight-medium);
}

/* 完成对话框 */
.finish-summary {
  text-align: center;
}

.summary-stats {
  display: flex;
  justify-content: space-around;
  margin-bottom: var(--spacing-xl);
}

.stat-card {
  text-align: center;
}

.stat-card .stat-number {
  font-size: var(--font-size-3xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary);
  margin-bottom: var(--spacing-xs);
}

.stat-card .stat-label {
  color: var(--color-text-secondary);
  font-size: var(--font-size-sm);
}

.unanswered-warning {
  margin-top: var(--spacing-lg);
}

/* 加载状态 */
.loading-container {
  max-width: 900px;
  margin: 0 auto;
  background: var(--color-bg-elevated);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-2xl);
}

.dark-mode .loading-container {
  background: #2d3748;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .main-content {
    margin-right: 0;
    padding: 80px var(--spacing-lg) var(--spacing-lg);
  }
  
  .sidebar {
    transform: translateX(100%);
  }
  
  .sidebar.collapsed {
    transform: translateX(0);
    width: 100%;
  }
  
  .progress-container {
    flex-direction: column;
    gap: var(--spacing-sm);
    padding: var(--spacing-md);
  }
  
  .action-buttons {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .left-actions,
  .center-actions,
  .right-actions {
    justify-content: center;
  }
  
  .question-card {
    padding: var(--spacing-xl);
  }
  
  .question-number .number {
    font-size: var(--font-size-3xl);
  }
  
  .question-title {
    font-size: var(--font-size-xl);
  }
}

@media (max-width: 480px) {
  .question-grid {
    grid-template-columns: repeat(4, 1fr);
  }
  
  .progress-container {
    padding: var(--spacing-sm);
  }
  
  .question-meta {
    flex-direction: column;
    gap: var(--spacing-md);
    align-items: flex-start;
  }
  
  .option-content {
    flex-direction: column;
    align-items: flex-start;
    gap: var(--spacing-sm);
  }
}
</style> 