<template>
  <div class="answer-record-detail">
    <div class="page-header">
      <div class="header-content">
        <h1 class="page-title">
          <el-icon class="title-icon"><Document /></el-icon>
          答题记录详情
        </h1>
        <el-button @click="goBack" type="primary" class="back-btn">
          <el-icon><ArrowLeft /></el-icon>
          返回列表
        </el-button>
      </div>
    </div>



    <div class="content" v-loading="loading">
      <div class="empty-state" v-if="!loading && !sessionDetail && (!answerDetails || answerDetails.length === 0)" style="background: white; padding: 32px; border-radius: 16px; text-align: center; box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);">
        <el-empty description="暂无答题记录数据">
          <template #description>
            <div>
              <p style="color: #6b7280; margin-bottom: 16px;">{{ errorMessage || '暂无答题记录数据，请检查会话编码是否正确' }}</p>
              <el-button type="primary" @click="goBack">返回列表</el-button>
              <el-button @click="loadAllData" style="margin-left: 10px;">重新加载</el-button>
            </div>
          </template>
        </el-empty>
      </div>

      <div class="overview-section">
        <div class="overview-cards" :class="{ 'cards-ready': contentReady }">
          <!-- 答题状态卡片 -->
          <div class="overview-card status-card" v-show="contentReady">
            <div class="card-icon status-icon">
              <el-icon><CircleCheck /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">
                <el-tag :type="statusInfo.type" size="large" class="status-tag">
                  {{ statusInfo.label }}
                </el-tag>
              </div>
              <div class="card-label">答题状态</div>
            </div>
          </div>
          <div class="overview-card status-card placeholder" v-show="!contentReady">
            <div class="card-icon status-icon skeleton"></div>
            <div class="card-content">
              <div class="card-value skeleton-text">--</div>
              <div class="card-label">答题状态</div>
            </div>
          </div>

          <!-- 答题用时卡片 -->
          <div class="overview-card time-card" v-show="contentReady">
            <div class="card-icon time-icon">
              <el-icon><Clock /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ getFormattedDuration() }}</div>
              <div class="card-label">答题用时</div>
            </div>
          </div>
          <div class="overview-card time-card placeholder" v-show="!contentReady">
            <div class="card-icon time-icon skeleton"></div>
            <div class="card-content">
              <div class="card-value skeleton-text">--</div>
              <div class="card-label">答题用时</div>
            </div>
          </div>

          <!-- 题目总数卡片 -->
          <div class="overview-card question-card" v-show="contentReady">
            <div class="card-icon question-icon">
              <el-icon><Document /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ stableSessionDetail?.questionCount || stableSessionDetail?.totalQuestions || stableAnswerDetails?.length || 0 }}</div>
              <div class="card-label">题目总数</div>
            </div>
          </div>
          <div class="overview-card question-card placeholder" v-show="!contentReady">
            <div class="card-icon question-icon skeleton"></div>
            <div class="card-content">
              <div class="card-value skeleton-text">--</div>
              <div class="card-label">题目总数</div>
            </div>
          </div>

          <!-- 总得分卡片 -->
          <div class="overview-card score-card" v-show="contentReady && (stableSessionDetail?.status === 2 || (stableSessionDetail?.totalScore !== undefined))">
            <div class="card-icon score-icon">
              <el-icon><Trophy /></el-icon>
            </div>
            <div class="card-content">
              <div class="card-value">{{ stableSessionDetail?.totalScore || 0 }}/{{ stableSessionDetail?.maxScore || 0 }}</div>
              <div class="card-label">总得分</div>
            </div>
          </div>
          <div class="overview-card score-card placeholder" v-show="!contentReady">
            <div class="card-icon score-icon skeleton"></div>
            <div class="card-content">
              <div class="card-value skeleton-text">--/--</div>
              <div class="card-label">总得分</div>
            </div>
          </div>
        </div>
      </div>

      <el-card class="score-card-detail" v-if="!loading && contentReady && ((stableSessionDetail && stableSessionDetail.status === 2) || (stableSessionDetail?.totalScore !== undefined))" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon class="header-icon score-header-icon"><Trophy /></el-icon>
              <span class="header-title">成绩报告</span>
            </div>
            <el-tag :type="gradeInfo.type" size="large" class="grade-tag">
              <el-icon><Medal /></el-icon>
              {{ gradeInfo.label }}
            </el-tag>
          </div>
        </template>
        <div class="score-content">
          <div class="score-summary">
            <div class="score-circle">
              <div class="circle-progress">
                <div class="progress-text">
                  <div class="score-main">{{ sessionDetail?.totalScore || 0 }}</div>
                  <div class="score-total">/ {{ sessionDetail?.maxScore || 0 }}</div>
                </div>
              </div>
            </div>
            <div class="score-details">
              <div class="score-metric">
                <div class="metric-icon">
                  <el-icon><TrendCharts /></el-icon>
                </div>
                <div class="metric-content">
                  <div class="metric-value">{{ scorePercentage }}%</div>
                  <div class="metric-label">得分率</div>
                </div>
              </div>
              <div class="score-metric">
                <div class="metric-icon">
                  <el-icon><Star /></el-icon>
                </div>
                <div class="metric-content">
                  <div class="metric-value">{{ gradeInfo.label }}</div>
                  <div class="metric-label">成绩等级</div>
                </div>
              </div>
            </div>
          </div>

          <div class="feedback-section" v-if="feedback">
            <div class="feedback-header">
              <el-icon><ChatDotRound /></el-icon>
              <span>评语反馈</span>
            </div>
            <div class="feedback-content">
              <p class="feedback-text">{{ feedback.content }}</p>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="statistics-card" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon class="header-icon stats-header-icon"><DataAnalysis /></el-icon>
              <span class="header-title">答题统计</span>
            </div>
            <div class="progress-indicator">
              <el-progress
                :percentage="answerProgress"
                :color="progressColor"
                :stroke-width="8"
                class="header-progress"
              />
            </div>
          </div>
        </template>
        <div class="statistics-content">
          <div class="stats-grid" :class="{ 'stats-ready': contentReady }">
            <!-- 正确题数 -->
            <div class="stat-card correct-card" v-show="contentReady">
              <div class="stat-icon correct-icon">
                <el-icon><Select /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stableStatistics?.correctCount || calculatedStats.correctCount || 0 }}</div>
                <div class="stat-label">正确题数</div>
              </div>
              <div class="stat-trend">
                <el-icon class="trend-icon"><TrendCharts /></el-icon>
              </div>
            </div>
            <div class="stat-card correct-card placeholder" v-show="!contentReady">
              <div class="stat-icon correct-icon skeleton"></div>
              <div class="stat-content">
                <div class="stat-number skeleton-text">--</div>
                <div class="stat-label">正确题数</div>
              </div>
              <div class="stat-trend">
                <el-icon class="trend-icon"><TrendCharts /></el-icon>
              </div>
            </div>

            <!-- 错误题数 -->
            <div class="stat-card wrong-card" v-show="contentReady">
              <div class="stat-icon wrong-icon">
                <el-icon><CloseBold /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stableStatistics?.wrongCount || calculatedStats.wrongCount || 0 }}</div>
                <div class="stat-label">错误题数</div>
              </div>
              <div class="stat-trend">
                <el-icon class="trend-icon"><TrendCharts /></el-icon>
              </div>
            </div>
            <div class="stat-card wrong-card placeholder" v-show="!contentReady">
              <div class="stat-icon wrong-icon skeleton"></div>
              <div class="stat-content">
                <div class="stat-number skeleton-text">--</div>
                <div class="stat-label">错误题数</div>
              </div>
              <div class="stat-trend">
                <el-icon class="trend-icon"><TrendCharts /></el-icon>
              </div>
            </div>

            <!-- 未答题数 -->
            <div class="stat-card unanswered-card" v-show="contentReady">
              <div class="stat-icon unanswered-icon">
                <el-icon><QuestionFilled /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ stableStatistics?.unansweredCount || calculatedStats.unansweredCount || 0 }}</div>
                <div class="stat-label">未答题数</div>
              </div>
              <div class="stat-trend">
                <el-icon class="trend-icon"><TrendCharts /></el-icon>
              </div>
            </div>
            <div class="stat-card unanswered-card placeholder" v-show="!contentReady">
              <div class="stat-icon unanswered-icon skeleton"></div>
              <div class="stat-content">
                <div class="stat-number skeleton-text">--</div>
                <div class="stat-label">未答题数</div>
              </div>
              <div class="stat-trend">
                <el-icon class="trend-icon"><TrendCharts /></el-icon>
              </div>
            </div>

            <!-- 答题总分 -->
            <div class="stat-card score-total-card" v-show="contentReady">
              <div class="stat-icon score-total-icon">
                <el-icon><Trophy /></el-icon>
              </div>
              <div class="stat-content">
                <div class="stat-number">{{ getTotalScore() }}</div>
                <div class="stat-label">答题总分</div>
              </div>
              <div class="stat-trend">
                <el-icon class="trend-icon"><TrendCharts /></el-icon>
              </div>
            </div>
            <div class="stat-card score-total-card placeholder" v-show="!contentReady">
              <div class="stat-icon score-total-icon skeleton"></div>
              <div class="stat-content">
                <div class="stat-number skeleton-text">--</div>
                <div class="stat-label">答题总分</div>
              </div>
              <div class="stat-trend">
                <el-icon class="trend-icon"><TrendCharts /></el-icon>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-card class="answers-card" v-if="!loading && contentReady && stableAnswerDetails && stableAnswerDetails.length > 0" shadow="hover">
        <template #header>
          <div class="card-header">
            <div class="header-left">
              <el-icon class="header-icon answers-header-icon"><Document /></el-icon>
              <span class="header-title">答题详情</span>
            </div>
            <div class="question-count">
              <el-tag type="info" size="large">
                共 {{ stableAnswerDetails.length }} 题
              </el-tag>
            </div>
          </div>
        </template>
        <div class="answers-content">
          <div class="answers-list">
            <div
              v-for="(item, index) in stableAnswerDetails"
              :key="item.id || index"
              class="answer-item"
              :class="getAnswerItemClass(item)"
            >
              <div class="question-header">
                <div class="question-meta">
                  <div class="question-number">
                    <span class="number">{{ index + 1 }}</span>
                  </div>
                  <div class="question-info">
                    <div class="question-type-badge">
                      <el-tag
                        :type="getQuestionTypeColor(item.questionType)"
                        size="small"
                        class="type-tag"
                      >
                        {{ item.questionTypeName || getQuestionTypeName(item.questionType) }}
                      </el-tag>
                    </div>
                    <div class="question-score">
                      <div class="score-display">
                        <span class="scored" :class="getScoreClass(item)">{{ getItemScore(item) }}</span>
                        <span class="separator">/</span>
                        <span class="total">{{ item.maxScore || item.totalScore || item.points || 1 }}</span>
                        <span class="unit">分</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div class="question-status">
                  <el-icon class="status-icon" :class="getStatusIconClass(item)">
                    <CircleCheck v-if="getStatusIcon(item) === 'CircleCheck'" />
                    <Warning v-else-if="getStatusIcon(item) === 'Warning'" />
                    <CloseBold v-else />
                  </el-icon>
                </div>
              </div>

              <div class="question-content">
                <div class="question-title">
                  <h4>{{ item.questionTitle || item.questionContent || '题目内容' }}</h4>
                </div>

                <div class="question-options" v-if="shouldShowOptions(item)">
                  <div class="options-header">
                    <el-icon><List /></el-icon>
                    <span>题目选项</span>
                  </div>
                  <div class="options-list">
                    <div 
                      v-for="(option, optionIndex) in parseOptions(getOptionsData(item))" 
                      :key="optionIndex"
                      class="option-item"
                      :class="getOptionClass(item, option, optionIndex)"
                    >
                      <span class="option-label">{{ getOptionLabel(optionIndex) }}.</span>
                      <span class="option-text">{{ option }}</span>
                    </div>
                  </div>
                </div>

                <div class="answer-section">
                  <div class="answer-block user-answer-block">
                    <div class="answer-header">
                      <el-icon class="answer-icon"><User /></el-icon>
                      <span class="answer-label">我的答案</span>
                    </div>
                    <div class="answer-content">
                      <span class="answer-text" :class="{ 'no-answer': !item.userAnswer }">
                        {{ item.userAnswer ? getFormattedAnswer(item, item.userAnswer, 'user') : '未作答' }}
                      </span>
                    </div>
                  </div>

                  <div class="answer-block correct-answer-block" v-if="item.correctAnswer">
                    <div class="answer-header">
                      <el-icon class="answer-icon"><CircleCheck /></el-icon>
                      <span class="answer-label">正确答案</span>
                    </div>
                    <div class="answer-content">
                      <span class="answer-text">{{ getFormattedAnswer(item, item.correctAnswer, 'correct') }}</span>
                    </div>
                  </div>

                  <div class="answer-block analysis-block" v-if="item.explanation">
                    <div class="answer-header">
                      <el-icon class="answer-icon"><Sunny /></el-icon>
                      <span class="answer-label">题目解析</span>
                    </div>
                    <div class="answer-content">
                      <p class="analysis-text">{{ item.explanation }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </el-card>

      <el-empty 
        v-if="!loading && (!sessionDetail || !answerDetails || answerDetails.length === 0)"
        description="暂无答题记录数据"
      >
        <template #description>
          <div>
            <p>暂无答题记录数据</p>
            <el-button type="primary" @click="goBack" size="small" style="margin-top: 16px;">
              返回列表
            </el-button>
          </div>
        </template>
      </el-empty>
      
      <el-alert
        v-if="errorMessage"
        :title="errorMessage"
        type="error"
        :closable="false"
        show-icon
        style="margin-top: 20px;"
      >
        <template #default>
          <div style="margin-top: 10px;">
            <el-button type="primary" @click="goBack" size="small">
              返回列表
            </el-button>
            <el-button @click="loadAllData" size="small" style="margin-left: 10px;">
              重试
            </el-button>
          </div>
        </template>
      </el-alert>
    </div>
  </div>
</template>

<script setup>
import {
  ArrowLeft,
  ArrowRight,
  InfoFilled,
  DataAnalysis,
  Document,
  House,
  Key,
  Calendar,
  Timer,
  Clock,
  CircleCheck,
  Trophy,
  Medal,
  TrendCharts,
  Star,
  ChatDotRound,
  Select,
  CloseBold,
  QuestionFilled,
  Odometer,
  User,
  Warning,
  List,
  Sunny
} from '@element-plus/icons-vue'
import { useAnswerRecordDetail } from '@/utils/answerRecordDetail'

defineOptions({
  name: 'AnswerRecordDetail'
})

const {
  loading,
  dataReady,
  contentReady,
  sessionCode,
  sessionDetail,
  answerDetails,
  statistics,
  feedback,
  errorMessage,
  stableSessionDetail,
  stableAnswerDetails,
  stableStatistics,
  statusInfo,
  gradeInfo,
  scorePercentage,
  calculatedStats,
  answerProgress,
  progressColor,
  goBack,
  loadAllData,
  getFormattedDuration,
  getTotalScore,
  getQuestionTypeName,
  getQuestionTypeColor,
  shouldShowOptions,
  getOptionsData,
  parseOptions,
  getOptionLabel,
  getOptionClass,
  getDataSource,
  getFormattedAnswer,
  getItemScore,
  getAnswerItemClass,
  getScoreClass,
  getStatusIcon,
  getStatusIconClass
} = useAnswerRecordDetail()
</script>

<style scoped>
@import '@/styles/answerRecordDetail.css';
</style> 