<template>
  <div class="questionnaire-list">
    <!-- 搜索和操作区域 -->
    <el-card class="search-card">
      <div class="search-header">
        <el-form ref="searchFormRef" :model="searchForm" :inline="true" class="search-form">
          <el-form-item label="问卷标题">
            <el-input
              v-model="searchForm.title"
              placeholder="请输入问卷标题"
              clearable
              style="width: 240px"
              @clear="handleReset"
            />
          </el-form-item>
          <el-form-item label="状态" v-if="showAdminActions">
            <el-select
              v-model="searchForm.status"
              placeholder="请选择状态"
              clearable
              style="width: 120px"
            >
              <el-option label="全部" :value="null" />
              <el-option label="草稿" :value="0" />
              <el-option label="已发布" :value="1" />
              <el-option label="已结束" :value="2" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="handleSearch" :icon="Search">
              搜索
            </el-button>
            <el-button @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
        
        <!-- 主要操作按钮 -->
        <div class="header-actions">
          <el-button 
            v-if="showAdminActions"
            type="primary" 
            @click="$router.push('/questionnaire/create')"
            :icon="Plus"
            size="default"
          >
            创建问卷
          </el-button>
        </div>
      </div>
    </el-card>

    <!-- 问卷列表 -->
    <el-card>
      <template #header>
        <div class="card-header">
          <span>问卷列表</span>
        </div>
      </template>

      <!-- 表格 -->
      <div class="table-container">
        <el-table 
          :data="questionnaireList" 
          v-loading="loading" 
          stripe 
          style="width: 100%"
          :scroll-x="true"
          table-layout="auto"
          border
        >
          <el-table-column prop="title" label="问卷标题" min-width="120" show-overflow-tooltip />
          <el-table-column prop="status" label="状态" width="80">
            <template #default="{ row }">
              <el-tag :type="getStatusType(row.status)" class="status-tag">
                {{ getStatusText(row.status) }}
              </el-tag>
            </template>
          </el-table-column>
          <el-table-column prop="totalCount" label="回复数" width="80">
            <template #default="{ row }">
              {{ row.totalCount || 0 }}
            </template>
          </el-table-column>
          <el-table-column label="浏览量" width="80">
            <template #default>
              -
            </template>
          </el-table-column>
          
                    <!-- 活动时间显示 -->
          <el-table-column label="活动时间" width="180" align="left">
            <template #default="{ row }">
              <div class="time-column-container">
                <!-- 草稿状态不显示状态标签，只显示时间 -->
                <template v-if="row.status === 0">
                  <div class="time-content">
                    <div v-if="row.startTime" class="time-item">
                      <span class="time-label">开始时间：</span>
                      <span class="time-value">{{ formatTime(row.startTime) }}</span>
                    </div>
                    <div v-if="row.endTime" class="time-item">
                      <span class="time-label">结束时间：</span>
                      <span class="time-value">{{ formatTime(row.endTime) }}</span>
                    </div>
                    <div v-if="!row.startTime && !row.endTime" class="time-item">
                      <span class="no-time-text">未设置时间</span>
                    </div>
                  </div>
                </template>
                
                <!-- 非草稿状态显示状态标签和相关时间 -->
                <template v-else>
                  <div class="time-content">
                    <el-tag 
                      :type="getSmartTimeDisplay(row).type" 
                      size="small"
                      class="status-tag-aligned"
                    >
                      {{ getSmartTimeDisplay(row).label }}
                    </el-tag>
                    
                    <div v-if="getSmartTimeDisplay(row).time" class="time-item">
                      <span class="time-label">{{ getSmartTimeDisplay(row).timeLabel }}：</span>
                      <span class="time-value">{{ formatTime(getSmartTimeDisplay(row).time) }}</span>
                    </div>
                  </div>
                </template>
              </div>
            </template>
          </el-table-column>
          
          <el-table-column label="操作" width="300" fixed="right">
            <template #default="{ row }">
              <div class="action-buttons-container">
                <!-- 管理员按钮 -->
                <template v-if="showAdminActions">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="previewQuestionnaire(row.id)"
                  >
                    预览
                  </el-button>
                  
                  <el-button 
                    type="warning" 
                    size="small" 
                    @click="editQuestionnaire(row.id)"
                  >
                    编辑
                  </el-button>
                  
                  <el-popconfirm 
                    title="确定要删除这个问卷吗？" 
                    @confirm="deleteQuestionnaire(row.id)"
                  >
                    <template #reference>
                      <el-button 
                        type="danger" 
                        size="small"
                      >
                        删除
                      </el-button>
                    </template>
                  </el-popconfirm>
                  
                  <el-button 
                    v-if="canFillQuestionnaire(row)"
                    type="success" 
                    size="small" 
                    @click="fillQuestionnaire(row.id)"
                    :title="getFillButtonTooltip(row)"
                  >
                    填写
                  </el-button>
                  
                  <el-button 
                    v-if="row.status === 0" 
                    type="success" 
                    size="small" 
                    @click="publishQuestionnaire(row.id)"
                  >
                    发布
                  </el-button>
                </template>
                
                <!-- 普通用户按钮 -->
                <template v-else>
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="previewQuestionnaire(row.id)"
                  >
                    预览
                  </el-button>
                  
                  <el-button 
                    v-if="canFillQuestionnaire(row)"
                    type="success" 
                    size="small" 
                    @click="fillQuestionnaire(row.id)"
                    :title="getFillButtonTooltip(row)"
                  >
                    填写
                  </el-button>
                </template>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>

      <!-- 分页 -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="pagination.page"
          v-model:page-size="pagination.size"
          :page-sizes="[10, 20, 50, 100]"
          :total="pagination.total"
          layout="total, sizes, prev, pager, next, jumper"
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted, computed, watch, onActivated, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus } from '@element-plus/icons-vue'
import { questionnaireAPI } from '@/api'
import { useUserStore } from '@/store/user'
import { useDebounce } from '@/utils/debounce'
import { formatDateTime, getQuestionnaireTimeStatus } from '@/utils/time'

