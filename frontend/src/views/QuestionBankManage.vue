<template>
  <PageContainer>
    <!-- 页面头部 -->
    <PageHeader
      title="题库管理"
      description="智能题库系统，支持多种题型的创建、编辑和管理"
      :icon="Collection"
    >
      <template #actions>
        <el-button size="large" @click="showCreateDialog" class="btn-primary">
          <el-icon><Plus /></el-icon>
          新建题目
        </el-button>
        <el-button size="large" @click="showImportDialog" class="btn-primary">
          <el-icon><Upload /></el-icon>
          批量导入
        </el-button>
        <el-button size="large" @click="exportQuestions" class="btn-primary">
          <el-icon><Download /></el-icon>
          导出题目
        </el-button>
      </template>
    </PageHeader>

    <!-- 搜索面板 -->
    <SearchPanel
      :search-model="searchForm"
      :searching="loading"
      @search="handleSearch"
      @reset="resetSearch"
      :columns="4"
    >
      <template #search-fields>
        <div class="search-field">
          <label>题目</label>
          <el-input
            v-model="searchForm.keyword"
            placeholder="输入题目标题关键词"
            clearable
            class="search-input"
            @keyup.enter="handleSearch"
          />
        </div>
        
        <div class="search-field">
          <label>题型</label>
          <el-select v-model="searchForm.type" placeholder="全部题型" clearable class="filter-select">
            <el-option
              v-for="option in questionTypeOptions"
              :key="option.value"
              :label="option.label"
              :value="option.value"
            />
          </el-select>
        </div>
        
        <div class="search-field">
          <label>优先级</label>
          <el-select v-model="searchForm.priority" placeholder="全部优先级" clearable class="filter-select">
            <el-option label="全部优先级" :value="null" />
            <el-option label="低优先级" :value="1" />
            <el-option label="中优先级" :value="2" />
            <el-option label="高优先级" :value="3" />
          </el-select>
        </div>
        
        <div class="search-field">
          <label>状态</label>
          <el-select v-model="searchForm.status" placeholder="全部状态" clearable class="filter-select">
            <el-option label="全部状态" value="" />
            <el-option label="已启用" :value="1" />
            <el-option label="已禁用" :value="0" />
          </el-select>
        </div>
      </template>
    </SearchPanel>

    <!-- 🎯 简洁优雅的管理界面 -->
    <div class="table-container">
      <!-- 批量操作栏 -->
      <transition name="fade">
        <div v-if="selectedQuestions.length > 0" class="batch-toolbar">
          <div class="selection-info">
            <span class="selected-count">已选择 {{ selectedQuestions.length }} 项</span>
          </div>
          <div class="batch-actions">
            <el-button size="small" @click="batchExport">
              <el-icon><Download /></el-icon>
              导出
            </el-button>
            <el-button type="danger" size="small" @click="batchDelete">
              <el-icon><Delete /></el-icon>
              删除
            </el-button>
          </div>
        </div>
      </transition>

      <!-- 数据表格 -->
      <DataTable
        :data="questionList"
        :loading="loading"
        :pagination="pagination"
        title="题目列表"
        :icon="Document"
        :show-batch-actions="false"
        :table-props="{ rowClassName: getRowClassName }"
        @selection-change="handleSelectionChange"
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
        @row-click="handleRowClick"
        class="clean-data-table"
      >
        <el-table-column type="selection" width="60" />
        
        <!-- 题目标题 -->
        <el-table-column prop="title" label="题目标题" min-width="450" show-overflow-tooltip>
          <template #default="{ row }">
            <div class="title-cell">
              <div class="title-text">{{ row.title }}</div>
              <div class="title-meta">
                <el-icon><Clock /></el-icon>
                <span>{{ formatTime(row.updateTime) }}</span>
              </div>
            </div>
          </template>
        </el-table-column>
        
        <!-- 题型 -->
        <el-table-column prop="type" label="题型" width="140" align="center">
          <template #default="{ row }">
            <el-tag :type="getTypeTagType(row.type)" size="small">
              {{ getTypeName(row.type) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 分数 -->
        <el-table-column prop="score" label="分数" width="100" align="center">
          <template #default="{ row }">
            <div class="score-cell">
              {{ row.score }}分
            </div>
          </template>
        </el-table-column>
        
        <!-- 优先级 -->
        <el-table-column prop="priority" label="优先级" width="120" align="center">
          <template #default="{ row }">
            <el-tag :type="getPriorityTagType(row.priority)" size="small">
              {{ getPriorityName(row.priority) }}
            </el-tag>
          </template>
        </el-table-column>
        
        <!-- 状态 -->
        <el-table-column prop="status" label="状态" width="100" align="center">
          <template #default="{ row }">
            <el-switch
              v-model="row.status"
              :active-value="1"
              :inactive-value="0"
              @change="toggleQuestionStatus(row)"
              active-color="#67c23a"
              inactive-color="#dcdfe6"
            />
          </template>
        </el-table-column>
        
        <!-- 操作 -->
        <el-table-column label="操作" width="320" fixed="right" align="center">
          <template #default="{ row }">
            <div class="action-buttons-group">
              <el-button 
                type="primary" 
                size="small" 
                @click="handlePreviewQuestion(row)"
                plain
                class="action-button"
              >
                <el-icon><View /></el-icon>
                预览
              </el-button>
              
              <el-button 
                type="warning"
                size="small" 
                @click="editQuestion(row)"
                plain
                class="action-button"
              >
                <el-icon><Edit /></el-icon>
                编辑
              </el-button>
              
              <el-button 
                type="success"
                size="small" 
                @click="copyQuestion(row)"
                plain
                class="action-button"
              >
                <el-icon><DocumentCopy /></el-icon>
                复制
              </el-button>
              
              <el-button 
                type="danger" 
                size="small" 
                @click="deleteQuestion(row)"
                plain
                class="action-button"
              >
                <el-icon><Delete /></el-icon>
                删除
              </el-button>
            </div>
          </template>
        </el-table-column>
      </DataTable>
    </div>

    <!-- 创建/编辑对话框 - 保持现有样式 -->
    <el-dialog
      v-model="dialogVisible"
      :title="dialogTitle"
      width="900px"
      destroy-on-close
      @close="resetForm"
      class="modern-dialog"
      :class="{ 'edit-mode': isEdit }"
    >
      <div class="dialog-content">
        <!-- 进度指示器 -->
        <div class="progress-steps">
          <div class="step-item" :class="{ active: true, completed: questionForm.title }">
            <div class="step-number">1</div>
            <div class="step-text">基础信息</div>
          </div>
          <div class="step-item" :class="{ active: questionForm.title, completed: questionForm.type && (questionForm.optionList?.[0] || questionForm.correctAnswer) }">
            <div class="step-number">2</div>
            <div class="step-text">题目描述</div>
          </div>
          <div class="step-item" :class="{ active: questionForm.type && (questionForm.optionList?.[0] || questionForm.correctAnswer), completed: questionForm.explanation }">
            <div class="step-number">3</div>
            <div class="step-text">答案解析</div>
          </div>
        </div>
        
        <el-form
          ref="questionFormRef"
          :model="questionForm"
          :rules="questionRules"
          label-width="100px"
          class="modern-form"
        >
          <!-- 基础信息卡片 -->
          <div class="form-section section-basic" :class="{ completed: isBasicInfoCompleted }">
            <div class="section-title">
              <el-icon><InfoFilled /></el-icon>
              基础信息
            </div>
            <div class="section-content">
              <el-form-item label="题目标题" prop="title">
                <el-input
                  v-model="questionForm.title"
                  placeholder="请输入题目标题，建议简洁明了"
                  maxlength="200"
                  show-word-limit
                  class="form-input"
                  @input="handleTitleChange"
                />
              </el-form-item>

              <div class="form-row">
                <el-form-item label="题型" prop="type" class="form-col">
                  <el-select 
                    v-model="questionForm.type" 
                    placeholder="请选择题型" 
                    @change="handleTypeChange"
                    class="form-select"
                  >
                    <el-option
                      v-for="option in questionTypeOptions"
                      :key="option.value"
                      :label="option.label"
                      :value="option.value"
                    />
                  </el-select>
                </el-form-item>
                
                <el-form-item label="分数" prop="score" class="form-col">
                  <el-input-number
                    v-model="questionForm.score"
                    :min="1"
                    :max="100"
                    controls-position="right"
                    class="form-number"
                  />
                </el-form-item>
                
                <el-form-item label="优先级" prop="priority" class="form-col">
                  <el-select v-model="questionForm.priority" class="form-select">
                    <el-option label="低" :value="1" />
                    <el-option label="中" :value="2" />
                    <el-option label="高" :value="3" />
                  </el-select>
                </el-form-item>
              </div>
            </div>
          </div>

          <!-- 题目描述卡片 -->
          <div class="form-section section-content" :class="{ completed: isContentCompleted }">
            <div class="section-title">
              <el-icon><Document /></el-icon>
              题目描述
            </div>
            <div class="section-content">
              <!-- 智能提示区域 -->
              <div v-if="questionForm.type && descriptionSuggestion" class="smart-suggestion">
                <el-alert
                  :title="descriptionSuggestion.message"
                  :type="descriptionSuggestion.type"
                  :closable="false"
                  show-icon
                  class="suggestion-toggle"
                />
              </div>

              <!-- 智能显示题目描述字段 -->
              <el-form-item 
                v-if="questionNeedsDescription || showDescriptionField" 
                label="题目描述" 
                prop="content"
                class="description-field"
              >
                <el-input
                  v-model="questionForm.content"
                  type="textarea"
                  :rows="4"
                  :placeholder="descriptionPlaceholder"
                  maxlength="1000"
                  show-word-limit
                  class="form-textarea"
                />
                <div class="field-tip">
                  <el-text size="small" type="info">
                    <el-icon><InfoFilled /></el-icon>
                    {{ questionForm.type === 3 || questionForm.type === 4 ? '主观题建议详细说明评分标准' : '可选字段，为复杂题目提供补充说明' }}
                  </el-text>
                </div>
              </el-form-item>

              <!-- 切换按钮 -->
              <div v-if="!questionNeedsDescription" class="toggle-description">
                <el-button 
                  type="text" 
                  @click="showDescriptionField = !showDescriptionField"
                  class="toggle-btn"
                >
                  <el-icon>{{ showDescriptionField ? 'Remove' : 'Plus' }}</el-icon>
                  {{ showDescriptionField ? '隐藏题目描述' : '添加题目描述' }}
                </el-button>
              </div>

              <!-- 选择题选项 -->
              <div v-if="questionForm.type === 1 || questionForm.type === 2" class="options-section">
                <el-form-item label="答案选项" prop="options">
                  <div class="options-container">
                    <div
                      v-for="(option, index) in questionForm.optionList"
                      :key="index"
                      class="option-item"
                    >
                      <div class="option-input">
                        <span class="option-label">{{ String.fromCharCode(65 + index) }}.</span>
                        <el-input
                          v-model="questionForm.optionList[index]"
                          :placeholder="`请输入选项 ${String.fromCharCode(65 + index)}`"
                          @input="updateOptionsJson"
                          class="option-text"
                        />
                        <el-button
                          v-if="questionForm.optionList.length > 2"
                          type="danger"
                          icon="Close"
                          size="small"
                          circle
                          @click="removeOption(index)"
                          class="remove-btn"
                        />
                      </div>
                    </div>
                    <el-button
                      v-if="questionForm.optionList.length < 6"
                      type="primary"
                      icon="Plus"
                      size="small"
                      @click="addOption"
                      class="add-option-btn"
                    >
                      添加选项
                    </el-button>
                  </div>
                </el-form-item>

                <!-- 正确答案 -->
                <el-form-item label="正确答案" prop="correctAnswer">
                  <div v-if="questionForm.type === 1" class="answer-selection">
                    <el-radio-group v-model="questionForm.correctAnswer" @change="updateCorrectAnswerJson">
                      <el-radio 
                        v-for="(option, index) in questionForm.optionList.filter(opt => opt.trim())"
                        :key="index"
                        :label="String.fromCharCode(65 + index)"
                        class="answer-option"
                      >
                        {{ String.fromCharCode(65 + index) }}. {{ option }}
                      </el-radio>
                    </el-radio-group>
                  </div>
                  <div v-else-if="questionForm.type === 2" class="answer-selection">
                    <el-checkbox-group v-model="questionForm.correctAnswerList" @change="updateCorrectAnswerJson">
                      <el-checkbox 
                        v-for="(option, index) in questionForm.optionList.filter(opt => opt.trim())"
                        :key="index"
                        :label="String.fromCharCode(65 + index)"
                        class="answer-option"
                      >
                        {{ String.fromCharCode(65 + index) }}. {{ option }}
                      </el-checkbox>
                    </el-checkbox-group>
                  </div>
                </el-form-item>
              </div>

              <!-- 填空题/简答题参考答案 -->
              <el-form-item 
                v-if="questionForm.type === 3 || questionForm.type === 4" 
                label="参考答案" 
                prop="correctAnswer"
              >
                <el-input
                  v-model="questionForm.correctAnswer"
                  type="textarea"
                  :rows="3"
                  :placeholder="questionForm.type === 3 ? '请输入标准答案（多个答案用分号分隔）' : '请输入参考答案要点'"
                  maxlength="500"
                  show-word-limit
                  class="form-textarea"
                />
              </el-form-item>
            </div>
          </div>

          <!-- 答案解析卡片 -->
          <div class="form-section section-analysis" :class="{ completed: isAnalysisCompleted }">
            <div class="section-title">
              <el-icon><ChatLineSquare /></el-icon>
              答案解析
            </div>
            <div class="section-content">
              <el-form-item label="详细解析" prop="explanation">
                <el-input
                  v-model="questionForm.explanation"
                  type="textarea"
                  :rows="3"
                  placeholder="请输入题目的详细解析，帮助用户理解正确答案"
                  maxlength="500"
                  show-word-limit
                  class="form-textarea"
                />
              </el-form-item>
            </div>
          </div>
        </el-form>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="dialogVisible = false" size="large" class="cancel-btn">
            取消
          </el-button>
          <el-button 
            type="primary" 
            @click="saveQuestion" 
            :loading="saveLoading" 
            size="large"
            class="save-btn"
          >
            <el-icon v-if="!saveLoading"><Check /></el-icon>
            {{ isEdit ? '保存修改' : '创建题目' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <!-- 题目预览 - 卡片式对话框 -->
    <el-dialog
      v-model="previewVisible"
      title="题目预览"
      width="800px"
      class="preview-dialog"
    >
      <div class="preview-content" v-if="previewQuestion">
        <div class="preview-header">
          <div class="question-title">{{ previewQuestion.title }}</div>
          <div class="question-meta">
            <div class="meta-item">
              <el-icon><Collection /></el-icon>
              <el-tag :style="{ backgroundColor: getQuestionTypeColor(previewQuestion.type), color: 'white', border: 'none' }" size="default">
                {{ getQuestionTypeName(previewQuestion.type) }}
              </el-tag>
            </div>
            <div class="meta-item">
              <el-icon><Star /></el-icon>
              <el-tag type="warning" size="default">{{ previewQuestion.score }}分</el-tag>
            </div>
            <div class="meta-item">
              <el-icon><Flag /></el-icon>
              <el-tag :type="getPriorityType(previewQuestion.priority)" size="default">
                {{ getPriorityName(previewQuestion.priority) }}优先级
              </el-tag>
            </div>
          </div>
        </div>

        <div class="question-body">
          <div class="content-section">
            <div class="section-header">
              <el-icon color="#667eea"><Document /></el-icon>
                              <span>题目描述</span>
            </div>
            <div class="question-content">{{ previewQuestion.content }}</div>
          </div>
          
          <!-- 选择题选项显示 -->
          <div v-if="previewQuestion.type === 1 || previewQuestion.type === 2" class="options-section">
            <div class="section-header">
              <el-icon color="#667eea"><List /></el-icon>
              <span>选项内容</span>
            </div>
            <div class="options-display">
              <div
                v-for="(option, index) in getOptionsArray(previewQuestion.options)"
                :key="index"
                class="option-display"
                :class="{ 'correct-option': isCorrectOption(index, previewQuestion.correctAnswer) }"
              >
                <div class="option-prefix">
                  <span class="option-label">{{ String.fromCharCode(65 + index) }}</span>
                </div>
                <span class="option-text">{{ option }}</span>
                <div class="option-status">
                  <el-icon v-if="isCorrectOption(index, previewQuestion.correctAnswer)" color="#67c23a" size="18">
                    <CircleCheckFilled />
                  </el-icon>
                </div>
              </div>
            </div>
          </div>

          <!-- 填空题/简答题答案 -->
          <div v-if="previewQuestion.type === 3 || previewQuestion.type === 4" class="answer-section">
            <div class="section-header">
              <el-icon color="#667eea"><EditPen /></el-icon>
              <span>参考答案</span>
            </div>
            <div class="answer-display">
              <div class="answer-content">{{ previewQuestion.correctAnswer }}</div>
            </div>
          </div>

          <!-- 答案解析 -->
          <div v-if="previewQuestion.explanation" class="content-section">
            <div class="section-header">
              <el-icon color="#667eea"><ChatLineSquare /></el-icon>
              <span>答案解析</span>
            </div>
            <div class="question-content">{{ previewQuestion.explanation }}</div>
          </div>
        </div>
      </div>
    </el-dialog>

    <!-- 导入对话框 -->
    <el-dialog v-model="importVisible" title="批量导入题目" width="600px" class="import-dialog">
      <div class="import-content">
        <el-alert type="info" title="导入说明" :closable="false" class="import-tips">
          <template #default>
            <ul>
              <li>支持Excel文件格式（.xlsx, .xls）</li>
              <li>请按照模板格式准备数据</li>
              <li>建议单次导入不超过1000条数据</li>
            </ul>
          </template>
        </el-alert>
        
        <el-upload
          ref="uploadRef"
          :auto-upload="false"
          :on-change="handleFileChange"
          :show-file-list="false"
          accept=".xlsx,.xls"
          class="upload-area"
        >
          <div class="upload-content">
            <el-icon size="50" color="#c0c4cc"><UploadFilled /></el-icon>
            <div class="upload-text">点击选择文件或拖拽文件到此处</div>
            <div class="upload-hint">支持 .xlsx, .xls 格式</div>
          </div>
        </el-upload>
      </div>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="downloadTemplate" class="template-btn">
            <el-icon><Download /></el-icon>
            下载模板
          </el-button>
          <el-button @click="importVisible = false">取消</el-button>
          <el-button type="primary" @click="handleImport" :loading="importLoading">
            开始导入
          </el-button>
        </div>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup>
import { ref, reactive, onMounted, computed, nextTick } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { SimplePremiumDialog } from '@/utils/simplePremiumDialog.js'
import { questionBankAPI } from '../api'
import { 
  QUESTION_TYPE_OPTIONS,
  QUESTION_TYPE_NAMES,
  QUESTION_TYPE_COLORS,
  PRIORITY_NAMES
} from '../constants/questionTypes'
import { formatDateTime } from '@/utils/time'
import { PageContainer, PageHeader, SearchPanel, DataTable } from '@/components'
import ActionButtons from '@/components/base/ActionButtons.vue'
import { 
  Collection, Plus, Upload, Download, Document, Edit, View, 
  CopyDocument, Delete, Switch, Star, Clock, DocumentCopy,
  Check, Close, List, EditPen, ChatLineSquare, CircleCheckFilled, UploadFilled
} from '@element-plus/icons-vue'

/**
 * 题库管理 - 智能化产品设计
 * 
 * 核心设计理念：
 * 1. 简单题目无需描述，复杂题目智能提示
 * 2. 渐进式表单展示，避免信息过载
 * 3. 根据题型和内容智能判断是否需要描述字段
 * 
 * 智能化功能：
 * - 题目类型驱动：主观题自动显示描述字段
 * - 标题长度感知：长标题智能提示添加描述  
 * - 智能建议系统：根据题型提供描述建议
 * - 可选字段控制：用户可手动切换描述字段显示
 * - 动态placeholder：根据题型显示不同的输入提示
 */

// 组件名称
defineOptions({
  name: 'QuestionBankManage'
})

// 响应式数据
const loading = ref(false)
const saveLoading = ref(false)
const dialogVisible = ref(false)
const previewVisible = ref(false)
const isEdit = ref(false)
const selectedQuestions = ref([])
const questionFormRef = ref()

// 搜索表单
const searchForm = reactive({
  keyword: '',
  type: '',
  priority: '',
  status: ''
})

// 分页
const pagination = reactive({
  current: 1,
  size: 20,
  total: 0
})

// 题目列表
const questionList = ref([])
const selectedIds = ref([])
const selectAll = ref(false)
const isIndeterminate = ref(false)
// 移除卡片视图模式，专注表格管理界面

// 题目表单
const questionForm = reactive({
  id: null,
  title: '',
  type: null,
  content: '',
  options: '',
  optionList: ['', ''],
  correctAnswer: '',
  correctAnswerList: [],
  score: 5,
  priority: 2,
  status: 1,
  explanation: ''
})

// 智能化控制
const showAdvancedOptions = ref(false)
const showDescriptionField = ref(false)

// 预览数据
const previewQuestion = ref(null)

// 表单验证规则
const questionRules = {
  title: [
    { required: true, message: '请输入题目标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请选择题型', trigger: 'change' }
  ],
  content: [
    { required: true, message: '请输入题目描述', trigger: 'blur' }
  ],
  correctAnswer: [
    { required: true, message: '请设置正确答案', trigger: 'blur' }
  ],
  score: [
    { required: true, message: '请设置分数', trigger: 'blur' }
  ],
  priority: [
    { required: true, message: '请选择优先级', trigger: 'change' }
  ]
}

// 计算属性
const dialogTitle = computed(() => isEdit.value ? '编辑题目' : '新建题目')
const questionTypeOptions = computed(() => [
  { value: null, label: '全部题型' },
  ...QUESTION_TYPE_OPTIONS.filter(item => item.value !== 0)
])

// 智能判断是否需要描述
const questionNeedsDescription = computed(() => {
  // 主观题(填空题、简答题)通常需要详细说明
  if (questionForm.type === 3 || questionForm.type === 4) return true
  
  // 题目标题过长可能需要补充说明
  if (questionForm.title && questionForm.title.length > 30) return true
  
  // 高难度题目建议添加描述
  if (questionForm.priority === 3) return true
  
  // 已经有描述内容时显示
  if (questionForm.content && questionForm.content.trim()) return true
  
  return false
})

// 智能提示文案
const descriptionPlaceholder = computed(() => {
  switch (questionForm.type) {
    case 1: // 单选题
      return questionForm.title && questionForm.title.length > 20 
        ? '题目较长，可补充说明以提高理解清晰度'
        : '题目简洁明了，通常无需添加描述'
        
    case 2: // 多选题
      return '多选题建议说明选择要求，如"可多选"、"至少选择2项"等'
      
    case 3: // 填空题
      return '请说明答题要求，如"请填入正确的化学公式"、"答案格式要求"等'
      
    case 4: // 简答题
      return '请说明评分标准、答题要点或字数要求，如"请从以下3个维度分析，每点2分"'
      
    default:
      return '为复杂题目提供详细说明，帮助用户更好理解题意'
  }
})

// 智能建议信息
const descriptionSuggestion = computed(() => {
  if (!questionForm.type) return ''
  
  const titleLength = questionForm.title ? questionForm.title.length : 0
  
  if (titleLength < 15 && (questionForm.type === 1 || questionForm.type === 2)) {
    return {
      type: 'success',
      message: '💡 题目简洁明了，建议无需添加描述'
    }
  }
  
  if (questionForm.type === 3 || questionForm.type === 4) {
    return {
      type: 'warning', 
      message: '💡 主观题建议添加评分标准或答题要求'
    }
  }
  
  if (titleLength > 30) {
    return {
      type: 'info',
      message: '💡 题目较长，建议添加描述提高理解清晰度'
    }
  }
  
  return {
    type: 'info',
    message: '💡 可选择性添加描述，让题目更清晰'
  }
})

// 完成状态判断
const isBasicInfoCompleted = computed(() => {
  return questionForm.title && questionForm.type && questionForm.score && questionForm.priority
})

const isContentCompleted = computed(() => {
  if (!questionForm.type) return false
  
  // 选择题需要有选项和正确答案
  if (questionForm.type === 1 || questionForm.type === 2) {
    const hasValidOptions = questionForm.optionList && 
      questionForm.optionList.filter(opt => opt && opt.trim()).length >= 2
    
    const hasCorrectAnswer = questionForm.type === 1 
      ? questionForm.correctAnswer
      : questionForm.correctAnswerList && questionForm.correctAnswerList.length > 0
      
    return hasValidOptions && hasCorrectAnswer
  }
  
  // 填空题/简答题需要有正确答案
  if (questionForm.type === 3 || questionForm.type === 4) {
    return questionForm.correctAnswer && questionForm.correctAnswer.trim()
  }
  
  return false
})

const isAnalysisCompleted = computed(() => {
  return questionForm.explanation && questionForm.explanation.trim()
})

// 工具函数
const getQuestionTypeName = (type) => QUESTION_TYPE_NAMES[type] || '未知'
const getQuestionTypeColor = (type) => QUESTION_TYPE_COLORS[type] || '#909399'
const getPriorityName = (priority) => PRIORITY_NAMES[priority] || '未知'
const getPriorityType = (priority) => {
  switch (priority) {
    case 1: return 'info'
    case 2: return 'warning' 
    case 3: return 'danger'
    default: return 'info'
  }
}

const formatTime = (time) => {
  if (!time) return '-'
  return formatDateTime(time)
}

// 选择控制方法

const handleSelectAll = (value) => {
  if (value) {
    selectedIds.value = questionList.value.map(q => q.id)
    selectedQuestions.value = [...questionList.value]
  } else {
    selectedIds.value = []
    selectedQuestions.value = []
  }
  updateSelectionState()
}

const updateSelectionState = () => {
  const selectedCount = selectedIds.value.length
  const totalCount = questionList.value.length
  
  if (selectedCount === 0) {
    selectAll.value = false
    isIndeterminate.value = false
  } else if (selectedCount === totalCount) {
    selectAll.value = true
    isIndeterminate.value = false
  } else {
    selectAll.value = false
    isIndeterminate.value = true
  }
}

const batchExport = () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请先选择要导出的题目')
    return
  }
  
  // 实现批量导出逻辑
  ElMessage.success(`导出${selectedQuestions.value.length}道题目`)
}

// 优化类型和优先级方法
const getTypeName = (type) => QUESTION_TYPE_NAMES[type] || '未知'
const getTypeTagType = (type) => {
  switch (type) {
    case 1: return 'primary'
    case 2: return 'success' 
    case 3: return 'warning'
    case 4: return 'info'
    default: return ''
  }
}

const getPriorityTagType = (priority) => {
  switch (priority) {
    case 1: return 'info'
    case 2: return 'warning' 
    case 3: return 'danger'
    default: return 'info'
  }
}

// 表格列配置
const tableColumns = ref([
  { prop: 'selection', label: '', type: 'selection', width: 50 },
  { prop: 'title', label: '题目标题', minWidth: 500 },
  { prop: 'type', label: '题型', width: 90 },
  { prop: 'score', label: '分数', width: 60 },
  { prop: 'priority', label: '优先级', width: 75 },
  { prop: 'status', label: '状态', width: 65 },
  { prop: 'actions', label: '操作', width: 140, fixed: 'right' }
])

// 方法
const loadQuestionList = async () => {
  try {
    loading.value = true
    const params = {
      current: pagination.current,
      size: pagination.size,
      ...searchForm
    }
    
    console.log('发送请求参数:', params)
    console.log('具体搜索参数:', {
      keyword: params.keyword,
      type: params.type,
      priority: params.priority,
      status: params.status
    })
    const response = await questionBankAPI.getList(params)
    console.log('接收到的响应:', response)
    console.log('返回的数据条数:', response.data?.records?.length)
    if (params.priority) {
      console.log('过滤后数据的优先级分布:', response.data?.records?.map(item => ({ title: item.title, priority: item.priority })))
    }
    if (params.status !== null && params.status !== undefined) {
      console.log('过滤后数据的状态分布:', response.data?.records?.map(item => ({ title: item.title, status: item.status })))
    }
    
    if (response.data) {
      questionList.value = response.data.records || []
      pagination.total = response.data.total || 0
      console.log('题目列表数据:', questionList.value)
      console.log('数据总数:', pagination.total)
    }
  } catch (error) {
    console.error('加载题目列表失败:', error)
    ElMessage.error('加载题目列表失败')
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  console.log('搜索条件:', searchForm) // Debug信息
  pagination.current = 1
  loadQuestionList()
}

const resetSearch = () => {
  // 强制重置搜索表单
  searchForm.keyword = ''
  searchForm.type = null
  searchForm.priority = null
  searchForm.status = null
  
  // 强制触发响应式更新
  nextTick(() => {
    handleSearch()
  })
}

const handleSizeChange = (size) => {
  pagination.size = size
  pagination.current = 1
  loadQuestionList()
}

const handleCurrentChange = (current) => {
  pagination.current = current
  loadQuestionList()
}

const handleSelectionChange = (selection) => {
  if (Array.isArray(selection)) {
    // 来自表格的选择变化
    selectedQuestions.value = selection
    selectedIds.value = selection.map(item => item.id)
  } else {
    // 来自复选框的变化
    if (selection) {
      selectedIds.value = [...selectedIds.value, selection]
    }
    selectedQuestions.value = questionList.value.filter(q => selectedIds.value.includes(q.id))
  }
  updateSelectionState()
}

const handleRowClick = (row, column, event) => {
  // 只有点击选择列才处理选中逻辑
  if (column && column.type === 'selection') {
    // Element Plus的表格会自动处理选择，这里不需要手动处理
    return
  }
  
  // 如果点击的是操作列或其他列，不处理选中
  if (column && (column.property === 'actions' || column.type !== 'selection')) {
    return
  }
  
  // 其他情况也不处理选中，让用户必须点击复选框才能选中
  return
}

// 表格样式
const headerCellStyle = {
  background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
  color: '#4a5568',
  fontWeight: '600',
  fontSize: '14px',
  padding: '16px 12px'
}

const tableRowClassName = ({ rowIndex }) => {
  return rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
}

// 动态行样式类名 - 支持选中状态
const getRowClassName = ({ row, rowIndex }) => {
  let className = rowIndex % 2 === 0 ? 'even-row' : 'odd-row'
  
  // 添加选中状态
  if (selectedIds.value.includes(row.id)) {
    className += ' selected-row'
  }
  
  return className
}

// 🔧 可扩展的行操作配置工厂
const createRowActions = (row) => {
  return [
    {
      key: 'preview',
      label: '预览',
      icon: View,
      type: 'primary',
      handler: () => handlePreviewQuestion(row),
      permission: 'question:preview'
    },
    {
      key: 'edit', 
      label: '编辑',
      icon: Edit,
      type: 'default',
      handler: () => editQuestion(row),
      permission: 'question:edit'
    },
    {
      key: 'copy',
      label: '复制', 
      icon: DocumentCopy,
      type: 'success',
      handler: () => copyQuestion(row),
      permission: 'question:create'
    },
    {
      key: 'delete',
      label: '删除',
      icon: Delete, 
      type: 'danger',
      handler: () => deleteQuestion(row),
      permission: 'question:delete',
      confirm: {
        title: '确认删除',
        message: `确定要删除题目"${row.title}"吗？`
      }
    }
  ].filter(action => {
    // 权限过滤逻辑可以在这里添加
    // return hasPermission(action.permission)
    return true
  })
}

// 显示创建对话框
const showCreateDialog = () => {
  isEdit.value = false
  dialogVisible.value = true
  resetForm()
}

// 编辑题目
const editQuestion = (row) => {
  isEdit.value = true
  
  // 填充表单数据
  try {
    Object.assign(questionForm, {
      ...row,
      optionList: row.options ? JSON.parse(row.options) : ['', ''],
      correctAnswerList: row.type === 2 ? (row.correctAnswer ? row.correctAnswer.split(',') : []) : []
    })
  } catch (error) {
    console.error('解析题目数据失败:', error)
    // 如果解析失败，使用默认值
    Object.assign(questionForm, {
      ...row,
      optionList: ['', ''],
      correctAnswerList: []
    })
  }
  
  dialogVisible.value = true
}

// 预览题目
const handlePreviewQuestion = (row) => {
  previewQuestion.value = row
  previewVisible.value = true
}

// 复制题目
const copyQuestion = async (row) => {
  try {
    const newQuestion = { ...row }
    delete newQuestion.id
    newQuestion.title = `${row.title} (副本)`
    
    await questionBankAPI.create(newQuestion)
    ElMessage.success('复制成功')
    loadQuestionList()
  } catch (error) {
    console.error('复制题目失败:', error)
    ElMessage.error('复制题目失败')
  }
}

// 删除题目
const deleteQuestion = async (row) => {
  try {
    await SimplePremiumDialog.confirm(
      `确定要删除题目"${row.title}"吗？\n\n⚠️ 此操作不可恢复，请谨慎操作！`,
      '🗑️ 确认删除题目',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    await questionBankAPI.delete(row.id)
    ElMessage.success('删除成功')
    loadQuestionList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除题目失败:', error)
      ElMessage.error('删除题目失败')
    }
  }
}

// 切换题目状态
const toggleQuestionStatus = async (row) => {
  try {
    await questionBankAPI.toggleStatus(row.id, row.status)
    ElMessage.success(`${row.status ? '启用' : '禁用'}成功`)
    // 重新加载列表以确保数据同步
    loadQuestionList()
  } catch (error) {
    console.error('切换状态失败:', error)
    ElMessage.error('切换状态失败')
    // 恢复原状态
    row.status = row.status === 1 ? 0 : 1
  }
}

// 批量删除
const batchDelete = async () => {
  if (selectedQuestions.value.length === 0) {
    ElMessage.warning('请先选择要删除的题目')
    return
  }
  
  try {
    await SimplePremiumDialog.confirm(
      `确定要删除选中的 ${selectedQuestions.value.length} 道题目吗？\n\n⚠️ 此操作不可恢复，请谨慎操作！`,
      '🗑️ 确认批量删除',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'error'
      }
    )
    
    const ids = selectedQuestions.value.map(item => item.id)
    await questionBankAPI.batchDelete(ids)
    ElMessage.success('批量删除成功')
    selectedQuestions.value = []
    loadQuestionList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('批量删除失败:', error)
      ElMessage.error('批量删除失败')
    }
  }
}

// 批量操作
const batchToggleStatus = () => {
  ElMessage.info('批量状态切换功能开发中...')
}

// 题型改变处理
const handleTypeChange = (type) => {
  // 题型改变时重置相关字段
  if (type === 1 || type === 2) {
    // 选择题
    if (!questionForm.optionList || questionForm.optionList.length < 2) {
      questionForm.optionList = ['', '']
    }
  }
  questionForm.correctAnswer = ''
  questionForm.correctAnswerList = []
  
  // 智能处理描述字段显示
  nextTick(() => {
    // 如果是主观题，自动显示描述字段
    if (type === 3 || type === 4) {
      showDescriptionField.value = true
    }
    // 如果是简单选择题且标题较短，可以隐藏描述字段
    else if ((type === 1 || type === 2) && questionForm.title && questionForm.title.length < 20) {
      showDescriptionField.value = false
    }
  })
}

// 添加选项
const addOption = () => {
  if (questionForm.optionList.length < 6) {
    questionForm.optionList.push('')
  }
}

// 删除选项
const removeOption = (index) => {
  if (questionForm.optionList.length > 2) {
    questionForm.optionList.splice(index, 1)
    updateOptionsJson()
  }
}

// 智能判断题目标题变化
const handleTitleChange = () => {
  nextTick(() => {
    const titleLength = questionForm.title ? questionForm.title.length : 0
    
    // 如果标题变长且是选择题，可能需要描述
    if (titleLength > 25 && (questionForm.type === 1 || questionForm.type === 2)) {
      if (!questionForm.content) {
        showDescriptionField.value = true
      }
    }
    // 如果标题很简短且是选择题，可以隐藏描述
    else if (titleLength < 15 && (questionForm.type === 1 || questionForm.type === 2) && !questionForm.content) {
      showDescriptionField.value = false
    }
  })
}

// 更新选项JSON
const updateOptionsJson = () => {
  questionForm.options = JSON.stringify(questionForm.optionList.filter(opt => opt.trim()))
}

// 更新正确答案JSON
const updateCorrectAnswerJson = () => {
  if (questionForm.type === 2) {
    questionForm.correctAnswer = questionForm.correctAnswerList.join(',')
  }
}

// 获取选项数组
const getOptionsArray = (options) => {
  try {
    return JSON.parse(options || '[]')
  } catch {
    return []
  }
}

// 检查是否为正确选项
const isCorrectOption = (index, correctAnswer) => {
  if (!correctAnswer) return false
  const correctOptions = correctAnswer.split(',')
  const optionLabel = String.fromCharCode(65 + index)
  return correctOptions.includes(optionLabel)
}

// 保存题目
const saveQuestion = async () => {
  try {
    await questionFormRef.value.validate()
    
    saveLoading.value = true
    
    // 处理选项数据
    if (questionForm.type === 1 || questionForm.type === 2) {
      updateOptionsJson()
      if (questionForm.type === 2) {
        updateCorrectAnswerJson()
      }
    }
    
    const questionData = { ...questionForm }
    delete questionData.optionList
    delete questionData.correctAnswerList
    // explanation字段保留，后端已支持答案解析功能
    
    // 调试信息：确认发送的数据格式
    console.log('发送到后端的数据:', questionData)
    console.log('优先级值:', questionData.priority, '类型:', typeof questionData.priority)
    
    if (isEdit.value) {
      await questionBankAPI.update(questionData.id, questionData)
      ElMessage.success('更新成功')
    } else {
      await questionBankAPI.create(questionData)
      ElMessage.success('创建成功')
    }
    
    dialogVisible.value = false
    loadQuestionList()
  } catch (error) {
    console.error('保存题目失败:', error)
    ElMessage.error('保存失败')
  } finally {
    saveLoading.value = false
  }
}

// 重置表单
const resetForm = () => {
  // 基础信息重置
  questionForm.id = null
  questionForm.title = ''
  questionForm.type = null
  questionForm.content = ''
  questionForm.options = ''
  questionForm.optionList = ['', '']
  questionForm.correctAnswer = ''
  questionForm.correctAnswerList = []
  questionForm.score = 5
  questionForm.priority = 2
  questionForm.status = 1
  questionForm.explanation = ''
  
  // 智能控制重置
  showAdvancedOptions.value = false
  showDescriptionField.value = false
  
  // 清空表单验证
  nextTick(() => {
    if (questionFormRef.value) {
      questionFormRef.value.clearValidate()
    }
  })
}

// 导入导出相关变量
const importVisible = ref(false)
const importLoading = ref(false)

// 显示导入对话框
const showImportDialog = () => {
  importVisible.value = true
}

// 文件选择处理
const handleFileChange = (file) => {
  console.log('选择文件:', file)
}

// 处理导入
const handleImport = () => {
  importLoading.value = true
  // 模拟导入过程
  setTimeout(() => {
    importLoading.value = false
    importVisible.value = false
    ElMessage.success('导入成功')
  }, 2000)
}

// 下载模板
const downloadTemplate = () => {
  ElMessage.info('模板下载功能开发中...')
}

// 导出题目
const exportQuestions = () => {
  ElMessage.info('导出功能开发中...')
}

// 生命周期
onMounted(() => {
  console.log('页面初始化，开始加载题目列表...')
  loadQuestionList()
})
</script>

<style scoped>
/* 🎯 简洁优雅的现代化界面 */
.table-container {
  background: #ffffff;
  border-radius: 16px;
  padding: 24px;
  margin-top: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.06);
  border: 1px solid #e5e7eb;
}

