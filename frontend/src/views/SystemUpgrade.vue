<template>
  <div class="system-upgrade">
    <el-container>
      <el-main>
        <div class="upgrade-content">
          <div class="upgrade-header">
            <el-icon class="upgrade-icon" size="80" color="#409EFF">
              <Promotion />
            </el-icon>
            <h1>系统升级完成</h1>
            <p>欢迎使用全新的智能答题系统</p>
          </div>

          <div class="upgrade-features">
            <h2>🎉 新功能亮点</h2>
            <el-row :gutter="20">
              <el-col :span="8">
                <el-card class="feature-card" shadow="hover">
                  <template #header>
                    <div class="feature-header">
                      <el-icon color="#67C23A"><Edit /></el-icon>
                      <span>智能答题</span>
                    </div>
                  </template>
                  <ul class="feature-list">
                    <li>多种题型支持</li>
                    <li>实时答题进度</li>
                    <li>智能超时提醒</li>
                    <li>答案自动保存</li>
                  </ul>
                </el-card>
              </el-col>
              
              <el-col :span="8">
                <el-card class="feature-card" shadow="hover">
                  <template #header>
                    <div class="feature-header">
                      <el-icon color="#E6A23C"><DataBoard /></el-icon>
                      <span>数据统计</span>
                    </div>
                  </template>
                  <ul class="feature-list">
                    <li>个人答题统计</li>
                    <li>成绩趋势分析</li>
                    <li>详细记录查看</li>
                    <li>能力评估报告</li>
                  </ul>
                </el-card>
              </el-col>
              
              <el-col :span="8">
                <el-card class="feature-card" shadow="hover">
                  <template #header>
                    <div class="feature-header">
                      <el-icon color="#F56C6C"><Setting /></el-icon>
                      <span>题库管理</span>
                    </div>
                  </template>
                  <ul class="feature-list">
                    <li>题目分类管理</li>
                    <li>难度等级设置</li>
                    <li>批量导入导出</li>
                    <li>智能推荐算法</li>
                  </ul>
                </el-card>
              </el-col>
            </el-row>
          </div>

          <div class="upgrade-migration">
            <h2>🔄 功能迁移说明</h2>
            <el-table :data="migrationData" border style="width: 100%">
              <el-table-column prop="oldFeature" label="旧功能" width="200" />
              <el-table-column prop="newFeature" label="新功能" width="200" />
              <el-table-column prop="description" label="说明" />
              <el-table-column label="操作" width="120">
                <template #default="{ row }">
                  <el-button 
                    type="primary" 
                    size="small" 
                    @click="navigateToNewFeature(row.path)"
                  >
                    前往
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </div>

          <div class="upgrade-actions">
            <h2>🚀 立即体验新功能</h2>
            <div class="action-buttons">
              <el-button 
                type="primary" 
                size="large" 
                @click="$router.push('/start-answer')"
                class="action-btn"
              >
                <el-icon><Edit /></el-icon>
                开始答题
              </el-button>
              
              <el-button 
                type="success" 
                size="large" 
                @click="$router.push('/my-records')"
                class="action-btn"
              >
                <el-icon><Document /></el-icon>
                我的记录
              </el-button>
              
              <el-button 
                v-if="userStore.isAdmin"
                type="warning" 
                size="large" 
                @click="$router.push('/question-bank')"
                class="action-btn"
              >
                <el-icon><FolderOpened /></el-icon>
                题库管理
              </el-button>
            </div>
          </div>

          <div class="upgrade-help">
            <h2>❓ 需要帮助？</h2>
            <p>如果您在使用新系统时遇到任何问题，请联系管理员或查看帮助文档。</p>
            <el-alert
              title="提示"
              type="info"
              description="旧的问卷功能已停用，所有数据已安全迁移到新系统。"
              show-icon
              :closable="false"
            />
          </div>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user'
import {
  Promotion, Edit, DataBoard, Setting, Document, FolderOpened
} from '@element-plus/icons-vue'

defineOptions({
  name: 'SystemUpgrade'
})

const router = useRouter()
const userStore = useUserStore()

const migrationData = ref([
  {
    oldFeature: '问卷创建',
    newFeature: '题库管理',
    description: '支持多种题型的题目创建和管理',
    path: '/question-bank'
  },
  {
    oldFeature: '问卷填写',
    newFeature: '智能答题',
    description: '更智能的答题体验，支持实时保存和进度跟踪',
    path: '/start-answer'
  },
  {
    oldFeature: '答题记录',
    newFeature: '我的记录',
    description: '更详细的答题历史和统计分析',
    path: '/my-records'
  },
  {
    oldFeature: '评分管理',
    newFeature: '评分系统',
    description: '自动评分和人工评分相结合',
    path: '/scoring'
  },
  {
    oldFeature: '数据统计',
    newFeature: '智能分析',
    description: '更丰富的数据可视化和趋势分析',
    path: '/statistics'
  }
])

const navigateToNewFeature = (path) => {
  if (path === '/question-bank' || path === '/scoring' || path === '/statistics') {
    if (!userStore.isAdmin) {
      ElMessage.warning('该功能需要管理员权限')
      return
    }
  }
  router.push(path)
}
</script>

<style scoped>
.system-upgrade {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.upgrade-content {
  max-width: 1200px;
  margin: 0 auto;
  background: white;
  border-radius: 16px;
  padding: 40px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.upgrade-header {
  text-align: center;
  margin-bottom: 40px;
}

.upgrade-icon {
  margin-bottom: 20px;
}

.upgrade-header h1 {
  font-size: 32px;
  color: #303133;
  margin: 0 0 10px 0;
  font-weight: 600;
}

.upgrade-header p {
  font-size: 16px;
  color: #606266;
  margin: 0;
}

.upgrade-features {
  margin-bottom: 40px;
}

.upgrade-features h2 {
  color: #303133;
  margin-bottom: 20px;
  font-size: 24px;
}

.feature-card {
  height: 100%;
}

.feature-header {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 600;
}

.feature-list {
  margin: 0;
  padding: 0;
  list-style: none;
}

.feature-list li {
  padding: 8px 0;
  color: #606266;
  position: relative;
  padding-left: 20px;
}

.feature-list li::before {
  content: '✓';
  position: absolute;
  left: 0;
  color: #67C23A;
  font-weight: bold;
}

.upgrade-migration {
  margin-bottom: 40px;
}

.upgrade-migration h2 {
  color: #303133;
  margin-bottom: 20px;
  font-size: 24px;
}

.upgrade-actions {
  margin-bottom: 40px;
  text-align: center;
}

.upgrade-actions h2 {
  color: #303133;
  margin-bottom: 30px;
  font-size: 24px;
}

.action-buttons {
  display: flex;
  gap: 20px;
  justify-content: center;
  flex-wrap: wrap;
}

.action-btn {
  min-width: 160px;
  height: 50px;
  font-size: 16px;
  font-weight: 500;
}

.upgrade-help {
  text-align: center;
}

.upgrade-help h2 {
  color: #303133;
  margin-bottom: 20px;
  font-size: 24px;
}

.upgrade-help p {
  color: #606266;
  margin-bottom: 20px;
  font-size: 16px;
}

@media (max-width: 768px) {
  .upgrade-content {
    padding: 20px;
  }
  
  .action-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .action-btn {
    width: 100%;
    max-width: 300px;
  }
}
</style> 