// 组件名称，用于keep-alive
defineOptions({
  name: 'QuestionnaireList'
})

const router = useRouter()
const userStore = useUserStore()
const loading = ref(false)
const questionnaireList = ref([])
const searchForm = ref({
  title: '',
  status: null
})
const pagination = ref({
  page: 1,
  size: 10,
  total: 0
})

// 记录上次数据更新时间
const lastUpdateTime = ref(Date.now())

// 标记是否有用户主动搜索操作
const hasUserSearch = ref(false)

// 是否显示管理员操作
const showAdminActions = computed(() => userStore.isAdmin)

// 防抖搜索
const debouncedSearch = useDebounce(() => {
  hasUserSearch.value = true
  pagination.value.page = 1
  loadQuestionnaireList()
}, 500)

// 监听搜索条件变化
watch(() => searchForm.value.title, () => {
  if (searchForm.value.title !== '') {
    debouncedSearch()
  } else {
    // 如果清空了标题搜索，且状态也为空，则表示用户想要重置搜索
    if (searchForm.value.status === null) {
      hasUserSearch.value = false
    }
  }
})

const getStatusType = (status) => {
  const types = { 
    0: 'info',       // 草稿 - 中性灰色
    1: 'success',    // 已发布 - 成功绿色  
    2: 'warning'     // 已结束 - 警告橙色
  }
  return types[status] || 'info'
}

const getStatusText = (status) => {
  const texts = { 
    0: '草稿', 
    1: '已发布', 
    2: '已结束' 
  }
  return texts[status] || '未知'
}

// 使用统一的时间格式化函数
const formatTime = (dateTime) => {
  return formatDateTime(dateTime, 'short')
}

// 检查问卷是否可以填写
const canFillQuestionnaire = (questionnaire) => {
  if (questionnaire.status !== 1) {
    return false // 只有已发布的问卷才能填写
  }
  
  const timeStatus = getQuestionnaireTimeStatus(questionnaire)
  return timeStatus.canFill
}

// 获取填写按钮的提示信息
const getFillButtonTooltip = (questionnaire) => {
  if (questionnaire.status !== 1) {
    return '问卷未发布，无法填写'
  }
  
  const timeStatus = getQuestionnaireTimeStatus(questionnaire)
  
  if (!timeStatus.canFill) {
    if (timeStatus.isNotStarted) {
      return `问卷将于 ${formatTime(questionnaire.startTime)} 开始接受填写`
    }
    if (timeStatus.isExpired) {
      return `问卷已于 ${formatTime(questionnaire.endTime)} 结束`
    }
  }
  
  return '点击填写问卷'
}