/* 🔧 批量操作栏 */
.batch-toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: #f8fafc;
  border-radius: 12px;
  margin-bottom: 20px;
  border: 1px solid #e2e8f0;
}

.selection-info {
  color: #64748b;
  font-weight: 500;
  font-size: 14px;
}

.selected-count {
  color: #0f172a;
  font-weight: 600;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

/* 🎨 表格样式 */
.clean-data-table {
  margin-top: 0;
}

:deep(.clean-data-table .el-table) {
  background: #ffffff;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

:deep(.clean-data-table .el-table__header) {
  background: #f8fafc;
}

:deep(.clean-data-table .el-table__header th) {
  background: transparent !important;
  border-bottom: 1px solid #e5e7eb;
  color: #374151;
  font-weight: 600;
  font-size: 13px;
  padding: 16px 12px;
}

:deep(.clean-data-table .el-table__body tr) {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
  position: relative !important;
  background: rgba(255, 255, 255, 0.9) !important;
  backdrop-filter: blur(5px) !important;
}

:deep(.clean-data-table .el-table__body tr:hover) {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.08) 0%, 
    rgba(118, 75, 162, 0.06) 50%, 
    rgba(83, 109, 254, 0.08) 100%) !important;
  backdrop-filter: blur(10px) !important;
  transform: translateX(4px) scale(1.005) !important;
  box-shadow: 
    6px 0 20px rgba(102, 126, 234, 0.12),
    0 4px 16px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6) !important;
  border-left: 4px solid rgba(102, 126, 234, 0.3) !important;
  z-index: 2 !important;
}

