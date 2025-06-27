<template>
  <div class="questionnaire-records">
    <div class="header">
      <h2>问卷记录管理</h2>
      <p>管理所有用户的问卷填写记录和评分</p>
    </div>

    <!-- 筛选和操作栏 -->
    <div class="filter-section">
      <el-form :model="searchForm" :inline="true" class="search-form">
        <el-form-item label="问卷">
          <el-select v-model="searchForm.questionnaireId" placeholder="选择问卷" clearable>
            <el-option 
              v-for="item in questionnaireList" 
              :key="item.id" 
              :label="item.title" 
              :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        
        <el-form-item label="状态">
          <el-select v-model="searchForm.status" placeholder="选择状态" clearable>
            <el-option label="已提交" value="submitted"></el-option>
            <el-option label="审核中" value="reviewing"></el-option>
            <el-option label="已评分" value="scored"></el-option>
            <el-option label="已完成" value="completed"></el-option>
            <el-option label="已拒绝" value="rejected"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="等级">
          <el-select v-model="searchForm.grade" placeholder="选择等级" clearable>
            <el-option label="A-优秀" value="A"></el-option>
            <el-option label="B-良好" value="B"></el-option>
            <el-option label="C-及格" value="C"></el-option>
            <el-option label="D-不及格" value="D"></el-option>
          </el-select>
        </el-form-item>

        <el-form-item label="用户">
          <el-input v-model="searchForm.userName" placeholder="输入用户名" clearable></el-input>
        </el-form-item>

        <el-form-item label="时间范围">
          <el-date-picker
            v-model="searchForm.dateRange"
            type="daterange"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            format="YYYY-MM-DD"
            value-format="YYYY-MM-DD"
            clearable>
          </el-date-picker>
        </el-form-item>

        <el-form-item>
          <el-button type="primary" @click="handleSearch" :loading="loading">
            <el-icon><Search /></el-icon>
            搜索
          </el-button>
          <el-button @click="resetSearch">重置</el-button>
        </el-form-item>
      </el-form>

      <!-- 批量操作 -->
      <div class="batch-actions">
        <el-button 
          type="warning" 
          :disabled="selectedRecords.length === 0"
          @click="handleBatchStatus('reviewing')">
          批量标记为审核中
        </el-button>
        <el-button 
          type="success" 
          :disabled="selectedRecords.length === 0"
          @click="handleBatchStatus('completed')">
          批量标记为已完成
        </el-button>
        <el-button 
          type="info" 
          @click="handleExport">
          导出记录
        </el-button>
      </div>
    </div>

    <!-- 统计卡片 -->
    <div class="stats-cards">
      <el-row :gutter="20">
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.totalRecords || 0 }}</div>
              <div class="stat-label">总记录数</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.pendingReview || 0 }}</div>
              <div class="stat-label">待审核</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.averageScore || 0 }}分</div>
              <div class="stat-label">平均评分</div>
            </div>
          </el-card>
        </el-col>
        <el-col :span="6">
          <el-card shadow="hover">
            <div class="stat-item">
              <div class="stat-value">{{ statistics.passRate || 0 }}%</div>
              <div class="stat-label">通过率</div>
            </div>
          </el-card>
        </el-col>
      </el-row>
    </div>

    <!-- 数据表格 -->
    <el-card shadow="never" class="table-card">
      <el-table
        v-loading="loading"
        :data="recordList"
        @selection-change="handleSelectionChange"
        stripe
        style="width: 100%"
        :height="500"
        :show-overflow-tooltip="true"
        :lazy="true"
        row-key="id">
        
        <el-table-column type="selection" width="55"></el-table-column>
        
        <el-table-column prop="userName" label="用户" width="120">
          <template #default="scope">
            <div>{{ scope.row.userName }}</div>
            <div class="text-secondary">{{ scope.row.userEmail }}</div>
          </template>
        </el-table-column>
        
        <el-table-column prop="questionnaireTitle" label="问卷标题" min-width="200"></el-table-column>
        
        <el-table-column prop="submitTime" label="提交时间" width="160">
          <template #default="scope">
            {{ formatDate(scope.row.submitTime) }}
          </template>
        </el-table-column>
        
        <el-table-column prop="durationText" label="答题用时" width="100"></el-table-column>
        
        <el-table-column prop="status" label="状态" width="100">
          <template #default="scope">
            <el-tag :type="getStatusType(scope.row.status)">
              {{ scope.row.statusName }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column prop="totalScore" label="评分" width="100">
          <template #default="scope">
            <span v-if="scope.row.totalScore !== null">
              {{ scope.row.totalScore }}分
            </span>
            <span v-else class="text-muted">未评分</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="grade" label="等级" width="80">
          <template #default="scope">
            <el-tag 
              v-if="scope.row.grade" 
              :type="getGradeType(scope.row.grade)"
              size="small">
              {{ scope.row.grade }}
            </el-tag>
          </template>
        </el-table-column>
        
        <el-table-column label="操作" width="200" fixed="right">
          <template #default="scope">
            <el-button 
              type="primary" 
              size="small" 
              @click="handleViewDetail(scope.row)">
              查看详情
            </el-button>
            <el-button 
              v-if="!scope.row.totalScore" 
              type="success" 
              size="small" 
              @click="handleScore(scope.row)">
              评分
            </el-button>
            <el-button 
              v-else 
              type="warning" 
              size="small" 
              @click="handleScore(scope.row)">
              修改评分
            </el-button>
          </template>
        </el-table-column>
      </el-table>

      <!-- 分页 -->
      <el-pagination
        v-model:current-page="pagination.page"
        v-model:page-size="pagination.size"
        :total="pagination.total"
        :page-sizes="[10, 20, 50, 100]"
        layout="total, sizes, prev, pager, next, jumper"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        class="pagination">
      </el-pagination>
    </el-card>

    <!-- 评分弹窗 -->
    <el-dialog
      v-model="scoreDialog.visible"
      :title="scoreDialog.title"
      width="600px"
      :close-on-click-modal="false">
      
      <div class="score-form">
        <!-- 基本信息 -->
        <div class="record-info">
          <h4>记录信息</h4>
          <p><strong>用户：</strong>{{ currentRecord.userName }}</p>
          <p><strong>问卷：</strong>{{ currentRecord.questionnaireTitle }}</p>
          <p><strong>提交时间：</strong>{{ formatDate(currentRecord.submitTime) }}</p>
          <p><strong>答题用时：</strong>{{ currentRecord.durationText }}</p>
        </div>

        <el-divider></el-divider>

        <!-- 评分表单 -->
        <el-form :model="scoreForm" :rules="scoreRules" ref="scoreFormRef" label-width="100px">
          <el-form-item label="总体评分" prop="totalScore">
            <el-input-number 
              v-model="scoreForm.totalScore" 
              :min="0" 
              :max="100" 
              :precision="1"
              style="width: 200px">
            </el-input-number>
            <span style="margin-left: 10px;">分（0-100分）</span>
          </el-form-item>

          <el-form-item label="分项评分">
            <div class="sub-scores">
              <el-row :gutter="20">
                <el-col :span="8">
                  <div class="score-item">
                    <label>完整性（30%）</label>
                    <el-input-number 
                      v-model="scoreForm.subScores.completeness" 
                      :min="0" 
                      :max="100" 
                      size="small">
                    </el-input-number>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="score-item">
                    <label>准确性（40%）</label>
                    <el-input-number 
                      v-model="scoreForm.subScores.accuracy" 
                      :min="0" 
                      :max="100" 
                      size="small">
                    </el-input-number>
                  </div>
                </el-col>
                <el-col :span="8">
                  <div class="score-item">
                    <label>质量（30%）</label>
                    <el-input-number 
                      v-model="scoreForm.subScores.quality" 
                      :min="0" 
                      :max="100" 
                      size="small">
                    </el-input-number>
                  </div>
                </el-col>
              </el-row>
            </div>
          </el-form-item>

          <el-form-item label="等级评定" prop="grade">
            <el-radio-group v-model="scoreForm.grade">
              <el-radio value="A">A - 优秀（90-100分）</el-radio>
              <el-radio value="B">B - 良好（80-89分）</el-radio>
              <el-radio value="C">C - 及格（60-79分）</el-radio>
              <el-radio value="D">D - 不及格（0-59分）</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="通过状态" prop="isPassed">
            <el-radio-group v-model="scoreForm.isPassed">
              <el-radio :value="true">通过</el-radio>
              <el-radio :value="false">不通过</el-radio>
            </el-radio-group>
          </el-form-item>

          <el-form-item label="评语反馈">
            <el-input 
              v-model="scoreForm.feedback" 
              type="textarea" 
              :rows="4" 
              placeholder="请输入评语和改进建议...">
            </el-input>
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <el-button @click="scoreDialog.visible = false">取消</el-button>
        <el-button type="primary" @click="submitScore" :loading="scoreDialog.loading">
          {{ scoreDialog.isEdit ? '修改评分' : '提交评分' }}
        </el-button>
      </template>
    </el-dialog>

    <!-- 详情弹窗 -->
    <el-dialog
      v-model="detailDialog.visible"
      title="问卷记录详情"
      width="800px"
      :close-on-click-modal="false">
      
      <div v-loading="detailDialog.loading" style="min-height: 200px;">
        <div v-if="!detailDialog.loading && recordDetail">
          <!-- 基本信息 -->
          <el-card shadow="never" style="margin-bottom: 20px;">
            <template #header>
              <div class="card-header">
                <span>基本信息</span>
              </div>
            </template>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="记录ID">
                {{ recordDetail.id }}
              </el-descriptions-item>
              <el-descriptions-item label="响应ID">
                {{ recordDetail.response_id }}
              </el-descriptions-item>
              <el-descriptions-item label="用户姓名">
                {{ recordDetail.user_name }}
              </el-descriptions-item>
              <el-descriptions-item label="用户邮箱">
                {{ recordDetail.user_email }}
              </el-descriptions-item>
              <el-descriptions-item label="问卷标题">
                {{ recordDetail.questionnaire_title }}
              </el-descriptions-item>
              <el-descriptions-item label="问卷描述">
                {{ recordDetail.questionnaire_description || '无' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 时间信息 -->
          <el-card shadow="never" style="margin-bottom: 20px;">
            <template #header>
              <div class="card-header">
                <span>时间信息</span>
              </div>
            </template>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="开始时间">
                {{ formatDate(recordDetail.start_time) }}
              </el-descriptions-item>
              <el-descriptions-item label="提交时间">
                {{ formatDate(recordDetail.submit_time) }}
              </el-descriptions-item>
              <el-descriptions-item label="答题用时">
                {{ recordDetail.duration_seconds ? Math.floor(recordDetail.duration_seconds / 60) + '分钟' + (recordDetail.duration_seconds % 60) + '秒' : '未知' }}
              </el-descriptions-item>
              <el-descriptions-item label="创建时间">
                {{ formatDate(recordDetail.create_time) }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 状态信息 -->
          <el-card shadow="never" style="margin-bottom: 20px;">
            <template #header>
              <div class="card-header">
                <span>状态信息</span>
              </div>
            </template>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="当前状态">
                <el-tag :type="getStatusType(recordDetail.status)">
                  {{ getStatusName(recordDetail.status) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="IP地址">
                {{ recordDetail.ip_address || '未知' }}
              </el-descriptions-item>
            </el-descriptions>
          </el-card>

          <!-- 评分信息 -->
          <el-card shadow="never" v-if="recordDetail.total_score !== null">
            <template #header>
              <div class="card-header">
                <span>评分信息</span>
              </div>
            </template>
            
            <el-descriptions :column="2" border>
              <el-descriptions-item label="总体评分">
                <span style="font-size: 18px; font-weight: bold; color: #409eff;">
                  {{ recordDetail.total_score }}分
                </span>
              </el-descriptions-item>
              <el-descriptions-item label="等级评定">
                <el-tag 
                  v-if="recordDetail.grade" 
                  :type="getGradeType(recordDetail.grade)"
                  size="large">
                  {{ recordDetail.grade }} - {{ getGradeName(recordDetail.grade) }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="通过状态">
                <el-tag :type="recordDetail.is_passed ? 'success' : 'danger'">
                  {{ recordDetail.is_passed ? '通过' : '不通过' }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="评分者">
                {{ recordDetail.scorer_real_name || recordDetail.scorer_name || '未知' }}
              </el-descriptions-item>
              <el-descriptions-item label="评分时间" :span="2">
                {{ formatDate(recordDetail.score_time) }}
              </el-descriptions-item>
              <el-descriptions-item label="评语反馈" :span="2">
                <div style="max-height: 100px; overflow-y: auto;">
                  {{ recordDetail.feedback || '无评语' }}
                </div>
              </el-descriptions-item>
            </el-descriptions>

            <!-- 分项评分 -->
            <div v-if="recordDetail.sub_scores" style="margin-top: 20px;">
              <h4>分项评分</h4>
              <el-row :gutter="20">
                <el-col :span="8">
                  <el-statistic title="完整性" :value="getSubScore(recordDetail.sub_scores, 'completeness')" suffix="分" />
                </el-col>
                <el-col :span="8">
                  <el-statistic title="准确性" :value="getSubScore(recordDetail.sub_scores, 'accuracy')" suffix="分" />
                </el-col>
                <el-col :span="8">
                  <el-statistic title="质量" :value="getSubScore(recordDetail.sub_scores, 'quality')" suffix="分" />
                </el-col>
              </el-row>
            </div>
          </el-card>

          <!-- 未评分提示 -->
          <el-card shadow="never" v-else>
            <el-empty description="该记录尚未评分">
              <el-button type="primary" @click="detailDialog.visible = false; handleScore(currentRecord)">
                立即评分
              </el-button>
            </el-empty>
          </el-card>
        </div>
      </div>

      <template #footer>
        <el-button @click="detailDialog.visible = false">关闭</el-button>
        <el-button 
          v-if="recordDetail.total_score === null" 
          type="primary" 
          @click="detailDialog.visible = false; handleScore(currentRecord)">
          评分
        </el-button>
        <el-button 
          v-else 
          type="warning" 
          @click="detailDialog.visible = false; handleScore(currentRecord)">
          修改评分
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="QuestionnaireRecords">
import { ref, reactive, onMounted, onActivated, computed, watch } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import { recordsApi } from '@/api/records'
import { questionnaireApi } from '@/api/questionnaire'
import { useUserStore } from '@/store/user'
import { useRoute } from 'vue-router'

// 获取用户store和路由
const userStore = useUserStore()
const route = useRoute()

// 响应式数据
const loading = ref(false)
const recordList = ref([])
const questionnaireList = ref([])
const selectedRecords = ref([])
const statistics = ref({})

// 搜索表单
const searchForm = reactive({
  questionnaireId: null,
  status: '',
  grade: '',
  userName: '',
  dateRange: null,
  isScored: null
})

// 分页
const pagination = reactive({
  page: 1,
  size: 10,
  total: 0
})

// 评分弹窗
const scoreDialog = reactive({
  visible: false,
  title: '',
  loading: false,
  isEdit: false
})

// 详情弹窗
const detailDialog = reactive({
  visible: false,
  loading: false
})

const currentRecord = ref({})
const recordDetail = ref({})
const scoreForm = reactive({
  totalScore: null,
  subScores: {
    completeness: null,
    accuracy: null,
    quality: null
  },
  grade: '',
  isPassed: null,
  feedback: ''
})

const scoreFormRef = ref()

// 评分表单验证规则
const scoreRules = {
  totalScore: [
    { required: true, message: '请输入总体评分', trigger: 'blur' },
    { type: 'number', min: 0, max: 100, message: '评分必须在0-100之间', trigger: 'blur' }
  ],
  grade: [
    { required: true, message: '请选择等级评定', trigger: 'change' }
  ],
  isPassed: [
    { required: true, message: '请选择通过状态', trigger: 'change' }
  ]
}

// 计算属性
const searchParams = computed(() => {
  const params = {
    page: pagination.page,
    size: pagination.size
  }
  
  // 只添加非空的搜索参数
  if (searchForm.questionnaireId) {
    params.questionnaireId = searchForm.questionnaireId
  }
  if (searchForm.status && searchForm.status !== '') {
    params.status = searchForm.status
  }
  if (searchForm.grade && searchForm.grade !== '') {
    params.grade = searchForm.grade
  }
  if (searchForm.userName && searchForm.userName.trim() !== '') {
    params.userName = searchForm.userName.trim()
  }
  if (searchForm.isScored !== null && searchForm.isScored !== undefined) {
    params.isScored = searchForm.isScored
  }
  
  // 处理日期范围
  if (searchForm.dateRange && searchForm.dateRange.length === 2) {
    params.startDate = searchForm.dateRange[0]
    params.endDate = searchForm.dateRange[1]
  }
  
  return params
})

// 监听评分变化，自动计算等级
watch(() => scoreForm.totalScore, (newScore) => {
  if (newScore !== null) {
    if (newScore >= 90) {
      scoreForm.grade = 'A'
      scoreForm.isPassed = true
    } else if (newScore >= 80) {
      scoreForm.grade = 'B'
      scoreForm.isPassed = true
    } else if (newScore >= 60) {
      scoreForm.grade = 'C'
      scoreForm.isPassed = true
    } else {
      scoreForm.grade = 'D'
      scoreForm.isPassed = false
    }
  }
})

// 防抖加载记录
let loadRecordsTimer = null
const loadRecords = async (immediate = false) => {
  // 如果不是立即执行，使用防抖
  if (!immediate && loadRecordsTimer) {
    clearTimeout(loadRecordsTimer)
  }
  
  const executeLoad = async () => {
    console.log('loadRecords函数被调用')
    try {
      loading.value = true
      const params = searchParams.value
      console.log('开始加载记录数据，参数:', params)
      
      // 调用问卷记录API
      const response = await recordsApi.getRecords(params)
      console.log('记录API响应:', response)
      
      if (response && response.data) {
        if (response.data.records) {
          recordList.value = response.data.records
          pagination.total = response.data.total || 0
          console.log('成功加载记录数据，数量:', response.data.records.length)
        } else {
          console.log('记录API返回空数据结构')
          recordList.value = []
          pagination.total = 0
        }
      } else {
        console.log('记录API返回无效响应')
        recordList.value = []
        pagination.total = 0
      }
    } catch (error) {
      console.error('加载记录失败:', error)
      ElMessage.error('加载记录失败：' + (error.message || '未知错误'))
      recordList.value = []
      pagination.total = 0
    } finally {
      loading.value = false
    }
  }
  
  if (immediate) {
    await executeLoad()
  } else {
    loadRecordsTimer = setTimeout(executeLoad, 300) // 300ms防抖
  }
}

const loadQuestionnaireList = async () => {
  try {
    const response = await questionnaireApi.getList({ page: 1, size: 100 })
    questionnaireList.value = response.data.records
  } catch (error) {
    console.error('加载问卷列表失败:', error)
  }
}

const loadStatistics = async () => {
  try {
    const response = await recordsApi.getStatistics(searchForm.questionnaireId)
    statistics.value = response.data
  } catch (error) {
    console.error('加载统计数据失败:', error)
  }
}

const handleSearch = async () => {
  pagination.page = 1
  await loadRecords(true) // 立即执行
  // 搜索条件变化时刷新统计数据
  loadStatistics()
}

const resetSearch = async () => {
  Object.assign(searchForm, {
    questionnaireId: null,
    status: '',
    grade: '',
    userName: '',
    dateRange: null,
    isScored: null
  })
  pagination.page = 1
  await loadRecords(true) // 立即执行
  // 重置搜索条件时刷新统计数据
  loadStatistics()
}

const handleSelectionChange = (selection) => {
  selectedRecords.value = selection
}

const handleSizeChange = async (size) => {
  pagination.size = size
  pagination.page = 1 // 重置到第一页
  await loadRecords(true) // 立即执行
}

const handleCurrentChange = async (page) => {
  pagination.page = page
  await loadRecords(true) // 立即执行
}

const handleViewDetail = async (record) => {
  try {
    detailDialog.loading = true
    detailDialog.visible = true
    currentRecord.value = record
    
    // 获取详细信息
    const response = await recordsApi.getRecordDetail(record.id)
    recordDetail.value = response.data
    
    console.log('记录详情:', recordDetail.value)
  } catch (error) {
    console.error('获取记录详情失败:', error)
    ElMessage.error('获取记录详情失败：' + (error.message || '未知错误'))
    detailDialog.visible = false
  } finally {
    detailDialog.loading = false
  }
}

const handleScore = (record) => {
  currentRecord.value = record
  scoreDialog.visible = true
  scoreDialog.isEdit = !!record.totalScore
  scoreDialog.title = scoreDialog.isEdit ? '修改评分' : '问卷评分'
  
  // 如果是修改评分，填充现有数据
  if (scoreDialog.isEdit) {
    scoreForm.totalScore = record.totalScore
    scoreForm.grade = record.grade
    scoreForm.isPassed = record.isPassed
    scoreForm.feedback = record.feedback || ''
    
    // 填充分项评分
    if (record.subScores) {
      scoreForm.subScores.completeness = record.subScores.completeness || null
      scoreForm.subScores.accuracy = record.subScores.accuracy || null
      scoreForm.subScores.quality = record.subScores.quality || null
    }
  } else {
    // 重置表单
    scoreForm.totalScore = null
    scoreForm.grade = ''
    scoreForm.isPassed = null
    scoreForm.feedback = ''
    scoreForm.subScores.completeness = null
    scoreForm.subScores.accuracy = null
    scoreForm.subScores.quality = null
  }
}

const submitScore = async () => {
  try {
    await scoreFormRef.value.validate()
    
    scoreDialog.loading = true
    
    const scoreData = {
      totalScore: scoreForm.totalScore,
      subScores: scoreForm.subScores,
      grade: scoreForm.grade,
      isPassed: scoreForm.isPassed,
      feedback: scoreForm.feedback
    }
    
    if (scoreDialog.isEdit) {
      await recordsApi.updateScore(currentRecord.value.id, scoreData)
      ElMessage.success('修改评分成功')
    } else {
      await recordsApi.submitScore(currentRecord.value.id, scoreData)
      ElMessage.success('提交评分成功')
    }
    
    scoreDialog.visible = false
    loadRecords()
    loadStatistics()
  } catch (error) {
    ElMessage.error('操作失败：' + error.message)
  } finally {
    scoreDialog.loading = false
  }
}

const handleBatchStatus = async (status) => {
  try {
    await ElMessageBox.confirm(
      `确认将选中的 ${selectedRecords.value.length} 条记录状态更新为 ${getStatusName(status)}？`,
      '批量操作确认',
      { type: 'warning' }
    )
    
    const recordIds = selectedRecords.value.map(record => record.id)
    await recordsApi.batchOperation({
      action: 'updateStatus',
      recordIds,
      params: { status }
    })
    
    ElMessage.success('批量操作成功')
    loadRecords()
    loadStatistics()
  } catch (error) {
    if (error !== 'cancel') {
      ElMessage.error('批量操作失败：' + error.message)
    }
  }
}

const handleExport = () => {
  // TODO: 实现导出功能
  ElMessage.info('导出功能开发中...')
}

// 辅助方法
const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const getStatusType = (status) => {
  const typeMap = {
    'submitted': '',
    'reviewing': 'warning',
    'scored': 'success',
    'completed': 'success',
    'rejected': 'danger'
  }
  return typeMap[status] || ''
}

const getStatusName = (status) => {
  const nameMap = {
    'submitted': '已提交',
    'reviewing': '审核中',
    'scored': '已评分',
    'completed': '已完成',
    'rejected': '已拒绝'
  }
  return nameMap[status] || status
}

const getGradeType = (grade) => {
  const typeMap = {
    'A': 'success',
    'B': 'success',
    'C': 'warning',
    'D': 'danger'
  }
  return typeMap[grade] || ''
}

const getGradeName = (grade) => {
  const nameMap = {
    'A': '优秀',
    'B': '良好',
    'C': '及格',
    'D': '不及格'
  }
  return nameMap[grade] || grade
}

const getSubScore = (subScoresStr, key) => {
  try {
    if (typeof subScoresStr === 'string') {
      const subScores = JSON.parse(subScoresStr)
      return subScores[key] || 0
    } else if (typeof subScoresStr === 'object' && subScoresStr !== null) {
      return subScoresStr[key] || 0
    }
    return 0
  } catch (error) {
    console.error('解析分项评分失败:', error)
    return 0
  }
}

// 数据加载标志
const isDataLoaded = ref(false)

// 统一的数据加载函数
const initializeData = async () => {
  console.log('开始初始化数据...')
  console.log('当前路由:', window.location.pathname)
  console.log('用户信息:', userStore.userInfo)
  console.log('用户角色:', userStore.role)
  console.log('是否管理员:', userStore.isAdmin)
  
  try {
    // 并行加载，但记录数据优先
    await loadRecords(true)
    
    // 后台加载其他数据
    Promise.all([
      loadQuestionnaireList(),
      loadStatistics()
    ]).catch(error => {
      console.error('后台数据加载失败:', error)
    })
    
    isDataLoaded.value = true
    console.log('数据初始化完成')
  } catch (error) {
    console.error('数据加载失败:', error)
    ElMessage.error('数据加载失败，请刷新页面重试')
  }
}

// 生命周期
onMounted(async () => {
  console.log('QuestionnaireRecords组件已挂载 (onMounted)')
  await initializeData()
})

onActivated(async () => {
  console.log('QuestionnaireRecords组件已激活 (onActivated)')
  // 只有在组件已经挂载过的情况下才重新加载数据
  if (isDataLoaded.value) {
    console.log('组件被重新激活，轻量刷新记录列表...')
    // 使用防抖加载，避免频繁切换时的性能问题
    loadRecords(false)
  }
})
</script>

<style scoped>
.questionnaire-records {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
}

.header h2 {
  margin: 0 0 5px 0;
  color: #303133;
}

.header p {
  margin: 0;
  color: #909399;
}

.filter-section {
  background: white;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.search-form {
  margin-bottom: 15px;
}

.batch-actions {
  border-top: 1px solid #ebeef5;
  padding-top: 15px;
}

.stats-cards {
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 5px;
}

.stat-label {
  color: #909399;
  font-size: 14px;
}

.table-card {
  margin-bottom: 20px;
}

.text-secondary {
  color: #909399;
  font-size: 12px;
}

.text-muted {
  color: #c0c4cc;
}

.pagination {
  margin-top: 20px;
  text-align: right;
}

.score-form {
  max-height: 500px;
  overflow-y: auto;
}

.record-info {
  background: #f5f7fa;
  padding: 15px;
  border-radius: 6px;
  margin-bottom: 15px;
}

.record-info h4 {
  margin: 0 0 10px 0;
  color: #303133;
}

.record-info p {
  margin: 5px 0;
  color: #606266;
}

.sub-scores {
  width: 100%;
}

.score-item {
  text-align: center;
}

.score-item label {
  display: block;
  margin-bottom: 5px;
  font-size: 12px;
  color: #606266;
}

/* 详情弹窗样式 */
.card-header {
  font-weight: bold;
  color: #303133;
}

.el-descriptions {
  margin-bottom: 0;
}

.el-descriptions__label {
  font-weight: 500;
}

.el-statistic {
  text-align: center;
}

.el-statistic__content {
  color: #409eff;
}
</style> 