// 获取智能的时间显示信息
const getSmartTimeDisplay = (questionnaire) => {
  const now = new Date()
  const startTime = questionnaire.startTime ? new Date(questionnaire.startTime) : null
  const endTime = questionnaire.endTime ? new Date(questionnaire.endTime) : null
  
  // 草稿状态 - 也显示时间信息
  if (questionnaire.status === 0) {
    if (startTime && endTime) {
      return { 
        label: '草稿', 
        type: 'info', 
        time: startTime,
        timeLabel: '计划开始',
        endTime: endTime,
        endTimeLabel: '计划结束'
      }
    } else if (startTime) {
      return { 
        label: '草稿', 
        type: 'info', 
        time: startTime,
        timeLabel: '计划开始'
      }
    } else if (endTime) {
      return { 
        label: '草稿', 
        type: 'info', 
        time: endTime,
        timeLabel: '计划结束'
      }
    } else {
      return { label: '草稿', type: 'info', time: null }
    }
  }
  
  // 已结束状态
  if (questionnaire.status === 2) {
    if (endTime) {
      return { 
        label: '已结束', 
        type: 'warning', 
        time: endTime,
        timeLabel: '结束时间'
      }
    } else {
      return { label: '已结束', type: 'warning', time: null }
    }
  }
  
  // 已发布状态的时间逻辑
  if (questionnaire.status === 1) {
    // 未开始
    if (startTime && now < startTime) {
      return { 
        label: '未开始', 
        type: 'info', 
        time: startTime,
        timeLabel: '开始时间'
      }
    }
    
    // 已过期
    if (endTime && now > endTime) {
      return { 
        label: '已过期', 
        type: 'danger', 
        time: endTime,
        timeLabel: '结束时间'
      }
    }
    
    // 进行中 - 显示最相关的时间
    if (endTime) {
      const timeLeft = endTime.getTime() - now.getTime()
      const daysLeft = Math.floor(timeLeft / (24 * 60 * 60 * 1000))
      
      if (daysLeft > 7) {
        return { 
          label: '进行中', 
          type: 'success', 
          time: endTime,
          timeLabel: '结束时间'
        }
      } else if (daysLeft > 0) {
        return { 
          label: `${daysLeft}天后结束`, 
          type: 'warning', 
          time: endTime,
          timeLabel: '结束时间'
        }
      } else {
        const hoursLeft = Math.floor(timeLeft / (60 * 60 * 1000))
        if (hoursLeft > 0) {
          return { 
            label: `${hoursLeft}小时后结束`, 
            type: 'danger', 
            time: endTime,
            timeLabel: '结束时间'
          }
        } else {
          return { 
            label: '即将结束', 
            type: 'danger', 
            time: endTime,
            timeLabel: '结束时间'
          }
        }
      }
    } else {
      return { label: '长期有效', type: 'success', time: null }
    }
  }
  
  return { label: '未知状态', type: 'info', time: null }
}

const loadQuestionnaireList = async () => {
  loading.value = true
  try {
    const params = {
      page: pagination.value.page,
      size: pagination.value.size,
      title: searchForm.value.title,
      status: searchForm.value.status
    }
    
    // 如果是普通用户，只显示已发布的问卷
    if (!userStore.isAdmin) {
      params.status = 1
    }
    
    const response = await questionnaireAPI.getList(params)
    console.log('分页响应数据:', response.data)
    console.log('总记录数:', response.data.total)
    console.log('当前页记录数:', response.data.records?.length)
    questionnaireList.value = response.data.records || []
    pagination.value.total = response.data.total || 0
    
    // 更新数据刷新时间
    lastUpdateTime.value = Date.now()
  } catch (error) {
    console.error('加载问卷列表失败:', error)
  } finally {
    loading.value = false
  }
}

const handleSearch = () => {
  hasUserSearch.value = true
  pagination.value.page = 1
  loadQuestionnaireList()
}

const handleReset = () => {
  hasUserSearch.value = false
  searchForm.value.title = ''
  searchForm.value.status = null
  pagination.value.page = 1
  loadQuestionnaireList()
}