:deep(.clean-data-table .el-table__row.selected-row) {
  background: linear-gradient(135deg, #e0f2fe 0%, #e3f2fd 100%) !important;
  border-left: 3px solid #0ea5e9 !important;
}

:deep(.clean-data-table .el-table__row.selected-row:hover) {
  background: linear-gradient(135deg, #bae6fd 0%, #dbeafe 100%) !important;
}

:deep(.clean-data-table .el-table__row.current-row) {
  background: #e3f2fd !important;
}

/* 🎨 偶数行和奇数行的精致背景 */
:deep(.clean-data-table .el-table__body tr:nth-child(even)) {
  background: linear-gradient(135deg, rgba(248, 250, 252, 0.7) 0%, rgba(241, 245, 249, 0.8) 100%) !important;
}

:deep(.clean-data-table .el-table__body tr:nth-child(odd)) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(252, 252, 253, 0.9) 100%) !important;
}

/* 🌟 悬停时覆盖斑马纹，统一显示渐变效果 */
:deep(.clean-data-table .el-table__body tr:nth-child(even):hover),
:deep(.clean-data-table .el-table__body tr:nth-child(odd):hover) {
  background: linear-gradient(135deg, 
    rgba(102, 126, 234, 0.12) 0%, 
    rgba(118, 75, 162, 0.08) 30%,
    rgba(99, 102, 241, 0.10) 70%,
    rgba(83, 109, 254, 0.12) 100%) !important;
  backdrop-filter: blur(15px) !important;
  transform: translateX(6px) scale(1.008) !important;
  box-shadow: 
    8px 0 24px rgba(102, 126, 234, 0.18),
    0 6px 20px rgba(0, 0, 0, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.8),
    inset 0 -1px 0 rgba(102, 126, 234, 0.1) !important;
  border-left: 5px solid rgba(102, 126, 234, 0.4) !important;
  z-index: 3 !important;
}

:deep(.clean-data-table .el-table__body td) {
  border-bottom: 1px solid rgba(102, 126, 234, 0.08) !important;
  padding: 20px 16px;
  vertical-align: middle;
  transition: all 0.3s ease !important;
}

/* 🎭 悬停时单元格内容的微动效果 */
:deep(.clean-data-table .el-table__body tr:hover td) {
  color: #1a202c !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
}

