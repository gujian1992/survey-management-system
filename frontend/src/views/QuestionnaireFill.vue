<template>
  <div class="questionnaire-fill">
    <div class="page-header">
      <h2>可填写问卷</h2>
      <p>选择您要填写的问卷</p>
    </div>

    <div v-if="loading" class="loading-container">
      <el-loading />
    </div>

    <div v-else-if="questionnaires.length === 0" class="empty-container">
      <el-empty description="暂无可填写的问卷" />
    </div>

    <div v-else class="questionnaire-grid">
      <el-card 
        v-for="questionnaire in questionnaires" 
        :key="questionnaire.id"
        class="questionnaire-card"
        shadow="hover"
      >
        <template #header>
          <div class="card-header">
            <span class="questionnaire-title">{{ questionnaire.title }}</span>
            <el-tag 
              :type="getStatusType(questionnaire.status)"
              size="small"
            >
              {{ getStatusText(questionnaire.status) }}
            </el-tag>
          </div>
        </template>

        <div class="questionnaire-content">
          <p class="description">{{ questionnaire.description || '暂无描述' }}</p>
          
          <div class="questionnaire-info">
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>创建时间：{{ formatDate(questionnaire.createTime) }}</span>
            </div>
            
            <div v-if="questionnaire.endTime" class="info-item">
              <el-icon><Clock /></el-icon>
              <span>截止时间：{{ formatDate(questionnaire.endTime) }}</span>
            </div>
            
            <div class="info-item">
              <el-icon><Document /></el-icon>
              <span>题目数量：{{ questionnaire.questionCount || 0 }} 题</span>
            </div>
          </div>
        </div>

        <template #footer>
          <div class="card-footer">
            <el-button 
              type="primary" 
              @click="startFill(questionnaire.id)"
              :disabled="questionnaire.status === 'completed' || questionnaire.status === 'expired'"
            >
              <el-icon><Edit /></el-icon>
              {{ getButtonText(questionnaire.status) }}
            </el-button>
            
            <el-button 
              v-if="questionnaire.status === 'completed'"
              type="info"
              @click="viewResponse(questionnaire.id)"
            >
              <el-icon><View /></el-icon>
              查看答案
            </el-button>
          </div>
        </template>
      </el-card>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, onActivated } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { questionnaireAPI } from '@/api/index'

// 组件名称，用于keep-alive
defineOptions({
  name: 'QuestionnaireFill'
})

const router = useRouter()

const loading = ref(true)
const questionnaires = ref([])

onMounted(async () => {
  await loadQuestionnaires()
})

// 组件激活时刷新数据（从答题页面返回时）
onActivated(async () => {
  // 重新加载问卷列表，确保状态是最新的
  await loadQuestionnaires()
})

// 组件销毁前清理状态
onBeforeUnmount(() => {
  loading.value = false
  questionnaires.value = []
})

const loadQuestionnaires = async () => {
  try {
    loading.value = true
    const response = await questionnaireAPI.getAvailable({
      page: 1,
      size: 20
    })
    
    // 转换数据格式以匹配前端展示需要
    questionnaires.value = response.data.map(item => ({
      id: item.id,
      title: item.title,
      description: item.description,
      createTime: item.createTime,
      endTime: item.endTime,
      questionCount: item.questionCount || 0,
      status: item.status || 'available'
    }))
    
  } catch (error) {
    ElMessage.error('获取问卷列表失败')
    console.error(error)
  } finally {
    loading.value = false
  }
}

const getStatusType = (status) => {
  const statusMap = {
    available: 'success',
    completed: 'info',
    expired: 'danger'
  }
  return statusMap[status] || 'info'
}

const getStatusText = (status) => {
  const statusMap = {
    available: '可填写',
    completed: '已完成',
    expired: '已过期'
  }
  return statusMap[status] || '未知'
}

const getButtonText = (status) => {
  const textMap = {
    available: '开始填写',
    completed: '已完成',
    expired: '已过期'
  }
  return textMap[status] || '填写'
}

const formatDate = (dateStr) => {
  if (!dateStr) return ''
  return new Date(dateStr).toLocaleString('zh-CN')
}

const startFill = (questionnaireId) => {
  router.push(`/questionnaire/fill/${questionnaireId}`)
}

const viewResponse = (questionnaireId) => {
  router.push(`/questionnaire/response/${questionnaireId}`)
}
</script>

<style scoped>
.questionnaire-fill {
  padding: 20px;
}

.page-header {
  margin-bottom: 30px;
}

.page-header h2 {
  color: #303133;
  margin: 0 0 10px 0;
  font-size: 24px;
  font-weight: 600;
}

.page-header p {
  color: #909399;
  margin: 0;
  font-size: 14px;
}

.loading-container {
  height: 300px;
  position: relative;
}

.empty-container {
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.questionnaire-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 20px;
}

.questionnaire-card {
  border-radius: 12px;
  overflow: hidden;
  transition: transform 0.2s;
}

.questionnaire-card:hover {
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.questionnaire-title {
  font-weight: 600;
  font-size: 16px;
  color: #303133;
}

.questionnaire-content {
  padding: 0 0 20px 0;
}

.description {
  color: #606266;
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 15px;
}

.questionnaire-info {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #909399;
  font-size: 13px;
}

.info-item .el-icon {
  font-size: 14px;
}

.card-footer {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}
</style> 