const handleSizeChange = (size) => {
  pagination.value.size = size
  loadQuestionnaireList()
}

const handleCurrentChange = (page) => {
  pagination.value.page = page
  loadQuestionnaireList()
}

const previewQuestionnaire = (id) => {
  router.push(`/questionnaire/preview/${id}`)
}

const editQuestionnaire = (id) => {
  router.push(`/questionnaire/edit/${id}`)
}

const fillQuestionnaire = (id) => {
  router.push(`/questionnaire/fill/${id}`)
}

const publishQuestionnaire = async (id) => {
  try {
    await ElMessageBox.confirm('确定要发布这个问卷吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await questionnaireAPI.publish(id)
    ElMessage.success('问卷发布成功')
    loadQuestionnaireList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('发布问卷失败:', error)
      ElMessage.error('发布问卷失败')
    }
  }
}

const endQuestionnaire = async (id) => {
  try {
    await ElMessageBox.confirm('确定要结束这个问卷吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })
    
    await questionnaireAPI.end(id)
    ElMessage.success('问卷已结束')
    loadQuestionnaireList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('结束问卷失败:', error)
      ElMessage.error('结束问卷失败')
    }
  }
}

const deleteQuestionnaire = async (id) => {
  try {
    await ElMessageBox.confirm('确定要删除这个问卷吗？删除后无法恢复！', '删除确认', {
      confirmButtonText: '确定删除',
      cancelButtonText: '取消',
      type: 'error'
    })
    
    await questionnaireAPI.delete(id)
    ElMessage.success('问卷删除成功')
    loadQuestionnaireList()
  } catch (error) {
    if (error !== 'cancel') {
      console.error('删除问卷失败:', error)
      ElMessage.error('删除问卷失败')
    }
  }
}

// 监听路由变化，当从其他页面返回时重置搜索条件并刷新列表
watch(
  () => router.currentRoute.value.path, 
  (newPath, oldPath) => {
    // 如果当前在问卷列表页面，且之前在其他页面，则重置搜索条件并刷新列表
    if (newPath === '/questionnaire') {
      if (oldPath && oldPath !== '/questionnaire') {
        console.log('从其他页面返回问卷列表, 来源页面:', oldPath)
        setTimeout(() => {
          // 总是重置搜索条件并刷新数据，确保用户看到最新的完整列表
          console.log('重置搜索条件并刷新数据')
          searchForm.value.title = ''
          searchForm.value.status = null
          pagination.value.page = 1
          hasUserSearch.value = false
          loadQuestionnaireList()
        }, 100) // 添加短暂延迟确保页面完全切换
      }
    }
  },
  { immediate: false }
)

// 添加onActivated钩子和更完善的数据刷新机制
onActivated(() => {
  // 检查是否需要刷新数据（超过30秒未刷新或从其他页面返回）
  const currentTime = Date.now()
  if (currentTime - lastUpdateTime.value > 30000) {
    console.log('数据已过期，重置搜索条件并刷新列表数据')
    // 重置搜索条件
    searchForm.value.title = ''
    searchForm.value.status = null
    pagination.value.page = 1
    lastUpdateTime.value = currentTime
    loadQuestionnaireList()
  }
})

// 监听全局数据刷新事件
const handleGlobalRefresh = () => {
  console.log('收到全局刷新事件，刷新问卷列表')
  loadQuestionnaireList()
}

onMounted(() => {
  // 添加全局事件监听
  window.addEventListener('questionnaireDataChanged', handleGlobalRefresh)
  loadQuestionnaireList()
})

// 添加onBeforeUnmount钩子，在组件卸载前清理资源
onBeforeUnmount(() => {
  // 移除全局事件监听
  window.removeEventListener('questionnaireDataChanged', handleGlobalRefresh)
})
</script>

<style scoped>
.questionnaire-list {
  padding: 20px;
}

.search-card {
  margin-bottom: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.3s ease;
}

.search-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.search-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  flex-wrap: wrap;
  padding: 4px 0;
}

.search-form {
  flex: 1;
  margin: 0;
}

.search-form .el-form-item {
  margin-bottom: 0;
  margin-right: 16px;
}