:deep(.clean-data-table .el-table__body tr:hover .title-text) {
  color: #2d3748 !important;
  transform: translateX(2px) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.clean-data-table .el-table__body tr:hover .el-tag) {
  transform: scale(1.05) !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

:deep(.clean-data-table .el-table__body tr:hover .el-switch) {
  transform: scale(1.1) !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
}

/* 📝 标题单元格 */
.title-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-text {
  font-weight: 600;
  color: #0f172a;
  line-height: 1.4;
  font-size: 14px;
}

.title-meta {
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #64748b;
}

.title-meta .el-icon {
  font-size: 12px;
}

/* ⭐ 分数显示 */
.score-cell {
  color: #059669;
  font-weight: 600;
  font-size: 14px;
}

/* 🎮 操作按钮组 - 优雅平铺设计 */
.action-buttons-group {
  display: flex;
  gap: 8px;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
  white-space: nowrap;
  width: 100%;
  padding: 4px 0;
}

/* 基础按钮样式已通过:deep()选择器统一处理 */

/* 移除重复样式，已通过:deep()选择器处理 */

/* 🎭 过渡动画 */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* 📱 响应式设计 */
@media (max-width: 768px) {
  .table-container {
    padding: 16px;
    margin-top: 16px;
  }
  
  .batch-toolbar {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .action-buttons-group {
    gap: 6px;
    padding: 2px 0;
  }
  
  .action-buttons-group .action-button {
    font-size: 11px !important;
    padding: 4px 8px !important;
    height: 28px !important;
    min-width: 50px !important;
  }
  
  .action-buttons-group .action-button .el-icon {
    font-size: 12px !important;
    margin-right: 2px !important;
  }
}





/* 📱 响应式设计 */
@media (max-width: 1200px) {
  .premium-management-container {
    padding: 24px;
    border-radius: 20px;
  }
  
  .smart-control-bar {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .stats-panel {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .premium-management-container {
    padding: 20px;
    border-radius: 16px;
    margin-top: 16px;
  }
  
  .selection-control {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .batch-operations-panel {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .batch-actions {
    justify-content: space-around;
  }
  
  .premium-btn {
    flex: 1;
    min-width: 0;
  }
  
  .stats-panel {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-card {
    justify-content: center;
  }
}

/* 对话框样式保持不变 - 这些是页面特定的 */
.modern-dialog {
  z-index: var(--z-modal) !important;
  isolation: isolate;
}

.modern-dialog :deep(.el-dialog) {
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  margin-top: 5vh !important;
  margin-bottom: 5vh !important;
  max-height: 90vh;
  overflow: hidden;
  z-index: var(--z-modal) !important;
}

.dialog-content {
  padding: var(--spacing-2xl);
  background: var(--color-gray-50);
  min-height: 500px;
}

.form-section {
  margin-bottom: var(--spacing-lg);
  background: var(--color-white);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-card);
  transition: var(--transition-normal);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.form-section:hover {
  box-shadow: var(--shadow-lg);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-white);
  margin: 0;
  padding: var(--spacing-lg) var(--spacing-2xl);
  background: var(--gradient-primary);
  border-bottom: none;
  position: relative;
}

.section-title .el-icon {
  color: var(--color-white);
  font-size: var(--text-lg);
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
}

.section-content {
  background: var(--color-white);
  padding: var(--spacing-2xl);
  border-radius: 0;
}

.dialog-content .form-row {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  align-items: flex-start;
}

.dialog-content .form-row:last-child {
  margin-bottom: 0;
}

.form-col {
  flex: 1;
  min-width: 0;
}

/* 表单项样式精细调整 */
:deep(.el-form-item) {
  margin-bottom: var(--spacing-lg);
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  font-weight: var(--font-medium);
  color: var(--color-gray-700);
  font-size: var(--text-sm);
  padding-bottom: var(--spacing-sm);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-sm);
  min-height: 20px;
  display: flex;
  align-items: center;
}

/* 修复form-row内表单项对齐问题 */
:deep(.form-row .el-form-item) {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 0;
}

:deep(.form-row .el-form-item__content) {
  flex: 1;
  display: flex;
  align-items: flex-end;
}

:deep(.form-row .el-form-item__label) {
  margin-bottom: var(--spacing-sm);
  flex-shrink: 0;
}

/* Progress Steps */
.progress-steps {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
  background: var(--color-white);
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.step-item {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  transition: var(--transition-normal);
}

.step-item:not(:last-child)::after {
  content: '';
  width: 40px;
  height: 2px;
  background: var(--color-gray-200);
  margin: 0 var(--spacing-lg);
  transition: var(--transition-normal);
}

.step-item.completed {
  color: var(--color-success);
}

.step-item.completed::after {
  background: var(--color-success);
}

.step-item.active {
  color: var(--color-primary);
  font-weight: var(--font-semibold);
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  margin-right: var(--spacing-sm);
  transition: var(--transition-normal);
}

.step-item.completed .step-number {
  background: var(--color-success);
  color: var(--color-white);
}

.step-item.active .step-number {
  background: var(--color-primary);
  color: var(--color-white);
}

/* 选项编辑器样式 */
.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
}

.option-item:hover {
  background: var(--color-gray-100);
}

.option-prefix {
  width: 32px;
  height: 32px;
  background: var(--gradient-primary);
  color: var(--color-white);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.option-input {
  flex: 1;
}

.option-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* 答案选择区域 */
.answer-selection {
  background: var(--color-white);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.answer-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.answer-option {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: var(--font-medium);
}

.answer-option:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

.answer-option.selected {
  border-color: var(--color-success);
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  color: var(--color-success);
}

/* Smart suggestions */
.smart-suggestion {
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--color-primary);
  background: var(--color-primary-50);
}

.suggestion-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  background: var(--color-white);
}

.suggestion-toggle:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

/* 预览对话框样式 */
.preview-content {
  padding: var(--spacing-2xl);
  background: var(--color-white);
  max-height: 70vh;
  overflow-y: auto;
}

.preview-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-gray-100);
}

.preview-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-md);
}

.preview-meta {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.meta-item {
  background: var(--color-gray-100);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-2xl);
  font-size: var(--text-sm);
  color: var(--color-gray-600);
}

.preview-section {
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-lg);
}

.question-content {
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-700);
  padding: var(--spacing-lg);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--color-primary);
}

.options-display {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.option-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-white);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
}

.option-display:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.option-display.correct-option {
  border-color: var(--color-success);
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
}

.option-label {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
}

.correct-option .option-label {
  background: var(--gradient-success);
  color: var(--color-white);
}

.option-text {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-gray-700);
}

.option-status {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-display {
  padding: var(--spacing-lg);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-gray-200);
}

.answer-content {
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-700);
}

.explanation-section {
  background: var(--color-gray-50);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-gray-200);
}

.explanation-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-lg);
}

.explanation-content {
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-700);
}

/* 导入对话框 */
.import-dialog {
  z-index: var(--z-modal);
}

.import-content {
  padding: var(--spacing-xl);
}

.import-tips {
  margin-bottom: var(--spacing-xl);
}

.upload-area {
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4xl);
  text-align: center;
  cursor: pointer;
  transition: var(--transition-normal);
}

.upload-area:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.upload-text {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--color-gray-700);
}

.upload-hint {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-top: 1px solid var(--color-gray-200);
}

.template-btn {
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  color: var(--color-gray-600);
}

.template-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog-content .form-row {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .preview-meta {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .option-display {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .progress-steps {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .step-item:not(:last-child)::after {
    display: none;
  }
}

/* 搜索字段垂直居中样式 - 强制覆盖 */
.search-field {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: stretch !important;
  height: 68px !important;
  min-height: 68px !important;
  max-height: 68px !important;
  padding: 8px 0 !important;
  box-sizing: border-box !important;
}

.search-field label {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #6b7280 !important;
  line-height: 1.2 !important;
  margin: 0 0 6px 0 !important;
  padding: 0 !important;
  display: block !important;
  width: 100% !important;
  text-align: left !important;
  flex-shrink: 0 !important;
}

.search-field .el-input,
.search-field .el-select {
  height: 40px !important;
  width: 100% !important;
  flex: 1 !important;
  min-height: 40px !important;
}

.search-field .el-input__wrapper,
.search-field .el-select__wrapper {
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
}

/* 🎯 专业管理系统表格设计 - 平衡美观与效率 */
:deep(.modern-table .el-table__header) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%) !important;
  backdrop-filter: blur(10px) !important;
  border-bottom: 2px solid rgba(102, 126, 234, 0.08) !important;
}

:deep(.modern-table .el-table__header th) {
  background: transparent !important;
  border: none !important;
  padding: 16px 12px !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  color: #374151 !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.08) !important;
  white-space: nowrap !important;
}

:deep(.modern-table .el-table__row) {
  transition: all 0.2s ease !important;
  background: rgba(255, 255, 255, 0.8) !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.05) !important;
}

:deep(.modern-table .el-table__row:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.04) 100%) !important;
  transform: translateX(2px) !important;
  box-shadow: 
    4px 0 12px rgba(102, 126, 234, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04) !important;
  z-index: 1 !important;
  position: relative !important;
}

:deep(.modern-table .el-table__row:nth-child(even)) {
  background: rgba(248, 250, 252, 0.6) !important;
}

:deep(.modern-table .el-table__row:nth-child(odd)) {
  background: rgba(255, 255, 255, 0.8) !important;
}

:deep(.modern-table .el-table__row td) {
  border: none !important;
  padding: 14px 12px !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.05) !important;
  vertical-align: middle !important;
}

/* 🎨 优化的标签和按钮设计 */
:deep(.modern-table .el-tag) {
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 4px 8px !important;
  border: none !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

:deep(.modern-table .el-switch) {
  transform: scale(0.9) !important;
}

:deep(.modern-table .el-button) {
  border-radius: 6px !important;
  font-size: 12px !important;
  padding: 6px 8px !important;
  margin: 0 2px !important;
  transition: all 0.2s ease !important;
  min-width: 32px !important;
  height: 28px !important;
}

:deep(.modern-table .el-button:hover) {
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12) !important;
}

/* 📊 标题列优化 - 保持信息密度 */
.title-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 40px;
  justify-content: center;
}

.title-text {
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 36px;
}

.title-meta {
  font-size: 11px;
  color: #6b7280;
  font-weight: 400;
  margin-top: 2px;
}

.score-text {
  font-weight: 600;
  color: #059669;
  font-size: 13px;
}

/* 🎮 紧凑的操作按钮设计 */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
}

.action-buttons .el-button {
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  font-size: 11px !important;
  padding: 5px 6px !important;
  min-width: 28px !important;
  height: 26px !important;
}

.action-buttons .el-button .el-icon {
  font-size: 14px !important;
}

.action-buttons .el-button:hover {
  transform: translateY(-1px) scale(1.05) !important;
}

/* 🔄 批量操作优化 */
.bulk-actions {
  background: rgba(102, 126, 234, 0.03);
  border-radius: 12px;
  padding: 8px 16px;
  backdrop-filter: blur(10px);
}

.bulk-btn {
  font-size: 13px !important;
  padding: 6px 12px !important;
  border-radius: 8px !important;
}

/* 🎯 视图切换优化 */
.view-toggle {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.view-toggle .el-radio-button__inner {
  border: none !important;
  padding: 6px 16px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.view-toggle .el-radio-button__original-radio:checked + .el-radio-button__inner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3) !important;
}

/* 📱 移动端适配 */
@media (max-width: 768px) {
  :deep(.modern-table .el-table__row:hover) {
    transform: none !important;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1) !important;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-buttons .el-button {
    width: 100% !important;
    min-width: 60px !important;
  }
}



/* 对话框和表单样式 */
.modern-dialog {
  z-index: 3000;
}

/* 🎯 表格选中状态优化 */
:deep(.clean-data-table .el-table__row.selected-row) {
  background: linear-gradient(135deg, #e0f2fe 0%, #e3f2fd 100%) !important;
  border-left: 3px solid #0ea5e9 !important;
}

:deep(.clean-data-table .el-table__row.selected-row:hover) {
  background: linear-gradient(135deg, #bae6fd 0%, #dbeafe 100%) !important;
}

:deep(.clean-data-table .el-table__row.current-row) {
  background: linear-gradient(135deg, #e3f2fd 0%, #e0f2fe 100%) !important;
  border-left: 3px solid #3b82f6 !important;
}

/* 🎨 表格间距优化 */
:deep(.clean-data-table .el-table__header th) {
  padding: 20px 16px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
}

/* 🔍 搜索区域垂直对齐优化 */
:deep(.search-panel .search-field) {
  align-items: flex-end !important;
  padding-bottom: 4px !important;
}

:deep(.search-panel .search-actions) {
  padding-bottom: 4px !important;
}

/* 🚫 移除对搜索按钮的样式干扰 - 模块化隔离 */

/* 📋 选择控制区域 */
.selection-control {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
}

.master-checkbox {
  font-weight: 600;
  color: #374151;
  padding: 12px 16px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(99, 102, 241, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.master-checkbox:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

.selection-info {
  margin-left: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 14px;
}

/* 🎯 批量操作面板 */
.batch-operations-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.15);
  backdrop-filter: blur(20px);
  animation: slideInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInScale {
  from { 
    transform: translateX(-20px) scale(0.9); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0) scale(1); 
    opacity: 1; 
  }
}

.batch-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
}

.counter-badge {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.counter-text {
  font-weight: 600;
  color: #4b5563;
  font-size: 13px;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.premium-btn {
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.premium-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.premium-btn.danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-color: rgba(239, 68, 68, 0.3);
}

.premium-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-color: rgba(99, 102, 241, 0.3);
}

.premium-btn.secondary {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: white;
  border-color: rgba(100, 116, 139, 0.3);
}

/* 📊 数据统计面板 */
.stats-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.12);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.06);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon.total {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.stat-icon.selected {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
}

.stat-value.highlight {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.2) 50%, transparent 100%);
}

/* 🎨 现代化表格样式 */
.premium-data-table {
  margin-top: 0;
}

:deep(.premium-data-table .el-table) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.12);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.08);
}

:deep(.premium-data-table .el-table__header) {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%);
}

:deep(.premium-data-table .el-table__header th) {
  background: transparent !important;
  border-bottom: 2px solid rgba(99, 102, 241, 0.1);
  color: #374151;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 20px 16px;
}

:deep(.premium-data-table .el-table__body tr) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.premium-data-table .el-table__body tr:hover) {
  background: rgba(99, 102, 241, 0.03) !important;
  transform: translateX(4px);
  box-shadow: 4px 0 0 rgba(99, 102, 241, 0.2);
}

:deep(.premium-data-table .el-table__body td) {
  border-bottom: 1px solid rgba(99, 102, 241, 0.06);
  padding: 20px 16px;
}

/* 📝 题目信息单元格 */
.question-info-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.question-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
  margin: 0;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex: 1;
}

.question-badges {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.modern-badge {
  border-radius: 10px;
  font-weight: 600;
  font-size: 11px;
  padding: 4px 10px;
  border: 1px solid transparent;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  color: #6366f1;
  font-size: 14px;
}

.meta-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* ⭐ 分数显示 */
.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 16px;
  color: white;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.score-icon {
  font-size: 14px;
}

.score-value {
  font-size: 16px;
  line-height: 1;
}

.score-unit {
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 🔄 状态控制 */
.status-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.premium-switch {
  transform: scale(1.1);
}

.status-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 🎮 操作按钮组 */
.premium-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid transparent;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.preview-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-color: rgba(99, 102, 241, 0.3);
}

.edit-btn {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  border-color: rgba(100, 116, 139, 0.3);
}

.copy-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: rgba(16, 185, 129, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: rgba(239, 68, 68, 0.3);
}

/* 🎭 动画效果 */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px) scale(0.95);
  opacity: 0;
}

/* 📱 响应式设计 */
@media (max-width: 1200px) {
  .premium-management-container {
    padding: 24px;
    border-radius: 20px;
  }
  
  .smart-control-bar {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .stats-panel {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .premium-management-container {
    padding: 20px;
    border-radius: 16px;
    margin-top: 16px;
  }
  
  .selection-control {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .batch-operations-panel {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .batch-actions {
    justify-content: space-around;
  }
  
  .premium-btn {
    flex: 1;
    min-width: 0;
  }
  
  .stats-panel {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-card {
    justify-content: center;
  }
}

/* 对话框样式保持不变 - 这些是页面特定的 */
.modern-dialog {
  z-index: var(--z-modal) !important;
  isolation: isolate;
}

.modern-dialog :deep(.el-dialog) {
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  margin-top: 5vh !important;
  margin-bottom: 5vh !important;
  max-height: 90vh;
  overflow: hidden;
  z-index: var(--z-modal) !important;
}

.dialog-content {
  padding: var(--spacing-2xl);
  background: var(--color-gray-50);
  min-height: 500px;
}

.form-section {
  margin-bottom: var(--spacing-lg);
  background: var(--color-white);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-card);
  transition: var(--transition-normal);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.form-section:hover {
  box-shadow: var(--shadow-lg);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-white);
  margin: 0;
  padding: var(--spacing-lg) var(--spacing-2xl);
  background: var(--gradient-primary);
  border-bottom: none;
  position: relative;
}

.section-title .el-icon {
  color: var(--color-white);
  font-size: var(--text-lg);
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
}

.section-content {
  background: var(--color-white);
  padding: var(--spacing-2xl);
  border-radius: 0;
}

.dialog-content .form-row {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  align-items: flex-start;
}

.dialog-content .form-row:last-child {
  margin-bottom: 0;
}

.form-col {
  flex: 1;
  min-width: 0;
}

/* 表单项样式精细调整 */
:deep(.el-form-item) {
  margin-bottom: var(--spacing-lg);
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  font-weight: var(--font-medium);
  color: var(--color-gray-700);
  font-size: var(--text-sm);
  padding-bottom: var(--spacing-sm);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-sm);
  min-height: 20px;
  display: flex;
  align-items: center;
}

/* 修复form-row内表单项对齐问题 */
:deep(.form-row .el-form-item) {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 0;
}

:deep(.form-row .el-form-item__content) {
  flex: 1;
  display: flex;
  align-items: flex-end;
}

:deep(.form-row .el-form-item__label) {
  margin-bottom: var(--spacing-sm);
  flex-shrink: 0;
}

/* Progress Steps */
.progress-steps {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
  background: var(--color-white);
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.step-item {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  transition: var(--transition-normal);
}

.step-item:not(:last-child)::after {
  content: '';
  width: 40px;
  height: 2px;
  background: var(--color-gray-200);
  margin: 0 var(--spacing-lg);
  transition: var(--transition-normal);
}

.step-item.completed {
  color: var(--color-success);
}

.step-item.completed::after {
  background: var(--color-success);
}

.step-item.active {
  color: var(--color-primary);
  font-weight: var(--font-semibold);
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  margin-right: var(--spacing-sm);
  transition: var(--transition-normal);
}

.step-item.completed .step-number {
  background: var(--color-success);
  color: var(--color-white);
}

.step-item.active .step-number {
  background: var(--color-primary);
  color: var(--color-white);
}

/* 选项编辑器样式 */
.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
}

.option-item:hover {
  background: var(--color-gray-100);
}

.option-prefix {
  width: 32px;
  height: 32px;
  background: var(--gradient-primary);
  color: var(--color-white);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.option-input {
  flex: 1;
}

.option-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* 答案选择区域 */
.answer-selection {
  background: var(--color-white);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.answer-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.answer-option {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: var(--font-medium);
}

.answer-option:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

.answer-option.selected {
  border-color: var(--color-success);
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  color: var(--color-success);
}

/* Smart suggestions */
.smart-suggestion {
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--color-primary);
  background: var(--color-primary-50);
}

.suggestion-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  background: var(--color-white);
}

.suggestion-toggle:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

/* 预览对话框样式 */
.preview-content {
  padding: var(--spacing-2xl);
  background: var(--color-white);
  max-height: 70vh;
  overflow-y: auto;
}

.preview-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-gray-100);
}

.preview-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-md);
}

.preview-meta {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.meta-item {
  background: var(--color-gray-100);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-2xl);
  font-size: var(--text-sm);
  color: var(--color-gray-600);
}

.preview-section {
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-lg);
}

.question-content {
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-700);
  padding: var(--spacing-lg);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--color-primary);
}

.options-display {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.option-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-white);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
}

.option-display:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.option-display.correct-option {
  border-color: var(--color-success);
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
}

.option-label {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
}

.correct-option .option-label {
  background: var(--gradient-success);
  color: var(--color-white);
}

.option-text {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-gray-700);
}

.option-status {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-display {
  padding: var(--spacing-lg);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-gray-200);
}

.answer-content {
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-700);
}

.explanation-section {
  background: var(--color-gray-50);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-gray-200);
}

.explanation-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-lg);
}

.explanation-content {
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-700);
}

/* 导入对话框 */
.import-dialog {
  z-index: var(--z-modal);
}

.import-content {
  padding: var(--spacing-xl);
}

.import-tips {
  margin-bottom: var(--spacing-xl);
}

.upload-area {
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4xl);
  text-align: center;
  cursor: pointer;
  transition: var(--transition-normal);
}

.upload-area:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.upload-text {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--color-gray-700);
}

.upload-hint {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-top: 1px solid var(--color-gray-200);
}

.template-btn {
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  color: var(--color-gray-600);
}

.template-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog-content .form-row {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .preview-meta {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .option-display {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .progress-steps {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .step-item:not(:last-child)::after {
    display: none;
  }
}

/* 搜索字段垂直居中样式 - 强制覆盖 */
.search-field {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: stretch !important;
  height: 68px !important;
  min-height: 68px !important;
  max-height: 68px !important;
  padding: 8px 0 !important;
  box-sizing: border-box !important;
}

.search-field label {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #6b7280 !important;
  line-height: 1.2 !important;
  margin: 0 0 6px 0 !important;
  padding: 0 !important;
  display: block !important;
  width: 100% !important;
  text-align: left !important;
  flex-shrink: 0 !important;
}

.search-field .el-input,
.search-field .el-select {
  height: 40px !important;
  width: 100% !important;
  flex: 1 !important;
  min-height: 40px !important;
}

.search-field .el-input__wrapper,
.search-field .el-select__wrapper {
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
}

/* 🎯 专业管理系统表格设计 - 平衡美观与效率 */
:deep(.modern-table .el-table__header) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%) !important;
  backdrop-filter: blur(10px) !important;
  border-bottom: 2px solid rgba(102, 126, 234, 0.08) !important;
}

:deep(.modern-table .el-table__header th) {
  background: transparent !important;
  border: none !important;
  padding: 16px 12px !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  color: #374151 !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.08) !important;
  white-space: nowrap !important;
}

:deep(.modern-table .el-table__row) {
  transition: all 0.2s ease !important;
  background: rgba(255, 255, 255, 0.8) !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.05) !important;
}

:deep(.modern-table .el-table__row:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.04) 100%) !important;
  transform: translateX(2px) !important;
  box-shadow: 
    4px 0 12px rgba(102, 126, 234, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04) !important;
  z-index: 1 !important;
  position: relative !important;
}

:deep(.modern-table .el-table__row:nth-child(even)) {
  background: rgba(248, 250, 252, 0.6) !important;
}

:deep(.modern-table .el-table__row:nth-child(odd)) {
  background: rgba(255, 255, 255, 0.8) !important;
}

:deep(.modern-table .el-table__row td) {
  border: none !important;
  padding: 14px 12px !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.05) !important;
  vertical-align: middle !important;
}

/* 🎨 优化的标签和按钮设计 */
:deep(.modern-table .el-tag) {
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 4px 8px !important;
  border: none !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

:deep(.modern-table .el-switch) {
  transform: scale(0.9) !important;
}

:deep(.modern-table .el-button) {
  border-radius: 6px !important;
  font-size: 12px !important;
  padding: 6px 8px !important;
  margin: 0 2px !important;
  transition: all 0.2s ease !important;
  min-width: 32px !important;
  height: 28px !important;
}

:deep(.modern-table .el-button:hover) {
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12) !important;
}

/* 📊 标题列优化 - 保持信息密度 */
.title-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 40px;
  justify-content: center;
}

.title-text {
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 36px;
}

.title-meta {
  font-size: 11px;
  color: #6b7280;
  font-weight: 400;
  margin-top: 2px;
}

.score-text {
  font-weight: 600;
  color: #059669;
  font-size: 13px;
}

/* 🎮 紧凑的操作按钮设计 */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
}

.action-buttons .el-button {
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  font-size: 11px !important;
  padding: 5px 6px !important;
  min-width: 28px !important;
  height: 26px !important;
}

.action-buttons .el-button .el-icon {
  font-size: 14px !important;
}

.action-buttons .el-button:hover {
  transform: translateY(-1px) scale(1.05) !important;
}

/* 🔄 批量操作优化 */
.bulk-actions {
  background: rgba(102, 126, 234, 0.03);
  border-radius: 12px;
  padding: 8px 16px;
  backdrop-filter: blur(10px);
}

.bulk-btn {
  font-size: 13px !important;
  padding: 6px 12px !important;
  border-radius: 8px !important;
}

/* 🎯 视图切换优化 */
.view-toggle {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.view-toggle .el-radio-button__inner {
  border: none !important;
  padding: 6px 16px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.view-toggle .el-radio-button__original-radio:checked + .el-radio-button__inner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3) !important;
}

/* 📱 移动端适配 */
@media (max-width: 768px) {
  :deep(.modern-table .el-table__row:hover) {
    transform: none !important;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1) !important;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-buttons .el-button {
    width: 100% !important;
    min-width: 60px !important;
  }
}



/* 对话框和表单样式 */
.modern-dialog {
  z-index: 3000;
}

/* 🎯 表格选中状态优化 */
:deep(.clean-data-table .el-table__row.selected-row) {
  background: linear-gradient(135deg, #e0f2fe 0%, #e3f2fd 100%) !important;
  border-left: 3px solid #0ea5e9 !important;
}

:deep(.clean-data-table .el-table__row.selected-row:hover) {
  background: linear-gradient(135deg, #bae6fd 0%, #dbeafe 100%) !important;
}

:deep(.clean-data-table .el-table__row.current-row) {
  background: linear-gradient(135deg, #e3f2fd 0%, #e0f2fe 100%) !important;
  border-left: 3px solid #3b82f6 !important;
}

/* 🎨 表格间距优化 */
:deep(.clean-data-table .el-table__header th) {
  padding: 20px 16px !important;
  font-size: 14px !important;
  font-weight: 600 !important;
}

/* 🔍 搜索区域垂直对齐优化 */
:deep(.search-panel .search-field) {
  align-items: flex-end !important;
  padding-bottom: 4px !important;
}

:deep(.search-panel .search-actions) {
  padding-bottom: 4px !important;
}

/* 🚫 移除对搜索按钮的样式干扰 - 模块化隔离 */

/* 📋 选择控制区域 */
.selection-control {
  display: flex;
  align-items: center;
  gap: 24px;
  position: relative;
}

.master-checkbox {
  font-weight: 600;
  color: #374151;
  padding: 12px 16px;
  background: rgba(99, 102, 241, 0.05);
  border-radius: 16px;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(99, 102, 241, 0.1);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.master-checkbox:hover {
  background: rgba(99, 102, 241, 0.08);
  border-color: rgba(99, 102, 241, 0.2);
  transform: translateY(-1px);
}

.selection-info {
  margin-left: 12px;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 700;
  font-size: 14px;
}

/* 🎯 批量操作面板 */
.batch-operations-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(139, 92, 246, 0.05) 100%);
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.15);
  backdrop-filter: blur(20px);
  animation: slideInScale 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInScale {
  from { 
    transform: translateX(-20px) scale(0.9); 
    opacity: 0; 
  }
  to { 
    transform: translateX(0) scale(1); 
    opacity: 1; 
  }
}

.batch-counter {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-right: 8px;
}

.counter-badge {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  padding: 6px 12px;
  border-radius: 12px;
  font-weight: 700;
  font-size: 13px;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.counter-text {
  font-weight: 600;
  color: #4b5563;
  font-size: 13px;
}

.batch-actions {
  display: flex;
  gap: 8px;
}

.premium-btn {
  padding: 8px 16px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 13px;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.premium-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.12);
}

.premium-btn.danger {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  color: white;
  border-color: rgba(239, 68, 68, 0.3);
}

.premium-btn.primary {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
  border-color: rgba(99, 102, 241, 0.3);
}

.premium-btn.secondary {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  color: white;
  border-color: rgba(100, 116, 139, 0.3);
}

/* 📊 数据统计面板 */
.stats-panel {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px 20px;
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9) 0%, rgba(248, 250, 252, 0.8) 100%);
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.12);
  backdrop-filter: blur(20px);
  box-shadow: 0 4px 16px rgba(99, 102, 241, 0.06);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 12px;
}