.search-form .el-form-item:last-child {
  margin-right: 0;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
}

.header-actions .el-button {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.header-actions .el-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-weight: 600;
  color: #303133;
}

.card-header span {
  font-size: 16px;
}

.card-header .el-tag {
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #7dd3fc;
  color: #0369a1;
  font-weight: 500;
}

.pagination-container {
  margin-top: 20px;
  text-align: center;
}

.status-tag {
  font-weight: 500;
  border-radius: 6px;
  padding: 4px 8px;
  font-size: 12px;
}

/* 自定义状态标签颜色 */
:deep(.el-tag--info) {
  --el-tag-bg-color: #f4f4f5;
  --el-tag-border-color: #d3d4d6;
  --el-tag-text-color: #606266;
}

:deep(.el-tag--success) {
  --el-tag-bg-color: #f0f9ff;
  --el-tag-border-color: #67c23a;
  --el-tag-text-color: #529b2e;
}

:deep(.el-tag--warning) {
  --el-tag-bg-color: #fdf6ec;
  --el-tag-border-color: #e6a23c;
  --el-tag-text-color: #b88230;
}

/* 统一的列容器样式 */
.time-column-container {
  display: flex;
  align-items: flex-start;
  min-height: 60px;
  padding: 12px 8px;
  box-sizing: border-box;
  justify-content: flex-start;
}

/* 简化的操作按钮容器 */
.action-buttons-container {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  align-items: center;
  justify-content: flex-start;
  padding: 12px 8px;
  min-height: 60px;
  box-sizing: border-box;
}

/* 时间内容区域 - 更好的间距和层次 */
.time-content {
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
}

.status-tag-aligned {
  font-size: 11px;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 500;
}

.time-item {
  font-size: 12px;
  line-height: 1.5;
  white-space: nowrap;
  display: flex;
  align-items: center;
  gap: 3px;
}

.time-label {
  color: #909399;
  font-weight: 500;
  font-size: 11px;
}

.time-value {
  color: #303133;
  font-weight: 600;
  font-size: 12px;
}

.no-time-text {
  font-size: 11px;
  color: #c0c4cc;
  font-style: italic;
}

/* 操作按钮样式 */
.action-buttons-container .el-button {
  margin: 0;
  font-size: 12px;
  flex-shrink: 0;
}

/* 表格滚动条样式 */
.table-container {
  overflow-x: auto;
  margin-bottom: 20px;
  border-radius: 4px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

:deep(.el-table__body-wrapper) {
  overflow-x: auto;
}

:deep(.el-table) {
  min-width: 1000px;
}

/* 移除重复样式，使用上面的简洁样式 */

/* 响应式设计 */
@media (max-width: 1200px) {
  :deep(.el-table) {
    min-width: 900px;
  }
  
  .time-info-column {
    font-size: 11px;
  }
  
  .action-buttons .el-button {
    padding: 3px 6px;
    font-size: 11px;
  }
}

@media (max-width: 768px) {
  .questionnaire-list {
    padding: 10px;
  }
  
  .search-header {
    flex-direction: column;
    gap: 16px;
  }
  
  .search-form {
    width: 100%;
  }
  
  .search-form .el-form-item {
    margin-bottom: 10px;
    margin-right: 0;
  }
  
  .header-actions {
    width: 100%;
    justify-content: center;
  }
  
  .card-header {
    flex-direction: column;
    gap: 8px;
    align-items: flex-start;
  }
}

@media (max-width: 480px) {
  .search-form .el-form-item {
    display: block;
    width: 100%;
  }
  
  .search-form .el-input {
    width: 100% !important;
  }
  
  .search-form .el-select {
    width: 100% !important;
  }
}

.search-form .el-button {
  border-radius: 6px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.search-form .el-button--primary {
  background: linear-gradient(135deg, #409eff 0%, #337ecc 100%);
  border: none;
  box-shadow: 0 2px 4px rgba(64, 158, 255, 0.3);
}

.search-form .el-button--primary:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(64, 158, 255, 0.4);
}

.search-form .el-button:not(.el-button--primary) {
  border-color: #dcdfe6;
  color: #606266;
}

.search-form .el-button:not(.el-button--primary):hover {
  border-color: #409eff;
  color: #409eff;
}
</style> 