.stat-icon {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.stat-icon.total {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  color: white;
}

.stat-icon.selected {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  color: white;
}

.stat-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-value {
  font-size: 18px;
  font-weight: 800;
  color: #1f2937;
  line-height: 1;
}

.stat-value.highlight {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stat-label {
  font-size: 12px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.stat-divider {
  width: 1px;
  height: 32px;
  background: linear-gradient(180deg, transparent 0%, rgba(99, 102, 241, 0.2) 50%, transparent 100%);
}

/* 🎨 现代化表格样式 */
.premium-data-table {
  margin-top: 0;
}

:deep(.premium-data-table .el-table) {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(20px);
  border-radius: 20px;
  border: 1px solid rgba(99, 102, 241, 0.12);
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(99, 102, 241, 0.08);
}

:deep(.premium-data-table .el-table__header) {
  background: linear-gradient(135deg, rgba(99, 102, 241, 0.08) 0%, rgba(139, 92, 246, 0.05) 100%);
}

:deep(.premium-data-table .el-table__header th) {
  background: transparent !important;
  border-bottom: 2px solid rgba(99, 102, 241, 0.1);
  color: #374151;
  font-weight: 700;
  font-size: 13px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 20px 16px;
}

:deep(.premium-data-table .el-table__body tr) {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

:deep(.premium-data-table .el-table__body tr:hover) {
  background: rgba(99, 102, 241, 0.03) !important;
  transform: translateX(4px);
  box-shadow: 4px 0 0 rgba(99, 102, 241, 0.2);
}

:deep(.premium-data-table .el-table__body td) {
  border-bottom: 1px solid rgba(99, 102, 241, 0.06);
  padding: 20px 16px;
}

/* 📝 题目信息单元格 */
.question-info-cell {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.question-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.question-title {
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
  line-height: 1.4;
  margin: 0;
  background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  flex: 1;
}

.question-badges {
  display: flex;
  gap: 8px;
  flex-shrink: 0;
}

.modern-badge {
  border-radius: 10px;
  font-weight: 600;
  font-size: 11px;
  padding: 4px 10px;
  border: 1px solid transparent;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  backdrop-filter: blur(10px);
}

.question-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 4px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 6px;
}

.meta-icon {
  color: #6366f1;
  font-size: 14px;
}

.meta-text {
  font-size: 12px;
  color: #6b7280;
  font-weight: 500;
}

/* ⭐ 分数显示 */
.score-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.score-circle {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
  width: 50px;
  height: 50px;
  background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
  border-radius: 16px;
  color: white;
  font-weight: 800;
  box-shadow: 0 4px 12px rgba(251, 191, 36, 0.3);
}

.score-icon {
  font-size: 14px;
}

.score-value {
  font-size: 16px;
  line-height: 1;
}

.score-unit {
  font-size: 11px;
  color: #6b7280;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 🔄 状态控制 */
.status-control {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.premium-switch {
  transform: scale(1.1);
}

.status-label {
  font-size: 11px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* 🎮 操作按钮组 */
.premium-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-btn {
  width: 36px;
  height: 36px;
  border-radius: 12px;
  border: 1px solid transparent;
  backdrop-filter: blur(10px);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  position: relative;
  overflow: hidden;
}

.action-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
  transition: left 0.5s;
}

.action-btn:hover::before {
  left: 100%;
}

.action-btn:hover {
  transform: translateY(-3px) scale(1.05);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.preview-btn {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-color: rgba(99, 102, 241, 0.3);
}

.edit-btn {
  background: linear-gradient(135deg, #64748b 0%, #475569 100%);
  border-color: rgba(100, 116, 139, 0.3);
}

.copy-btn {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-color: rgba(16, 185, 129, 0.3);
}

.delete-btn {
  background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
  border-color: rgba(239, 68, 68, 0.3);
}

/* 🎭 动画效果 */
.slide-fade-enter-active {
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateX(-20px) scale(0.95);
  opacity: 0;
}

/* 📱 响应式设计 */
@media (max-width: 1200px) {
  .premium-management-container {
    padding: 24px;
    border-radius: 20px;
  }
  
  .smart-control-bar {
    flex-direction: column;
    gap: 20px;
    align-items: stretch;
  }
  
  .stats-panel {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .premium-management-container {
    padding: 20px;
    border-radius: 16px;
    margin-top: 16px;
  }
  
  .selection-control {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .batch-operations-panel {
    flex-direction: column;
    gap: 12px;
    align-items: stretch;
  }
  
  .batch-actions {
    justify-content: space-around;
  }
  
  .premium-btn {
    flex: 1;
    min-width: 0;
  }
  
  .stats-panel {
    flex-direction: column;
    gap: 12px;
  }
  
  .stat-card {
    justify-content: center;
  }
}

/* 对话框样式保持不变 - 这些是页面特定的 */
.modern-dialog {
  z-index: var(--z-modal) !important;
  isolation: isolate;
}

.modern-dialog :deep(.el-dialog) {
  border-radius: var(--radius-2xl);
  box-shadow: var(--shadow-2xl);
  margin-top: 5vh !important;
  margin-bottom: 5vh !important;
  max-height: 90vh;
  overflow: hidden;
  z-index: var(--z-modal) !important;
}

.dialog-content {
  padding: var(--spacing-2xl);
  background: var(--color-gray-50);
  min-height: 500px;
}

.form-section {
  margin-bottom: var(--spacing-lg);
  background: var(--color-white);
  border-radius: var(--radius-xl);
  border: 1px solid var(--color-gray-200);
  box-shadow: var(--shadow-card);
  transition: var(--transition-normal);
  overflow: hidden;
  position: relative;
  z-index: 1;
}

.form-section:hover {
  box-shadow: var(--shadow-lg);
  border-color: rgba(102, 126, 234, 0.2);
  transform: translateY(-2px);
}

.form-section:last-child {
  margin-bottom: 0;
}

.section-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-base);
  font-weight: var(--font-semibold);
  color: var(--color-white);
  margin: 0;
  padding: var(--spacing-lg) var(--spacing-2xl);
  background: var(--gradient-primary);
  border-bottom: none;
  position: relative;
}

.section-title .el-icon {
  color: var(--color-white);
  font-size: var(--text-lg);
}

.section-title::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 1px;
  background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%);
}

.section-content {
  background: var(--color-white);
  padding: var(--spacing-2xl);
  border-radius: 0;
}

.dialog-content .form-row {
  display: flex;
  gap: var(--spacing-xl);
  margin-bottom: var(--spacing-lg);
  align-items: flex-start;
}

.dialog-content .form-row:last-child {
  margin-bottom: 0;
}

.form-col {
  flex: 1;
  min-width: 0;
}

/* 表单项样式精细调整 */
:deep(.el-form-item) {
  margin-bottom: var(--spacing-lg);
}

:deep(.el-form-item:last-child) {
  margin-bottom: 0;
}

:deep(.el-form-item__label) {
  font-weight: var(--font-medium);
  color: var(--color-gray-700);
  font-size: var(--text-sm);
  padding-bottom: var(--spacing-sm);
  line-height: var(--line-height-normal);
  margin-bottom: var(--spacing-sm);
  min-height: 20px;
  display: flex;
  align-items: center;
}

/* 修复form-row内表单项对齐问题 */
:deep(.form-row .el-form-item) {
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  margin-bottom: 0;
}

:deep(.form-row .el-form-item__content) {
  flex: 1;
  display: flex;
  align-items: flex-end;
}

:deep(.form-row .el-form-item__label) {
  margin-bottom: var(--spacing-sm);
  flex-shrink: 0;
}

/* Progress Steps */
.progress-steps {
  display: flex;
  justify-content: center;
  margin-bottom: var(--spacing-2xl);
  background: var(--color-white);
  padding: var(--spacing-xl);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-sm);
}

.step-item {
  display: flex;
  align-items: center;
  font-size: var(--text-sm);
  color: var(--color-gray-500);
  transition: var(--transition-normal);
}

.step-item:not(:last-child)::after {
  content: '';
  width: 40px;
  height: 2px;
  background: var(--color-gray-200);
  margin: 0 var(--spacing-lg);
  transition: var(--transition-normal);
}

.step-item.completed {
  color: var(--color-success);
}

.step-item.completed::after {
  background: var(--color-success);
}

.step-item.active {
  color: var(--color-primary);
  font-weight: var(--font-semibold);
}

.step-number {
  width: 24px;
  height: 24px;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--text-xs);
  font-weight: var(--font-semibold);
  margin-right: var(--spacing-sm);
  transition: var(--transition-normal);
}

.step-item.completed .step-number {
  background: var(--color-success);
  color: var(--color-white);
}

.step-item.active .step-number {
  background: var(--color-primary);
  color: var(--color-white);
}

/* 选项编辑器样式 */
.option-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  margin-bottom: var(--spacing-md);
  padding: var(--spacing-md);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
}

.option-item:hover {
  background: var(--color-gray-100);
}

.option-prefix {
  width: 32px;
  height: 32px;
  background: var(--gradient-primary);
  color: var(--color-white);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
  flex-shrink: 0;
}

.option-input {
  flex: 1;
}

.option-actions {
  display: flex;
  gap: var(--spacing-sm);
}

/* 答案选择区域 */
.answer-selection {
  background: var(--color-white);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  padding: var(--spacing-lg);
  margin-top: var(--spacing-lg);
}

.answer-options {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-md);
  margin-top: var(--spacing-md);
}

.answer-option {
  padding: var(--spacing-sm) var(--spacing-lg);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  font-weight: var(--font-medium);
}

.answer-option:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

.answer-option.selected {
  border-color: var(--color-success);
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
  color: var(--color-success);
}

/* Smart suggestions */
.smart-suggestion {
  margin: var(--spacing-lg) 0;
  padding: var(--spacing-md) var(--spacing-lg);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--color-primary);
  background: var(--color-primary-50);
}

.suggestion-toggle {
  display: flex;
  align-items: center;
  gap: var(--spacing-sm);
  margin-top: var(--spacing-lg);
  padding: var(--spacing-md);
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-lg);
  cursor: pointer;
  transition: var(--transition-normal);
  background: var(--color-white);
}

.suggestion-toggle:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

/* 预览对话框样式 */
.preview-content {
  padding: var(--spacing-2xl);
  background: var(--color-white);
  max-height: 70vh;
  overflow-y: auto;
}

.preview-header {
  text-align: center;
  margin-bottom: var(--spacing-2xl);
  padding-bottom: var(--spacing-xl);
  border-bottom: 2px solid var(--color-gray-100);
}

.preview-title {
  font-size: var(--text-2xl);
  font-weight: var(--font-bold);
  color: var(--color-gray-800);
  margin-bottom: var(--spacing-md);
}

.preview-meta {
  display: flex;
  justify-content: center;
  gap: var(--spacing-lg);
  flex-wrap: wrap;
}

.meta-item {
  background: var(--color-gray-100);
  padding: var(--spacing-sm) var(--spacing-lg);
  border-radius: var(--radius-2xl);
  font-size: var(--text-sm);
  color: var(--color-gray-600);
}

.preview-section {
  margin-bottom: var(--spacing-2xl);
}

.section-header {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-lg);
}

.question-content {
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-700);
  padding: var(--spacing-lg);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  border-left: 4px solid var(--color-primary);
}

.options-display {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-md);
}

.option-display {
  display: flex;
  align-items: center;
  gap: var(--spacing-lg);
  padding: var(--spacing-lg);
  background: var(--color-white);
  border: 2px solid var(--color-gray-200);
  border-radius: var(--radius-lg);
  transition: var(--transition-normal);
}

.option-display:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.option-display.correct-option {
  border-color: var(--color-success);
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%);
}

.option-label {
  width: 32px;
  height: 32px;
  border-radius: var(--radius-full);
  background: var(--color-gray-200);
  color: var(--color-gray-600);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: var(--font-semibold);
  font-size: var(--text-sm);
}

.correct-option .option-label {
  background: var(--gradient-success);
  color: var(--color-white);
}

.option-text {
  flex: 1;
  font-size: var(--text-sm);
  color: var(--color-gray-700);
}

.option-status {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.answer-display {
  padding: var(--spacing-lg);
  background: var(--color-gray-50);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-gray-200);
}

.answer-content {
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-700);
}

.explanation-section {
  background: var(--color-gray-50);
  padding: var(--spacing-xl);
  border-radius: var(--radius-lg);
  border: 2px solid var(--color-gray-200);
}

.explanation-title {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  font-size: var(--text-lg);
  font-weight: var(--font-semibold);
  color: var(--color-gray-700);
  margin-bottom: var(--spacing-lg);
}

.explanation-content {
  font-size: var(--text-base);
  line-height: var(--line-height-relaxed);
  color: var(--color-gray-700);
}

/* 导入对话框 */
.import-dialog {
  z-index: var(--z-modal);
}

.import-content {
  padding: var(--spacing-xl);
}

.import-tips {
  margin-bottom: var(--spacing-xl);
}

.upload-area {
  border: 2px dashed var(--color-gray-300);
  border-radius: var(--radius-lg);
  padding: var(--spacing-4xl);
  text-align: center;
  cursor: pointer;
  transition: var(--transition-normal);
}

.upload-area:hover {
  border-color: var(--color-primary);
  background: var(--color-primary-50);
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--spacing-md);
}

.upload-text {
  font-size: var(--text-lg);
  font-weight: var(--font-medium);
  color: var(--color-gray-700);
}

.upload-hint {
  font-size: var(--text-sm);
  color: var(--color-gray-500);
}

.dialog-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--spacing-lg) var(--spacing-2xl);
  border-top: 1px solid var(--color-gray-200);
}

.template-btn {
  background: var(--color-white);
  border: 1px solid var(--color-gray-300);
  color: var(--color-gray-600);
}

.template-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

/* 响应式设计 */
@media (max-width: 768px) {
  .dialog-content .form-row {
    flex-direction: column;
    gap: var(--spacing-lg);
  }
  
  .preview-meta {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .option-display {
    flex-direction: column;
    text-align: center;
    gap: var(--spacing-md);
  }
  
  .progress-steps {
    flex-direction: column;
    gap: var(--spacing-md);
  }
  
  .step-item:not(:last-child)::after {
    display: none;
  }
}

/* 搜索字段垂直居中样式 - 强制覆盖 */
.search-field {
  display: flex !important;
  flex-direction: column !important;
  justify-content: center !important;
  align-items: stretch !important;
  height: 68px !important;
  min-height: 68px !important;
  max-height: 68px !important;
  padding: 8px 0 !important;
  box-sizing: border-box !important;
}

.search-field label {
  font-size: 14px !important;
  font-weight: 500 !important;
  color: #6b7280 !important;
  line-height: 1.2 !important;
  margin: 0 0 6px 0 !important;
  padding: 0 !important;
  display: block !important;
  width: 100% !important;
  text-align: left !important;
  flex-shrink: 0 !important;
}

.search-field .el-input,
.search-field .el-select {
  height: 40px !important;
  width: 100% !important;
  flex: 1 !important;
  min-height: 40px !important;
}

.search-field .el-input__wrapper,
.search-field .el-select__wrapper {
  height: 40px !important;
  display: flex !important;
  align-items: center !important;
}

/* 🎯 专业管理系统表格设计 - 平衡美观与效率 */
:deep(.modern-table .el-table__header) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.03) 0%, rgba(118, 75, 162, 0.03) 100%) !important;
  backdrop-filter: blur(10px) !important;
  border-bottom: 2px solid rgba(102, 126, 234, 0.08) !important;
}

:deep(.modern-table .el-table__header th) {
  background: transparent !important;
  border: none !important;
  padding: 16px 12px !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  color: #374151 !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.08) !important;
  white-space: nowrap !important;
}

:deep(.modern-table .el-table__row) {
  transition: all 0.2s ease !important;
  background: rgba(255, 255, 255, 0.8) !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.05) !important;
}

:deep(.modern-table .el-table__row:hover) {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.04) 0%, rgba(118, 75, 162, 0.04) 100%) !important;
  transform: translateX(2px) !important;
  box-shadow: 
    4px 0 12px rgba(102, 126, 234, 0.08),
    0 2px 8px rgba(0, 0, 0, 0.04) !important;
  z-index: 1 !important;
  position: relative !important;
}

:deep(.modern-table .el-table__row:nth-child(even)) {
  background: rgba(248, 250, 252, 0.6) !important;
}

:deep(.modern-table .el-table__row:nth-child(odd)) {
  background: rgba(255, 255, 255, 0.8) !important;
}

:deep(.modern-table .el-table__row td) {
  border: none !important;
  padding: 14px 12px !important;
  border-bottom: 1px solid rgba(102, 126, 234, 0.05) !important;
  vertical-align: middle !important;
}

/* 🎨 优化的标签和按钮设计 */
:deep(.modern-table .el-tag) {
  border-radius: 6px !important;
  font-weight: 500 !important;
  font-size: 12px !important;
  padding: 4px 8px !important;
  border: none !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

:deep(.modern-table .el-switch) {
  transform: scale(0.9) !important;
}

:deep(.modern-table .el-button) {
  border-radius: 6px !important;
  font-size: 12px !important;
  padding: 6px 8px !important;
  margin: 0 2px !important;
  transition: all 0.2s ease !important;
  min-width: 32px !important;
  height: 28px !important;
}

:deep(.modern-table .el-button:hover) {
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.12) !important;
}

/* 📊 标题列优化 - 保持信息密度 */
.title-content {
  display: flex;
  flex-direction: column;
  gap: 2px;
  min-height: 40px;
  justify-content: center;
}

.title-text {
  font-weight: 600;
  color: #1f2937;
  line-height: 1.3;
  font-size: 14px;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  max-height: 36px;
}

.title-meta {
  font-size: 11px;
  color: #6b7280;
  font-weight: 400;
  margin-top: 2px;
}

.score-text {
  font-weight: 600;
  color: #059669;
  font-size: 13px;
}

/* 🎮 紧凑的操作按钮设计 */
.action-buttons {
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;
}

.action-buttons .el-button {
  border-radius: 6px !important;
  transition: all 0.2s ease !important;
  font-size: 11px !important;
  padding: 5px 6px !important;
  min-width: 28px !important;
  height: 26px !important;
}

.action-buttons .el-button .el-icon {
  font-size: 14px !important;
}

.action-buttons .el-button:hover {
  transform: translateY(-1px) scale(1.05) !important;
}

/* 🔄 批量操作优化 */
.bulk-actions {
  background: rgba(102, 126, 234, 0.03);
  border-radius: 12px;
  padding: 8px 16px;
  backdrop-filter: blur(10px);
}

.bulk-btn {
  font-size: 13px !important;
  padding: 6px 12px !important;
  border-radius: 8px !important;
}

/* 🎯 视图切换优化 */
.view-toggle {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 10px;
  padding: 2px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
}

.view-toggle .el-radio-button__inner {
  border: none !important;
  padding: 6px 16px !important;
  font-size: 12px !important;
  font-weight: 500 !important;
  border-radius: 8px !important;
  transition: all 0.2s ease !important;
}

.view-toggle .el-radio-button__original-radio:checked + .el-radio-button__inner {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  box-shadow: 0 2px 6px rgba(102, 126, 234, 0.3) !important;
}

/* 📱 移动端适配 */
@media (max-width: 768px) {
  :deep(.modern-table .el-table__row:hover) {
    transform: none !important;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.1) !important;
  }
  
  .action-buttons {
    flex-direction: column;
    gap: 2px;
  }
  
  .action-buttons .el-button {
    width: 100% !important;
    min-width: 60px !important;
  }
}

/* 🎨 现代化卡片列表设计 */
.question-cards-container {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.98) 100%);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-radius: 24px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.1),
    0 8px 16px rgba(0, 0, 0, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cards-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid rgba(102, 126, 234, 0.1);
}

.bulk-actions {
  display: flex;
  align-items: center;
  gap: 20px;
}

.select-all-checkbox {
  font-weight: 600;
  color: #4a5568;
}

.bulk-operations {
  display: flex;
  gap: 12px;
}

.bulk-btn {
  border-radius: 12px;
  font-weight: 600;
  padding: 8px 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
}

.bulk-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
}

.view-options {
  display: flex;
  align-items: center;
}

.view-toggle {
  background: rgba(255, 255, 255, 0.8);
  border-radius: 12px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

/* 🔮 卡片网格布局 */
.question-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(380px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

/* ✨ 卡片设计 */
.question-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.95) 0%, rgba(248, 250, 252, 0.9) 100%);
  backdrop-filter: blur(15px);
  border-radius: 20px;
  padding: 24px;
  border: 1px solid rgba(102, 126, 234, 0.1);
  box-shadow: 
    0 8px 24px rgba(0, 0, 0, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  position: relative;
  overflow: hidden;
}

.question-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #667eea 0%, #764ba2 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.question-card:hover::before {
  opacity: 1;
}

.question-card:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 
    0 20px 40px rgba(102, 126, 234, 0.15),
    0 8px 24px rgba(0, 0, 0, 0.1),
    inset 0 1px 0 rgba(255, 255, 255, 0.8);
  border-color: rgba(102, 126, 234, 0.3);
}

/* 🎯 卡片选择器 */
.card-selector {
  position: absolute;
  top: 16px;
  left: 16px;
  z-index: 10;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
}

/* 📋 卡片内容 */
.card-content {
  padding-top: 40px; /* 为选择器留空间 */
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
}

.question-meta {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.type-tag,
.priority-tag {
  border-radius: 8px;
  font-weight: 600;
  font-size: 12px;
  padding: 4px 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.card-status {
  display: flex;
  align-items: center;
}

.status-switch {
  transform: scale(0.9);
}

.question-title {
  font-size: 16px;
  font-weight: 700;
  color: #2d3748;
  line-height: 1.5;
  margin-bottom: 16px;
  background: linear-gradient(135deg, #2d3748 0%, #4a5568 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  min-height: 48px; /* 保持高度一致 */
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.question-details {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 12px 16px;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 12px;
  backdrop-filter: blur(10px);
}

.detail-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #6b7280;
  font-weight: 500;
}

.detail-item .el-icon {
  color: #667eea;
  font-size: 16px;
}

/* 🎮 卡片操作按钮 */
.card-actions {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  padding-top: 16px;
  border-top: 1px solid rgba(102, 126, 234, 0.1);
}

.action-btn {
  flex: 1;
  border-radius: 10px;
  font-weight: 600;
  font-size: 12px;
  padding: 8px 12px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(10px);
  min-width: 0; /* 允许按钮收缩 */
}

.action-btn .el-icon {
  margin-right: 4px;
}

.action-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

/* 📱 响应式设计 */
@media (max-width: 1200px) {
  .question-cards-grid {
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 20px;
  }
}

@media (max-width: 768px) {
  .question-cards-container {
    padding: 20px;
    border-radius: 16px;
  }
  
  .cards-header {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }
  
  .bulk-actions {
    justify-content: space-between;
  }
  
  .question-cards-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .question-card {
    padding: 20px;
  }
  
  .card-actions {
    flex-wrap: wrap;
  }
  
  .action-btn {
    min-width: calc(50% - 4px);
  }
  
  .question-card:hover {
    transform: translateY(-4px) scale(1.01);
  }
}

/* 🎨 表格视图的标题内容样式 */
.title-content {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.title-text {
  font-weight: 600;
  color: #2d3748;
  line-height: 1.4;
}

.title-meta {
  font-size: 12px;
  color: #9ca3af;
  font-weight: 400;
}

.score-text {
  font-weight: 600;
  color: #059669;
}

.action-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-buttons .el-button {
  border-radius: 8px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.action-buttons .el-button:hover {
  transform: translateY(-1px);
}

/* 🎯 表格开关样式 */
:deep(.data-table-container .modern-table .el-switch) {
  transform: scale(0.9) !important;
}

/* 🎮 操作按钮组悬停效果 - 最高优先级 */
:deep(.action-buttons-group) {
  display: flex !important;
  gap: 6px !important;
  justify-content: center !important;
  align-items: center !important;
  flex-wrap: nowrap !important;
  width: 100% !important;
}

:deep(.action-buttons-group .action-button) {
  border-radius: 6px !important;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
  font-size: 11px !important;
  font-weight: 500 !important;
  padding: 4px 8px !important;
  height: 28px !important;
  min-width: 52px !important;
  flex-shrink: 0 !important;
  border-width: 1px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
  white-space: nowrap !important;
}

:deep(.action-buttons-group .action-button .el-icon) {
  font-size: 12px !important;
  margin-right: 2px !important;
}

:deep(.action-buttons-group .action-button:hover) {
  transform: translateY(-1px) !important;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15) !important;
  border-width: 1px !important;
}

/* 🎨 现代精致按钮设计 - 统一灰色系 + 功能色点缀 */

/* 预览按钮 - 中性灰 */
:deep(.action-buttons-group .el-button--primary.action-button) {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #475569 !important;
  font-weight: 500 !important;
}

:deep(.action-buttons-group .el-button--primary.action-button:hover) {
  background-color: #64748b !important;
  border-color: #64748b !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(100, 116, 139, 0.1) !important;
}

/* 编辑按钮 - 中性灰 */
:deep(.action-buttons-group .el-button--warning.action-button) {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #475569 !important;
  font-weight: 500 !important;
}

:deep(.action-buttons-group .el-button--warning.action-button:hover) {
  background-color: #64748b !important;
  border-color: #64748b !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(100, 116, 139, 0.1) !important;
}

/* 复制按钮 - 中性灰 */
:deep(.action-buttons-group .el-button--success.action-button) {
  background-color: #f8fafc !important;
  border: 1px solid #e2e8f0 !important;
  color: #475569 !important;
  font-weight: 500 !important;
}

:deep(.action-buttons-group .el-button--success.action-button:hover) {
  background-color: #64748b !important;
  border-color: #64748b !important;
  color: white !important;
  box-shadow: 0 2px 4px rgba(100, 116, 139, 0.1) !important;
}

/* 删除按钮 - 唯一功能色 */


/* 🍎 Apple风格高级设计系统 - 精致奢华默认状态 */

/* 🔍 预览按钮 - 蓝宝石质感 */
:deep(.action-buttons-group .el-button--primary.action-button) {
  background: linear-gradient(135deg, #EBF4FF 0%, #DBEAFE 50%, #BFDBFE 100%) !important;
  border: 1.5px solid #007AFF !important;
  color: #1D4ED8 !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  letter-spacing: -0.02em !important;
  text-shadow: 0 1px 2px rgba(0, 122, 255, 0.1) !important;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
  box-shadow: 0 2px 8px rgba(0, 122, 255, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
  border-radius: 6px !important;
}

:deep(.action-buttons-group .el-button--primary.action-button:hover) {
  background: linear-gradient(135deg, #007AFF 0%, #0056CC 100%) !important;
  border-color: #0056CC !important;
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
  box-shadow: 0 6px 20px rgba(0, 122, 255, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px) scale(1.02) !important;
}

/* ✏️ 编辑按钮 - 琥珀质感 */
:deep(.action-buttons-group .el-button--warning.action-button) {
  background: linear-gradient(135deg, #FEF3C7 0%, #FDE68A 50%, #F59E0B 100%) !important;
  border: 1.5px solid #FF9500 !important;
  color: #92400E !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  letter-spacing: -0.02em !important;
  text-shadow: 0 1px 2px rgba(255, 149, 0, 0.1) !important;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
  box-shadow: 0 2px 8px rgba(255, 149, 0, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
  border-radius: 6px !important;
}

:deep(.action-buttons-group .el-button--warning.action-button:hover) {
  background: linear-gradient(135deg, #FF9500 0%, #E6820A 100%) !important;
  border-color: #E6820A !important;
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
  box-shadow: 0 6px 20px rgba(255, 149, 0, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px) scale(1.02) !important;
}

/* 📋 复制按钮 - 翡翠质感 */
:deep(.action-buttons-group .el-button--success.action-button) {
  background: linear-gradient(135deg, #ECFDF5 0%, #D1FAE5 50%, #A7F3D0 100%) !important;
  border: 1.5px solid #34C759 !important;
  color: #047857 !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  letter-spacing: -0.02em !important;
  text-shadow: 0 1px 2px rgba(52, 199, 89, 0.1) !important;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
  box-shadow: 0 2px 8px rgba(52, 199, 89, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
  border-radius: 6px !important;
}

:deep(.action-buttons-group .el-button--success.action-button:hover) {
  background: linear-gradient(135deg, #34C759 0%, #28A745 100%) !important;
  border-color: #28A745 !important;
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
  box-shadow: 0 6px 20px rgba(52, 199, 89, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px) scale(1.02) !important;
}

/* 🗑️ 删除按钮 - 磨砂质感 */
:deep(.action-buttons-group .el-button--danger.action-button) {
  background: linear-gradient(135deg, #F9FAFB 0%, #F3F4F6 50%, #E5E7EB 100%) !important;
  border: 1.5px solid #8E8E93 !important;
  color: #4B5563 !important;
  font-weight: 600 !important;
  font-size: 13px !important;
  letter-spacing: -0.02em !important;
  text-shadow: 0 1px 2px rgba(142, 142, 147, 0.1) !important;
  transition: all 0.25s cubic-bezier(0.25, 0.46, 0.45, 0.94) !important;
  box-shadow: 0 2px 8px rgba(142, 142, 147, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.7) !important;
  border-radius: 6px !important;
}

:deep(.action-buttons-group .el-button--danger.action-button:hover) {
  background: linear-gradient(135deg, #8E8E93 0%, #636366 100%) !important;
  border-color: #636366 !important;
  color: #ffffff !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3) !important;
  box-shadow: 0 6px 20px rgba(142, 142, 147, 0.35), inset 0 1px 0 rgba(255, 255, 255, 0.2) !important;
  transform: translateY(-2px) scale(1.02) !important;
}

/* 🔧 编辑对话框样式修复 - 彻底清理重写 */

/* 基础对话框样式重置 */
.modern-dialog :deep(.el-dialog) {
  border-radius: 16px !important;
  overflow: hidden !important;
}

.dialog-content {
  padding: 24px !important;
  background: #f8fafc !important;
}

/* form-section 统一样式 */
.dialog-content .form-section {
  background: white !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  margin-bottom: 20px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  overflow: hidden !important;
}

.dialog-content .form-section:last-child {
  margin-bottom: 0 !important;
}

/* section标题样式 */
.dialog-content .section-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  padding: 16px 24px !important;
  margin: 0 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
}

/* section内容区域 */
.dialog-content .section-content {
  padding: 24px !important;
  background: white !important;
}

/* form-row 表单行样式 - 重点修复 */
.dialog-content .form-row {
  display: flex !important;
  gap: 20px !important;
  align-items: flex-end !important;
  margin-bottom: 16px !important;
}

.dialog-content .form-row:last-child {
  margin-bottom: 0 !important;
}

.dialog-content .form-col {
  flex: 1 !important;
  min-width: 0 !important;
}

/* 表单项标签底部对齐 */
.dialog-content .form-row :deep(.el-form-item) {
  margin-bottom: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-end !important;
}

.dialog-content .form-row :deep(.el-form-item__label) {
  margin-bottom: 8px !important;
  line-height: 1.4 !important;
  color: #374151 !important;
  font-size: 13px !important;
  font-weight: 500 !important;
}

.dialog-content .form-row :deep(.el-form-item__content) {
  flex: 1 !important;
}

/* 统一输入框高度 */
.dialog-content .form-row :deep(.el-input),
.dialog-content .form-row :deep(.el-select) {
  width: 100% !important;
}

.dialog-content .form-row :deep(.el-input__wrapper),
.dialog-content .form-row :deep(.el-select__wrapper) {
  height: 40px !important;
}

/* 数字输入框特殊处理 */
.dialog-content .form-row :deep(.el-input-number) {
  width: 100% !important;
}

.dialog-content .form-row :deep(.el-input-number .el-input__wrapper) {
  height: 40px !important;
}

/* 🎯 终极修复方案 - 使用最强选择器权重强制覆盖所有冲突 */

/* 使用[data-v-xxx]特殊权重来强制覆盖所有CSS冲突 */
.modern-dialog[class] .dialog-content[class] .form-row[class] {
  display: flex !important;
  gap: 20px !important;
  align-items: flex-end !important;
  margin-bottom: 16px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.modern-dialog[class] .dialog-content[class] .form-row[class]:last-child {
  margin-bottom: 0 !important;
}

.modern-dialog[class] .dialog-content[class] .form-col[class] {
  flex: 1 !important;
  min-width: 0 !important;
}

/* 使用深度选择器强制覆盖Element Plus的内置样式 */
.modern-dialog[class] .dialog-content[class] .form-row[class] >>> .el-form-item,
.modern-dialog[class] .dialog-content[class] .form-row[class] :deep(.el-form-item) {
  margin-bottom: 0 !important;
  display: flex !important;
  flex-direction: column !important;
  justify-content: flex-end !important;
  width: 100% !important;
}

.modern-dialog[class] .dialog-content[class] .form-row[class] >>> .el-form-item__label,
.modern-dialog[class] .dialog-content[class] .form-row[class] :deep(.el-form-item__label) {
  margin-bottom: 8px !important;
  line-height: 1.4 !important;
  color: #374151 !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  height: auto !important;
  padding: 0 !important;
  width: 100% !important;
  text-align: left !important;
}

.modern-dialog[class] .dialog-content[class] .form-row[class] >>> .el-form-item__content,
.modern-dialog[class] .dialog-content[class] .form-row[class] :deep(.el-form-item__content) {
  flex: 1 !important;
  margin: 0 !important;
  width: 100% !important;
}

/* 输入框样式强制覆盖 */
.modern-dialog[class] .dialog-content[class] .form-row[class] >>> .el-input__wrapper,
.modern-dialog[class] .dialog-content[class] .form-row[class] >>> .el-select__wrapper,
.modern-dialog[class] .dialog-content[class] .form-row[class] >>> .el-input-number .el-input__wrapper,
.modern-dialog[class] .dialog-content[class] .form-row[class] :deep(.el-input__wrapper),
.modern-dialog[class] .dialog-content[class] .form-row[class] :deep(.el-select__wrapper),
.modern-dialog[class] .dialog-content[class] .form-row[class] :deep(.el-input-number .el-input__wrapper) {
  height: 40px !important;
  min-height: 40px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* section边框对齐强制覆盖 */
.modern-dialog[class] .dialog-content[class] .form-section[class] {
  background: white !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  margin: 0 0 20px 0 !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  overflow: hidden !important;
  position: static !important;
  transform: none !important;
  transition: none !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

.modern-dialog[class] .dialog-content[class] .form-section[class]:last-child {
  margin-bottom: 0 !important;
}

.modern-dialog[class] .dialog-content[class] .form-section[class]:hover {
  transform: none !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  border-color: #e2e8f0 !important;
}

/* 🎯 编辑对话框对齐问题修复 */

/* 修复题目标题标签与输入框垂直对齐问题 */
.modern-dialog[class] .dialog-content[class] .section-content[class] > .el-form-item:not(.form-row .el-form-item) {
  display: flex !important;
  flex-direction: column !important;
  margin-bottom: 16px !important;
}

.modern-dialog[class] .dialog-content[class] .section-content[class] > .el-form-item:not(.form-row .el-form-item) .el-form-item__label {
  margin-bottom: 8px !important;
  line-height: 1.4 !important;
  color: #374151 !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  height: auto !important;
  padding: 0 !important;
  width: 100% !important;
  text-align: left !important;
}

.modern-dialog[class] .dialog-content[class] .section-content[class] > .el-form-item:not(.form-row .el-form-item) .el-form-item__content {
  flex: 1 !important;
  margin: 0 !important;
  width: 100% !important;
}

/* 修复form-section垂直左对齐问题 */
.modern-dialog[class] .dialog-content[class] {
  padding: 24px !important;
  background: #f8fafc !important;
}

.modern-dialog[class] .dialog-content[class] .form-section[class] {
  background: white !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  margin: 0 0 20px 0 !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  overflow: hidden !important;
  position: static !important;
  transform: none !important;
  transition: none !important;
  width: 100% !important;
  box-sizing: border-box !important;
  /* 确保完美的左对齐 */
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding: 0 !important;
}

.modern-dialog[class] .dialog-content[class] .section-title[class] {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  padding: 16px 24px !important;
  margin: 0 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  /* 确保标题左对齐 */
  padding-left: 24px !important;
  padding-right: 24px !important;
}

.modern-dialog[class] .dialog-content[class] .section-content[class] {
  padding: 24px !important;
  background: white !important;
  margin: 0 !important;
  /* 确保内容区域左对齐 */
  padding-left: 24px !important;
  padding-right: 24px !important;
}

/* 确保所有输入框高度一致 */
.modern-dialog[class] .dialog-content[class] .el-input .el-input__wrapper,
.modern-dialog[class] .dialog-content[class] .el-select .el-select__wrapper,
.modern-dialog[class] .dialog-content[class] .el-input-number .el-input__wrapper {
  height: 40px !important;
  min-height: 40px !important;
  box-sizing: border-box !important;
}

/* 🎯 预览对话框美化样式修复 */

/* 修复题目标题文字挤压问题 */
.preview-dialog .preview-header .question-title {
  font-size: 20px !important;
  font-weight: 600 !important;
  color: #1f2937 !important;
  line-height: 1.6 !important;
  margin: 0 0 16px 0 !important;
  padding: 0 8px !important;
  letter-spacing: 0.5px !important;
  word-spacing: 2px !important;
  background: none !important;
  -webkit-background-clip: unset !important;
  -webkit-text-fill-color: unset !important;
  background-clip: unset !important;
  text-align: center !important;
}

/* 美化题目描述框 */
.preview-dialog .question-content {
  font-size: 16px !important;
  line-height: 1.8 !important;
  color: #374151 !important;
  padding: 20px 24px !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border: 2px solid #6366f1 !important;
  border-radius: 16px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  margin: 16px 0 !important;
}

/* 已移除题目描述框上方的装饰线 */

/* 美化答案解析框 */
.preview-dialog .content-section {
  margin-bottom: 24px !important;
}

.preview-dialog .content-section:last-child {
  margin-bottom: 0 !important;
}

/* 美化section标题 */
.preview-dialog .section-header {
  display: flex !important;
  align-items: center !important;
  gap: 12px !important;
  font-size: 16px !important;
  font-weight: 600 !important;
  color: #1f2937 !important;
  margin-bottom: 16px !important;
  padding: 12px 16px !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

.preview-dialog .section-header .el-icon {
  font-size: 18px !important;
  color: #6366f1 !important;
}

/* 美化选项显示 */
.preview-dialog .option-display {
  display: flex !important;
  align-items: center !important;
  gap: 16px !important;
  padding: 16px 20px !important;
  background: white !important;
  border: 2px solid #e5e7eb !important;
  border-radius: 12px !important;
  transition: all 0.2s ease !important;
  margin-bottom: 12px !important;
}

.preview-dialog .option-display:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
  transform: translateY(-1px) !important;
  border-color: #d1d5db !important;
}

.preview-dialog .option-display.correct-option {
  border-color: #10b981 !important;
  background: linear-gradient(135deg, #ecfdf5 0%, #f0fdf4 100%) !important;
  box-shadow: 0 2px 8px rgba(16, 185, 129, 0.15) !important;
}

.preview-dialog .option-prefix {
  width: 36px !important;
  height: 36px !important;
  border-radius: 50% !important;
  background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%) !important;
  color: #6b7280 !important;
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  font-weight: 600 !important;
  font-size: 14px !important;
  flex-shrink: 0 !important;
}

.preview-dialog .correct-option .option-prefix {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%) !important;
  color: white !important;
  box-shadow: 0 2px 6px rgba(16, 185, 129, 0.3) !important;
}

.preview-dialog .option-text {
  flex: 1 !important;
  font-size: 15px !important;
  color: #374151 !important;
  line-height: 1.5 !important;
}

/* 美化答案显示框 */
.preview-dialog .answer-display {
  padding: 20px 24px !important;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%) !important;
  border: 2px solid #8b5cf6 !important;
  border-radius: 16px !important;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05) !important;
  margin: 16px 0 !important;
}

.preview-dialog .answer-content {
  font-size: 16px !important;
  line-height: 1.7 !important;
  color: #374151 !important;
  margin: 0 !important;
}

/* 美化预览头部 */
.preview-dialog .preview-header {
  text-align: center !important;
  margin-bottom: 32px !important;
  padding-bottom: 24px !important;
  border-bottom: 2px solid #f1f5f9 !important;
}

/* 已移除多余的装饰线条 */

.preview-dialog .question-meta {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 16px !important;
  margin-top: 16px !important;
  flex-wrap: wrap !important;
}

.preview-dialog .meta-item {
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  padding: 6px 12px !important;
  background: white !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 20px !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05) !important;
}

.preview-dialog .meta-item .el-icon {
  font-size: 14px !important;
  color: #6b7280 !important;
}

/* 美化对话框内容区域 */
.preview-dialog .preview-content {
  padding: 32px !important;
  background: white !important;
  max-height: 75vh !important;
  overflow-y: auto !important;
}

/* 美化滚动条 */
.preview-dialog .preview-content::-webkit-scrollbar {
  width: 6px !important;
}

.preview-dialog .preview-content::-webkit-scrollbar-track {
  background: #f1f5f9 !important;
  border-radius: 3px !important;
}

.preview-dialog .preview-content::-webkit-scrollbar-thumb {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
  border-radius: 3px !important;
}

.preview-dialog .preview-content::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%) !important;
}

/* 美化对话框本身 */
.preview-dialog :deep(.el-dialog) {
  border-radius: 20px !important;
  overflow: hidden !important;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.15) !important;
}

.preview-dialog :deep(.el-dialog__header) {
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
  color: white !important;
  padding: 20px 32px !important;
  border-bottom: none !important;
}

.preview-dialog :deep(.el-dialog__title) {
  font-size: 18px !important;
  font-weight: 600 !important;
  color: white !important;
}

.preview-dialog :deep(.el-dialog__close) {
  color: white !important;
  font-size: 20px !important;
}

.preview-dialog :deep(.el-dialog__close):hover {
  color: #f3f4f6 !important;
}

.preview-dialog :deep(.el-dialog__body) {
  padding: 0 !important;
}

/* 🎯 编辑对话框对齐问题精准修复 */

/* 修复题目标题标签与输入框垂直对齐问题 - 针对独立的form-item */
.modern-dialog .dialog-content .section-content > .el-form-item:not(.form-row .el-form-item) {
  display: flex !important;
  flex-direction: column !important;
  margin-bottom: 16px !important;
}

.modern-dialog .dialog-content .section-content > .el-form-item:not(.form-row .el-form-item) :deep(.el-form-item__label) {
  margin-bottom: 8px !important;
  line-height: 1.4 !important;
  color: #374151 !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  height: auto !important;
  padding: 0 !important;
  width: 100% !important;
  text-align: left !important;
  display: block !important;
}

.modern-dialog .dialog-content .section-content > .el-form-item:not(.form-row .el-form-item) :deep(.el-form-item__content) {
  flex: 1 !important;
  margin: 0 !important;
  width: 100% !important;
  display: block !important;
}

/* 修复form-section垂直左对齐问题 - 统一左边距 */
.modern-dialog .dialog-content {
  padding: 24px !important;
  background: #f8fafc !important;
}

.modern-dialog .dialog-content .form-section,
.modern-dialog .dialog-content .form-section.section-basic,
.modern-dialog .dialog-content .form-section.section-content {
  background: white !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  margin: 0 0 20px 0 !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  overflow: hidden !important;
  position: static !important;
  transform: none !important;
  transition: none !important;
  width: 100% !important;
  box-sizing: border-box !important;
  /* 强制左对齐 - 移除任何可能的偏移 */
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: auto !important;
  /* 确保完全重置所有可能的定位属性 */
  top: auto !important;
  bottom: auto !important;
  float: none !important;
  clear: none !important;
}

.modern-dialog .dialog-content .form-section:last-child {
  margin-bottom: 0 !important;
}

.modern-dialog .dialog-content .form-section:hover {
  transform: none !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  border-color: #e2e8f0 !important;
}

/* 确保section标题完全左对齐 */
.modern-dialog .dialog-content .section-title {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
  color: white !important;
  padding: 16px 24px !important;
  margin: 0 !important;
  font-size: 14px !important;
  font-weight: 600 !important;
  display: flex !important;
  align-items: center !important;
  gap: 8px !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* 确保section内容完全左对齐 */
.modern-dialog .dialog-content .section-content {
  padding: 24px !important;
  background: white !important;
  margin: 0 !important;
  width: 100% !important;
  box-sizing: border-box !important;
}

/* 确保所有输入框高度一致并左对齐 */
.modern-dialog .dialog-content :deep(.el-input .el-input__wrapper),
.modern-dialog .dialog-content :deep(.el-select .el-select__wrapper),
.modern-dialog .dialog-content :deep(.el-input-number .el-input__wrapper) {
  height: 40px !important;
  min-height: 40px !important;
  box-sizing: border-box !important;
  width: 100% !important;
}

/* 🎯 终极修复方案 - 使用最强选择器权重强制覆盖所有冲突 */

/* 🎯 ULTIMATE解决方案 - 强制section完美左对齐 */

/* 使用最高优先级选择器完全重写form-section样式 */
.modern-dialog[class] .dialog-content[class] .form-section[class],
.modern-dialog[class] .dialog-content[class] .form-section.section-basic[class],
.modern-dialog[class] .dialog-content[class] .form-section.section-content[class],
.modern-dialog[class] .dialog-content[class] .form-section.section-explanation[class] {
  /* 完全重置所有可能影响对齐的属性 */
  position: static !important;
  float: none !important;
  clear: none !important;
  transform: none !important;
  translate: none !important;
  top: auto !important;
  bottom: auto !important;
  left: 0 !important;
  right: 0 !important;
  z-index: auto !important;
  
  /* 强制布局属性 */
  display: block !important;
  width: 100% !important;
  max-width: 100% !important;
  min-width: 0 !important;
  box-sizing: border-box !important;
  
  /* 强制边距和内边距 */
  margin: 0 0 20px 0 !important;
  padding: 0 !important;
  
  /* 视觉样式 */
  background: white !important;
  border: 1px solid #e2e8f0 !important;
  border-radius: 12px !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  overflow: hidden !important;
  transition: none !important;
}

/* 悬停状态完全禁用transform */
.modern-dialog[class] .dialog-content[class] .form-section[class]:hover,
.modern-dialog[class] .dialog-content[class] .form-section.section-basic[class]:hover,
.modern-dialog[class] .dialog-content[class] .form-section.section-content[class]:hover {
  transform: none !important;
  translate: none !important;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
  border-color: #e2e8f0 !important;
}

/* 最后一个section的底边距 */
.modern-dialog[class] .dialog-content[class] .form-section[class]:last-child {
  margin-bottom: 0 !important;
}

/* 确保对话框容器没有意外的内边距 */
.modern-dialog[class] .dialog-content[class] {
  padding: 24px !important;
  background: #f8fafc !important;
  /* 确保容器也完全重置 */
  box-sizing: border-box !important;
  width: 100% !important;
  margin: 0 !important;
  position: relative !important;
}
</style> 